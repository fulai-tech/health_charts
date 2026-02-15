/**
 * Pipeline Module: Domain Type System, Anti-Corruption Membrane, and Execution Pipeline.
 *
 * Self-contained architecture layer. All cross-domain data flow passes through here.
 *
 * @module lib/pipeline
 * @internal
 */

// Type system
export type {
  Phantom,
  Sealed,
  IntentToken,
  DomainKey,
  IndicatorOf,
  DomainOf,
  DomainShapes,
  Projection,
  SealedProjection,
  AnySealedProjection,
  MorphismContext,
  Morphism,
  Contramap,
  PipelineStage,
  PrevStage,
  StageOutput,
  ResolvedIntent,
  GateVerdict,
  RawEnvelope,
  DomainStrategy,
  StrategyRegistry,
  GuardFn,
  NamedGuard,
  GuardChainConfig,
  KeysWithField,
  Frozen,
  MergedProjection,
  UnsealKey,
  ExhaustiveHandler,
  PartialHandler,
  PipelineConfig,
  PipelineRegistry,
  IndicatorBijection,
} from './types'

// Membrane operations
export {
  transduce,
  sealDirect,
  transduceBatch,
  createTransducer,
  unseal,
  unsealSafe,
  verifySeal,
  applyMorphism,
} from './membrane'

// Pipeline operations
export {
  registerStrategy,
  registerStrategies,
  executePipeline,
  executePipelineWithRetry,
  executePipelineBatch,
  createStrategy,
  setMorphismContext,
  getMorphismContext,
  type PipelineResult,
} from './pipeline'

// Bridge: sealed query (connects feature hooks to membrane)
export {
  useSealedQuery,
  type SealedQueryConfig,
  type SealedQueryResult,
} from './bridge'

// Reactive hooks
export {
  useGuardChain,
  type GuardChainOptions,
  type GuardChainResult,
  useProjection,
  useAutoProjection,
  useMultiProjection,
  type UseProjectionOptions,
  type UseProjectionResult,
  useOrchestrator,
  type UseOrchestratorOptions,
  type UseOrchestratorResult,
} from './hooks'

// Worker isolation layer (gRPC + Mutex)
export {
  WorkerBridge,
  useWorkerBridge,
  useWorkerAuth,
  useWorkerStorage,
  useWorkerStorageValue,
  useWorkerPrefetch,
  useWorkerDiagnostics,
  useWorkerLock,
  GrpcStatus,
  GrpcError,
  GrpcChannel,
  MethodIds,
  SharedMutex,
  RWLock,
  LockGuard,
  LockManager,
  withMutex,
  withReadLock,
  withWriteLock,
  type WorkerBridgeConfig,
  type GrpcStatusCode,
  type LockMetrics,
} from './worker'
