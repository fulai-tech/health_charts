/**
 * WorkerBridge — Main-thread gRPC client for Worker communication.
 *
 * Manages the Worker lifecycle, gRPC channel establishment,
 * SharedArrayBuffer allocation, and reverse storage delegation.
 *
 * Architecture:
 *   ┌────────────────────────────────────────────────────┐
 *   │                    Main Thread                      │
 *   │                                                     │
 *   │  ┌─────────────┐  gRPC invoke  ┌──────────────┐   │
 *   │  │ React Hooks  │ ───────────→ │ WorkerBridge  │   │
 *   │  │ (consumer)   │ ←─────────── │ (client stub) │   │
 *   │  └─────────────┘  response     └───────┬───────┘   │
 *   │                                         │           │
 *   │                                  postMessage(buf)   │
 *   │                                         │           │
 *   └─────────────────────────────────────────┼───────────┘
 *                                              │
 *   ┌──────────────────────────────────────────┼──────────┐
 *   │                   Worker Thread          │           │
 *   │                                          ↓           │
 *   │  ┌──────────────┐  dispatch  ┌──────────────────┐  │
 *   │  │ AuthService   │ ←──────── │ GrpcChannel      │  │
 *   │  │ StorageService│           │ (server dispatch) │  │
 *   │  │ PrefetchSvc   │           └──────────────────┘  │
 *   │  └──────────────┘                                   │
 *   └─────────────────────────────────────────────────────┘
 *
 * @module worker/bridge/WorkerBridge
 * @internal
 */

import { GrpcChannel } from '../grpc/channel'
import { MethodIds } from '../grpc/descriptors'
import { GrpcStatus, GrpcError } from '../grpc/status'
import { FrameFlags, decodeFrame } from '../grpc/protocol'
import { createSharedMutex, SharedMutex, setThreadId } from '../mutex/SharedMutex'
import { createRWLock, RWLock } from '../mutex/RWLock'
import { LockManager } from '../mutex/LockGuard'

// ======================== Types ========================

export interface WorkerBridgeConfig {
  /** API base URL for auth service */
  apiBaseUrl?: string
  /** API auth endpoint path */
  apiAuthPath?: string
  /** Custom Worker URL (for development/testing) */
  workerUrl?: string | URL
  /** Timeout for worker boot (ms) */
  bootTimeoutMs?: number
  /** Enable keepalive heartbeat */
  enableHeartbeat?: boolean
  /** Heartbeat interval (ms) */
  heartbeatIntervalMs?: number
}

export interface WorkerBridgeMetrics {
  isReady: boolean
  uptime: number
  channelMetrics: Record<string, unknown>
  lockMetrics: Record<string, unknown>
  workerThreadId: number | null
}

type ReadyCallback = (bridge: WorkerBridge) => void

// ======================== Singleton ========================

let _instance: WorkerBridge | null = null

// ======================== WorkerBridge ========================

/**
 * WorkerBridge: singleton orchestrator for Worker lifecycle and gRPC communication.
 *
 * Usage:
 * ```ts
 * const bridge = await WorkerBridge.getInstance(config)
 * const result = await bridge.auth.login({ username, password })
 * ```
 */
export class WorkerBridge {
  private _worker: Worker | null = null
  private _channel: GrpcChannel | null = null
  private _lockManager: LockManager
  private _isReady = false
  private _bootPromise: Promise<void> | null = null
  private _readyCallbacks: ReadyCallback[] = []
  private _heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private _workerThreadId: number | null = null
  private _config: WorkerBridgeConfig

  // Mutex instances (main-thread side)
  private _authMutex: SharedMutex | null = null
  private _storageLock: RWLock | null = null
  private _prefetchMutex: SharedMutex | null = null

  private constructor(config: WorkerBridgeConfig = {}) {
    this._config = config
    this._lockManager = new LockManager()

    // Set main thread ID
    setThreadId(1)
  }

  // ======================== Singleton Access ========================

  /**
   * Get or create the WorkerBridge singleton.
   * First call initializes and boots the worker.
   */
  static async getInstance(config?: WorkerBridgeConfig): Promise<WorkerBridge> {
    if (!_instance) {
      _instance = new WorkerBridge(config)
      await _instance.boot()
    }
    return _instance
  }

  /**
   * Get the singleton without waiting (returns null if not yet initialized).
   */
  static peekInstance(): WorkerBridge | null {
    return _instance
  }

  /**
   * Destroy the singleton and terminate the worker.
   */
  static async destroy(): Promise<void> {
    if (_instance) {
      await _instance.shutdown()
      _instance = null
    }
  }

  // ======================== Lifecycle ========================

  /**
   * Boot the worker and establish gRPC communication.
   */
  private async boot(): Promise<void> {
    if (this._bootPromise) return this._bootPromise

    this._bootPromise = this._doBoot()
    return this._bootPromise
  }

  private async _doBoot(): Promise<void> {
    const timeoutMs = this._config.bootTimeoutMs ?? 10_000

    // Allocate SharedArrayBuffers for mutexes
    this._authMutex = createSharedMutex('auth')
    this._storageLock = createRWLock('storage')
    this._prefetchMutex = createSharedMutex('prefetch')

    // Register in lock manager
    this._lockManager.attachMutex('auth', this._authMutex.buffer)
    this._lockManager.attachRWLock('storage', this._storageLock.buffer)
    this._lockManager.attachMutex('prefetch', this._prefetchMutex.buffer)

    // Create worker
    const workerUrl = this._config.workerUrl
      ?? new URL('./kernel.worker.ts', import.meta.url)

    this._worker = new Worker(workerUrl, {
      type: 'module',
      name: 'pipeline-kernel',
    })

    // Create gRPC channel over the worker
    this._channel = new GrpcChannel(this._worker)

    // Register reverse storage handlers (worker → main thread → localStorage)
    this._registerStorageHandlers()

    // Wait for WORKER_READY
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new GrpcError(
          GrpcStatus.DEADLINE_EXCEEDED,
          `Worker boot timeout (${timeoutMs}ms)`,
        ))
      }, timeoutMs)

      // Listen for the ready frame
      const onReady = (event: MessageEvent) => {
        const data = event.data
        if (!(data instanceof ArrayBuffer)) return

        try {
          const frame = decodeFrame(data)
          if (frame.methodId === MethodIds.WORKER_READY && (frame.flags & FrameFlags.RESPONSE)) {
            clearTimeout(timer)
            this._worker!.removeEventListener('message', onReady)

            const payload = frame.payload as { threadId?: number }
            this._workerThreadId = payload?.threadId ?? null
            this._isReady = true

            // Notify callbacks
            for (const cb of this._readyCallbacks) {
              try { cb(this) } catch { /* ignore */ }
            }
            this._readyCallbacks = []

            resolve()
          }
        } catch {
          // Not a valid frame — ignore
        }
      }

      this._worker!.addEventListener('message', onReady)

      // Send init message with SharedArrayBuffer manifest
      this._worker!.postMessage({
        __init: true,
        mutexBuffers: {
          auth: this._authMutex!.buffer,
          storage: this._storageLock!.buffer,
          prefetch: this._prefetchMutex!.buffer,
        },
        config: {
          apiBaseUrl: this._config.apiBaseUrl ?? '',
          apiAuthPath: this._config.apiAuthPath ?? '',
        },
      })
    })

    // Start heartbeat if configured
    if (this._config.enableHeartbeat) {
      this._startHeartbeat(this._config.heartbeatIntervalMs ?? 30_000)
    }
  }

  /**
   * Gracefully shutdown the worker.
   */
  async shutdown(): Promise<void> {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer)
      this._heartbeatTimer = null
    }

    if (this._channel && this._isReady) {
      try {
        await this._channel.invoke(MethodIds.WORKER_SHUTDOWN, {}, { deadlineMs: 2_000 })
      } catch {
        // Timeout is acceptable during shutdown
      }
    }

    this._channel?.close()
    this._worker?.terminate()
    this._worker = null
    this._channel = null
    this._isReady = false
  }

  // ======================== gRPC Client Stubs ========================

  /**
   * Auth service client stubs.
   */
  get auth() {
    const channel = this._ensureChannel()

    return {
      login: (req: { username: string; password: string }) =>
        channel.invoke(MethodIds.AUTH_LOGIN, req) as Promise<{
          success: boolean
          accessToken: string
          username: string
          expiresAt: number
        }>,

      setTokenFromUrl: (token: string) =>
        channel.invoke(MethodIds.AUTH_SET_TOKEN_FROM_URL, { token }) as Promise<{
          success: boolean
          accessToken: string
          username: string
        }>,

      logout: () =>
        channel.invoke(MethodIds.AUTH_LOGOUT, {}) as Promise<{ success: boolean }>,

      isAuthenticated: () =>
        channel.invoke(MethodIds.AUTH_IS_AUTHENTICATED, {}) as Promise<{
          isAuthenticated: boolean
          hasToken: boolean
          expiresAt: number | null
        }>,

      getToken: () =>
        channel.invoke(MethodIds.AUTH_GET_TOKEN, {}) as Promise<{
          token: string | null
          expiresAt: number | null
        }>,

      getAuthData: () =>
        channel.invoke(MethodIds.AUTH_GET_AUTH_DATA, {}) as Promise<unknown>,

      ensureAuth: (req: {
        urlToken?: string
        defaultUsername?: string
        defaultPassword?: string
      }) =>
        channel.invoke(MethodIds.AUTH_ENSURE_AUTH, req) as Promise<{
          token: string
          source: 'url' | 'storage' | 'api'
        }>,
    }
  }

  /**
   * Storage service client stubs.
   */
  get storage() {
    const channel = this._ensureChannel()

    return {
      get: (key: string) =>
        channel.invoke(MethodIds.STORAGE_GET, { key }) as Promise<{
          key: string
          value: string | null
        }>,

      set: (key: string, value: string) =>
        channel.invoke(MethodIds.STORAGE_SET, { key, value }) as Promise<{
          success: boolean
        }>,

      remove: (key: string) =>
        channel.invoke(MethodIds.STORAGE_REMOVE, { key }) as Promise<{
          success: boolean
        }>,

      clear: () =>
        channel.invoke(MethodIds.STORAGE_CLEAR, {}) as Promise<{
          success: boolean
        }>,

      keys: () =>
        channel.invoke(MethodIds.STORAGE_KEYS, {}) as Promise<{
          keys: string[]
        }>,

      has: (key: string) =>
        channel.invoke(MethodIds.STORAGE_HAS, { key }) as Promise<{
          exists: boolean
        }>,

      getBatch: (keys: string[]) =>
        channel.invoke(MethodIds.STORAGE_GET_BATCH, { keys }) as Promise<{
          data: Record<string, string | null>
        }>,

      setBatch: (entries: Array<{ key: string; value: string }>) =>
        channel.invoke(MethodIds.STORAGE_SET_BATCH, { entries }) as Promise<{
          success: boolean
          count: number
        }>,
    }
  }

  /**
   * Prefetch service client stubs.
   */
  get prefetch() {
    const channel = this._ensureChannel()

    return {
      prefetchWeeks: (req: {
        featureName: string
        currentWeekStartISO: string
        weekCount?: number
        fetchUrl: string
        fetchHeaders?: Record<string, string>
        staleTime?: number
      }) =>
        channel.invoke(MethodIds.PREFETCH_WEEKS, req) as Promise<{
          started: number
          tasks: Array<{ id: string; featureName: string; status: string }>
        }>,

      prefetchSingle: (req: {
        featureName: string
        dateRange: { startDate: string; endDate: string }
        fetchUrl: string
        fetchHeaders?: Record<string, string>
        staleTime?: number
      }) =>
        channel.invoke(MethodIds.PREFETCH_SINGLE, req) as Promise<{
          cached: boolean
          data: unknown
        }>,

      invalidate: (req: {
        featureName?: string
        dateRange?: { startDate: string; endDate: string }
      }) =>
        channel.invoke(MethodIds.PREFETCH_INVALIDATE, req) as Promise<{
          invalidated: number
        }>,

      status: () =>
        channel.invoke(MethodIds.PREFETCH_STATUS, {}) as Promise<{
          cacheSize: number
          activeTasks: number
          concurrentFetches: number
          entries: Array<{ key: string; isStale: boolean }>
        }>,

      cancel: (taskId?: string) =>
        channel.invoke(MethodIds.PREFETCH_CANCEL, { taskId }) as Promise<{
          cancelled: number
        }>,

      warmup: (req: {
        featureName: string
        baseDate: string
        fetchUrl: string
        fetchHeaders?: Record<string, string>
        depth?: number
      }) =>
        channel.invoke(MethodIds.PREFETCH_WARMUP, req) as Promise<{
          scheduled: number
          keys: string[]
        }>,
    }
  }

  /**
   * System / diagnostic stubs.
   */
  get system() {
    const channel = this._ensureChannel()

    return {
      ping: () =>
        channel.invoke(MethodIds.DIAGNOSTIC_PING, { timestamp: Date.now() }) as Promise<{
          pong: boolean
          latencyMs: number
        }>,

      metrics: () =>
        channel.invoke(MethodIds.DIAGNOSTIC_METRICS, {}) as Promise<Record<string, unknown>>,

      keepalive: () =>
        channel.invoke(MethodIds.KEEPALIVE, {}) as Promise<{
          alive: boolean
          uptime: number
        }>,
    }
  }

  // ======================== Lock Access ========================

  /**
   * Access the lock manager for direct mutex/rwlock operations.
   */
  get locks(): LockManager {
    return this._lockManager
  }

  /**
   * Auth mutex (main-thread side).
   */
  get authMutex(): SharedMutex | null {
    return this._authMutex
  }

  /**
   * Storage RWLock (main-thread side).
   */
  get storageLock(): RWLock | null {
    return this._storageLock
  }

  // ======================== Status ========================

  get isReady(): boolean {
    return this._isReady
  }

  get workerThreadId(): number | null {
    return this._workerThreadId
  }

  /**
   * Register a callback for when the worker is ready.
   */
  onReady(callback: ReadyCallback): void {
    if (this._isReady) {
      callback(this)
    } else {
      this._readyCallbacks.push(callback)
    }
  }

  // ======================== Internal ========================

  private _ensureChannel(): GrpcChannel {
    if (!this._channel || !this._isReady) {
      throw new GrpcError(
        GrpcStatus.WORKER_NOT_READY,
        'Worker is not ready. Call WorkerBridge.getInstance() first.',
      )
    }
    return this._channel
  }

  /**
   * Register handlers for reverse storage delegation.
   * When the worker needs to read/write localStorage, it sends
   * storage method calls BACK to the main thread.
   */
  private _registerStorageHandlers(): void {
    if (!this._channel) return

    // Worker → Main: STORAGE_GET
    this._channel.handle(MethodIds.STORAGE_GET, async (payload) => {
      const { key } = payload as { key: string }
      const value = localStorage.getItem(key)
      return { key, value }
    })

    // Worker → Main: STORAGE_SET
    this._channel.handle(MethodIds.STORAGE_SET, async (payload) => {
      const { key, value } = payload as { key: string; value: string }
      localStorage.setItem(key, value)
      return { success: true }
    })

    // Worker → Main: STORAGE_REMOVE
    this._channel.handle(MethodIds.STORAGE_REMOVE, async (payload) => {
      const { key } = payload as { key: string }
      localStorage.removeItem(key)
      return { success: true }
    })

    // Worker → Main: STORAGE_CLEAR
    this._channel.handle(MethodIds.STORAGE_CLEAR, async () => {
      localStorage.clear()
      return { success: true }
    })

    // Worker → Main: STORAGE_KEYS
    this._channel.handle(MethodIds.STORAGE_KEYS, async () => {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) keys.push(key)
      }
      return { keys }
    })
  }

  /**
   * Start periodic heartbeat to detect worker death.
   */
  private _startHeartbeat(intervalMs: number): void {
    this._heartbeatTimer = setInterval(async () => {
      try {
        const result = await this.system.keepalive()
        if (!result?.alive) {
          console.warn('[WorkerBridge] Worker heartbeat failed — not alive')
        }
      } catch (err) {
        console.warn('[WorkerBridge] Worker heartbeat failed:', err)
        // Worker may be dead — attempt recovery
        this._isReady = false
      }
    }, intervalMs)
  }
}
