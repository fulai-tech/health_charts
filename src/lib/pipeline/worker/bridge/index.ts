/**
 * Worker Bridge — Main-thread client layer.
 *
 * @module worker/bridge
 * @internal
 */

export {
  WorkerBridge,
  type WorkerBridgeConfig,
  type WorkerBridgeMetrics,
} from './WorkerBridge'

export {
  useWorkerBridge,
  useWorkerAuth,
  useWorkerStorage,
  useWorkerStorageValue,
  useWorkerPrefetch,
  useWorkerDiagnostics,
  useWorkerLock,
} from './hooks'
