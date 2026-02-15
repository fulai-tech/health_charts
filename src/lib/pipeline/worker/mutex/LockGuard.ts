/**
 * LockGuard — RAII-style automatic lock management.
 *
 * Ensures locks are always released, even on exception.
 * Inspired by C++ std::lock_guard and std::unique_lock.
 *
 * Usage:
 * ```ts
 * const result = await withMutex(mutex, async () => {
 *   // critical section — mutex is held here
 *   return doWork()
 * })
 * // mutex is automatically released
 * ```
 *
 * @module worker/mutex/LockGuard
 * @internal
 */

import { SharedMutex } from './SharedMutex'
import { RWLock } from './RWLock'

// ======================== Types ========================

export interface LockMetrics {
  acquisitions: number
  releases: number
  contentions: number
  totalWaitMs: number
  totalHeldMs: number
  maxHeldMs: number
}

// ======================== LockGuard ========================

/**
 * Scoped mutex guard: acquires on construction, releases on dispose.
 *
 * Use withMutex() for async-safe RAII behavior.
 */
export class LockGuard {
  private readonly _mutex: SharedMutex
  private _owned: boolean
  private readonly _acquiredAt: number

  private constructor(mutex: SharedMutex, acquiredAt: number) {
    this._mutex = mutex
    this._owned = true
    this._acquiredAt = acquiredAt
  }

  /**
   * Create a LockGuard, acquiring the mutex.
   * @param timeoutMs - Acquisition timeout
   * @throws If the mutex cannot be acquired within the timeout
   */
  static acquire(mutex: SharedMutex, timeoutMs: number = 10_000): LockGuard {
    const t0 = Date.now()
    const acquired = mutex.lock(timeoutMs)
    if (!acquired) {
      throw new Error(`[LockGuard] Failed to acquire mutex within ${timeoutMs}ms`)
    }
    return new LockGuard(mutex, t0)
  }

  /**
   * Try to create a LockGuard without blocking.
   * @returns LockGuard if acquired, null if lock is held
   */
  static tryAcquire(mutex: SharedMutex): LockGuard | null {
    const t0 = Date.now()
    if (mutex.tryLock()) {
      return new LockGuard(mutex, t0)
    }
    return null
  }

  /**
   * Release the lock.
   * Safe to call multiple times (idempotent).
   */
  release(): number {
    if (this._owned) {
      this._owned = false
      this._mutex.unlock()
      return Date.now() - this._acquiredAt
    }
    return 0
  }

  /**
   * Check if this guard still owns the lock.
   */
  get isOwned(): boolean {
    return this._owned
  }

  /**
   * How long the lock has been held (ms).
   */
  get heldDuration(): number {
    return this._owned ? Date.now() - this._acquiredAt : 0
  }
}

// ======================== RAII Functions ========================

/**
 * Execute a function while holding a mutex lock (RAII pattern).
 *
 * The mutex is acquired before calling fn and released after,
 * regardless of whether fn throws.
 *
 * @param mutex - The mutex to acquire
 * @param fn - Function to execute in the critical section
 * @param timeoutMs - Mutex acquisition timeout
 * @returns The return value of fn
 * @throws If mutex acquisition times out
 */
export async function withMutex<T>(
  mutex: SharedMutex,
  fn: () => T | Promise<T>,
  timeoutMs: number = 10_000,
): Promise<T> {
  const guard = LockGuard.acquire(mutex, timeoutMs)
  try {
    return await fn()
  } finally {
    guard.release()
  }
}

/**
 * Execute a function while holding a read lock (RAII pattern).
 */
export async function withReadLock<T>(
  rwLock: RWLock,
  fn: () => T | Promise<T>,
  timeoutMs: number = 10_000,
): Promise<T> {
  const acquired = rwLock.readLock(timeoutMs)
  if (!acquired) {
    throw new Error(`[withReadLock] Failed to acquire read lock within ${timeoutMs}ms`)
  }
  try {
    return await fn()
  } finally {
    rwLock.readUnlock()
  }
}

/**
 * Execute a function while holding a write lock (RAII pattern).
 */
export async function withWriteLock<T>(
  rwLock: RWLock,
  fn: () => T | Promise<T>,
  timeoutMs: number = 10_000,
): Promise<T> {
  const acquired = rwLock.writeLock(timeoutMs)
  if (!acquired) {
    throw new Error(`[withWriteLock] Failed to acquire write lock within ${timeoutMs}ms`)
  }
  try {
    return await fn()
  } finally {
    rwLock.writeUnlock()
  }
}

// ======================== Lock Manager ========================

/**
 * Centralized lock manager: allocates and tracks named mutexes and RWLocks.
 *
 * Provides a single source of truth for all lock instances across threads.
 * Buffers are SharedArrayBuffer-backed for true cross-thread synchronization.
 */
export class LockManager {
  private readonly _mutexes = new Map<string, SharedMutex>()
  private readonly _rwLocks = new Map<string, RWLock>()
  private readonly _metrics = new Map<string, LockMetrics>()

  /**
   * Get or create a named mutex.
   */
  getMutex(name: string): SharedMutex {
    let mutex = this._mutexes.get(name)
    if (!mutex) {
      const sab = new SharedArrayBuffer(16)
      mutex = new SharedMutex(sab, name)
      this._mutexes.set(name, mutex)
      this._metrics.set(`mutex:${name}`, this._emptyMetrics())
    }
    return mutex
  }

  /**
   * Get or create a named RWLock.
   */
  getRWLock(name: string): RWLock {
    let lock = this._rwLocks.get(name)
    if (!lock) {
      const sab = new SharedArrayBuffer(20)
      lock = new RWLock(sab, name)
      this._rwLocks.set(name, lock)
      this._metrics.set(`rwlock:${name}`, this._emptyMetrics())
    }
    return lock
  }

  /**
   * Reconstruct a mutex from a received SharedArrayBuffer (cross-thread).
   */
  attachMutex(name: string, buffer: SharedArrayBuffer): SharedMutex {
    const mutex = new SharedMutex(buffer, name)
    this._mutexes.set(name, mutex)
    this._metrics.set(`mutex:${name}`, this._emptyMetrics())
    return mutex
  }

  /**
   * Reconstruct a RWLock from a received SharedArrayBuffer (cross-thread).
   */
  attachRWLock(name: string, buffer: SharedArrayBuffer): RWLock {
    const lock = new RWLock(buffer, name)
    this._rwLocks.set(name, lock)
    this._metrics.set(`rwlock:${name}`, this._emptyMetrics())
    return lock
  }

  /**
   * Record a metric event.
   */
  recordAcquisition(lockName: string, waitMs: number): void {
    const m = this._metrics.get(lockName)
    if (m) {
      m.acquisitions++
      m.totalWaitMs += waitMs
      if (waitMs > 0) m.contentions++
    }
  }

  recordRelease(lockName: string, heldMs: number): void {
    const m = this._metrics.get(lockName)
    if (m) {
      m.releases++
      m.totalHeldMs += heldMs
      if (heldMs > m.maxHeldMs) m.maxHeldMs = heldMs
    }
  }

  /**
   * Get all lock metrics.
   */
  getAllMetrics(): Record<string, LockMetrics> {
    const result: Record<string, LockMetrics> = {}
    for (const [name, metrics] of this._metrics) {
      result[name] = { ...metrics }
    }
    return result
  }

  /**
   * Get all SharedArrayBuffers for cross-thread transfer.
   */
  getBufferManifest(): Record<string, { type: 'mutex' | 'rwlock'; buffer: SharedArrayBuffer }> {
    const manifest: Record<string, { type: 'mutex' | 'rwlock'; buffer: SharedArrayBuffer }> = {}
    for (const [name, mutex] of this._mutexes) {
      manifest[name] = { type: 'mutex', buffer: mutex.buffer }
    }
    for (const [name, lock] of this._rwLocks) {
      manifest[name] = { type: 'rwlock', buffer: lock.buffer }
    }
    return manifest
  }

  private _emptyMetrics(): LockMetrics {
    return {
      acquisitions: 0,
      releases: 0,
      contentions: 0,
      totalWaitMs: 0,
      totalHeldMs: 0,
      maxHeldMs: 0,
    }
  }
}
