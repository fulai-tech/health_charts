import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRangePicker } from '@/components/business/DateRangePicker'
import { EmotionTrendyReportCard } from '@/features/emotion/components/EmotionTrendyReportCard'
import { EmotionStatisticsCard } from '@/features/emotion/components/EmotionStatisticsCard'
import { EmotionDistributionCard } from '@/features/emotion/components/EmotionDistributionCard'
import { EmotionDataAnalysisCard } from '@/features/emotion/components/EmotionDataAnalysisCard'
import { EmotionWeeklyOverviewCard } from '@/features/emotion/components/EmotionWeeklyOverviewCard'
import { EmotionDiaryCard } from '@/features/emotion/components/EmotionDiaryCard'
import { EmotionDemoModeToggle } from '@/features/emotion/components/EmotionDemoModeToggle'
import { useEmotionTrendData, usePrefetchEmotionData } from '@/features/emotion/api'
import { useUrlConfig } from '@/hooks/useUrlParams'
import { DisclaimerBox } from '@/components/ui/DisclaimerBox'
import { UI_STYLES } from '@/config/theme'
import {
  formatDateToAPI,
  formatDateForDisplay,
  getCurrentWeekDateRange,
  getPreviousWeekRange,
  getNextWeekRange,
  canNavigateToNextWeek
} from '@/lib/dateUtils'

/**
 * Emotion Details Page
 */
export function EmotionPage() {
  const { t } = useTranslation()
  const { theme } = useUrlConfig()
  const { prefetchPreviousWeeks } = usePrefetchEmotionData()

  // Date range state - week-aligned (Monday to today or Sunday)
  const [dateRange, setDateRange] = useState(() => getCurrentWeekDateRange())

  // Prefetch previous weeks
  useEffect(() => {
    prefetchPreviousWeeks(dateRange.start, 3)
  }, [dateRange.start, prefetchPreviousWeeks])

  // Check if we can navigate to next week
  const canGoNext = useMemo(() => canNavigateToNextWeek(dateRange.start), [dateRange.start])

  // Format dates for API
  const apiDateRange = useMemo(
    () => ({
      startDate: formatDateToAPI(dateRange.start),
      endDate: formatDateToAPI(dateRange.end),
    }),
    [dateRange]
  )

  // Format dates for display
  const displayDateRange = useMemo(
    () => ({
      start: formatDateForDisplay(dateRange.start),
      end: formatDateForDisplay(dateRange.end),
    }),
    [dateRange]
  )

  // Handle date navigation - week by week
  const handlePrevious = () => {
    setDateRange((prev) => getPreviousWeekRange(prev.start))
  }

  const handleNext = () => {
    if (!canGoNext) return
    setDateRange((prev) => {
      const next = getNextWeekRange(prev.start)
      return next || prev
    })
  }

  // Fetch Emotion data
  const { data, isLoading, isFetching, error } = useEmotionTrendData(apiDateRange)



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

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: theme.background }}
    >
      <div className={`${UI_STYLES.pageMaxWidth} mx-auto`}>
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
            <EmotionDemoModeToggle />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 space-y-4">
          {!data && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">{t('common.noData')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <EmotionTrendyReportCard data={data} />
              <EmotionStatisticsCard data={data} />
              <EmotionDistributionCard data={data} />
              <EmotionDataAnalysisCard data={data} />
              <EmotionWeeklyOverviewCard data={data} />
              <EmotionDiaryCard data={data} />
              <DisclaimerBox />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
