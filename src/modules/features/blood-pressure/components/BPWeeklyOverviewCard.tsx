import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { WeeklyOverviewCard } from '@/components/common/WeeklyOverviewCard'
import { VITAL_COLORS } from '@/config/theme'
import type { BPDomainModel } from '../types'
import { memo, useMemo } from 'react'

interface BPWeeklyOverviewCardProps {
  data?: BPDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * BP Weekly Overview Card
 */
const BPWeeklyOverviewCardInner = ({
  data,
  className,
  isLoading,
}: BPWeeklyOverviewCardProps) => {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.bp

  const overviewText = useMemo(
    () =>
      data?.weeklySummary?.overview ||
      t('page.bloodPressure.defaultOverview', {
        defaultValue: 'Your blood pressure is generally within the ideal range. Although your systolic blood pressure has risen slightly compared to last week, it remains within the normal fluctuation range.'
      }),
    [data?.weeklySummary?.overview, t]
  )

  const highlightsText = useMemo(
    () =>
      data?.weeklySummary?.highlights ||
      t('page.bloodPressure.defaultHighlights', {
        defaultValue: 'The trend chart shows that your blood pressure rose significantly during the week (Wednesday and Thursday), with a peak systolic pressure approaching 150 mmHg. Meanwhile, the statistics show that your blood pressure measurements fluctuated considerably across different levels. We will continue to monitor your condition and help you identify any possible causes for the elevated blood pressure.'
      }),
    [data?.weeklySummary?.highlights, t]
  )

  return (
    <WeeklyOverviewCard
      titleKey="page.bloodPressure.weeklyOverview"
      Icon={FileText}
      overallText={overviewText}
      highlightText={highlightsText}
      highlightLabelKey="page.bloodPressure.needsAttention"
      highlightColor="#FBBF24"
      suggestions={data?.weeklySummary?.suggestions}
      themeColor={themeColor}
      className={className}
      isLoading={isLoading}
    />
  )
}

export const BPWeeklyOverviewCard = memo(BPWeeklyOverviewCardInner)
