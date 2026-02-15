/**
 * Pipeline Bridge: Sealed Query
 *
 * Bridges existing React Query hooks to the membrane seal/verify/unseal pipeline.
 * Data flow: queryFn → select(adapt) → seal(membrane) → verify → unseal → component
 *
 * Components receive integrity-verified, immutable domain data that has passed
 * through the Anti-Corruption Membrane's signature verification.
 *
 * @module lib/pipeline/bridge
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { DomainKey, SealedProjection, Projection } from './types'
import { sealDirect, unseal, verifySeal } from './membrane'

// ======================== Configuration ========================

export interface SealedQueryConfig<K extends DomainKey, TRaw, TAdapted> {
  /** Domain key for membrane routing */
  readonly domainKey: K
  /** React Query cache key */
  readonly queryKey: readonly unknown[]
  /** Fetch function (delegates to existing API service) */
  readonly queryFn: () => Promise<TRaw>
  /** Adapter function: raw API → domain model */
  readonly select: (raw: TRaw) => TAdapted
  /** Cache freshness (ms) */
  readonly staleTime?: number
  /** Garbage collection time (ms) */
  readonly gcTime?: number
  /** Enable/disable the query */
  readonly enabled?: boolean
  /** Keep previous data visible during refetch (uses TanStack keepPreviousData) */
  readonly keepPrevious?: boolean
}

// ======================== Result Type ========================

export interface SealedQueryResult<K extends DomainKey, T> {
  /** Domain data — integrity-verified, passed through membrane unseal */
  readonly data: T | undefined
  /** Sealed envelope for advanced consumers (debugging, forwarding) */
  readonly sealed: SealedProjection<K> | null
  /** Whether the membrane integrity signature was verified */
  readonly integrityOk: boolean
  /** Initial loading state */
  readonly isLoading: boolean
  /** Background refetch state */
  readonly isFetching: boolean
  /** Whether the query is in error state */
  readonly isError: boolean
  /** Last error */
  readonly error: Error | null
  /** Imperatively trigger refetch */
  readonly refetch: () => void
}

// ======================== Hook ========================

/**
 * Sealed Query: React Query + Membrane integrity layer.
 *
 * Drop-in replacement for `useQuery` that routes all data through
 * the membrane's seal → verify → unseal pipeline.
 *
 * @example
 * ```tsx
 * const { data, isLoading, sealed } = useSealedQuery({
 *   domainKey: 'bp',
 *   queryKey: ['bp', 'trend', dateRange],
 *   queryFn: () => getBPDetail(dateRange),
 *   select: adaptBPData,
 * })
 * // data: BPDomainModel (integrity-verified)
 * // sealed: SealedProjection<'bp'> (signed envelope)
 * ```
 */
export function useSealedQuery<K extends DomainKey, TRaw, TAdapted>(
  config: SealedQueryConfig<K, TRaw, TAdapted>,
): SealedQueryResult<K, TAdapted> {
  const {
    domainKey,
    queryKey,
    queryFn,
    select,
    staleTime,
    gcTime,
    enabled,
    keepPrevious,
  } = config

  // Layer 1: Standard React Query fetch + adapt
  const query = useQuery({
    queryKey,
    queryFn,
    select,
    staleTime,
    gcTime,
    enabled,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
  })

  // Layer 2: Route adapted data through membrane seal → verify → unseal
  const pipelineResult = useMemo(() => {
    if (query.data === undefined) {
      return { data: undefined as TAdapted | undefined, sealed: null, integrityOk: false }
    }

    // Seal through membrane (DJBX33A integrity signing + Object.freeze)
    const sealed = sealDirect(domainKey, query.data as unknown as Projection<K>)

    // Verify integrity signature
    const integrityOk = verifySeal(sealed)

    // Unseal: extract verified, immutable payload
    const data = unseal(sealed) as unknown as TAdapted

    return { data, sealed, integrityOk }
  }, [query.data, domainKey])

  // Compose final result
  return useMemo(() => ({
    data: pipelineResult.data,
    sealed: pipelineResult.sealed,
    integrityOk: pipelineResult.integrityOk,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }), [pipelineResult, query.isLoading, query.isFetching, query.isError, query.error, query.refetch])
}
