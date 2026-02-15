/**
 * RWLock — Readers-Writer Lock via SharedArrayBuffer + Atomics.
 *
 * Implements a multiple-readers / single-writer lock for concurrent
 * read access with exclusive write access.
 *
 * Memory layout (Int32Array over SharedArrayBuffer):
 * ┌──────────┬──────────┬──────────┬──────────┬──────────┐
 * │ State(4) │ Readers  │ WOwner   │ WDepth   │ Waiters  │
 * │ [0]      │ [1]      │ [2]      │ [3]      │ [4]      │
 * └──────────┴──────────┴──────────┴──────────┴──────────┘
 *
 * State values:
 *   0 = FREE            (no readers, no writer)
 *   1 = READING          (one or more readers active)
 *   2 = WRITING          (exclusive writer active)
 *
 * Writer starvation prevention:
 *   When a writer is waiting (Waiters > 0), new readers are blocked.
 *
 * @module worker/mutex/RWLock
 * @internal
 */

import { getThreadId } from './SharedMutex'

// ======================== Constants ========================

const FREE    = 0
const READING = 1
const WRITING = 2

const OFF_STATE    = 0
const OFF_READERS  = 1
const OFF_WOWNER   = 2
const OFF_WDEPTH   = 3
const OFF_WAITERS  = 4

const RWLOCK_BUFFER_SIZE = 20  // 5 x Int32

// ======================== RWLock ========================

/**
 * RWLock: cross-thread readers-writer lock.
 *
 * Multiple threads can hold the read lock simultaneously.
 * Only one thread can hold the write lock, and it excludes all readers.
 *
 * Fairness: writers are given priority to prevent writer starvation.
 */
export class RWLock {
  private readonly _atoms: Int32Array
  private readonly _id: string

  constructor(buffer: SharedArrayBuffer, id: string = 'ρ') {
    if (buffer.byteLength < RWLOCK_BUFFER_SIZE) {
      throw new Error(
        `[RWLock:${id}] Buffer too small: ${buffer.byteLength} < ${RWLOCK_BUFFER_SIZE}`
      )
    }
    this._atoms = new Int32Array(buffer)
    this._id = id
  }

  // ======================== Read Lock ========================

  /**
   * Acquire a read lock.
   *
   * Blocks if a writer is active OR if a writer is waiting (fairness).
   * Multiple concurrent readers are allowed.
   *
   * @param timeoutMs - Maximum wait time (0 = infinite)
   * @returns true if acquired, false if timed out
   */
  readLock(timeoutMs: number = 0): boolean {
    const deadline = timeoutMs > 0 ? Date.now() + timeoutMs : Infinity

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const state = Atomics.load(this._atoms, OFF_STATE)
      const waitingWriters = Atomics.load(this._atoms, OFF_WAITERS)

      // Can acquire read if: no writer active AND no writers waiting
      if (state !== WRITING && waitingWriters === 0) {
        // Transition FREE → READING, or stay READING
        if (state === FREE) {
          const prev = Atomics.compareExchange(this._atoms, OFF_STATE, FREE, READING)
          if (prev !== FREE) continue
        }

        // Increment reader count
        Atomics.add(this._atoms, OFF_READERS, 1)
        return true
      }

      // Wait
      if (Date.now() >= deadline && deadline !== Infinity) return false

      try {
        const remaining = deadline === Infinity ? 50 : Math.max(1, deadline - Date.now())
        Atomics.wait(this._atoms, OFF_STATE, state, remaining)
      } catch {
        // Main thread fallback: cooperative retry
        if (Date.now() >= deadline && deadline !== Infinity) return false
      }
    }
  }

  /**
   * Release a read lock.
   * If this is the last reader, transition state to FREE and notify waiting writers.
   */
  readUnlock(): void {
    const remaining = Atomics.sub(this._atoms, OFF_READERS, 1) - 1

    if (remaining <= 0) {
      // Last reader — transition to FREE
      Atomics.store(this._atoms, OFF_READERS, 0)
      Atomics.compareExchange(this._atoms, OFF_STATE, READING, FREE)
      // Wake all waiting threads (writers + readers)
      Atomics.notify(this._atoms, OFF_STATE, Infinity)
    }
  }

  // ======================== Write Lock ========================

  /**
   * Acquire a write lock (exclusive).
   *
   * Blocks until all readers finish and no other writer is active.
   * Registers as a waiting writer to prevent reader starvation of writers.
   *
   * Supports re-entrant write locking.
   *
   * @param timeoutMs - Maximum wait time (0 = infinite)
   * @returns true if acquired, false if timed out
   */
  writeLock(timeoutMs: number = 0): boolean {
    const tid = getThreadId()
    const deadline = timeoutMs > 0 ? Date.now() + timeoutMs : Infinity

    // Re-entrant check
    if (
      Atomics.load(this._atoms, OFF_STATE) === WRITING &&
      Atomics.load(this._atoms, OFF_WOWNER) === tid
    ) {
      Atomics.add(this._atoms, OFF_WDEPTH, 1)
      return true
    }

    // Register as waiting writer (blocks new readers — fairness)
    Atomics.add(this._atoms, OFF_WAITERS, 1)

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Try to transition FREE → WRITING
      const prev = Atomics.compareExchange(this._atoms, OFF_STATE, FREE, WRITING)

      if (prev === FREE) {
        // Acquired
        Atomics.sub(this._atoms, OFF_WAITERS, 1)
        Atomics.store(this._atoms, OFF_WOWNER, tid)
        Atomics.store(this._atoms, OFF_WDEPTH, 1)
        return true
      }

      // Wait
      if (Date.now() >= deadline && deadline !== Infinity) {
        Atomics.sub(this._atoms, OFF_WAITERS, 1)
        return false
      }

      try {
        const remaining = deadline === Infinity ? 50 : Math.max(1, deadline - Date.now())
        Atomics.wait(this._atoms, OFF_STATE, prev, remaining)
      } catch {
        // Main thread fallback
        if (Date.now() >= deadline && deadline !== Infinity) {
          Atomics.sub(this._atoms, OFF_WAITERS, 1)
          return false
        }
      }
    }
  }

  /**
   * Release a write lock.
   *
   * For re-entrant locks, decrements depth. Only truly releases when depth reaches 0.
   *
   * @throws If the calling thread does not own the write lock
   */
  writeUnlock(): void {
    const tid = getThreadId()
    const owner = Atomics.load(this._atoms, OFF_WOWNER)

    if (owner !== tid) {
      throw new Error(
        `[RWLock:${this._id}] Thread ${tid} cannot write-unlock ` +
        `lock owned by thread ${owner}`
      )
    }

    const depth = Atomics.sub(this._atoms, OFF_WDEPTH, 1) - 1

    if (depth <= 0) {
      Atomics.store(this._atoms, OFF_WOWNER, 0)
      Atomics.store(this._atoms, OFF_WDEPTH, 0)
      Atomics.store(this._atoms, OFF_STATE, FREE)
      // Wake all: both waiting readers and writers
      Atomics.notify(this._atoms, OFF_STATE, Infinity)
    }
  }

  // ======================== Diagnostics ========================

  /**
   * Current lock state.
   */
  get state(): 'free' | 'reading' | 'writing' {
    const s = Atomics.load(this._atoms, OFF_STATE)
    if (s === WRITING) return 'writing'
    if (s === READING) return 'reading'
    return 'free'
  }

  /**
   * Number of active readers.
   */
  get readerCount(): number {
    return Math.max(0, Atomics.load(this._atoms, OFF_READERS))
  }

  /**
   * Number of writers waiting to acquire the lock.
   */
  get waitingWriters(): number {
    return Math.max(0, Atomics.load(this._atoms, OFF_WAITERS))
  }

  /**
   * Get the underlying SharedArrayBuffer.
   */
  get buffer(): SharedArrayBuffer {
    return this._atoms.buffer as SharedArrayBuffer
  }

  /**
   * Diagnostic snapshot.
   */
  snapshot(): {
    state: string
    readers: number
    writeOwner: number
    writeDepth: number
    waitingWriters: number
  } {
    return {
      state: this.state,
      readers: this.readerCount,
      writeOwner: Atomics.load(this._atoms, OFF_WOWNER),
      writeDepth: Atomics.load(this._atoms, OFF_WDEPTH),
      waitingWriters: this.waitingWriters,
    }
  }
}

/**
 * Create a new RWLock with its own SharedArrayBuffer.
 */
export function createRWLock(id?: string): RWLock {
  const sab = new SharedArrayBuffer(RWLOCK_BUFFER_SIZE)
  return new RWLock(sab, id)
}
