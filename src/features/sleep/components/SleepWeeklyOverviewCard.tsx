import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { WeeklyOverviewCard } from '@/components/common/WeeklyOverviewCard'
import type { SleepDomainModel } from '../types'
import { memo, useMemo } from 'react'

interface SleepWeeklyOverviewCardProps {
    data?: SleepDomainModel
    className?: string
    isLoading?: boolean
}

const SLEEP_THEME_COLOR = '#A78BFA'

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
        <WeeklyOverviewCard
            titleKey="page.sleep.weeklyOverview"
            Icon={FileText}
            overallText={overviewText}
            highlightText={highlightsText}
            highlightLabelKey="page.sleep.needsAttention"
            highlightColor="#FBBF24" // Amber for warning similar to original 'bg-amber-400'
            suggestions={weeklySummary.suggestions}
            themeColor={SLEEP_THEME_COLOR}
            className={className}
            isLoading={isLoading}
        />
    )
}

export const SleepWeeklyOverviewCard = memo(SleepWeeklyOverviewCardInner)
