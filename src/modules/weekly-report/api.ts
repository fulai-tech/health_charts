import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { API_CONFIG } from '@/config/api'
import type { WeeklyReportDataAPI, WeeklyReportResponseAPI } from './types'

/**
 * Query keys for weekly report data
 */
export const weeklyReportQueryKeys = {
  all: ['weekly-report'] as const,
  report: (reportId: string) => [...weeklyReportQueryKeys.all, 'report', reportId] as const,
}

/**
 * Fetch weekly report from API
 * @param reportId - Report ID from URL query (?rid=). When omitted, request body is empty.
 */
export async function getWeeklyReport(reportId?: string | null): Promise<WeeklyReportDataAPI> {
  const body = reportId ? { report_id: reportId } : {}
  const response = await apiClient.post<WeeklyReportResponseAPI>(
    API_CONFIG.weeklyReport,
    body
  )

  if (response.data.code !== 200) {
    throw new Error(response.data.msg || 'Failed to fetch weekly report')
  }

  return response.data.data
}

/**
 * React Query hook for weekly report data
 * @param reportId - Report ID from URL query (?rid=). When null/undefined, request is sent without body.
 */
export function useWeeklyReportData(reportId?: string | null) {
  return useQuery({
    queryKey: weeklyReportQueryKeys.report(reportId ?? ''),
    queryFn: () => getWeeklyReport(reportId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
