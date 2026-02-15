/**
 * Mutex Module — Cross-thread synchronization primitives.
 *
 * @module worker/mutex
 * @internal
 */

export {
  SharedMutex,
  createSharedMutex,
  getThreadId,
  setThreadId,
} from './SharedMutex'

export {
  RWLock,
  createRWLock,
} from './RWLock'

export {
  LockGuard,
  LockManager,
  withMutex,
  withReadLock,
  withWriteLock,
  type LockMetrics,
} from './LockGuard'
