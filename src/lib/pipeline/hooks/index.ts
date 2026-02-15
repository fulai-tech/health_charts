/**
 * Reactive hook layer: guard chain, projection, and orchestration.
 *
 * Components should primarily use `useOrchestrator` for all data needs.
 * Lower-level hooks are exported for advanced use cases only.
 *
 * @module hooks/reactive
 */

export {
  useGuardChain,
  type GuardChainOptions,
  type GuardChainResult,
} from './useGuardChain'

export {
  useProjection,
  useAutoProjection,
  useMultiProjection,
  type UseProjectionOptions,
  type UseProjectionResult,
} from './useProjection'

export {
  useOrchestrator,
  type UseOrchestratorOptions,
  type UseOrchestratorResult,
} from './useOrchestrator'
