import { useQuery } from '@tanstack/react-query'
import { getIndicatorDetail } from '@/services/api'
import type { EmotionDomainModel } from './types'
import { adaptEmotionData, getDummyEmotionData } from './adapter'
import { usePrefetchData, type DateRange } from '@/lib/usePrefetchData'
import { isEmotionDemoModeEnabled } from './demoMode'

// Re-export DateRange for backwards compatibility
export type { DateRange }

/**
 * Query keys for emotion data
 * Include demo mode status to ensure cache invalidation when mode changes
 */
export const emotionQueryKeys = {
  all: ['emotion'] as const,
  trend: (dateRange?: DateRange, demoMode?: boolean) =>
    [...emotionQueryKeys.all, 'trend', dateRange?.startDate, dateRange?.endDate, demoMode ? 'demo' : 'live'] as const,
  details: () => [...emotionQueryKeys.all, 'details'] as const,
}

/**
 * Fetch emotion detail from API
 * Note: This API endpoint may not exist yet - will use dummy data as fallback
 */
async function getEmotionDetail(dateRange?: { start_date: string; end_date: string }) {
  try {
    const result = await getIndicatorDetail<any>('emotion', dateRange)
    return result
  } catch (error) {
    console.warn('[Emotion API] API not available, using dummy data:', error)
    return null
  }
}

/**
 * React Query hook for emotion trend data
 * When demo mode is enabled, directly returns dummy data without API calls
 */
export function useEmotionTrendData(dateRange?: DateRange) {
  const isDemoMode = isEmotionDemoModeEnabled()

  return useQuery({
    // Include demo mode in query key to ensure proper cache invalidation
    queryKey: emotionQueryKeys.trend(dateRange, isDemoMode),
    queryFn: async (): Promise<EmotionDomainModel> => {
      // Check if demo mode is enabled - return dummy data directly
      if (isDemoMode) {
        console.log('🎭 [Emotion Demo Mode] Using dummy data instead of backend API')
        return getDummyEmotionData()
      }

      console.log('[Emotion API] Fetching with dateRange:', dateRange)

      const apiDateRange = dateRange
        ? { start_date: dateRange.startDate, end_date: dateRange.endDate }
        : undefined

      const result = await getEmotionDetail(apiDateRange)
      console.log('[Emotion API] Result:', result)

      // Transform API data to domain model (will use dummy if null)
      return adaptEmotionData(result)
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Prefetch hook for emotion data
 */
export function usePrefetchEmotionData() {
  const isDemoMode = isEmotionDemoModeEnabled()

  return usePrefetchData({
    featureName: 'Emotion',
    queryKeyFn: (range) => emotionQueryKeys.trend(range, isDemoMode),
    fetchFn: async (dateRange) => {
      // Skip prefetch in demo mode
      if (isDemoMode) {
        return getDummyEmotionData()
      }

      try {
        const result = await getEmotionDetail({
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        })
        return adaptEmotionData(result)
      } catch {
        return getDummyEmotionData()
      }
    }
  })
}
