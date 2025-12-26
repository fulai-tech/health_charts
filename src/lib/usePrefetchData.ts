/**
 * Reusable Data Prefetch Hook
 * 
 * A generic hook for prefetching date-range based data using React Query.
 * This allows pages to preload previous weeks' data for instant navigation.
 * 
 * @example
 * ```tsx
 * // In a feature API file
 * export function usePrefetchHRData() {
 *   return usePrefetchData({
 *     featureName: 'heart-rate',
 *     queryKeyFn: hrQueryKeys.trend,
 *     fetchFn: (dateRange) => getHRDetail({
 *       start_date: dateRange.startDate,
 *       end_date: dateRange.endDate
 *     })
 *   })
 * }
 * 
 * // In a page component
 * const { prefetchPreviousWeeks } = usePrefetchHRData()
 * useEffect(() => {
 *   prefetchPreviousWeeks(currentDate, 3)
 * }, [currentDate])
 * ```
 */

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

/**
 * Date range interface used by all features
 */
export interface DateRange {
    startDate: string  // YYYY-MM-DD
    endDate: string    // YYYY-MM-DD
}

/**
 * Format Date to YYYY-MM-DD string for API
 */
export function formatDateToAPI(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Configuration for the prefetch hook
 */
export interface PrefetchConfig<TData = unknown> {
    /** Feature name for logging (e.g., 'blood-pressure', 'heart-rate') */
    featureName: string
    /** Function to generate query key from date range */
    queryKeyFn: (dateRange?: DateRange) => readonly unknown[]
    /** Async function to fetch data for a date range */
    fetchFn: (dateRange: DateRange) => Promise<TData>
    /** Stale time in ms, defaults to 5 minutes */
    staleTime?: number
}

/**
 * Reusable hook for prefetching date-range based data
 * Preloads previous weeks' data to improve UX when navigating dates
 */
export function usePrefetchData<TData = unknown>(config: PrefetchConfig<TData>) {
    const queryClient = useQueryClient()
    const { featureName, queryKeyFn, fetchFn, staleTime = 5 * 60 * 1000 } = config

    /**
     * Prefetch data for multiple previous weeks
     * @param currentEndDate - The end date of the current displayed week
     * @param weekCount - Number of previous weeks to prefetch (default: 3)
     */
    const prefetchPreviousWeeks = useCallback((currentEndDate: Date, weekCount = 3) => {
        console.log(`[${featureName} Prefetch] Starting prefetch of ${weekCount} previous weeks`)

        for (let i = 1; i <= weekCount; i++) {
            // Calculate date range for each previous week
            const endDate = new Date(currentEndDate)
            endDate.setDate(endDate.getDate() - (7 * i))

            const startDate = new Date(endDate)
            startDate.setDate(startDate.getDate() - 6)

            const dateRange: DateRange = {
                startDate: formatDateToAPI(startDate),
                endDate: formatDateToAPI(endDate),
            }

            console.log(`[${featureName} Prefetch] Week ${i}: ${dateRange.startDate} to ${dateRange.endDate}`)

            // Prefetch the data - won't refetch if data is fresh
            queryClient.prefetchQuery({
                queryKey: queryKeyFn(dateRange),
                queryFn: () => fetchFn(dateRange),
                staleTime,
            })
        }
    }, [queryClient, featureName, queryKeyFn, fetchFn, staleTime])

    return { prefetchPreviousWeeks }
}
