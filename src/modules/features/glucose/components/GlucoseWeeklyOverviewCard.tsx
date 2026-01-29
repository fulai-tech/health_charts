import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { WeeklyOverviewCard } from '@/components/common/WeeklyOverviewCard'
import { VITAL_COLORS } from '@/config/theme'
import type { GlucoseDomainModel } from '../types'

interface GlucoseWeeklyOverviewCardProps {
  data?: GlucoseDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * Glucose Weekly Overview Card
 */
export function GlucoseWeeklyOverviewCard({
  data,
  className,
  isLoading,
}: GlucoseWeeklyOverviewCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.glucose

  const weeklySummary = data?.weeklySummary

  const overviewText = weeklySummary?.overview ||
    t('page.glucose.defaultOverview', {
      defaultValue: 'Your blood glucose levels are generally within the normal range this week. Keep up the good work with your diet and exercise habits!'
    })

  const highlightsText = weeklySummary?.highlights ||
    t('page.glucose.defaultHighlights', {
      defaultValue: 'The trend chart shows some fluctuations in your blood glucose levels during the week. Pay attention to your diet, especially after meals, to maintain stable blood sugar levels.'
    })

  return (
    <WeeklyOverviewCard
      titleKey="page.glucose.weeklyOverview"
      Icon={FileText}
      overallText={overviewText}
      highlightText={highlightsText}
      highlightLabelKey="page.glucose.needsAttention"
      highlightColor="#FBBF24"
      suggestions={weeklySummary?.suggestions}
      themeColor={themeColor}
      className={className}
      isLoading={isLoading}
    />
  )
}
