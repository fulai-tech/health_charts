import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRangePicker } from '@/components/common/DateRangePicker'
import { BPTrendyReportCard } from '@/features/blood-pressure/components/BPTrendyReportCard'
import { BPStatisticsCard } from '@/features/blood-pressure/components/BPStatisticsCard'
import { BPCompareCard } from '@/features/blood-pressure/components/BPCompareCard'
import { BPWeeklyOverviewCard } from '@/features/blood-pressure/components/BPWeeklyOverviewCard'
import { useBPTrendData, usePrefetchBPData } from '@/features/blood-pressure/api'
import { useUrlConfig } from '@/hooks/useUrlParams'
import { useWeekNavigation } from '@/hooks/useWeekNavigation'
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'
import { DisclaimerBox } from '@/components/ui/DisclaimerBox'
import { UI_STYLES } from '@/config/theme'

/**
 * Blood Pressure Details Page
 * 
 * URL Params:
 * - ?lang=zh or ?lang=en (language)
 * - ?theme=light or ?theme=dark (theme mode)
 */
export function BloodPressurePage() {
  const { t } = useTranslation()
  const { theme } = useUrlConfig()
  const { prefetchPreviousWeeks } = usePrefetchBPData()

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

  // Prefetch previous weeks - runs on mount AND when dateRange changes
  useEffect(() => {
    prefetchPreviousWeeks(dateRange.start, 3)
  }, [dateRange.start, prefetchPreviousWeeks])

  // Fetch BP data with date range - will refetch when dates change
  const { data, isLoading, error } = useBPTrendData(apiDateRange)

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
        {/* Date Range Picker - Always visible, not affected by loading */}
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
        </div>

        {/* Content - Shows loading or data */}
        <div className="px-4 space-y-4">
          {!data && !isLoading ? (
            // No data state (after loading completes with no data)
            <div className="flex items-center justify-center py-20">
              <p style={{ color: theme.textSecondary }}>{t('common.noData')}</p>
            </div>
          ) : (
            // Always show cards - with skeleton content when no data, with overlay when loading
            <div className="space-y-4">
              <BPTrendyReportCard data={data} />
              <BPStatisticsCard data={data} />
              <BPCompareCard data={data} />
              <BPWeeklyOverviewCard data={data} />
              <DisclaimerBox />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
