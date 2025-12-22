/**
 * Authentication Types
 */

/** Device login request */
export interface DeviceLoginRequest {
  deviceId: string
  deviceSecret: string
}

/** User info in auth response */
export interface AuthUser {
  id: string
  type: 'device'
  deviceId: string
  permissions: string[]
}

/** Device login response */
export interface DeviceLoginResponse {
  code: number
  msg: string
  data: {
    user: AuthUser
    accessToken: string
    refreshToken: string
  }
}

/** Stored auth data */
export interface StoredAuthData {
  user: AuthUser
  accessToken: string
  refreshToken: string
  /** Timestamp when access token expires */
  accessTokenExpiry: number
  /** Timestamp when refresh token expires */
  refreshTokenExpiry: number
}

/** Token expiry durations in milliseconds */
export const TOKEN_EXPIRY = {
  /** Access token: 1 week */
  accessToken: 7 * 24 * 60 * 60 * 1000,
  /** Refresh token: 1 month (30 days) */
  refreshToken: 30 * 24 * 60 * 60 * 1000,
} as const

/** LocalStorage key for auth data */
export const AUTH_STORAGE_KEY = 'fulai_auth_data'

