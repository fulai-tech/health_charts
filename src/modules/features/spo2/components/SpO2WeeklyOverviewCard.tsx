import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { WeeklyOverviewCard } from '@/components/common/WeeklyOverviewCard'
import { VITAL_COLORS } from '@/config/theme'
import type { SpO2DomainModel } from '../types'

interface SpO2WeeklyOverviewCardProps {
  data?: SpO2DomainModel
  className?: string
  isLoading?: boolean
}

/**
 * SpO2 Weekly Overview Card
 */
export function SpO2WeeklyOverviewCard({ data, className, isLoading }: SpO2WeeklyOverviewCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.spo2

  const weeklySummary = data?.weeklySummary

  // Default overview text if not provided
  const overviewText =
    weeklySummary?.overview ||
    t('page.spo2.defaultOverview', {
      defaultValue:
        'Your blood pressure is generally within the ideal range. Although your systolic blood pressure has risen slightly compared to last week, it remains within the normal fluctuation range.',
    })

  // Default highlights text if not provided
  const highlightsText =
    weeklySummary?.highlights ||
    t('page.spo2.defaultHighlights', {
      defaultValue:
        'The trend chart shows that your blood pressure rose significantly during the week (Wednesday and Thursday), with a peak systolic pressure approaching 150 mmHg. Meanwhile, the statistics show that your blood pressure measurements fluctuated considerably across different levels. We will continue to monitor your condition and help you identify any possible causes for the elevated blood pressure.',
    })

  return (
    <WeeklyOverviewCard
      titleKey="page.spo2.weeklyOverview"
      Icon={FileText}
      overallText={overviewText}
      highlightText={highlightsText}
      highlightLabelKey="page.spo2.anomalyAlert"
      highlightColor="#FBBF24"
      suggestions={weeklySummary?.suggestions}
      themeColor={themeColor}
      className={className}
      isLoading={isLoading}
    />
  )
}
