/**
 * Healthy Feature - API Layer
 * React Query hooks for fetching healthy data
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api/client'
import { transformHealthyApiResponse, generateMockHealthyData } from './adapter'
import { isDemoModeEnabled } from './demoMode'
import type { HealthyDomainModel, ViewType, ApiHealthyResponse } from './types'

/** Query keys for healthy feature */
export const healthyQueryKeys = {
  all: ['healthy'] as const,
  data: (viewType: ViewType) => [...healthyQueryKeys.all, 'data', viewType] as const,
}

/**
 * Fetch healthy data from API
 * @param viewType - 'day' for daily view, 'week' for weekly view
 */
async function fetchHealthyData(viewType: ViewType): Promise<HealthyDomainModel> {
  // Check if demo mode is enabled
  if (isDemoModeEnabled()) {
    console.log('🎭 [Demo Mode] Using dummy data instead of backend API')
    return generateMockHealthyData()
  }

  try {
    const response = await apiClient.post<ApiHealthyResponse>('/trend-review/overview', {
      view_type: viewType,
    })

    console.log('[Healthy API] Response code:', response.data.code, 'msg:', response.data.msg)

    // Backend returns code: 200 for success
    if (response.data.code !== 200) {
      console.error('[Healthy API] Unexpected code:', response.data.code)
      throw new Error(response.data.msg || 'Failed to fetch healthy data')
    }

    return transformHealthyApiResponse(response.data)
  } catch (error) {
    console.error('[Healthy API] Failed to fetch healthy data:', error)
    // Fallback to mock data in case of error (for development)
    console.warn('[Healthy API] Using mock data as fallback')
    return generateMockHealthyData()
  }
}

/**
 * React Query hook for fetching healthy data
 * @param viewType - 'day' for daily view, 'week' for weekly view
 * @returns Query result with healthy data
 */
export function useHealthyData(viewType: ViewType = 'day') {
  return useQuery({
    queryKey: healthyQueryKeys.data(viewType),
    queryFn: () => fetchHealthyData(viewType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}
