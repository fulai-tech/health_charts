import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRangePicker } from '@/components/business/DateRangePicker'
import { SpO2TrendyReportCard } from '@/features/spo2/components/SpO2TrendyReportCard'
import { SpO2StatisticsCard } from '@/features/spo2/components/SpO2StatisticsCard'
import { SpO2DataAnalysisCard } from '@/features/spo2/components/SpO2DataAnalysisCard'
import { SpO2WeeklyOverviewCard } from '@/features/spo2/components/SpO2WeeklyOverviewCard'
import { useSpO2TrendData, usePrefetchSpO2Data } from '@/features/spo2/api'
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
 * SpO2 (Blood Oxygen) Details Page
 *
 * URL Params:
 * - ?lang=zh or ?lang=en (language)
 * - ?theme=light or ?theme=dark (theme mode)
 */
export function SpO2Page() {
  const { t } = useTranslation()
  const { theme } = useUrlConfig()
  const { prefetchPreviousWeeks } = usePrefetchSpO2Data()

  // Date range state - week-aligned (Monday to today or Sunday)
  const [dateRange, setDateRange] = useState(() => getCurrentWeekDateRange())

  // Prefetch previous weeks - runs on mount AND when dateRange changes
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

  // Fetch SpO2 data with date range - will refetch when dates change
  const { data, isLoading, isFetching, error } = useSpO2TrendData(apiDateRange)



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
        {/* Date Range Picker - Always visible, not affected by loading */}
        <div
          className="sticky top-0 z-20 py-3 px-4"
          style={{
            backgroundColor: theme.background
          }}
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
        </div>

        {/* Content - Shows loading or data */}
        <div className="px-4 space-y-4">
          {!data && !isLoading ? (
            // No data state (after loading completes with no data)
            <div className="flex items-center justify-center py-20">
              <p style={{ color: theme.textSecondary }}>{t('common.noData')}</p>
            </div>
          ) : (
            // Always show cards - with overlay when loading
            <div className="space-y-4">
              <SpO2TrendyReportCard data={data} />
              <SpO2StatisticsCard data={data} />
              <SpO2DataAnalysisCard data={data} />
              <SpO2WeeklyOverviewCard data={data} />
              <DisclaimerBox />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
