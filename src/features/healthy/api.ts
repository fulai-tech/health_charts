/**
 * Healthy Feature - API Layer
 * React Query hooks for fetching healthy data
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api/client'
import { transformHealthyApiResponse, generateMockHealthyData } from './adapter'
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
  try {
    const response = await apiClient.post<ApiHealthyResponse>('/trend-review/overview', {
      view_type: viewType,
    })

    if (response.data.code !== 0) {
      console.error('API error:', response.data.msg)
      throw new Error(response.data.msg || 'Failed to fetch healthy data')
    }

    return transformHealthyApiResponse(response.data)
  } catch (error) {
    console.error('Failed to fetch healthy data:', error)
    // Fallback to mock data in case of error (for development)
    console.warn('Using mock data as fallback')
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
