/**
 * EmotionDistributionCard
 * 
 * Displays emotion distribution as a pie chart with main emotion highlight.
 * Refactored to use the common DistributionCard component.
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DistributionCard, type DistributionItem } from '@/components/common/DistributionCard'
import { EMOTION_COLORS } from '@/config/theme'
import type { EmotionDistributionItem } from '../types'

export interface EmotionDistributionCardProps {
    /** Main emotion type */
    mainEmotion: string
    /** Main emotion label */
    mainEmotionLabel: string
    /** Distribution items */
    items: EmotionDistributionItem[]
    /** Additional class names */
    className?: string
    /** Loading state */
    isLoading?: boolean
}

/**
 * Get color for emotion type
 */
export const getEmotionColor = (type: string): string => {
    const typeUpper = type.toUpperCase()
    const colorMap: Record<string, string> = {
        HAPPY: EMOTION_COLORS.happy,
        CALM: EMOTION_COLORS.calm,
        NEUTRAL: EMOTION_COLORS.neutral,
        SURPRISED: EMOTION_COLORS.surprised,
        SAD: EMOTION_COLORS.sad,
        ANGRY: EMOTION_COLORS.angry,
        FEARFUL: EMOTION_COLORS.fearful,
        DISGUSTED: EMOTION_COLORS.disgusted,
    }
    return colorMap[typeUpper] || '#94a3b8'
}

/**
 * Transform EmotionDistributionItem[] to DistributionItem[]
 */
export const transformEmotionItems = (items: EmotionDistributionItem[]): DistributionItem[] => {
    return items.map((item) => ({
        type: item.type,
        label: item.label,
        percent: item.percent,
        count: item.count,
        color: getEmotionColor(item.type),
    }))
}

const EmotionDistributionCardInner = ({
    mainEmotion,
    mainEmotionLabel,
    items,
    className = '',
    isLoading = false,
}: EmotionDistributionCardProps) => {
    const { t } = useTranslation()

    // Transform emotion items to distribution items
    const distributionItems = useMemo(() => transformEmotionItems(items), [items])

    // Orange bar icon element
    const orangeBarIcon = (
        <span className="w-1.5 h-4 rounded-full bg-orange-400" />
    )

    return (
        <DistributionCard
            title={t('daily.emotionDistribution', 'Emotion distribution')}
            iconElement={orangeBarIcon}
            themeColor={EMOTION_COLORS.primary}
            items={distributionItems}
            donutThickness={12}
            centerValue={mainEmotionLabel}
            centerLabel={t('daily.asMain', 'as main')}
            centerValueColor={getEmotionColor(mainEmotion)}
            itemLayout="grid-2col"
            pieChartSize="medium"
            showInfo={true}
            className={className}
            isLoading={isLoading}
        />
    )
}

export const EmotionDistributionCard = memo(EmotionDistributionCardInner)
