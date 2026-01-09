/**
 * Daily Data Hooks
 * React Query hooks for fetching daily report data
 * Handles demo mode switching automatically
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
    fetchHealthyDaily,
    fetchEmotionDaily,
    fetchSleepDaily,
} from '@/services/api/dailyService'
import type { HealthyDailyData } from '@/daily/healthy/types'
import type { EmotionDailyData } from '@/daily/emotion/types'
import type { SleepDailyData } from '@/daily/sleep/types'
import { generateHealthyDemoData } from '@/daily/healthy/adapter'
import { generateEmotionDemoData } from '@/daily/emotion/adapter'
import { generateSleepDemoData } from '@/daily/sleep/adapter'
import { isDemoModeEnabled as isHealthyDemoEnabled } from '@/daily/healthy/demoMode'
import { isDemoModeEnabled as isEmotionDemoEnabled } from '@/daily/emotion/demoMode'
import { isDemoModeEnabled as isSleepDemoEnabled } from '@/daily/sleep/demoMode'

/**
 * Query keys for daily data
 */
export const dailyQueryKeys = {
    all: ['daily'] as const,
    healthy: (date: string, isDemoMode: boolean) =>
        [...dailyQueryKeys.all, 'healthy', date, isDemoMode] as const,
    emotion: (date: string, isDemoMode: boolean) =>
        [...dailyQueryKeys.all, 'emotion', date, isDemoMode] as const,
    sleep: (date: string, isDemoMode: boolean) =>
        [...dailyQueryKeys.all, 'sleep', date, isDemoMode] as const,
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0]
}

/**
 * Hook for fetching healthy daily data
 * @param date - Date in YYYY-MM-DD format (defaults to today)
 */
export function useHealthyDailyData(date?: string) {
    const isDemoMode = isHealthyDemoEnabled()
    const targetDate = date || getTodayDate()
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: dailyQueryKeys.healthy(targetDate, isDemoMode),
        queryFn: async (): Promise<HealthyDailyData | null> => {
            if (isDemoMode) {
                console.log('🎭 [Healthy Daily] Demo mode enabled, using demo data')
                return generateHealthyDemoData()
            }

            console.log('📡 [Healthy Daily] Fetching real data for:', targetDate)
            return fetchHealthyDaily(targetDate)
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })

    // Invalidate query when demo mode changes
    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: dailyQueryKeys.all })
    }, [queryClient])

    return {
        ...query,
        isDemoMode,
        invalidate,
    }
}

/**
 * Hook for fetching emotion daily data
 * @param date - Date in YYYY-MM-DD format (defaults to today)
 */
export function useEmotionDailyData(date?: string) {
    const isDemoMode = isEmotionDemoEnabled()
    const targetDate = date || getTodayDate()
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: dailyQueryKeys.emotion(targetDate, isDemoMode),
        queryFn: async (): Promise<EmotionDailyData> => {
            if (isDemoMode) {
                console.log('🎭 [Emotion Daily] Demo mode enabled, using demo data')
                return generateEmotionDemoData()
            }

            console.log('📡 [Emotion Daily] Fetching real data for:', targetDate)
            return fetchEmotionDaily(targetDate)
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: dailyQueryKeys.all })
    }, [queryClient])

    return {
        ...query,
        isDemoMode,
        invalidate,
    }
}

/**
 * Hook for fetching sleep daily data
 * @param date - Date in YYYY-MM-DD format (defaults to today)
 */
export function useSleepDailyData(date?: string) {
    const isDemoMode = isSleepDemoEnabled()
    const targetDate = date || getTodayDate()
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: dailyQueryKeys.sleep(targetDate, isDemoMode),
        queryFn: async (): Promise<SleepDailyData> => {
            if (isDemoMode) {
                console.log('🎭 [Sleep Daily] Demo mode enabled, using demo data')
                return generateSleepDemoData()
            }

            console.log('📡 [Sleep Daily] Fetching real data for:', targetDate)
            return fetchSleepDaily(targetDate)
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: dailyQueryKeys.all })
    }, [queryClient])

    return {
        ...query,
        isDemoMode,
        invalidate,
    }
}

