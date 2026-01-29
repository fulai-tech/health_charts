/**
 * Daily Report Service
 * Fetches daily dimension detail data from the backend API
 * Used by: HealthyDailyPage, EmotionDailyPage, SleepDailyPage
 */

import { apiClient } from './client'
import { API_CONFIG } from '@/config/api'
import type {
    HealthyDailyApiResponse,
    HealthyDailyData,
} from '@/modules/daily/healthy/types'
import type {
    EmotionDailyApiResponse,
    EmotionDailyData,
} from '@/modules/daily/emotion/types'
import type {
    SleepDailyApiResponse,
    SleepDailyData,
} from '@/modules/daily/sleep/types'
import { adaptHealthyDailyData } from '@/modules/daily/healthy/adapter'
import { adaptEmotionDailyData } from '@/modules/daily/emotion/adapter'
import { adaptSleepDailyData } from '@/modules/daily/sleep/adapter'

/** Daily dimension types */
export type DailyDimensionType = 'fitness' | 'emotion' | 'sleep'

/**
 * Generic fetch function for daily dimension detail
 */
async function fetchDailyDimensionDetail<TResponse>(
    type: DailyDimensionType,
    date: string
): Promise<TResponse> {
    const response = await apiClient.post<TResponse>(
        API_CONFIG.currentStatus.dimensionDetail,
        { type, date }
    )

    return response.data
}

/**
 * Fetch healthy (fitness) daily data
 * @param date - Date in YYYY-MM-DD format
 * @returns Adapted HealthyDailyData or null if no data
 */
export async function fetchHealthyDaily(date: string): Promise<HealthyDailyData | null> {
    console.log('[Daily Service] Fetching healthy daily data for:', date)

    const response = await fetchDailyDimensionDetail<HealthyDailyApiResponse>(
        'fitness',
        date
    )

    if (response.code !== 200) {
        throw new Error(response.msg || 'Failed to fetch healthy daily data')
    }

    return adaptHealthyDailyData(response)
}

/**
 * Fetch emotion daily data
 * @param date - Date in YYYY-MM-DD format
 * @returns Adapted EmotionDailyData
 */
export async function fetchEmotionDaily(date: string): Promise<EmotionDailyData> {
    console.log('[Daily Service] Fetching emotion daily data for:', date)

    const response = await fetchDailyDimensionDetail<EmotionDailyApiResponse>(
        'emotion',
        date
    )

    if (response.code !== 200) {
        throw new Error(response.msg || 'Failed to fetch emotion daily data')
    }

    return adaptEmotionDailyData(response)
}

/**
 * Fetch sleep daily data
 * @param date - Date in YYYY-MM-DD format
 * @returns Adapted SleepDailyData
 */
export async function fetchSleepDaily(date: string): Promise<SleepDailyData> {
    console.log('[Daily Service] Fetching sleep daily data for:', date)

    const response = await fetchDailyDimensionDetail<SleepDailyApiResponse>(
        'sleep',
        date
    )

    if (response.code !== 200) {
        throw new Error(response.msg || 'Failed to fetch sleep daily data')
    }

    return adaptSleepDailyData(response)
}

