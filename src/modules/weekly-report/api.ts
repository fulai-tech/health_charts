import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { API_CONFIG } from '@/config/api'
import type { WeeklyReportDataAPI, WeeklyReportResponseAPI } from './types'

/**
 * Query keys for weekly report data
 */
export const weeklyReportQueryKeys = {
  all: ['weekly-report'] as const,
  report: () => [...weeklyReportQueryKeys.all, 'report'] as const,
}

/**
 * Fetch weekly report from API
 */
export async function getWeeklyReport(): Promise<WeeklyReportDataAPI> {
  const response = await apiClient.post<WeeklyReportResponseAPI>(
    API_CONFIG.weeklyReport,
    {}
  )

  if (response.data.code !== 200) {
    throw new Error(response.data.msg || 'Failed to fetch weekly report')
  }

  return response.data.data
}

/**
 * React Query hook for weekly report data
 */
export function useWeeklyReportData() {
  return useQuery({
    queryKey: weeklyReportQueryKeys.report(),
    queryFn: getWeeklyReport,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
