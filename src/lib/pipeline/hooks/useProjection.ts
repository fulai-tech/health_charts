/**
 * Reactive Projection Hook
 *
 * Provides memoized extraction of domain data from sealed projections
 * through the membrane's unseal pathway. Includes integrity verification
 * and automatic re-projection on context changes.
 *
 * This hook is the BRIDGE between sealed pipeline output and component rendering.
 *
 * @module hooks/reactive/useProjection
 */

import { useMemo, useCallback, useRef, useReducer, useEffect } from 'react'
import type {
  DomainKey,
  Projection,
  SealedProjection,
  MorphismContext,
  Morphism,
} from '../types'
import { unseal, unsealSafe, verifySeal, applyMorphism, getMorphismContext } from '..'

// ======================== Projection State ========================

type ProjectionPhase = 'idle' | 'projecting' | 'stale' | 'error'

interface ProjectionState<K extends DomainKey> {
  phase: ProjectionPhase
  data: Projection<K> | null
  error: string | null
  epoch: number | null
  projectionCount: number
}

type ProjectionAction<K extends DomainKey> =
  | { type: 'PROJECT'; data: Projection<K>; epoch: number }
  | { type: 'ERROR'; error: string }
  | { type: 'INVALIDATE' }
  | { type: 'RESET' }

function projectionReducer<K extends DomainKey>(
  state: ProjectionState<K>,
  action: ProjectionAction<K>,
): ProjectionState<K> {
  switch (action.type) {
    case 'PROJECT':
      return {
        phase: 'idle',
        data: action.data,
        error: null,
        epoch: action.epoch,
        projectionCount: state.projectionCount + 1,
      }
    case 'ERROR':
      return { ...state, phase: 'error', error: action.error }
    case 'INVALIDATE':
      return { ...state, phase: 'stale' }
    case 'RESET':
      return { phase: 'idle', data: null, error: null, epoch: null, projectionCount: 0 }
    default:
      return state
  }
}

function createInitialState<K extends DomainKey>(): ProjectionState<K> {
  return { phase: 'idle', data: null, error: null, epoch: null, projectionCount: 0 }
}

// ======================== Main Hook ========================

export interface UseProjectionOptions<K extends DomainKey, R = Projection<K>> {
  /** Optional morphism to transform the projection into a custom shape */
  morphism?: Morphism<K, R>
  /** Whether to verify seal integrity on every projection */
  verifyIntegrity?: boolean
  /** Custom equality check for memoization */
  isEqual?: (prev: R | null, next: R) => boolean
}

export interface UseProjectionResult<K extends DomainKey, R = Projection<K>> {
  /** Current projected data (null if no sealed data has been provided) */
  data: R | null
  /** Current projection phase */
  phase: ProjectionPhase
  /** Last error message, if any */
  error: string | null
  /** Number of times the projection has been recomputed */
  projectionCount: number
  /** Manually invalidate the current projection */
  invalidate: () => void
  /** Project from a new sealed source */
  project: (sealed: SealedProjection<K>) => void
}

/**
 * Project sealed domain data into component-ready form.
 *
 * Handles: unseal → verify → morphism → memoize
 *
 * @example
 * ```tsx
 * const { data, project } = useProjection<'bp'>({
 *   morphism: (sealed, ctx) => ({
 *     systolic: unseal(sealed).s,
 *     diastolic: unseal(sealed).d,
 *     label: ctx.locale === 'zh' ? '血压' : 'Blood Pressure',
 *   }),
 * })
 * ```
 */
export function useProjection<K extends DomainKey, R = Projection<K>>(
  options: UseProjectionOptions<K, R> = {},
): UseProjectionResult<K, R> {
  const { morphism, verifyIntegrity = true, isEqual } = options

  const [state, dispatch] = useReducer(
    projectionReducer<K>,
    undefined,
    createInitialState<K>,
  )

  const prevResultRef = useRef<R | null>(null)
  const contextRef = useRef<MorphismContext>(getMorphismContext())

  // Update context ref in effect to capture latest theme/locale
  const currentContext = getMorphismContext()
  useEffect(() => {
    contextRef.current = currentContext
  })

  const project = useCallback(
    (sealed: SealedProjection<K>) => {
      try {
        // Integrity check
        if (verifyIntegrity && !verifySeal(sealed)) {
          dispatch({ type: 'ERROR', error: 'Seal integrity verification failed' })
          return
        }

        // Apply morphism or default unseal
        let result: R
        if (morphism) {
          result = morphism(sealed, contextRef.current)
        } else {
          const raw = unseal(sealed)
          result = raw as unknown as R
        }

        // Equality check for memoization
        if (isEqual && prevResultRef.current !== null && isEqual(prevResultRef.current, result)) {
          return // No change — skip dispatch
        }

        prevResultRef.current = result
        dispatch({ type: 'PROJECT', data: result as unknown as Projection<K>, epoch: sealed.epoch })
      } catch (err) {
        dispatch({
          type: 'ERROR',
          error: err instanceof Error ? err.message : 'Projection failed',
        })
      }
    },
    [morphism, verifyIntegrity, isEqual],
  )

  const invalidate = useCallback(() => {
    dispatch({ type: 'INVALIDATE' })
    prevResultRef.current = null
  }, [])

  return useMemo(
    () => ({
      data: state.data as R | null,
      phase: state.phase,
      error: state.error,
      projectionCount: state.projectionCount,
      invalidate,
      project,
    }),
    [state, invalidate, project],
  )
}

// ======================== Utility Hooks ========================

/**
 * Simplified projection that auto-projects when sealed data changes.
 */
export function useAutoProjection<K extends DomainKey>(
  sealed: SealedProjection<K> | null,
  options: UseProjectionOptions<K> = {},
): Projection<K> | null {
  const { project, data } = useProjection<K>(options)

  const prevEpochRef = useRef<number | null>(null)

  // Move ref access to useEffect to avoid accessing during render
  useEffect(() => {
    if (sealed && sealed.epoch !== prevEpochRef.current) {
      prevEpochRef.current = sealed.epoch
      project(sealed)
    }
  }, [sealed, project])

  return data
}

/**
 * Multi-domain projection: project multiple sealed sources at once.
 */
export function useMultiProjection<KS extends readonly DomainKey[]>(
  entries: { [I in keyof KS]: SealedProjection<KS[I] & DomainKey> | null },
): { [I in keyof KS]: Projection<KS[I] & DomainKey> | null } {
  return useMemo(() => {
    return entries.map((sealed) => {
      if (!sealed) return null
      const safe = unsealSafe(sealed as SealedProjection<DomainKey>)
      return safe ?? null
    }) as { [I in keyof KS]: Projection<KS[I] & DomainKey> | null }
  }, [entries])
}
