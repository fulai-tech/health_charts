import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRangePicker } from '@/components/business/DateRangePicker'
import { SleepTrendyReportCard } from '@/features/sleep/components/SleepTrendyReportCard'
import { SleepStructureCard } from '@/features/sleep/components/SleepStructureCard'
import { SleepDataAnalysisCard } from '@/features/sleep/components/SleepDataAnalysisCard'
import { SleepCompareCard } from '@/features/sleep/components/SleepCompareCard'
import { SleepWeeklyOverviewCard } from '@/features/sleep/components/SleepWeeklyOverviewCard'
import { useSleepTrendData, usePrefetchSleepData } from '@/features/sleep/api'
import { useUrlConfig } from '@/hooks/useUrlParams'
import { DisclaimerBox } from '@/components/ui/DisclaimerBox'

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

/**
 * Sleep Details Page
 * 
 * URL Params:
 * - ?lang=zh or ?lang=en (language)
 * - ?theme=light or ?theme=dark (theme mode)
 */
export function SleepPage() {
    const { t } = useTranslation()
    const { theme } = useUrlConfig()
    const { prefetchPreviousWeeks } = usePrefetchSleepData()

    // Date range state
    const [dateRange, setDateRange] = useState(() => {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 6)
        return { start, end }
    })

    // Prefetch previous weeks - runs on mount AND when dateRange changes
    useEffect(() => {
        prefetchPreviousWeeks(dateRange.end, 3)
    }, [dateRange.end, prefetchPreviousWeeks])

    // Check if we can go to next period (current end date is already today or later)
    const canGoNext = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const endDate = new Date(dateRange.end)
        endDate.setHours(0, 0, 0, 0)
        // Can go next if end date is before today
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

            // Ensure we don't go past today
            const today = new Date()
            if (newEnd > today) {
                newEnd.setTime(today.getTime())
                newStart.setTime(today.getTime())
                newStart.setDate(newStart.getDate() - 6)
            }

            return { start: newStart, end: newEnd }
        })
    }

    // Fetch Sleep data with date range - will refetch when dates change
    const { data, isLoading, isFetching, error } = useSleepTrendData(apiDateRange)



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
            <div className="max-w-2xl mx-auto">
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
                        // Always show cards - with skeleton content when no data, with overlay when loading
                        <div className="space-y-4">
                            <SleepTrendyReportCard data={data} />
                            <SleepStructureCard data={data} />
                            <SleepDataAnalysisCard data={data} />
                            <SleepCompareCard data={data} />
                            <SleepWeeklyOverviewCard data={data} />
                            <DisclaimerBox />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
