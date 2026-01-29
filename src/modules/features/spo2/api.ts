import { useQuery } from '@tanstack/react-query'
import { getSpO2Detail } from '@/services/api'
import type { SpO2DomainModel } from './types'
import { adaptSpO2Data } from './adapter'
import { usePrefetchData, type DateRange } from '@/lib/usePrefetchData'

// Re-export DateRange for backwards compatibility
export type { DateRange }

/**
 * Query keys for SpO2 data
 */
export const spo2QueryKeys = {
  all: ['spo2'] as const,
  trend: (dateRange?: DateRange) =>
    [...spo2QueryKeys.all, 'trend', dateRange?.startDate, dateRange?.endDate] as const,
  details: () => [...spo2QueryKeys.all, 'details'] as const,
}

/**
 * React Query hook for SpO2 trend data
 */
export function useSpO2TrendData(dateRange?: DateRange) {
  return useQuery({
    queryKey: spo2QueryKeys.trend(dateRange),
    queryFn: async () => {
      console.log('[SpO2 API] Fetching with dateRange:', dateRange)

      const apiDateRange = dateRange
        ? { start_date: dateRange.startDate, end_date: dateRange.endDate }
        : undefined

      const result = await getSpO2Detail(apiDateRange)
      console.log('[SpO2 API] Result:', result)
      return result
    },
    select: (data): SpO2DomainModel => adaptSpO2Data(data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Prefetch hook for SpO2 data
 */
export function usePrefetchSpO2Data() {
  return usePrefetchData({
    featureName: 'SpO2',
    queryKeyFn: spo2QueryKeys.trend,
    fetchFn: (dateRange) => getSpO2Detail({
      start_date: dateRange.startDate,
      end_date: dateRange.endDate
    })
  })
}

