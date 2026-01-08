import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRangePicker } from '@/components/business/DateRangePicker'
import { NutritionWeeklyGaugeCard } from '@/features/nutrition/components/NutritionWeeklyGaugeCard'
import { NutritionStatisticsCard } from '@/features/nutrition/components/NutritionStatisticsCard'
import { NutritionDataAnalysisCard } from '@/features/nutrition/components/NutritionDataAnalysisCard'
import { MicroElementStructureCard } from '@/features/nutrition/components/MicroElementStructureCard'
import { MicroElementStatusCard } from '@/features/nutrition/components/MicroElementStatusCard'
import { ComplicatedRecipesCard } from '@/features/nutrition/components/ComplicatedRecipesCard'
import { NutritionWeeklyOverviewCard } from '@/features/nutrition/components/NutritionWeeklyOverviewCard'
import { useNutritionData, usePrefetchNutritionData } from '@/features/nutrition/api'
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
 * Nutrition Details Page
 *
 * URL Params:
 * - ?lang=zh or ?lang=en (language)
 * - ?theme=light or ?theme=dark (theme mode)
 */
export function NutritionPage() {
    const { t } = useTranslation()
    const { theme } = useUrlConfig()
    const { prefetchPreviousWeeks } = usePrefetchNutritionData()

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

    // Fetch Nutrition data with date range - will refetch when dates change
    const { data, isLoading, isFetching, error } = useNutritionData(apiDateRange)

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
                        <div className="text-center py-12">
                            <p className="text-slate-500">{t('common.noData')}</p>
                        </div>
                    ) : (
                        // Always show cards - with overlay when loading
                        <div className="space-y-4">
                            <NutritionWeeklyGaugeCard data={data?.weeklyManagement} />
                            <NutritionStatisticsCard data={data?.metabolismTrend} />
                            <NutritionDataAnalysisCard data={data?.analysis} />
                            <MicroElementStructureCard data={data?.nutrientStructure} />
                            <MicroElementStatusCard data={data?.microElements} />
                            <ComplicatedRecipesCard data={data?.recipes} />
                            <NutritionWeeklyOverviewCard data={data} />
                            <DisclaimerBox />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
