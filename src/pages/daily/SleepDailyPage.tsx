/**
 * Sleep Daily Report Page
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Moon } from 'lucide-react'
import { DailyScoreCard } from '@/components/common/DailyScoreCard'
import { AIInsightsCard } from '@/components/common/AIInsightsCard'
import { SuggestionsList } from '@/components/common/SuggestionsList'
import {
    SleepStructureDiagram,
    SleepDistributionCard,
    SleepQualityIndicators,
    generateSleepDemoData,
    isDemoModeEnabled,
    toggleDemoMode,
    type SleepDailyData,
} from '@/daily/sleep'
import { VITAL_COLORS, UI_STYLES } from '@/config/theme'

export default function SleepDailyPage() {
    const { t } = useTranslation()
    const [data, setData] = useState<SleepDailyData | null>(() => generateSleepDemoData())
    const [demoMode, setDemoMode] = useState(isDemoModeEnabled())

    useEffect(() => {
        setData(generateSleepDemoData())
    }, [demoMode])

    const handleToggleDemo = () => {
        const newState = toggleDemoMode()
        setDemoMode(newState)
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
                            className={`w-10 h-5 rounded-full transition-colors ${demoMode ? 'bg-violet-400' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${demoMode ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Score Card */}
                    <DailyScoreCard
                        score={data.score}
                        maxScore={200}
                        levelLabel={data.levelLabel}
                        percentile={data.percentile}
                        percentileMessage={data.percentileMessage}
                        aiTags={data.aiTags}
                        themeColor="#A37EFE"
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
                    {data.suggestions.length > 0 && (
                        <SuggestionsList suggestions={data.suggestions} />
                    )}

                    {/* Disclaimer */}
                    <p className="text-xs text-slate-400 text-center px-4 py-2">
                        {t('common.disclaimer', 'The monitoring results of this product are for reference only.')}
                    </p>
                </div>
            </div>
        </div>
    )
}
