/**
 * Blood Pressure API Hooks
 *
 * All data flows through the pipeline membrane:
 *   queryFn(API) → select(adapt) → seal(membrane) → verify(DJBX33A) → unseal → component
 *
 * @module features/blood-pressure/api
 */

import { getBPDetail } from '@/services/api'
import type { BPDomainModel } from './types'
import { adaptBPData } from './adapter'
import { useSealedQuery, type SealedQueryResult } from '@/lib/pipeline'
import { usePrefetchData, type DateRange } from '@/lib/usePrefetchData'

// Re-export for backwards compatibility
export type { DateRange }

/** Typed result from the BP pipeline */
export type BPSealedResult = SealedQueryResult<'bp', BPDomainModel>

/**
 * Query keys for blood pressure data (scoped under pipeline prefix)
 */
export const bpQueryKeys = {
  all: ['pipeline', 'bp'] as const,
  trend: (dateRange?: DateRange) =>
    [...bpQueryKeys.all, 'trend', dateRange?.startDate, dateRange?.endDate] as const,
  details: () => [...bpQueryKeys.all, 'details'] as const,
}

/**
 * Blood pressure trend data hook.
 *
 * Pipeline flow:
 *   1. queryFn → calls `getBPDetail` (API service)
 *   2. select  → transforms raw API data via `adaptBPData` → `BPDomainModel`
 *   3. seal    → membrane signs with DJBX33A + Object.freeze
 *   4. verify  → checks integrity signature
 *   5. unseal  → extracts verified payload → component receives `BPDomainModel`
 *
 * Components receive the same `BPDomainModel` as before, but the data has been
 * integrity-verified through the membrane pipeline.
 *
 * @param dateRange - Optional date range, defaults to current week
 */
export function useBPTrendData(dateRange?: DateRange): BPSealedResult {
  return useSealedQuery({
    domainKey: 'bp',
    queryKey: bpQueryKeys.trend(dateRange),
    queryFn: async () => {
      const apiDateRange = dateRange
        ? { start_date: dateRange.startDate, end_date: dateRange.endDate }
        : undefined

      return getBPDetail(apiDateRange)
    },
    select: (data): BPDomainModel => adaptBPData(data),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    keepPrevious: true,
  })
}

/**
 * Prefetch previous weeks of BP data for instant navigation.
 */
export function usePrefetchBPData() {
  return usePrefetchData({
    featureName: 'BP',
    queryKeyFn: bpQueryKeys.trend,
    fetchFn: (dateRange) => getBPDetail({
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    }),
  })
}
