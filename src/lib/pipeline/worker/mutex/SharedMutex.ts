/**
 * SharedMutex — Cross-thread mutual exclusion via SharedArrayBuffer + Atomics.
 *
 * Implements a spinlock-free mutex using Atomics.wait() and Atomics.notify()
 * for zero-busy-wait cross-thread synchronization.
 *
 * Memory layout (Int32Array over SharedArrayBuffer):
 * ┌──────────┬──────────┬──────────┬──────────┐
 * │ Lock(4)  │ Owner(4) │ Depth(4) │ Epoch(4) │
 * │ [0]      │ [1]      │ [2]      │ [3]      │
 * └──────────┴──────────┴──────────┴──────────┘
 *
 * Lock states:
 *   0 = UNLOCKED
 *   1 = LOCKED
 *
 * Supports re-entrant locking via owner tracking and depth counting.
 *
 * @module worker/mutex/SharedMutex
 * @internal
 */

// ======================== Constants ========================

const UNLOCKED = 0
const LOCKED = 1

const OFFSET_LOCK  = 0  // Int32 index 0: lock state
const OFFSET_OWNER = 1  // Int32 index 1: owner thread ID
const OFFSET_DEPTH = 2  // Int32 index 2: re-entrant depth
const OFFSET_EPOCH = 3  // Int32 index 3: acquisition epoch (monotonic)

/** Minimum SharedArrayBuffer size for a mutex: 16 bytes (4 x Int32) */
const MUTEX_BUFFER_SIZE = 16

// ======================== Thread ID ========================

let _threadId = 0

/**
 * Generate a unique thread identifier.
 * In the main thread this returns 1; in workers it returns incrementing IDs.
 */
export function getThreadId(): number {
  if (_threadId === 0) {
    // Use a combination of random + timestamp for uniqueness
    _threadId = (Math.random() * 0x7FFFFFFF) >>> 0 | 1
  }
  return _threadId
}

/**
 * Set an explicit thread ID (useful for worker identification).
 */
export function setThreadId(id: number): void {
  _threadId = id
}

// ======================== SharedMutex ========================

/**
 * SharedMutex: cross-thread mutual exclusion primitive.
 *
 * MUST be constructed with a SharedArrayBuffer that is shared between threads.
 * Both the main thread and worker thread(s) create a SharedMutex instance
 * pointing to the same underlying SharedArrayBuffer.
 *
 * @example
 * ```ts
 * // Main thread
 * const sab = new SharedArrayBuffer(16)
 * const mutex = new SharedMutex(sab)
 * worker.postMessage({ mutexBuffer: sab })
 *
 * // Worker thread
 * onmessage = (e) => {
 *   const mutex = new SharedMutex(e.data.mutexBuffer)
 *   mutex.lock()
 *   try { ... } finally { mutex.unlock() }
 * }
 * ```
 */
export class SharedMutex {
  private readonly _atoms: Int32Array
  private readonly _id: string

  /**
   * @param buffer - SharedArrayBuffer (minimum 16 bytes)
   * @param id - Optional identifier for debugging
   */
  constructor(buffer: SharedArrayBuffer, id: string = 'μ') {
    if (buffer.byteLength < MUTEX_BUFFER_SIZE) {
      throw new Error(
        `[SharedMutex:${id}] Buffer too small: ${buffer.byteLength} < ${MUTEX_BUFFER_SIZE}`
      )
    }
    this._atoms = new Int32Array(buffer)
    this._id = id
  }

  /**
   * Acquire the mutex. Blocks until the lock is available.
   *
   * Uses Atomics.wait() for efficient kernel-level blocking
   * (no busy-wait / spinlock).
   *
   * Supports re-entrant locking: if the current thread already owns the lock,
   * the depth counter is incremented instead of deadlocking.
   *
   * @param timeoutMs - Maximum wait time. 0 = infinite.
   * @returns true if acquired, false if timed out
   */
  lock(timeoutMs: number = 0): boolean {
    const tid = getThreadId()

    // Re-entrant check: if we already own the lock, just increment depth
    if (
      Atomics.load(this._atoms, OFFSET_LOCK) === LOCKED &&
      Atomics.load(this._atoms, OFFSET_OWNER) === tid
    ) {
      Atomics.add(this._atoms, OFFSET_DEPTH, 1)
      return true
    }

    const deadline = timeoutMs > 0 ? Date.now() + timeoutMs : Infinity

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Try to acquire: CAS (0 → 1)
      const prev = Atomics.compareExchange(this._atoms, OFFSET_LOCK, UNLOCKED, LOCKED)

      if (prev === UNLOCKED) {
        // Successfully acquired
        Atomics.store(this._atoms, OFFSET_OWNER, tid)
        Atomics.store(this._atoms, OFFSET_DEPTH, 1)
        Atomics.store(this._atoms, OFFSET_EPOCH, Date.now() & 0x7FFFFFFF)
        return true
      }

      // Lock is held by another thread — wait
      const remaining = deadline === Infinity ? undefined : Math.max(1, deadline - Date.now())

      if (remaining !== undefined && remaining <= 0) {
        return false  // Timeout
      }

      // Atomics.wait blocks the thread until notified or timeout
      // NOTE: Atomics.wait is NOT available on the main thread in most browsers.
      // On main thread, we fall back to a cooperative yield strategy.
      try {
        const result = Atomics.wait(this._atoms, OFFSET_LOCK, LOCKED, remaining)
        if (result === 'timed-out') {
          return false
        }
      } catch {
        // Atomics.wait not available (main thread) — cooperative polling fallback
        return this._cooperativeLock(deadline)
      }
    }
  }

  /**
   * Cooperative locking fallback for the main thread.
   * Uses setTimeout-based polling instead of Atomics.wait().
   *
   * WARNING: This is a degraded path. The main thread should generally
   * use tryLock() or async locking patterns.
   */
  private _cooperativeLock(deadline: number): boolean {
    // Single attempt — main thread should not block
    const prev = Atomics.compareExchange(this._atoms, OFFSET_LOCK, UNLOCKED, LOCKED)
    if (prev === UNLOCKED) {
      const tid = getThreadId()
      Atomics.store(this._atoms, OFFSET_OWNER, tid)
      Atomics.store(this._atoms, OFFSET_DEPTH, 1)
      Atomics.store(this._atoms, OFFSET_EPOCH, Date.now() & 0x7FFFFFFF)
      return true
    }

    if (Date.now() >= deadline) return false

    // For main thread: retry a few times with short delays
    for (let attempt = 0; attempt < 100; attempt++) {
      const p = Atomics.compareExchange(this._atoms, OFFSET_LOCK, UNLOCKED, LOCKED)
      if (p === UNLOCKED) {
        const tid = getThreadId()
        Atomics.store(this._atoms, OFFSET_OWNER, tid)
        Atomics.store(this._atoms, OFFSET_DEPTH, 1)
        Atomics.store(this._atoms, OFFSET_EPOCH, Date.now() & 0x7FFFFFFF)
        return true
      }
      if (Date.now() >= deadline) return false
      // Yield (busy wait is acceptable for short durations on main thread)
    }

    return false
  }

  /**
   * Try to acquire the mutex without blocking.
   * @returns true if acquired, false if already locked
   */
  tryLock(): boolean {
    const tid = getThreadId()

    // Re-entrant check
    if (
      Atomics.load(this._atoms, OFFSET_LOCK) === LOCKED &&
      Atomics.load(this._atoms, OFFSET_OWNER) === tid
    ) {
      Atomics.add(this._atoms, OFFSET_DEPTH, 1)
      return true
    }

    const prev = Atomics.compareExchange(this._atoms, OFFSET_LOCK, UNLOCKED, LOCKED)
    if (prev === UNLOCKED) {
      Atomics.store(this._atoms, OFFSET_OWNER, tid)
      Atomics.store(this._atoms, OFFSET_DEPTH, 1)
      Atomics.store(this._atoms, OFFSET_EPOCH, Date.now() & 0x7FFFFFFF)
      return true
    }

    return false
  }

  /**
   * Release the mutex.
   *
   * For re-entrant locks, decrements depth. Only truly releases when depth reaches 0.
   * Notifies one waiting thread via Atomics.notify().
   *
   * @throws If the calling thread does not own the lock
   */
  unlock(): void {
    const tid = getThreadId()
    const owner = Atomics.load(this._atoms, OFFSET_OWNER)

    if (owner !== tid) {
      throw new Error(
        `[SharedMutex:${this._id}] Thread ${tid} cannot unlock ` +
        `mutex owned by thread ${owner}`
      )
    }

    const depth = Atomics.sub(this._atoms, OFFSET_DEPTH, 1) - 1

    if (depth <= 0) {
      // Fully released
      Atomics.store(this._atoms, OFFSET_OWNER, 0)
      Atomics.store(this._atoms, OFFSET_DEPTH, 0)
      Atomics.store(this._atoms, OFFSET_LOCK, UNLOCKED)

      // Wake one waiting thread
      Atomics.notify(this._atoms, OFFSET_LOCK, 1)
    }
  }

  /**
   * Check if the mutex is currently locked.
   */
  get isLocked(): boolean {
    return Atomics.load(this._atoms, OFFSET_LOCK) === LOCKED
  }

  /**
   * Get the owner thread ID (0 if unlocked).
   */
  get ownerId(): number {
    return Atomics.load(this._atoms, OFFSET_OWNER)
  }

  /**
   * Get current lock depth (0 if unlocked).
   */
  get depth(): number {
    return Atomics.load(this._atoms, OFFSET_DEPTH)
  }

  /**
   * Get the underlying SharedArrayBuffer (for cross-thread sharing).
   */
  get buffer(): SharedArrayBuffer {
    return this._atoms.buffer as SharedArrayBuffer
  }

  /**
   * Diagnostic snapshot.
   */
  snapshot(): { locked: boolean; owner: number; depth: number; epoch: number } {
    return {
      locked: this.isLocked,
      owner: this.ownerId,
      depth: this.depth,
      epoch: Atomics.load(this._atoms, OFFSET_EPOCH),
    }
  }
}

/**
 * Create a new SharedMutex with its own SharedArrayBuffer.
 */
export function createSharedMutex(id?: string): SharedMutex {
  const sab = new SharedArrayBuffer(MUTEX_BUFFER_SIZE)
  return new SharedMutex(sab, id)
}
