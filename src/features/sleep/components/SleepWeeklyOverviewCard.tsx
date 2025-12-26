import { useTranslation } from 'react-i18next'
import { FileText, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import type { SleepDomainModel } from '../types'
import { memo, useMemo } from 'react'

interface SleepWeeklyOverviewCardProps {
    data?: SleepDomainModel
    className?: string
    isLoading?: boolean
}

const SLEEP_THEME_COLOR = '#A78BFA'

/**
 * Sleep Weekly Overview Card
 */
const SleepWeeklyOverviewCardInner = ({
    data,
    className,
    isLoading,
}: SleepWeeklyOverviewCardProps) => {
    const { t } = useTranslation()

    const weeklySummary = data?.weeklySummary ?? {
        overview: null,
        highlights: null,
        suggestions: [],
        dataAnalysis: [],
    }

    const overviewText = useMemo(
        () =>
            weeklySummary.overview ||
            t('page.sleep.defaultOverview', {
                defaultValue: 'Your sleep quality this week has been generally good. You have maintained a consistent sleep schedule, which is beneficial for your overall health.'
            }),
        [weeklySummary.overview, t]
    )

    const highlightsText = useMemo(
        () =>
            weeklySummary.highlights ||
            t('page.sleep.defaultHighlights', {
                defaultValue: 'The trend chart shows your sleep patterns have been relatively stable throughout the week. However, pay attention to your REM sleep ratio as it may affect your sleep quality and dream patterns.'
            }),
        [weeklySummary.highlights, t]
    )

    return (
        <Card className={`${className} relative overflow-hidden`}>
            {/* Loading overlay */}
            <div
                className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                style={{ backgroundColor: UI_STYLES.loadingOverlay }}
            >
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" style={{ color: SLEEP_THEME_COLOR }} />
                <h3 className="text-base font-semibold text-slate-800">
                    {t('page.sleep.weeklyOverview')}
                </h3>
            </div>

            <div className="mb-5">
                <span
                    className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium mb-2"
                    style={{ backgroundColor: SLEEP_THEME_COLOR }}
                >
                    {t('page.sleep.overallSituation')}
                </span>
                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: '#F8F9FA',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {overviewText}
                    </p>
                </div>
            </div>

            <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-medium mb-2">
                    {t('page.sleep.needsAttention')}
                </span>
                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: '#F8F9FA',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {highlightsText}
                    </p>
                </div>
            </div>

            {weeklySummary.suggestions && weeklySummary.suggestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <ul className="space-y-2">
                        {weeklySummary.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                                <span style={{ color: SLEEP_THEME_COLOR }}>•</span>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    )
}

export const SleepWeeklyOverviewCard = memo(SleepWeeklyOverviewCardInner)
