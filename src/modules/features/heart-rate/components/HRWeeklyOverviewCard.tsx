import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { WeeklyOverviewCard } from '@/components/common/WeeklyOverviewCard'
import { VITAL_COLORS } from '@/config/theme'
import type { HRDomainModel } from '../types'

interface HRWeeklyOverviewCardProps {
  data?: HRDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * HR Weekly Overview Card
 */
export function HRWeeklyOverviewCard({ data, className, isLoading }: HRWeeklyOverviewCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.heartRate

  const weeklySummary = data?.weeklySummary

  const overviewText = weeklySummary?.overview ||
    t('page.heartRate.defaultOverview', {
      defaultValue: 'Your heart rate is generally within the normal range this week. Keep up with your regular exercise routine!'
    })

  const highlightsText = weeklySummary?.highlights ||
    t('page.heartRate.defaultHighlights', {
      defaultValue: 'The trend chart shows some fluctuations in your heart rate during the week. This is normal and can be influenced by physical activity, stress levels, and sleep quality.'
    })

  return (
    <WeeklyOverviewCard
      titleKey="page.heartRate.weeklyOverview"
      Icon={FileText}
      overallText={overviewText}
      highlightText={highlightsText}
      highlightLabelKey="page.heartRate.anomalyAlert"
      highlightColor="#FBBF24"
      suggestions={weeklySummary?.suggestions}
      themeColor={themeColor}
      className={className}
      isLoading={isLoading}
    />
  )
}
