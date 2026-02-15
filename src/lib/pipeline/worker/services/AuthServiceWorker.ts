/**
 * AuthServiceWorker — Worker-side authentication service implementation.
 *
 * Executes login, token management, and credential storage
 * inside the Worker thread, isolated from the main thread's DOM context.
 *
 * All localStorage operations are proxied through StorageServiceWorker
 * to maintain thread-safe access via mutex-guarded writes.
 *
 * gRPC method handlers for AuthService (0x0001_xxxx).
 *
 * @module worker/services/AuthServiceWorker
 * @internal
 */

import type { GrpcChannel, CallMetadata, RequestHandler } from '../grpc/channel'
import { MethodIds } from '../grpc/descriptors'
import { GrpcStatus, GrpcError } from '../grpc/status'
import { SharedMutex } from '../mutex/SharedMutex'
import { withMutex } from '../mutex/LockGuard'

// ======================== Types (mirror auth/types.ts) ========================

interface AuthUser {
  id: string
  type: 'device'
  deviceId: string
  permissions: string[]
}

interface StoredAuthData {
  user: AuthUser
  accessToken: string
  refreshToken: string
  accessTokenExpiry: number
  refreshTokenExpiry: number
  username?: string
}

interface DeviceLoginRequest {
  username: string
  password: string
}

interface DeviceLoginResponse {
  code: number
  msg: string
  data: {
    user: AuthUser
    accessToken: string
    refreshToken: string
  }
}

const TOKEN_EXPIRY = {
  accessToken: 7 * 24 * 60 * 60 * 1000,
  refreshToken: 30 * 24 * 60 * 60 * 1000,
} as const

const AUTH_STORAGE_KEY = 'fulai_auth_data'

// ======================== Worker Auth State ========================

/**
 * In-memory auth state inside the worker.
 * Synchronized with localStorage via storage proxy.
 */
let _authData: StoredAuthData | null = null
let _apiBaseUrl = ''
let _apiAuthPath = ''

// ======================== Internal Helpers ========================

/**
 * Storage proxy: read from main thread localStorage via gRPC callback.
 * Since workers cannot access localStorage, we delegate reads/writes
 * to the main thread's StorageService.
 */
type StorageProxy = {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string) => Promise<void>
  remove: (key: string) => Promise<void>
}

let _storageProxy: StorageProxy | null = null

/**
 * HTTP fetch that works in both main thread and worker context.
 * Workers have access to fetch() natively.
 */
async function _workerFetch(url: string, body: unknown): Promise<DeviceLoginResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new GrpcError(
      GrpcStatus.UNAVAILABLE,
      `HTTP ${response.status}: ${response.statusText}`,
    )
  }

  return response.json()
}

async function _loadFromStorage(): Promise<void> {
  if (!_storageProxy) return
  try {
    const stored = await _storageProxy.get(AUTH_STORAGE_KEY)
    if (stored) {
      _authData = JSON.parse(stored)
    }
  } catch {
    _authData = null
  }
}

async function _saveToStorage(): Promise<void> {
  if (!_storageProxy) return
  try {
    if (_authData) {
      await _storageProxy.set(AUTH_STORAGE_KEY, JSON.stringify(_authData))
    } else {
      await _storageProxy.remove(AUTH_STORAGE_KEY)
    }
  } catch {
    // Silent fail in worker
  }
}

function _isAuthenticated(): boolean {
  if (!_authData) return false
  return Date.now() < _authData.accessTokenExpiry - 5 * 60 * 1000
}

// ======================== gRPC Handlers ========================

/**
 * AUTH_LOGIN: Device login via API.
 * Payload: { username: string, password: string, baseUrl?: string, authPath?: string }
 */
const handleLogin: RequestHandler = async (payload, _meta) => {
  const req = payload as {
    username?: string
    password?: string
    baseUrl?: string
    authPath?: string
  }

  if (req.baseUrl) _apiBaseUrl = req.baseUrl
  if (req.authPath) _apiAuthPath = req.authPath

  const loginData: DeviceLoginRequest = {
    username: req.username ?? '',
    password: req.password ?? '',
  }

  if (!loginData.username || !loginData.password) {
    throw new GrpcError(GrpcStatus.INVALID_ARGUMENT, 'Username and password are required')
  }

  const url = `${_apiBaseUrl}${_apiAuthPath}`
  const response = await _workerFetch(url, loginData)

  if (response.code !== 0) {
    throw new GrpcError(GrpcStatus.UNAUTHENTICATED, response.msg || 'Login failed')
  }

  const now = Date.now()
  _authData = {
    user: response.data.user,
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    accessTokenExpiry: now + TOKEN_EXPIRY.accessToken,
    refreshTokenExpiry: now + TOKEN_EXPIRY.refreshToken,
    username: loginData.username,
  }

  await _saveToStorage()

  return {
    success: true,
    accessToken: _authData.accessToken,
    username: _authData.username,
    expiresAt: _authData.accessTokenExpiry,
  }
}

/**
 * AUTH_SET_TOKEN_FROM_URL: Set token from URL parameter.
 * Payload: { token: string }
 */
const handleSetTokenFromUrl: RequestHandler = async (payload) => {
  const { token } = payload as { token: string }

  if (!token) {
    throw new GrpcError(GrpcStatus.INVALID_ARGUMENT, 'Token is required')
  }

  // Clear old state
  _authData = null
  await _saveToStorage()

  const now = Date.now()
  _authData = {
    user: {
      id: 'android',
      type: 'device',
      deviceId: 'Android',
      permissions: [],
    },
    accessToken: token,
    refreshToken: token,
    accessTokenExpiry: now + TOKEN_EXPIRY.accessToken,
    refreshTokenExpiry: now + TOKEN_EXPIRY.refreshToken,
    username: 'Android',
  }

  await _saveToStorage()

  return {
    success: true,
    accessToken: token,
    username: 'Android',
  }
}

/**
 * AUTH_LOGOUT: Clear all auth data.
 */
const handleLogout: RequestHandler = async () => {
  _authData = null
  await _saveToStorage()
  return { success: true }
}

/**
 * AUTH_IS_AUTHENTICATED: Check authentication status.
 */
const handleIsAuthenticated: RequestHandler = async () => {
  return {
    isAuthenticated: _isAuthenticated(),
    hasToken: !!_authData?.accessToken,
    expiresAt: _authData?.accessTokenExpiry ?? null,
  }
}

/**
 * AUTH_GET_TOKEN: Get current access token.
 */
const handleGetToken: RequestHandler = async () => {
  return {
    token: _authData?.accessToken ?? null,
    expiresAt: _authData?.accessTokenExpiry ?? null,
  }
}

/**
 * AUTH_GET_AUTH_DATA: Get full auth data.
 */
const handleGetAuthData: RequestHandler = async () => {
  if (!_authData) return null
  return {
    user: _authData.user,
    accessToken: _authData.accessToken,
    refreshToken: _authData.refreshToken,
    accessTokenExpiry: _authData.accessTokenExpiry,
    refreshTokenExpiry: _authData.refreshTokenExpiry,
    username: _authData.username,
  }
}

/**
 * AUTH_ENSURE_AUTH: Ensure authenticated (URL token → stored token → login).
 * Payload: { urlToken?: string, defaultUsername?: string, defaultPassword?: string }
 */
const handleEnsureAuth: RequestHandler = async (payload) => {
  const req = payload as {
    urlToken?: string
    defaultUsername?: string
    defaultPassword?: string
  }

  // Priority 1: URL token
  if (req.urlToken) {
    await handleSetTokenFromUrl({ token: req.urlToken }, {} as CallMetadata)
    return {
      token: _authData!.accessToken,
      source: 'url',
    }
  }

  // Priority 2: Existing valid token
  await _loadFromStorage()
  if (_isAuthenticated()) {
    return {
      token: _authData!.accessToken,
      source: 'storage',
    }
  }

  // Priority 3: Login with default credentials
  if (req.defaultUsername && req.defaultPassword) {
    const result = await handleLogin(
      { username: req.defaultUsername, password: req.defaultPassword },
      {} as CallMetadata,
    )
    return {
      token: (result as Record<string, unknown>).accessToken,
      source: 'api',
    }
  }

  throw new GrpcError(GrpcStatus.UNAUTHENTICATED, 'No valid authentication method available')
}

// ======================== Service Registration ========================

/**
 * Register all AuthService handlers on a gRPC channel.
 *
 * When a mutex is provided, write operations (login, logout, setToken)
 * are wrapped with mutex-guarded critical sections for thread safety.
 */
export function registerAuthService(
  channel: GrpcChannel,
  storageProxy: StorageProxy,
  authMutex?: SharedMutex,
): void {
  _storageProxy = storageProxy

  // Wrap write operations with mutex if provided
  const guard = <T>(handler: RequestHandler): RequestHandler => {
    if (!authMutex) return handler
    return async (payload, meta) => {
      return withMutex(authMutex, () => handler(payload, meta))
    }
  }

  channel.handleAll([
    [MethodIds.AUTH_LOGIN,              guard(handleLogin)],
    [MethodIds.AUTH_SET_TOKEN_FROM_URL, guard(handleSetTokenFromUrl)],
    [MethodIds.AUTH_LOGOUT,             guard(handleLogout)],
    [MethodIds.AUTH_IS_AUTHENTICATED,   handleIsAuthenticated],
    [MethodIds.AUTH_GET_TOKEN,          handleGetToken],
    [MethodIds.AUTH_GET_AUTH_DATA,      handleGetAuthData],
    [MethodIds.AUTH_ENSURE_AUTH,        guard(handleEnsureAuth)],
  ])
}

/**
 * Initialize auth service with API configuration.
 */
export function configureAuthService(config: {
  baseUrl: string
  authPath: string
}): void {
  _apiBaseUrl = config.baseUrl
  _apiAuthPath = config.authPath
}

/**
 * Load initial auth state from storage.
 */
export async function initAuthState(storageProxy: StorageProxy): Promise<void> {
  _storageProxy = storageProxy
  await _loadFromStorage()
}
