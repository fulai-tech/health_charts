import { useQuery } from '@tanstack/react-query'
import { getHRDetail } from '@/services/api'
import type { HRDomainModel } from './types'
import { adaptHRData } from './adapter'
import { usePrefetchData, type DateRange } from '@/lib/usePrefetchData'

// Re-export DateRange for backwards compatibility
export type { DateRange }

/**
 * Query keys for heart rate data
 */
export const hrQueryKeys = {
  all: ['heart-rate'] as const,
  trend: (dateRange?: DateRange) =>
    [...hrQueryKeys.all, 'trend', dateRange?.startDate, dateRange?.endDate] as const,
  details: () => [...hrQueryKeys.all, 'details'] as const,
}

/**
 * React Query hook for heart rate trend data
 */
export function useHRTrendData(dateRange?: DateRange) {
  return useQuery({
    queryKey: hrQueryKeys.trend(dateRange),
    queryFn: async () => {
      console.log('[HR API] Fetching with dateRange:', dateRange)

      const apiDateRange = dateRange
        ? { start_date: dateRange.startDate, end_date: dateRange.endDate }
        : undefined

      const result = await getHRDetail(apiDateRange)
      console.log('[HR API] Result:', result)
      return result
    },
    select: (data): HRDomainModel => adaptHRData(data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Prefetch hook for heart rate data
 */
export function usePrefetchHRData() {
  return usePrefetchData({
    featureName: 'HR',
    queryKeyFn: hrQueryKeys.trend,
    fetchFn: (dateRange) => getHRDetail({
      start_date: dateRange.startDate,
      end_date: dateRange.endDate
    })
  })
}

