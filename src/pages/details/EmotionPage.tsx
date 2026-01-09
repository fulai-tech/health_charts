import { useEffect } from 'react'
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
import { useWeekNavigation } from '@/hooks/useWeekNavigation'
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'
import { DisclaimerBox } from '@/components/ui/DisclaimerBox'
import { UI_STYLES } from '@/config/theme'

/**
 * Emotion Details Page
 */
export function EmotionPage() {
  const { t } = useTranslation()
  const { theme } = useUrlConfig()
  const { prefetchPreviousWeeks } = usePrefetchEmotionData()

  // Week navigation (unified hook)
  const {
    dateRange,
    apiDateRange,
    displayDateRange,
    canGoNext,
    goToPreviousWeek,
    goToNextWeek,
    setWeek,
  } = useWeekNavigation()

  // Swipe navigation for touch devices
  const { containerRef, swipeHandlers } = useSwipeNavigation({
    onSwipeLeft: goToNextWeek,
    onSwipeRight: goToPreviousWeek,
    canSwipeLeft: canGoNext,
    canSwipeRight: true,
  })

  // Prefetch previous weeks
  useEffect(() => {
    prefetchPreviousWeeks(dateRange.start, 3)
  }, [dateRange.start, prefetchPreviousWeeks])

  // Fetch Emotion data
  const { data, isLoading, error } = useEmotionTrendData(apiDateRange)

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
      ref={containerRef}
      className="min-h-screen pb-20"
      style={{ backgroundColor: theme.background }}
      {...swipeHandlers}
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
              onPrevious={goToPreviousWeek}
              onNext={goToNextWeek}
              disableNext={!canGoNext}
              onSelectWeek={setWeek}
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
