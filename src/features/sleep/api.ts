import { useQuery } from '@tanstack/react-query'
import { getSleepDetail } from '@/services/api'
import type { SleepDomainModel } from './types'
import { adaptSleepData } from './adapter'

/**
 * Date range interface
 */
export interface DateRange {
    startDate: string
    endDate: string
}

/**
 * Query keys for sleep data
 */
export const sleepQueryKeys = {
    all: ['sleep'] as const,
    trend: (dateRange?: DateRange) =>
        [...sleepQueryKeys.all, 'trend', dateRange?.startDate, dateRange?.endDate] as const,
    details: () => [...sleepQueryKeys.all, 'details'] as const,
}

/**
 * React Query hook for sleep trend data
 * Fetches from real API and transforms using adapter
 * 
 * @param dateRange - Optional date range, defaults to last 7 days
 */
export function useSleepTrendData(dateRange?: DateRange) {
    return useQuery({
        queryKey: sleepQueryKeys.trend(dateRange),
        queryFn: async () => {
            console.log('[Sleep API] Fetching with dateRange:', dateRange)

            const apiDateRange = dateRange
                ? { start_date: dateRange.startDate, end_date: dateRange.endDate }
                : undefined

            const result = await getSleepDetail(apiDateRange)
            console.log('[Sleep API] Result:', result)
            return result
        },
        select: (data): SleepDomainModel => adaptSleepData(data),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: (previousData) => previousData,
    })
}
