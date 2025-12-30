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
 */
export async function fetchHealthyDailyData(
    date: string,
    token: string
): Promise<HealthyDailyData> {
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

        const adaptedData = adaptHealthyDailyData(data)

        // If API returns null score and demo mode check
        if (adaptedData.score === null && isDemoModeEnabled()) {
            console.log('⚠️ [Healthy Daily] Null data from API, using demo data')
            return generateHealthyDemoData()
        }

        return adaptedData
    } catch (error) {
        console.error('[Healthy Daily] API error:', error)

        // Fallback to demo data on error if demo mode enabled
        if (isDemoModeEnabled()) {
            return generateHealthyDemoData()
        }

        throw error
    }
}
