import { apiClient } from './client'
import { API_CONFIG, type IndicatorType, type ViewType } from '@/config/api'
import type {
  ApiResponse,
  OverviewResponse,
  BPDetailData,
  HRDetailData,
  GlucoseDetailData,
  SpO2DetailData,
  SleepDetailData,
} from './types'

/**
 * Trend Review Service
 * Fetches health trend data from the backend API
 */

/**
 * Get default date range (last 7 days)
 */
function getDefaultDateRange(): { start_date: string; end_date: string } {
  const now = new Date()
  const endDate = now.toISOString().split('T')[0]

  const startDateObj = new Date(now)
  startDateObj.setDate(startDateObj.getDate() - 6)
  const startDate = startDateObj.toISOString().split('T')[0]

  console.log('[DateRange]', { start_date: startDate, end_date: endDate })

  return {
    start_date: startDate,
    end_date: endDate,
  }
}

/**
 * Get overview data with all indicators
 */
export async function getOverview(
  viewType: ViewType = 'week'
): Promise<OverviewResponse> {
  const response = await apiClient.post<ApiResponse<OverviewResponse>>(
    API_CONFIG.trendReview.overview,
    { view_type: viewType }
  )

  if (response.data.code !== 200) {
    throw new Error(response.data.msg || 'Failed to fetch overview')
  }

  return response.data.data
}

/**
 * Get detailed data for a specific indicator
 */
export async function getIndicatorDetail<T>(
  indicatorType: IndicatorType,
  dateRange?: { start_date: string; end_date: string }
): Promise<T> {
  const range = dateRange || getDefaultDateRange()

  const requestBody = {
    type: indicatorType,
    start_date: range.start_date,
    end_date: range.end_date,
  }

  // console.log('[getIndicatorDetail] Request body:', requestBody)

  const response = await apiClient.post<ApiResponse<T>>(
    API_CONFIG.trendReview.indicatorDetail,
    requestBody
  )

  if (response.data.code !== 200) {
    throw new Error(response.data.msg || 'Failed to fetch indicator detail')
  }

  return response.data.data
}

/**
 * Get blood pressure detail
 */
export async function getBPDetail(
  dateRange?: { start_date: string; end_date: string }
): Promise<BPDetailData> {
  return getIndicatorDetail<BPDetailData>('blood_pressure', dateRange)
}

/**
 * Get heart rate detail
 */
export async function getHRDetail(
  dateRange?: { start_date: string; end_date: string }
): Promise<HRDetailData> {
  return getIndicatorDetail<HRDetailData>('heart_rate', dateRange)
}

/**
 * Get blood glucose detail
 */
export async function getGlucoseDetail(
  dateRange?: { start_date: string; end_date: string }
): Promise<GlucoseDetailData> {
  return getIndicatorDetail<GlucoseDetailData>('blood_glucose', dateRange)
}

/**
 * Get blood oxygen (SpO2) detail
 */
export async function getSpO2Detail(
  dateRange?: { start_date: string; end_date: string }
): Promise<SpO2DetailData> {
  return getIndicatorDetail<SpO2DetailData>('blood_oxygen', dateRange)
}

/**
 * Get sleep detail
 */
export async function getSleepDetail(
  dateRange?: { start_date: string; end_date: string }
): Promise<SleepDetailData> {
  return getIndicatorDetail<SleepDetailData>('sleep', dateRange)
}

