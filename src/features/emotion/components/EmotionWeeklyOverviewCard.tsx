import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { WeeklyOverviewCard } from '@/components/common/WeeklyOverviewCard'
import { EMOTION_COLORS } from '@/config/theme'
import type { EmotionDomainModel } from '../types'

interface EmotionWeeklyOverviewCardProps {
  data?: EmotionDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * Emotion Weekly Overview Card
 */
export function EmotionWeeklyOverviewCard({
  data,
  className,
  isLoading,
}: EmotionWeeklyOverviewCardProps) {
  const { t } = useTranslation()

  const weeklySummary = data?.weeklySummary

  const overviewText = weeklySummary?.overview ||
    t('page.emotion.defaultOverview', {
      defaultValue: '本周您的情绪整体处于积极状态。继续保持良好的心态和生活习惯！'
    })

  const highlightsText = weeklySummary?.highlights ||
    t('page.emotion.defaultHighlights', {
      defaultValue: '趋势图显示您的情绪在本周中有一些波动。这是正常的，可能会受到工作压力、睡眠质量和社交活动的影响。'
    })

  return (
    <WeeklyOverviewCard
      titleKey="page.emotion.weeklyOverview"
      Icon={FileText}
      overallText={overviewText}
      highlightText={highlightsText}
      highlightLabelKey="page.emotion.needsAttention"
      highlightColor="#FBBF24"
      suggestions={weeklySummary?.suggestions}
      themeColor={EMOTION_COLORS.primary}
      className={className}
      isLoading={isLoading}
    />
  )
}
