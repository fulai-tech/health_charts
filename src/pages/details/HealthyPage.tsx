/**
 * Healthy Details Page
 * 
 * Comprehensive health dashboard displaying all vital metrics including:
 * - Comprehensive health score with AI summary
 * - Blood Pressure, Heart Rate, Blood Sugar
 * - Blood Oxygen, Sleep, Emotion, Nutrition
 * 
 * URL Params:
 * - ?lang=zh or ?lang=en (language)
 * - ?theme=light or ?theme=dark (theme mode)
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DateRangePicker } from '@/components/business/DateRangePicker'
import { useUrlConfig } from '@/hooks/useUrlParams'
import { DisclaimerBox } from '@/components/ui/DisclaimerBox'
import { useHealthyData } from '@/features/healthy/api'
import type { TimePeriod, ViewType } from '@/features/healthy/types'

// Import all healthy components
import {
  ComprehensiveHealthCard,
  HealthBloodPressureCard,
  HealthHeartRateCard,
  HealthBloodSugarCard,
  HealthBloodOxygenCard,
  HealthSleepCard,
  HealthEmotionCard,
  HealthNutritionCard,
  DemoModeToggle,
} from '@/features/healthy'

/**
 * Format Date to YYYY-MM-DD string
 */
function formatDateToAPI(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Format Date for display (YYYY/MM/DD)
 */
function formatDateForDisplay(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

export function HealthyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useUrlConfig()

  // Period state for comprehensive health card (UI toggle)
  const [period, setPeriod] = useState<TimePeriod>('weekly')

  // Map TimePeriod to ViewType for API
  const viewType: ViewType = period === 'daily' ? 'day' : 'week'

  // Date range state
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 6)
    return { start, end }
  })

  // Check if we can go to next period
  const canGoNext = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(dateRange.end)
    endDate.setHours(0, 0, 0, 0)
    return endDate < today
  }, [dateRange.end])

  // Format dates for API
  const apiDateRange = useMemo(() => ({
    startDate: formatDateToAPI(dateRange.start),
    endDate: formatDateToAPI(dateRange.end),
  }), [dateRange])

  // Format dates for display
  const displayDateRange = useMemo(() => ({
    start: formatDateForDisplay(dateRange.start),
    end: formatDateForDisplay(dateRange.end),
  }), [dateRange])

  // Handle date navigation
  const handlePrevious = () => {
    setDateRange((prev) => {
      const newStart = new Date(prev.start)
      const newEnd = new Date(prev.end)
      newStart.setDate(newStart.getDate() - 7)
      newEnd.setDate(newEnd.getDate() - 7)
      return { start: newStart, end: newEnd }
    })
  }

  const handleNext = () => {
    if (!canGoNext) return

    setDateRange((prev) => {
      const newStart = new Date(prev.start)
      const newEnd = new Date(prev.end)
      newStart.setDate(newStart.getDate() + 7)
      newEnd.setDate(newEnd.getDate() + 7)

      const today = new Date()
      if (newEnd > today) {
        newEnd.setTime(today.getTime())
        newStart.setTime(today.getTime())
        newStart.setDate(newStart.getDate() - 6)
      }

      return { start: newStart, end: newEnd }
    })
  }

  // Fetch healthy data using viewType
  const { data, isLoading, isFetching, error } = useHealthyData(viewType)

  // Minimum loading time control
  const [showLoading, setShowLoading] = useState(false)
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadingStartRef = useRef<number>(0)

  useEffect(() => {
    if (isFetching) {
      setShowLoading(true)
      loadingStartRef.current = Date.now()

      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
        loadingTimerRef.current = null
      }
    } else {
      const elapsed = Date.now() - loadingStartRef.current
      const remaining = Math.max(0, 1000 - elapsed)

      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }

      loadingTimerRef.current = setTimeout(() => {
        setShowLoading(false)
        loadingTimerRef.current = null
      }, remaining)
    }

    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }
    }
  }, [isFetching])

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: theme.background }}
      >
        <div className="text-center">
          <p className="text-red-500 mb-2">{t('common.error')}</p>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {String(error)}
          </p>
        </div>
      </div>
    )
  }

  const isLoadingState = showLoading || isLoading

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Date Range Picker */}
        <div
          className="sticky top-0 z-20 py-3 px-4"
          style={{ backgroundColor: theme.background }}
        >
          <div className="flex justify-center">
            <DateRangePicker
              startDate={displayDateRange.start}
              endDate={displayDateRange.end}
              onPrevious={handlePrevious}
              onNext={handleNext}
              disableNext={!canGoNext}
            />
          </div>

          {/* Demo Mode Toggle */}
          <div className="flex justify-center mt-3">
            <DemoModeToggle />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 space-y-4">
          {!data && !isLoading ? (
            <div className="flex items-center justify-center py-20">
              <p style={{ color: theme.textSecondary }}>{t('common.noData')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Comprehensive Health Score */}
              <ComprehensiveHealthCard
                data={data?.comprehensiveHealth}
                period={period}
                onPeriodChange={setPeriod}
                isLoading={isLoadingState}
              />

              {/* Blood Pressure */}
              <HealthBloodPressureCard
                data={data?.bloodPressure}
                isLoading={isLoadingState}
                onClick={() => navigate('/details/blood-pressure')}
              />

              {/* Heart Rate */}
              <HealthHeartRateCard
                data={data?.heartRate}
                isLoading={isLoadingState}
                onClick={() => navigate('/details/heart-rate')}
              />

              {/* Blood Sugar */}
              <HealthBloodSugarCard
                data={data?.bloodSugar}
                isLoading={isLoadingState}
                onClick={() => navigate('/details/glucose')}
              />

              {/* Blood Oxygen */}
              <HealthBloodOxygenCard
                data={data?.bloodOxygen}
                isLoading={isLoadingState}
                onClick={() => navigate('/details/spo2')}
              />

              {/* Sleep */}
              <HealthSleepCard
                data={data?.sleep}
                isLoading={isLoadingState}
                onClick={() => console.log('Navigate to sleep details')}
              />

              {/* Emotion */}
              <HealthEmotionCard
                data={data?.emotion}
                isLoading={isLoadingState}
                onClick={() => console.log('Navigate to emotion details')}
              />

              {/* Nutrition */}
              <HealthNutritionCard
                data={data?.nutrition}
                isLoading={isLoadingState}
                onClick={() => console.log('Navigate to nutrition details')}
              />

              {/* Disclaimer */}
              <DisclaimerBox />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
