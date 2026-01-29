import { useQuery } from '@tanstack/react-query'
import { getBPDetail } from '@/services/api'
import type { BPDomainModel } from './types'
import { adaptBPData } from './adapter'
import { usePrefetchData, type DateRange } from '@/lib/usePrefetchData'

// Re-export DateRange for backwards compatibility
export type { DateRange }

/**
 * Query keys for blood pressure data
 */
export const bpQueryKeys = {
  all: ['blood-pressure'] as const,
  trend: (dateRange?: DateRange) =>
    [...bpQueryKeys.all, 'trend', dateRange?.startDate, dateRange?.endDate] as const,
  details: () => [...bpQueryKeys.all, 'details'] as const,
}

/**
 * React Query hook for blood pressure trend data
 * Fetches from real API and transforms using adapter
 * 
 * @param dateRange - Optional date range, defaults to last 7 days
 */
export function useBPTrendData(dateRange?: DateRange) {
  return useQuery({
    queryKey: bpQueryKeys.trend(dateRange),
    queryFn: async () => {
      console.log('[BP API] Fetching with dateRange:', dateRange)

      const apiDateRange = dateRange
        ? { start_date: dateRange.startDate, end_date: dateRange.endDate }
        : undefined

      const result = await getBPDetail(apiDateRange)
      console.log('[BP API] Result:', result)
      return result
    },
    select: (data): BPDomainModel => adaptBPData(data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Prefetch hook for blood pressure data
 * Uses the generic usePrefetchData hook
 */
export function usePrefetchBPData() {
  return usePrefetchData({
    featureName: 'BP',
    queryKeyFn: bpQueryKeys.trend,
    fetchFn: (dateRange) => getBPDetail({
      start_date: dateRange.startDate,
      end_date: dateRange.endDate
    })
  })
}


