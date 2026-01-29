/**
 * Healthy Daily API
 * Fetch healthy daily report data
 */

import { API_CONFIG } from '@/config/api'
import type { HealthyDailyApiResponse, HealthyDailyData } from './types'
import { adaptHealthyDailyData, generateHealthyDemoData } from './adapter'
import { isDemoModeEnabled } from './demoMode'

/**
 * Fetch healthy daily data
 * @param date - Date in YYYY-MM-DD format
 * @param token - Auth token
 * @returns Adapted data or null if no data available
 */
export async function fetchHealthyDailyData(
    date: string,
    token: string
): Promise<HealthyDailyData | null> {
    // If demo mode enabled, return demo data
    if (isDemoModeEnabled()) {
        console.log('🎭 [Healthy Daily] Demo mode enabled, using demo data')
        return generateHealthyDemoData()
    }

    try {
        const response = await fetch(
            `${API_CONFIG.baseURL}/current-status/dimension-detail`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: 'fitness',
                    date,
                }),
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: HealthyDailyApiResponse = await response.json()

        if (data.code !== 200) {
            throw new Error(data.msg || 'API error')
        }

        // Adapt API response to domain model
        // Returns null if API returned null data
        const adaptedData = adaptHealthyDailyData(data)

        return adaptedData
    } catch (error) {
        console.error('[Healthy Daily] API error:', error)

        // In non-demo mode, propagate the error
        // Let the UI handle error states
        throw error
    }
}

/**
 * Helper to check if a value represents "no data" from backend
 * Distinguishes between:
 * - null/undefined: truly no data
 * - 0: valid data point
 * - empty array: no items but valid response
 */
export function isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined) {
        return true
    }
    if (Array.isArray(value) && value.length === 0) {
        return true
    }
    if (typeof value === 'string' && value.trim() === '') {
        return true
    }
    return false
}

/**
 * Check if indicator has any meaningful data
 */
export function hasIndicatorData(indicator: {
    latest: unknown
    avg: unknown
    chart: unknown[]
}): boolean {
    return (
        !isEmptyValue(indicator.latest) ||
        !isEmptyValue(indicator.avg) ||
        (Array.isArray(indicator.chart) && indicator.chart.length > 0)
    )
}
