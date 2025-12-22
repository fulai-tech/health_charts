import { useQuery } from '@tanstack/react-query'
import { getGlucoseDetail } from '@/services/api'
import type { GlucoseDomainModel } from './types'
import { adaptGlucoseData } from './adapter'

/**
 * Date range interface
 */
export interface DateRange {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
}

/**
 * Query keys for glucose data
 */
export const glucoseQueryKeys = {
  all: ['glucose'] as const,
  trend: (dateRange?: DateRange) => 
    [...glucoseQueryKeys.all, 'trend', dateRange?.startDate, dateRange?.endDate] as const,
  details: () => [...glucoseQueryKeys.all, 'details'] as const,
}

/**
 * React Query hook for glucose trend data
 */
export function useGlucoseTrendData(dateRange?: DateRange) {
  return useQuery({
    queryKey: glucoseQueryKeys.trend(dateRange),
    queryFn: async () => {
      console.log('[Glucose API] Fetching with dateRange:', dateRange)
      
      const apiDateRange = dateRange 
        ? { start_date: dateRange.startDate, end_date: dateRange.endDate }
        : undefined
      
      const result = await getGlucoseDetail(apiDateRange)
      console.log('[Glucose API] Result:', result)
      return result
    },
    select: (data): GlucoseDomainModel => adaptGlucoseData(data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
