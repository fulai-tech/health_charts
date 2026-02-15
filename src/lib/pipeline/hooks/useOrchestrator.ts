/**
 * Reactive Orchestrator Hook
 *
 * The top-level composition hook that combines:
 *   - Guard Chain (auth, network, cache, viewport gates)
 *   - Pipeline Execution (strategy resolution, fetch, membrane transduce)
 *   - Reactive Projection (unseal, morphism, memoization)
 *   - Lifecycle Management (mount/unmount, re-fetch, invalidation)
 *
 * Components should ONLY use this hook for data acquisition.
 * Direct use of lower-level hooks (useGuardChain, useProjection) is discouraged.
 *
 * @module hooks/reactive/useOrchestrator
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import type {
  DomainKey,
  Projection,
  SealedProjection,
  Morphism,
  NamedGuard,
} from '../types'
import {
  executePipeline,
  sealDirect,
  unseal,
  getMorphismContext,
  type PipelineResult,
} from '..'
import { useGuardChain, type GuardChainOptions } from './useGuardChain'
import { useProjection, type UseProjectionOptions } from './useProjection'

// ======================== Orchestrator Types ========================

type OrchestratorPhase =
  | 'initializing'
  | 'guarding'
  | 'fetching'
  | 'projecting'
  | 'ready'
  | 'error'
  | 'stale'

interface OrchestratorState<K extends DomainKey> {
  phase: OrchestratorPhase
  sealed: SealedProjection<K> | null
  error: string | null
  pipelineToken: string | null
  fetchCount: number
  lastFetchAt: number | null
}

// ======================== Configuration ========================

export interface UseOrchestratorOptions<K extends DomainKey, R = Projection<K>> {
  /** Domain key identifying the feature */
  key: K
  /** Parameters passed to the pipeline strategy */
  params?: Record<string, unknown>
  /** Guard chain configuration */
  guards?: GuardChainOptions
  /** Projection configuration (morphism, integrity check) */
  projection?: UseProjectionOptions<K, R>
  /** React Query stale time (ms) */
  staleTime?: number
  /** React Query GC time (ms) */
  gcTime?: number
  /** Whether the orchestrator is enabled (defaults to true) */
  enabled?: boolean
  /** Demo data generator — bypasses pipeline when provided */
  demoDataFn?: () => Projection<K>
  /** Whether demo mode is active */
  isDemoMode?: boolean
  /** Callback on successful fetch */
  onSuccess?: (data: Projection<K>) => void
  /** Callback on error */
  onError?: (error: string) => void
}

export interface UseOrchestratorResult<K extends DomainKey, R = Projection<K>> {
  /** Projected data ready for rendering (null if not yet fetched) */
  data: R | null
  /** Raw sealed projection (for advanced use) */
  sealed: SealedProjection<K> | null
  /** Current orchestrator phase */
  phase: OrchestratorPhase
  /** Whether data is currently being fetched */
  isLoading: boolean
  /** Whether all guards are passing */
  isReady: boolean
  /** Last error message */
  error: string | null
  /** Number of completed fetch cycles */
  fetchCount: number
  /** Whether operating in demo mode */
  isDemoMode: boolean
  /** Manually trigger a refetch */
  refetch: () => void
  /** Invalidate cached data and force refetch */
  invalidate: () => void
  /** Pipeline execution token for debugging */
  pipelineToken: string | null
}

// ======================== Query Key Factory ========================

const ORCHESTRATOR_KEY_PREFIX = ['core', 'orchestrator'] as const

function buildQueryKey<K extends DomainKey>(
  key: K,
  params: Record<string, unknown>,
  isDemoMode: boolean,
): readonly unknown[] {
  return [
    ...ORCHESTRATOR_KEY_PREFIX,
    key,
    isDemoMode ? 'demo' : 'live',
    JSON.stringify(params),
  ] as const
}

// ======================== Main Hook ========================

/**
 * Orchestrate the full data lifecycle for a domain feature.
 *
 * This is the ONLY hook components need to call for data.
 * Everything else (guards, pipeline, projection) is handled internally.
 *
 * @example
 * ```tsx
 * function BPCard() {
 *   const { data, isLoading, error } = useOrchestrator({
 *     key: 'bp',
 *     params: { start_date: '2024-01-01', end_date: '2024-01-07' },
 *     guards: { containerRef: cardRef },
 *     projection: {
 *       morphism: (sealed, ctx) => {
 *         const raw = unseal(sealed)
 *         return { systolic: raw.s, diastolic: raw.d }
 *       },
 *     },
 *   })
 *
 *   if (isLoading) return <Skeleton />
 *   if (error) return <ErrorCard message={error} />
 *   return <BPChart data={data} />
 * }
 * ```
 */
export function useOrchestrator<K extends DomainKey, R = Projection<K>>(
  options: UseOrchestratorOptions<K, R>,
): UseOrchestratorResult<K, R> {
  const {
    key,
    params = {},
    guards: guardOptions = {},
    projection: projectionOptions = {},
    staleTime = 5 * 60_000,
    gcTime = 10 * 60_000,
    enabled = true,
    demoDataFn,
    isDemoMode = false,
    onSuccess,
    onError,
  } = options

  // Layer 1: Guard chain
  const { guards, isReady: guardsReady, markFetched } = useGuardChain(guardOptions)

  // Layer 2: Projection
  const { data: projectedData, project, invalidate: invalidateProjection, phase: projectionPhase } =
    useProjection<K, R>(projectionOptions)

  // Internal state
  const [orchestratorState, setOrchestratorState] = useState<OrchestratorState<K>>({
    phase: 'initializing',
    sealed: null,
    error: null,
    pipelineToken: null,
    fetchCount: 0,
    lastFetchAt: null,
  })

  const queryClient = useQueryClient()
  const mountedRef = useRef(true)
  const fetchCountRef = useRef(0)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Query key
  const queryKey = useMemo(
    () => buildQueryKey(key, params, isDemoMode),
    [key, params, isDemoMode],
  )

  // Pipeline query function
  const queryFn = useCallback(async (): Promise<SealedProjection<K>> => {
    if (!mountedRef.current) throw new Error('Component unmounted')

    setOrchestratorState(prev => ({ ...prev, phase: 'guarding' }))

    // Demo mode: bypass pipeline entirely
    if (isDemoMode && demoDataFn) {
      const demoData = demoDataFn()
      const sealed = sealDirect(key, demoData)
      return sealed
    }

    setOrchestratorState(prev => ({ ...prev, phase: 'fetching' }))

    // Execute full pipeline
    const result: PipelineResult<K> = await executePipeline(
      key,
      params,
      guards as readonly NamedGuard[],
    )

    if (!result.ok) {
      throw new Error(`[Pipeline:${result.stage}] ${result.reason}`)
    }

    return result.data
  }, [key, params, guards, isDemoMode, demoDataFn])

  // React Query integration
  const query = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    enabled: enabled && (guardsReady || isDemoMode),
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false
      const msg = error instanceof Error ? error.message : ''
      // Don't retry auth failures
      if (msg.includes('AUTH_')) return false
      return true
    },
  })

  // React to query state changes
  useEffect(() => {
    if (query.data && mountedRef.current) {
      fetchCountRef.current++
      const sealed = query.data

      // Project the sealed data
      project(sealed)
      markFetched()

      setOrchestratorState({
        phase: 'ready',
        sealed,
        error: null,
        pipelineToken: null,
        fetchCount: fetchCountRef.current,
        lastFetchAt: Date.now(),
      })

      // Callback
      try {
        const raw = unseal(sealed)
        onSuccess?.(raw)
      } catch {
        // Integrity error during callback — non-critical
      }
    }
  }, [query.data, project, markFetched, onSuccess])

  useEffect(() => {
    if (query.error && mountedRef.current) {
      const msg = query.error instanceof Error ? query.error.message : 'Unknown error'
      setOrchestratorState(prev => ({
        ...prev,
        phase: 'error',
        error: msg,
      }))
      onError?.(msg)
    }
  }, [query.error, onError])

  // Imperative actions
  const refetch = useCallback(() => {
    query.refetch()
  }, [query])

  const invalidate = useCallback(() => {
    invalidateProjection()
    queryClient.invalidateQueries({ queryKey })
  }, [invalidateProjection, queryClient, queryKey])

  // Compute final phase
  const phase: OrchestratorPhase = useMemo(() => {
    if (query.isLoading) return 'fetching'
    if (orchestratorState.error) return 'error'
    if (projectionPhase === 'stale') return 'stale'
    if (projectedData !== null) return 'ready'
    return 'initializing'
  }, [query.isLoading, orchestratorState.error, projectionPhase, projectedData])

  return useMemo(() => ({
    data: projectedData,
    sealed: orchestratorState.sealed,
    phase,
    isLoading: query.isLoading || query.isFetching,
    isReady: guardsReady,
    error: orchestratorState.error,
    fetchCount: orchestratorState.fetchCount,
    isDemoMode,
    refetch,
    invalidate,
    pipelineToken: orchestratorState.pipelineToken,
  }), [
    projectedData,
    orchestratorState,
    phase,
    query.isLoading,
    query.isFetching,
    guardsReady,
    isDemoMode,
    refetch,
    invalidate,
  ])
}
