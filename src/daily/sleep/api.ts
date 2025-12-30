/**
 * Sleep Daily API
 */

import { API_CONFIG } from '@/config/api'
import type { SleepDailyApiResponse, SleepDailyData } from './types'
import { adaptSleepDailyData, generateSleepDemoData } from './adapter'
import { isDemoModeEnabled } from './demoMode'

export async function fetchSleepDailyData(
    date: string,
    token: string
): Promise<SleepDailyData> {
    if (isDemoModeEnabled()) {
        console.log('🎭 [Sleep Daily] Demo mode enabled, using demo data')
        return generateSleepDemoData()
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
                    type: 'sleep',
                    date,
                }),
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: SleepDailyApiResponse = await response.json()

        if (data.code !== 200) {
            throw new Error(data.msg || 'API error')
        }

        const adaptedData = adaptSleepDailyData(data)

        if (adaptedData.score === null && isDemoModeEnabled()) {
            return generateSleepDemoData()
        }

        return adaptedData
    } catch (error) {
        console.error('[Sleep Daily] API error:', error)
        if (isDemoModeEnabled()) {
            return generateSleepDemoData()
        }
        throw error
    }
}
