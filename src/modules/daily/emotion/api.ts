/**
 * Emotion Daily API
 */

import { API_CONFIG } from '@/config/api'
import type { EmotionDailyApiResponse, EmotionDailyData } from './types'
import { adaptEmotionDailyData, generateEmotionDemoData } from './adapter'
import { isDemoModeEnabled } from './demoMode'

/**
 * Fetch emotion daily data
 */
export async function fetchEmotionDailyData(
    date: string,
    token: string
): Promise<EmotionDailyData> {
    if (isDemoModeEnabled()) {
        console.log('🎭 [Emotion Daily] Demo mode enabled, using demo data')
        return generateEmotionDemoData()
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
                    type: 'emotion',
                    date,
                }),
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: EmotionDailyApiResponse = await response.json()

        if (data.code !== 200) {
            throw new Error(data.msg || 'API error')
        }

        const adaptedData = adaptEmotionDailyData(data)

        if (adaptedData.score === null && isDemoModeEnabled()) {
            return generateEmotionDemoData()
        }

        return adaptedData
    } catch (error) {
        console.error('[Emotion Daily] API error:', error)
        if (isDemoModeEnabled()) {
            return generateEmotionDemoData()
        }
        throw error
    }
}
