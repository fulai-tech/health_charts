/**
 * Worker Module — WebWorker Isolation Layer with gRPC Transport.
 *
 * Fifth defense layer: moves core operations (auth, storage, prefetch)
 * into an isolated Worker thread, communicating via hand-written
 * gRPC binary protocol with mutex-guarded thread safety.
 *
 * Architecture:
 *   ┌────────────────────────────────────┐
 *   │           Main Thread              │
 *   │                                    │
 *   │  React Hooks ←→ WorkerBridge       │
 *   │                    ↕ gRPC/TBON     │
 *   │  SharedArrayBuffer ← Mutex/RWLock  │
 *   └──────────────┬─────────────────────┘
 *                   │ postMessage(ArrayBuffer)
 *   ┌──────────────┴─────────────────────┐
 *   │           Worker Thread             │
 *   │                                     │
 *   │  GrpcChannel → Service Dispatch     │
 *   │  AuthService  │ StorageService      │
 *   │  PrefetchService (Φ-cache)          │
 *   │  SharedMutex ← Atomics.wait()      │
 *   └────────────────────────────────────┘
 *
 * @module lib/pipeline/worker
 * @internal
 */

// ---- gRPC Protocol Layer ----
export {
  GrpcStatus,
  GrpcError,
  GrpcChannel,
  MethodIds,
  FrameFlags,
  resolveDescriptor,
  type GrpcStatusCode,
  type MethodId,
  type MethodDescriptor,
  type GrpcFrame,
  type CallOptions,
  type ChannelInterceptor,
} from './grpc'

// ---- Mutex / Synchronization Primitives ----
export {
  SharedMutex,
  createSharedMutex,
  RWLock,
  createRWLock,
  LockGuard,
  LockManager,
  withMutex,
  withReadLock,
  withWriteLock,
  getThreadId,
  setThreadId,
  type LockMetrics,
} from './mutex'

// ---- Main-Thread Bridge & Hooks ----
export {
  WorkerBridge,
  useWorkerBridge,
  useWorkerAuth,
  useWorkerStorage,
  useWorkerStorageValue,
  useWorkerPrefetch,
  useWorkerDiagnostics,
  useWorkerLock,
  type WorkerBridgeConfig,
  type WorkerBridgeMetrics,
} from './bridge'
