/**
 * SleepDistributionCard
 * 
 * Displays sleep stage distribution as a donut chart with labels.
 * Refactored to use the common DistributionCard component.
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DistributionCard, type DistributionItem } from '@/components/common/DistributionCard'
import { SLEEP_COLORS, VITAL_COLORS } from '@/config/theme'
import type { SleepStructureItem } from '../types'

export interface SleepDistributionCardProps {
    items: SleepStructureItem[]
    totalMinutes?: number
    className?: string
    isLoading?: boolean
}

/**
 * Get color for sleep stage type
 */
const getStageColor = (type: string): string => {
    const colorMap: Record<string, string> = SLEEP_COLORS
    return colorMap[type.toLowerCase()] || '#94a3b8'
}

/**
 * Get translated label for sleep stage type
 */
const getSleepStageLabel = (type: string, fallbackLabel: string, t: (key: string, fallback: string) => string): string => {
    const typeKey = type.toLowerCase()
    return t(`sleep.${typeKey}`, fallbackLabel)
}

/**
 * Transform SleepStructureItem[] to DistributionItem[] with i18n labels
 */
export const transformSleepItems = (
    items: SleepStructureItem[],
    t: (key: string, fallback: string) => string
): DistributionItem[] => {
    return items.map((item) => ({
        type: item.type,
        label: getSleepStageLabel(item.type, item.label, t),
        percent: item.percent,
        color: getStageColor(item.type),
        duration: item.duration,
        status: item.status,
    }))
}

const SleepDistributionCardInner = ({
    items,
    totalMinutes,
    className = '',
    isLoading = false,
}: SleepDistributionCardProps) => {
    const { t } = useTranslation()

    // Transform sleep items to distribution items with i18n labels
    const distributionItems = useMemo(() => transformSleepItems(items, t), [items, t])

    // Calculate hours for center display
    const hours = totalMinutes ? Math.floor(totalMinutes / 60) : '--'

    // Violet bar icon element
    const violetBarIcon = (
        <span className="w-1.5 h-4 rounded-full bg-violet-400" />
    )

    return (
        <DistributionCard
            title={t('daily.sleepDistribution', 'Sleep distribution')}
            iconElement={violetBarIcon}
            themeColor={VITAL_COLORS.sleep}
            items={distributionItems}
            centerValue={hours}
            centerLabel={t('daily.totalHours', 'Total hours')}
            centerValueColor="#1e293b" // slate-800
            itemLayout="with-duration"
            pieChartSize="medium"
            showInfo={true}
            className={className}
            isLoading={isLoading}
        />
    )
}

export const SleepDistributionCard = memo(SleepDistributionCardInner)
