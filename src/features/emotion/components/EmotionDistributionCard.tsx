import { useTranslation } from 'react-i18next'
import { PieChart as PieChartIcon } from 'lucide-react'
import { DistributionCard, type DistributionItem } from '@/components/common/DistributionCard'
import { EMOTION_COLORS } from '@/config/theme'
import type { EmotionDomainModel } from '../types'
import { useMemo, memo } from 'react'

// Emotion type colors mapping to theme
const EMOTION_TYPE_COLORS: Record<string, string> = {
  happy: EMOTION_COLORS.happy,
  surprised: EMOTION_COLORS.surprised,
  calm: EMOTION_COLORS.calm,
  sad: EMOTION_COLORS.sad,
  angry: EMOTION_COLORS.angry,
  fearful: EMOTION_COLORS.fearful,
  disgusted: EMOTION_COLORS.disgusted,
  neutral: EMOTION_COLORS.calm,
}

interface EmotionDistributionCardProps {
  data?: EmotionDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * Emotion Distribution Card - Uses common DistributionCard with 2-column mode
 */
const EmotionDistributionCardInner = ({ data, className, isLoading }: EmotionDistributionCardProps) => {
  const { t } = useTranslation()
  const themeColor = EMOTION_COLORS.primary

  const distribution = data?.distribution?.distribution ?? []
  const dominantEmotion = data?.distribution?.dominantEmotion ?? ''

  // Map distribution to DistributionItem format
  const items: DistributionItem[] = useMemo(() =>
    distribution.map((d) => ({
      type: d.type,
      label: d.label,
      percent: d.percent,
      count: d.count,
      color: EMOTION_TYPE_COLORS[d.type] || EMOTION_COLORS.calm,
    })),
    [distribution]
  )

  return (
    <DistributionCard
      title={t('page.emotion.distribution')}
      icon={PieChartIcon}
      themeColor={themeColor}
      pieChartSize={"medium"}
      items={items}
      centerValue={dominantEmotion || t('page.emotion.neutral')}
      centerLabel="as main"
      showCount={false}
      columns={2}
      className={className}
      isLoading={isLoading}
    />
  )
}

export const EmotionDistributionCard = memo(EmotionDistributionCardInner)
