/**
 * PrefetchServiceWorker — Worker-side data prefetching service.
 *
 * Executes prefetch operations in the Worker thread to avoid blocking
 * the main thread's rendering pipeline. Maintains an in-worker data cache
 * with TTL-based eviction and Fibonacci-sequence warmup scheduling.
 *
 * Architecture:
 *   Worker Thread                           Network
 *   ┌──────────────────┐   fetch()         ┌─────────┐
 *   │ PrefetchService   │ ──────────────→  │ API     │
 *   │ (Φ-cache + TTL)   │ ←──────────────  │ Server  │
 *   └──────────────────┘                    └─────────┘
 *        ↕ gRPC
 *   ┌──────────────────┐
 *   │ Main Thread       │
 *   │ (QueryClient)     │
 *   └──────────────────┘
 *
 * gRPC method handlers for PrefetchService (0x0003_xxxx).
 *
 * @module worker/services/PrefetchServiceWorker
 * @internal
 */

import type { GrpcChannel, RequestHandler } from '../grpc/channel'
import { MethodIds } from '../grpc/descriptors'
import { GrpcStatus, GrpcError } from '../grpc/status'
import { SharedMutex } from '../mutex/SharedMutex'
import { withMutex } from '../mutex/LockGuard'

// ======================== Types ========================

interface DateRange {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
}

interface PrefetchEntry {
  key: string
  data: unknown
  fetchedAt: number
  staleTime: number
  /** Fibonacci sequence position for decay scheduling */
  φIndex: number
}

interface PrefetchTask {
  id: string
  featureName: string
  dateRange: DateRange
  status: 'pending' | 'fetching' | 'completed' | 'failed'
  startedAt: number
  completedAt?: number
  error?: string
}

// ======================== Fibonacci Scheduling ========================

/**
 * Φ-Cache: Fibonacci-indexed decay schedule for prefetch priority.
 *
 * More recently accessed data gets lower Fibonacci indices (higher priority).
 * Eviction targets entries with higher indices first.
 *
 * φ sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...
 */
const _φ = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]

function φDecayFactor(index: number): number {
  return _φ[Math.min(index, _φ.length - 1)]
}

/**
 * Calculate effective TTL with Fibonacci decay.
 * Frequently accessed entries decay slower (higher effective TTL).
 */
function effectiveTTL(baseTTL: number, φIndex: number): number {
  return baseTTL * φDecayFactor(φIndex)
}

// ======================== Cache State ========================

const _cache = new Map<string, PrefetchEntry>()
const _activeTasks = new Map<string, PrefetchTask>()
const _abortControllers = new Map<string, AbortController>()

const DEFAULT_STALE_TIME = 5 * 60 * 1000  // 5 minutes
const MAX_CACHE_SIZE = 512
const MAX_CONCURRENT_FETCHES = 4

let _concurrentFetches = 0

// ======================== Cache Key Generation ========================

function _makeCacheKey(featureName: string, dateRange: DateRange): string {
  return `Φ:${featureName}:${dateRange.startDate}:${dateRange.endDate}`
}

function _makeTaskId(featureName: string, dateRange: DateRange): string {
  return `τ:${featureName}:${dateRange.startDate}:${dateRange.endDate}:${Date.now().toString(36)}`
}

// ======================== Date Utilities ========================

function _formatDateToAPI(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function _getPreviousWeekRange(currentMonday: Date): { start: Date; end: Date } {
  const prevMonday = new Date(currentMonday)
  prevMonday.setDate(prevMonday.getDate() - 7)
  const prevSunday = new Date(prevMonday)
  prevSunday.setDate(prevSunday.getDate() + 6)
  return { start: prevMonday, end: prevSunday }
}

// ======================== Eviction ========================

function _evictIfNeeded(): void {
  if (_cache.size <= MAX_CACHE_SIZE) return

  // Evict entries with highest φ index first (least valuable)
  const entries = Array.from(_cache.entries())
    .sort((a, b) => b[1].φIndex - a[1].φIndex)

  const toEvict = entries.length - MAX_CACHE_SIZE
  for (let i = 0; i < toEvict; i++) {
    _cache.delete(entries[i][0])
  }
}

function _isStale(entry: PrefetchEntry): boolean {
  const ttl = effectiveTTL(entry.staleTime, entry.φIndex)
  return Date.now() - entry.fetchedAt > ttl
}

// ======================== Fetch Execution ========================

/**
 * Execute a prefetch request via the Worker's fetch API.
 *
 * The actual fetch URL and parameters are provided by the main thread
 * via the gRPC payload. Results are cached in the worker.
 */
async function _executeFetch(
  url: string,
  options: RequestInit,
  cacheKey: string,
  staleTime: number,
  signal?: AbortSignal,
): Promise<unknown> {
  if (_concurrentFetches >= MAX_CONCURRENT_FETCHES) {
    // Queue — wait for a slot
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (_concurrentFetches < MAX_CONCURRENT_FETCHES) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
  }

  _concurrentFetches++
  try {
    const response = await fetch(url, { ...options, signal })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()

    // Cache the result
    const existing = _cache.get(cacheKey)
    _cache.set(cacheKey, {
      key: cacheKey,
      data,
      fetchedAt: Date.now(),
      staleTime,
      φIndex: existing ? Math.max(0, existing.φIndex - 1) : 8, // Promote on access
    })

    _evictIfNeeded()
    return data
  } finally {
    _concurrentFetches--
  }
}

// ======================== gRPC Handlers ========================

/**
 * PREFETCH_WEEKS: Prefetch multiple previous weeks of data.
 * Payload: {
 *   featureName: string,
 *   currentWeekStartISO: string,
 *   weekCount: number,
 *   fetchUrl: string,
 *   fetchHeaders: Record<string, string>,
 *   staleTime?: number
 * }
 */
const handlePrefetchWeeks: RequestHandler = async (payload) => {
  const req = payload as {
    featureName: string
    currentWeekStartISO: string
    weekCount: number
    fetchUrl: string
    fetchHeaders?: Record<string, string>
    staleTime?: number
  }

  if (!req.featureName || !req.currentWeekStartISO) {
    throw new GrpcError(GrpcStatus.INVALID_ARGUMENT, 'featureName and currentWeekStartISO are required')
  }

  const weekCount = req.weekCount ?? 3
  const staleTime = req.staleTime ?? DEFAULT_STALE_TIME
  const tasks: PrefetchTask[] = []

  let currentMonday = new Date(req.currentWeekStartISO)

  for (let i = 1; i <= weekCount; i++) {
    const { start, end } = _getPreviousWeekRange(currentMonday)
    const dateRange: DateRange = {
      startDate: _formatDateToAPI(start),
      endDate: _formatDateToAPI(end),
    }

    const cacheKey = _makeCacheKey(req.featureName, dateRange)
    const existing = _cache.get(cacheKey)

    // Skip if fresh
    if (existing && !_isStale(existing)) {
      tasks.push({
        id: _makeTaskId(req.featureName, dateRange),
        featureName: req.featureName,
        dateRange,
        status: 'completed',
        startedAt: Date.now(),
        completedAt: Date.now(),
      })
      currentMonday = start
      continue
    }

    // Create fetch task
    const taskId = _makeTaskId(req.featureName, dateRange)
    const task: PrefetchTask = {
      id: taskId,
      featureName: req.featureName,
      dateRange,
      status: 'pending',
      startedAt: Date.now(),
    }
    _activeTasks.set(taskId, task)
    tasks.push(task)

    // Execute fetch (fire-and-forget, result is cached)
    const abortController = new AbortController()
    _abortControllers.set(taskId, abortController)

    const fetchUrl = req.fetchUrl
      .replace('{startDate}', dateRange.startDate)
      .replace('{endDate}', dateRange.endDate)

    task.status = 'fetching'
    _executeFetch(
      fetchUrl,
      { headers: req.fetchHeaders ?? {} },
      cacheKey,
      staleTime,
      abortController.signal,
    ).then(() => {
      task.status = 'completed'
      task.completedAt = Date.now()
    }).catch((err) => {
      task.status = 'failed'
      task.error = err instanceof Error ? err.message : 'Unknown error'
    }).finally(() => {
      _abortControllers.delete(taskId)
    })

    currentMonday = start
  }

  return {
    started: tasks.length,
    tasks: tasks.map(t => ({
      id: t.id,
      featureName: t.featureName,
      dateRange: t.dateRange,
      status: t.status,
    })),
  }
}

/**
 * PREFETCH_SINGLE: Prefetch a single date range.
 * Payload: {
 *   featureName: string,
 *   dateRange: DateRange,
 *   fetchUrl: string,
 *   fetchHeaders?: Record<string, string>,
 *   staleTime?: number
 * }
 */
const handlePrefetchSingle: RequestHandler = async (payload) => {
  const req = payload as {
    featureName: string
    dateRange: DateRange
    fetchUrl: string
    fetchHeaders?: Record<string, string>
    staleTime?: number
  }

  const cacheKey = _makeCacheKey(req.featureName, req.dateRange)
  const existing = _cache.get(cacheKey)

  if (existing && !_isStale(existing)) {
    return { cached: true, data: existing.data }
  }

  const data = await _executeFetch(
    req.fetchUrl,
    { headers: req.fetchHeaders ?? {} },
    cacheKey,
    req.staleTime ?? DEFAULT_STALE_TIME,
  )

  return { cached: false, data }
}

/**
 * PREFETCH_INVALIDATE: Invalidate cached data.
 * Payload: { featureName?: string, dateRange?: DateRange }
 */
const handleInvalidate: RequestHandler = async (payload) => {
  const { featureName, dateRange } = payload as {
    featureName?: string
    dateRange?: DateRange
  }

  let invalidated = 0

  if (featureName && dateRange) {
    // Specific entry
    const key = _makeCacheKey(featureName, dateRange)
    if (_cache.delete(key)) invalidated++
  } else if (featureName) {
    // All entries for a feature
    const prefix = `Φ:${featureName}:`
    for (const key of _cache.keys()) {
      if (key.startsWith(prefix)) {
        _cache.delete(key)
        invalidated++
      }
    }
  } else {
    // Clear all
    invalidated = _cache.size
    _cache.clear()
  }

  return { invalidated }
}

/**
 * PREFETCH_STATUS: Get prefetch cache and task status.
 */
const handleStatus: RequestHandler = async () => {
  return {
    cacheSize: _cache.size,
    maxCacheSize: MAX_CACHE_SIZE,
    activeTasks: _activeTasks.size,
    concurrentFetches: _concurrentFetches,
    maxConcurrentFetches: MAX_CONCURRENT_FETCHES,
    entries: Array.from(_cache.entries()).map(([key, entry]) => ({
      key,
      fetchedAt: entry.fetchedAt,
      staleTime: entry.staleTime,
      φIndex: entry.φIndex,
      isStale: _isStale(entry),
    })),
  }
}

/**
 * PREFETCH_CANCEL: Cancel active prefetch tasks.
 * Payload: { taskId?: string } (if omitted, cancels all)
 */
const handleCancel: RequestHandler = async (payload) => {
  const { taskId } = payload as { taskId?: string }

  if (taskId) {
    const controller = _abortControllers.get(taskId)
    if (controller) {
      controller.abort()
      _abortControllers.delete(taskId)
      return { cancelled: 1 }
    }
    return { cancelled: 0 }
  }

  // Cancel all
  let cancelled = 0
  for (const [id, controller] of _abortControllers) {
    controller.abort()
    _abortControllers.delete(id)
    cancelled++
  }
  return { cancelled }
}

/**
 * PREFETCH_WARMUP: Pre-warm the cache with Fibonacci-scheduled fetches.
 * Payload: {
 *   featureName: string,
 *   baseDate: string,
 *   fetchUrl: string,
 *   fetchHeaders?: Record<string, string>,
 *   depth?: number
 * }
 */
const handleWarmup: RequestHandler = async (payload) => {
  const req = payload as {
    featureName: string
    baseDate: string
    fetchUrl: string
    fetchHeaders?: Record<string, string>
    depth?: number
  }

  const depth = req.depth ?? 5
  const baseDate = new Date(req.baseDate)
  const scheduled: string[] = []

  // Schedule fetches at Fibonacci-spaced week intervals
  for (let i = 0; i < depth; i++) {
    const weeksBack = _φ[i]
    const target = new Date(baseDate)
    target.setDate(target.getDate() - weeksBack * 7)

    // Find Monday of that week
    const day = target.getDay()
    const monday = new Date(target)
    monday.setDate(monday.getDate() - ((day + 6) % 7))
    const sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)

    const dateRange: DateRange = {
      startDate: _formatDateToAPI(monday),
      endDate: _formatDateToAPI(sunday),
    }

    const cacheKey = _makeCacheKey(req.featureName, dateRange)
    if (!_cache.has(cacheKey) || _isStale(_cache.get(cacheKey)!)) {
      const fetchUrl = req.fetchUrl
        .replace('{startDate}', dateRange.startDate)
        .replace('{endDate}', dateRange.endDate)

      // Schedule with staggered delay
      setTimeout(() => {
        _executeFetch(
          fetchUrl,
          { headers: req.fetchHeaders ?? {} },
          cacheKey,
          DEFAULT_STALE_TIME * (i + 1),
        ).catch(() => { /* silent */ })
      }, i * 500) // 500ms stagger

      scheduled.push(cacheKey)
    }
  }

  return {
    scheduled: scheduled.length,
    keys: scheduled,
  }
}

// ======================== Service Registration ========================

/**
 * Register all PrefetchService handlers on a gRPC channel.
 */
export function registerPrefetchService(
  channel: GrpcChannel,
  prefetchMutex?: SharedMutex,
): void {
  const guard = (handler: RequestHandler): RequestHandler => {
    if (!prefetchMutex) return handler
    return async (payload, meta) => {
      return withMutex(prefetchMutex, () => handler(payload, meta))
    }
  }

  channel.handleAll([
    [MethodIds.PREFETCH_WEEKS,      handlePrefetchWeeks],
    [MethodIds.PREFETCH_SINGLE,     handlePrefetchSingle],
    [MethodIds.PREFETCH_INVALIDATE, guard(handleInvalidate)],
    [MethodIds.PREFETCH_STATUS,     handleStatus],
    [MethodIds.PREFETCH_CANCEL,     handleCancel],
    [MethodIds.PREFETCH_WARMUP,     handleWarmup],
  ])
}

/**
 * Get cached data directly (for worker-internal use).
 */
export function getCachedData(featureName: string, dateRange: DateRange): unknown | null {
  const key = _makeCacheKey(featureName, dateRange)
  const entry = _cache.get(key)
  if (!entry || _isStale(entry)) return null
  return entry.data
}
