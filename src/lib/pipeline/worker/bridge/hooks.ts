/**
 * Worker Bridge React Hooks — Main-thread reactive bindings.
 *
 * Provides React hooks that transparently proxy to Worker-hosted services
 * via the gRPC channel, while maintaining the existing hook API surface.
 *
 * Components using these hooks are unaware that operations execute
 * in a separate thread — the gRPC transport is fully abstracted.
 *
 * @module worker/bridge/hooks
 * @internal
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { WorkerBridge, type WorkerBridgeConfig } from './WorkerBridge'

// ======================== Worker Lifecycle Hook ========================

/**
 * useWorkerBridge — Initialize and access the Worker bridge.
 *
 * Manages the Worker lifecycle and provides access to all service stubs.
 * Should be called once at the app root level.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { bridge, isReady, error } = useWorkerBridge({
 *     apiBaseUrl: API_CONFIG.baseURL,
 *     apiAuthPath: API_CONFIG.auth.deviceLogin,
 *   })
 *
 *   if (!isReady) return <Loading />
 *   return <AppContent />
 * }
 * ```
 */
export function useWorkerBridge(config?: WorkerBridgeConfig) {
  const [bridge, setBridge] = useState<WorkerBridge | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const configRef = useRef(config)

  useEffect(() => {
    let cancelled = false

    WorkerBridge.getInstance(configRef.current)
      .then((instance) => {
        if (!cancelled) {
          setBridge(instance)
          setIsReady(true)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { bridge, isReady, error }
}

// ======================== Auth Hooks ========================

/**
 * useWorkerAuth — Auth operations via Worker thread.
 *
 * Drop-in replacement for useAuthStore() that executes all
 * auth logic inside the Worker, communicating via gRPC.
 */
export function useWorkerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const bridgeRef = useRef<WorkerBridge | null>(null)

  // Initialize bridge reference
  useEffect(() => {
    WorkerBridge.getInstance()
      .then((bridge) => {
        bridgeRef.current = bridge
        // Check initial auth state
        return bridge.auth.isAuthenticated()
      })
      .then((result) => {
        setIsAuthenticated(result.isAuthenticated)
        if (result.isAuthenticated) {
          return bridgeRef.current!.auth.getToken()
        }
        return null
      })
      .then((tokenResult) => {
        if (tokenResult) {
          setAccessToken(tokenResult.token)
        }
      })
      .catch(() => {
        // Worker not ready yet
      })
  }, [])

  const login = useCallback(async (req: { username: string; password: string }) => {
    if (!bridgeRef.current) throw new Error('Worker not ready')
    setIsLoading(true)
    setError(null)
    try {
      const result = await bridgeRef.current.auth.login(req)
      setIsAuthenticated(true)
      setAccessToken(result.accessToken)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    if (!bridgeRef.current) return
    setIsLoading(true)
    try {
      await bridgeRef.current.auth.logout()
      setIsAuthenticated(false)
      setAccessToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setTokenFromUrl = useCallback(async (token: string) => {
    if (!bridgeRef.current) return
    const result = await bridgeRef.current.auth.setTokenFromUrl(token)
    setIsAuthenticated(true)
    setAccessToken(result.accessToken)
    return result
  }, [])

  const ensureAuth = useCallback(async (req?: {
    urlToken?: string
    defaultUsername?: string
    defaultPassword?: string
  }) => {
    if (!bridgeRef.current) throw new Error('Worker not ready')
    setIsLoading(true)
    try {
      const result = await bridgeRef.current.auth.ensureAuth(req ?? {})
      setIsAuthenticated(true)
      setAccessToken(result.token)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isAuthenticated,
    accessToken,
    isLoading,
    error,
    login,
    logout,
    setTokenFromUrl,
    ensureAuth,
  }
}

// ======================== Storage Hooks ========================

/**
 * useWorkerStorage — localStorage operations via Worker thread.
 *
 * All reads/writes go through the Worker's LRU cache
 * with RWLock-guarded access for thread safety.
 */
export function useWorkerStorage() {
  const bridgeRef = useRef<WorkerBridge | null>(null)

  useEffect(() => {
    WorkerBridge.getInstance().then((bridge) => {
      bridgeRef.current = bridge
    }).catch(() => {})
  }, [])

  const get = useCallback(async (key: string): Promise<string | null> => {
    if (!bridgeRef.current) {
      // Fallback to direct localStorage
      return localStorage.getItem(key)
    }
    const result = await bridgeRef.current.storage.get(key)
    return result.value
  }, [])

  const set = useCallback(async (key: string, value: string): Promise<void> => {
    if (!bridgeRef.current) {
      localStorage.setItem(key, value)
      return
    }
    await bridgeRef.current.storage.set(key, value)
  }, [])

  const remove = useCallback(async (key: string): Promise<void> => {
    if (!bridgeRef.current) {
      localStorage.removeItem(key)
      return
    }
    await bridgeRef.current.storage.remove(key)
  }, [])

  const clear = useCallback(async (): Promise<void> => {
    if (!bridgeRef.current) {
      localStorage.clear()
      return
    }
    await bridgeRef.current.storage.clear()
  }, [])

  return { get, set, remove, clear }
}

/**
 * useWorkerStorageValue — Reactive storage value with auto-sync.
 *
 * Reads a value from Worker storage and re-reads on key change.
 */
export function useWorkerStorageValue(key: string) {
  const [value, setValue] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { get, set, remove } = useWorkerStorage()

  useEffect(() => {
    setIsLoading(true)
    get(key).then((v) => {
      setValue(v)
      setIsLoading(false)
    }).catch(() => {
      setIsLoading(false)
    })
  }, [key, get])

  const update = useCallback(async (newValue: string | null) => {
    if (newValue === null) {
      await remove(key)
    } else {
      await set(key, newValue)
    }
    setValue(newValue)
  }, [key, set, remove])

  return { value, isLoading, update }
}

// ======================== Prefetch Hooks ========================

/**
 * useWorkerPrefetch — Data prefetching via Worker thread.
 *
 * Moves prefetch operations off the main thread entirely,
 * preventing UI jank during background data loading.
 */
export function useWorkerPrefetch(featureName: string) {
  const bridgeRef = useRef<WorkerBridge | null>(null)
  const [status, setStatus] = useState<{
    cacheSize: number
    activeTasks: number
  } | null>(null)

  useEffect(() => {
    WorkerBridge.getInstance().then((bridge) => {
      bridgeRef.current = bridge
    }).catch(() => {})
  }, [])

  const prefetchWeeks = useCallback(async (
    currentWeekStart: Date,
    weekCount: number = 3,
    fetchUrl: string,
    fetchHeaders?: Record<string, string>,
  ) => {
    if (!bridgeRef.current) return null
    return bridgeRef.current.prefetch.prefetchWeeks({
      featureName,
      currentWeekStartISO: currentWeekStart.toISOString(),
      weekCount,
      fetchUrl,
      fetchHeaders,
    })
  }, [featureName])

  const invalidate = useCallback(async (
    dateRange?: { startDate: string; endDate: string },
  ) => {
    if (!bridgeRef.current) return null
    return bridgeRef.current.prefetch.invalidate({ featureName, dateRange })
  }, [featureName])

  const warmup = useCallback(async (
    baseDate: string,
    fetchUrl: string,
    depth?: number,
  ) => {
    if (!bridgeRef.current) return null
    return bridgeRef.current.prefetch.warmup({
      featureName,
      baseDate,
      fetchUrl,
      depth,
    })
  }, [featureName])

  const refreshStatus = useCallback(async () => {
    if (!bridgeRef.current) return
    const s = await bridgeRef.current.prefetch.status()
    setStatus({
      cacheSize: s.cacheSize,
      activeTasks: s.activeTasks,
    })
  }, [])

  return {
    prefetchWeeks,
    invalidate,
    warmup,
    status,
    refreshStatus,
  }
}

// ======================== Diagnostic Hook ========================

/**
 * useWorkerDiagnostics — Monitor Worker health and performance.
 */
export function useWorkerDiagnostics() {
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const bridgeRef = useRef<WorkerBridge | null>(null)

  useEffect(() => {
    WorkerBridge.getInstance().then((bridge) => {
      bridgeRef.current = bridge
    }).catch(() => {})
  }, [])

  const ping = useCallback(async () => {
    if (!bridgeRef.current) return null
    const result = await bridgeRef.current.system.ping()
    setLatency(result.latencyMs)
    return result
  }, [])

  const refreshMetrics = useCallback(async () => {
    if (!bridgeRef.current) return null
    const result = await bridgeRef.current.system.metrics()
    setMetrics(result)
    return result
  }, [])

  return { metrics, latency, ping, refreshMetrics }
}

// ======================== Lock Hook ========================

/**
 * useWorkerLock — Access mutex/rwlock diagnostics and operations.
 */
export function useWorkerLock(lockName: string) {
  const [isLocked, setIsLocked] = useState(false)
  const bridgeRef = useRef<WorkerBridge | null>(null)

  useEffect(() => {
    WorkerBridge.getInstance().then((bridge) => {
      bridgeRef.current = bridge
      // Check initial lock state
      if (lockName === 'auth' && bridge.authMutex) {
        setIsLocked(bridge.authMutex.isLocked)
      }
    }).catch(() => {})
  }, [lockName])

  const snapshot = useCallback(() => {
    if (!bridgeRef.current) return null
    if (lockName === 'auth' && bridgeRef.current.authMutex) {
      return bridgeRef.current.authMutex.snapshot()
    }
    if (lockName === 'storage' && bridgeRef.current.storageLock) {
      return bridgeRef.current.storageLock.snapshot()
    }
    return null
  }, [lockName])

  return { isLocked, snapshot }
}
