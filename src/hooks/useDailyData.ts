/**
 * Daily data hooks: React Query for healthy / emotion / sleep daily reports.
 * Demo mode is handled automatically.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import {
  fetchHealthyDaily,
  fetchEmotionDaily,
  fetchSleepDaily,
} from '@/services/api/dailyService'
import type { HealthyDailyData } from '@/modules/daily/healthy/types'
import type { EmotionDailyData } from '@/modules/daily/emotion/types'
import type { SleepDailyData } from '@/modules/daily/sleep/types'
import { generateHealthyDemoData } from '@/modules/daily/healthy/adapter'
import { generateEmotionDemoData } from '@/modules/daily/emotion/adapter'
import { generateSleepDemoData } from '@/modules/daily/sleep/adapter'
import { isDemoModeEnabled as isHealthyDemoEnabled } from '@/modules/daily/healthy/demoMode'
import { isDemoModeEnabled as isEmotionDemoEnabled } from '@/modules/daily/emotion/demoMode'
import { isDemoModeEnabled as isSleepDemoEnabled } from '@/modules/daily/sleep/demoMode'
import { parseDateString, getTodayDateISO } from '@/hooks/core'

export const dailyQueryKeys = {
  all: ['daily'] as const,
  healthy: (date: string, isDemoMode: boolean) =>
    [...dailyQueryKeys.all, 'healthy', date, isDemoMode] as const,
  emotion: (date: string, isDemoMode: boolean) =>
    [...dailyQueryKeys.all, 'emotion', date, isDemoMode] as const,
  sleep: (date: string, isDemoMode: boolean) =>
    [...dailyQueryKeys.all, 'sleep', date, isDemoMode] as const,
}

function resolveDateParam(date: string | undefined): string {
  if (date === undefined || date === '') return getTodayDateISO()
  const result = parseDateString(date)
  return result.ok ? result.value : getTodayDateISO()
}

/** Wraps query fn in try/catch; returns fallback when provided, otherwise rethrows. */
function wrapQueryFn<T>(
  fn: () => Promise<T>,
  options: { logLabel: string; fallback?: T }
): () => Promise<T> {
  const { logLabel, fallback } = options
  return async () => {
    try {
      return await fn()
    } catch (e) {
      console.error(`[${logLabel}] Query failed:`, e)
      if (fallback !== undefined) return fallback
      throw e
    }
  }
}

interface DailyDataHookConfig<TData, TDemoData extends TData> {
  queryKeyPart: 'healthy' | 'emotion' | 'sleep'
  isDemoEnabled: () => boolean
  fetchApi: (date: string) => Promise<TData>
  generateDemo: () => TDemoData
  fallbackData?: TData
  logLabel: string
}

/**
 * Factory for daily data hooks: single implementation path for queryKey, queryFn, invalidate.
 */
function createDailyDataHook<TData, TDemoData extends TData>(
  config: DailyDataHookConfig<TData, TDemoData>
) {
  const {
    queryKeyPart,
    isDemoEnabled,
    fetchApi,
    generateDemo,
    fallbackData,
    logLabel,
  } = config

  const getQueryKey = (date: string, isDemoMode: boolean) => {
    switch (queryKeyPart) {
      case 'healthy':
        return dailyQueryKeys.healthy(date, isDemoMode)
      case 'emotion':
        return dailyQueryKeys.emotion(date, isDemoMode)
      case 'sleep':
        return dailyQueryKeys.sleep(date, isDemoMode)
      default:
        return [...dailyQueryKeys.all, queryKeyPart, date, isDemoMode] as const
    }
  }

  return function useDailyData(date?: string) {
    const isDemoMode = isDemoEnabled()
    const targetDate = useMemo(() => resolveDateParam(date), [date])
    const queryClient = useQueryClient()

    const queryFn = useCallback(() => {
      const rawFn = async (): Promise<TData> => {
        if (isDemoMode) {
          console.log(`🎭 [${logLabel}] Demo mode enabled, using demo data`)
          return generateDemo() as TData
        }
        console.log(`📡 [${logLabel}] Fetching real data for:`, targetDate)
        return fetchApi(targetDate)
      }
      return wrapQueryFn(rawFn, { logLabel, fallback: fallbackData })()
    }, [isDemoMode, targetDate, logLabel])

    const query = useQuery({
      queryKey: getQueryKey(targetDate, isDemoMode),
      queryFn,
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
}

/** Healthy daily data; date in YYYY-MM-DD, defaults to today. */
export const useHealthyDailyData = createDailyDataHook<
  HealthyDailyData | null,
  HealthyDailyData
>({
  queryKeyPart: 'healthy',
  isDemoEnabled: isHealthyDemoEnabled,
  fetchApi: fetchHealthyDaily,
  generateDemo: generateHealthyDemoData,
  fallbackData: null,
  logLabel: 'Healthy Daily',
})

/** Emotion daily data. */
export const useEmotionDailyData = createDailyDataHook<EmotionDailyData, EmotionDailyData>({
  queryKeyPart: 'emotion',
  isDemoEnabled: isEmotionDemoEnabled,
  fetchApi: fetchEmotionDaily,
  generateDemo: generateEmotionDemoData,
  logLabel: 'Emotion Daily',
})

/** Sleep daily data. */
export const useSleepDailyData = createDailyDataHook<SleepDailyData, SleepDailyData>({
  queryKeyPart: 'sleep',
  isDemoEnabled: isSleepDemoEnabled,
  fetchApi: fetchSleepDaily,
  generateDemo: generateSleepDemoData,
  logLabel: 'Sleep Daily',
})
