/**
 * Healthy Daily Report Page
 */

import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { DailyScoreCard } from '@/components/common/DailyScoreCard'
import { AIInsightsCard } from '@/components/common/AIInsightsCard'
import { SuggestionsList } from '@/components/common/SuggestionsList'
import {
    BloodPressureIndicatorCard,
    HeartRateIndicatorCard,
    BloodGlucoseIndicatorCard,
    BloodOxygenIndicatorCard,
    toggleDemoMode,
} from '@/daily/healthy'
import { HEALTH_COLORS, UI_STYLES } from '@/config/theme'
import { useHealthyDailyData } from '@/hooks/useDailyData'

export default function HealthyDailyPage() {
    const { t } = useTranslation()
    const [searchParams] = useSearchParams()
    const dateParam = searchParams.get('date')
    const { data, isLoading, isError, error, isDemoMode, invalidate } = useHealthyDailyData(dateParam || undefined)

    const handleToggleDemo = () => {
        toggleDemoMode()
        // Invalidate and refetch after toggling demo mode
        invalidate()
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F1EFEE' }}>
                <div className="animate-pulse text-slate-500">Loading...</div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F1EFEE' }}>
                <div className="text-red-500">Error: {error?.message || 'Failed to load data'}</div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: '#F1EFEE' }}>
            <div className={`${UI_STYLES.pageMaxWidth} mx-auto`}>
                <div className="p-4 space-y-4">
                    {/* Demo mode toggle */}
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-slate-500">Demo Mode</span>
                        <button
                            onClick={handleToggleDemo}
                            className={`w-10 h-5 rounded-full transition-colors ${isDemoMode ? 'bg-orange-400' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${isDemoMode ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Score Card */}
                    <DailyScoreCard
                        score={data.score}
                        maxScore={100}
                        percentile={data.percentile}
                        percentileMessage={data.percentileMessage}
                        aiTags={data.aiTags}
                        themeColor="#FB923D"
                        title={t('daily.todayScore', "Today's score")}
                        icon={<Activity className="w-6 h-6 text-white" />}
                    />

                    {/* Core Indicator Analysis */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-slate-800 px-1">
                            {t('daily.coreIndicators', 'Core indicator Analysis')}
                        </h3>

                        {/* Blood Pressure */}
                        <BloodPressureIndicatorCard
                            latest={data.indicators.bloodPressure.latest}
                            change={data.indicators.bloodPressure.change}
                            avg={data.indicators.bloodPressure.avg}
                            reference={data.indicators.bloodPressure.reference}
                            status={data.indicators.bloodPressure.status}
                            chart={data.indicators.bloodPressure.chart}
                            yAxisRange={data.indicators.bloodPressure.yAxisRange}
                        />

                        {/* Heart Rate */}
                        <HeartRateIndicatorCard
                            latest={data.indicators.heartRate.latest}
                            change={data.indicators.heartRate.change}
                            avg={data.indicators.heartRate.avg}
                            max={data.indicators.heartRate.max}
                            min={data.indicators.heartRate.min}
                            reference={data.indicators.heartRate.reference}
                            status={data.indicators.heartRate.status}
                            chart={data.indicators.heartRate.chart}
                            yAxisRange={data.indicators.heartRate.yAxisRange}
                        />

                        {/* Blood Glucose (POCT) */}
                        <BloodGlucoseIndicatorCard
                            latest={data.indicators.bloodGlucose.latest}
                            change={data.indicators.bloodGlucose.change}
                            avg={data.indicators.bloodGlucose.avg}
                            max={data.indicators.bloodGlucose.max}
                            min={data.indicators.bloodGlucose.min}
                            reference={data.indicators.bloodGlucose.reference}
                            status={data.indicators.bloodGlucose.status}
                            chart={data.indicators.bloodGlucose.chart}
                            yAxisRange={data.indicators.bloodGlucose.yAxisRange}
                        />

                        {/* Blood Oxygen */}
                        <BloodOxygenIndicatorCard
                            latest={data.indicators.bloodOxygen.latest}
                            change={data.indicators.bloodOxygen.change}
                            avg={data.indicators.bloodOxygen.avg}
                            max={data.indicators.bloodOxygen.max}
                            min={data.indicators.bloodOxygen.min}
                            reference={data.indicators.bloodOxygen.reference}
                            status={data.indicators.bloodOxygen.status}
                            chart={data.indicators.bloodOxygen.chart}
                            yAxisRange={data.indicators.bloodOxygen.yAxisRange}
                        />
                    </div>

                    {/* AI Insights */}
                    {data.aiInsights.length > 0 && (
                        <AIInsightsCard
                            insights={data.aiInsights}
                            themeColor={HEALTH_COLORS.primary}
                        />
                    )}

                    {/* Suggestions */}
                    <SuggestionsList suggestions={data.suggestions || []} />

                    {/* Disclaimer */}
                    <p className="text-xs text-slate-400 text-center px-4 py-2">
                        {t('common.disclaimer', 'The monitoring results of this product are for reference only.')}
                    </p>
                </div>
            </div>
        </div>
    )
}
