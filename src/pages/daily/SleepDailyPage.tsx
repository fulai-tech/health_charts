/**
 * Sleep Daily Report Page
 */

import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useQueryParams } from '@/hooks/useUrlParams'
import { Moon } from 'lucide-react'
import { DailyScoreCard } from '@/components/common/DailyScoreCard'
import { AIInsightsCard } from '@/components/common/AIInsightsCard'
import { SuggestionsList } from '@/components/common/SuggestionsList'
import {
    SleepStructureDiagram,
    SleepDistributionCard,
    SleepQualityIndicators,
} from '@/modules/daily/sleep'
import { VITAL_COLORS, UI_STYLES } from '@/config/theme'
import { useSleepDailyData } from '@/hooks/useDailyData'

function SleepDailyPage() {
    const { t } = useTranslation()
    const params = useQueryParams()
    const dateParam = params.date
    const { data, isLoading, isError, error } = useSleepDailyData(dateParam || undefined)

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
                    {/* Score Card */}
                    <DailyScoreCard
                        score={data.score}
                        maxScore={200}
                        levelLabel={data.levelLabel}
                        percentile={data.percentile}
                        percentileMessage={data.percentileMessage}
                        aiTags={data.aiTags}
                        themeColor={VITAL_COLORS.sleep}
                        title={t('daily.todayScore', "Today's score")}
                        icon={<Moon className="w-6 h-6 text-white" />}
                    />

                    {/* Sleep Structure Diagram */}
                    <SleepStructureDiagram
                        totalDuration={data.structureChart.totalDuration}
                        deepDuration={data.structureChart.deepDuration}
                        segments={data.structureChart.segments}
                    />

                    {/* Sleep Distribution */}
                    <SleepDistributionCard
                        items={data.structureAnalysis}
                        totalMinutes={data.structureChart.totalMinutes}
                    />

                    {/* Sleep Quality Indicators */}
                    <SleepQualityIndicators indicators={data.qualityIndicators} />

                    {/* AI Insights */}
                    {data.aiInsights.length > 0 && (
                        <AIInsightsCard
                            insights={data.aiInsights}
                            themeColor={VITAL_COLORS.sleep}
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

export default observer(SleepDailyPage)
