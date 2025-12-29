import { useTranslation } from 'react-i18next'
import { FileSearch } from 'lucide-react'
import { DataAnalysisCard } from '@/components/common/DataAnalysisCard'
import { EMOTION_COLORS } from '@/config/theme'
import type { EmotionDomainModel } from '../types'

interface EmotionDataAnalysisCardProps {
  data?: EmotionDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * Emotion Data Analysis Card
 */
export function EmotionDataAnalysisCard({
  data,
  className,
  isLoading,
}: EmotionDataAnalysisCardProps) {
  const { t } = useTranslation()

  const dataAnalysis = data?.weeklySummary?.dataAnalysis || []

  // Default analysis items if no data
  const defaultItems = [
    t('page.emotion.defaultAnalysis1', { defaultValue: '您的情绪以积极为主，整体状态良好' }),
    t('page.emotion.defaultAnalysis2', { defaultValue: '情绪波动在正常范围内，情绪调节能力较强' }),
    t('page.emotion.defaultAnalysis3', { defaultValue: '建议继续保持积极的生活态度，适当进行放松训练' }),
  ]

  const items = dataAnalysis.length > 0 ? dataAnalysis : defaultItems

  return (
    <DataAnalysisCard
      titleKey="page.emotion.dataAnalysis"
      Icon={FileSearch}
      items={items}
      themeColor={EMOTION_COLORS.primary}
      className={className}
      isLoading={isLoading}
    />
  )
}
