import { useTranslation } from 'react-i18next'
import { Activity } from 'lucide-react'
import { DistributionCard, type DistributionItem } from '@/components/common/DistributionCard'
import { VITAL_COLORS, STATUS_COLORS } from '@/config/theme'
import type { GlucoseDomainModel } from '../types'
import { useMemo } from 'react'

interface GlucoseStatisticsCardProps {
  data?: GlucoseDomainModel
  className?: string
  isLoading?: boolean
}

// Status order for display
const STAT_ORDER = ['normal', 'high', 'too_high', 'too_low']

// Status label keys
const STAT_LABELS: Record<string, string> = {
  normal: 'status.normal',
  high: 'status.high',
  too_high: 'status.tooHigh',
  too_low: 'status.tooLow',
}

/**
 * Glucose Statistics Card - Uses common DistributionCard with highlight mode
 */
export function GlucoseStatisticsCard({ data, className, isLoading }: GlucoseStatisticsCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.glucose

  const distribution = data?.summary?.distribution ?? []
  const totalCount = data?.summary?.totalCount ?? 0

  // Order distribution by our defined order - show all items for stable layout
  const items: DistributionItem[] = useMemo(
    () => STAT_ORDER.map((type) => {
      const found = distribution.find((d) => d.type === type)
      return {
        type,
        label: t(STAT_LABELS[type] || `status.${type}`),
        count: found?.count || 0,
        percent: found?.percent || 0,
        color: STATUS_COLORS.glucose[type as keyof typeof STATUS_COLORS.glucose] || '#94A3B8',
      }
    }),
    [distribution, t]
  )

  // Calculate normal count
  const normalCount = useMemo(
    () => items
      .filter((d) => d.type === 'normal')
      .reduce((sum, d) => sum + (d.count || 0), 0),
    [items]
  )

  return (
    <DistributionCard
      title={t('page.glucose.statistics')}
      icon={Activity}
      themeColor={themeColor}
      items={items}
      centerValue={t('common.good')}
      centerLabel={t('common.inAverage')}
      highlightValue={normalCount}
      highlightLabel={`/ ${totalCount} ${t('common.times')}`}
      highlightDescription={t('page.glucose.normalResults')}
      gridColumns={2}
      className={className}
      isLoading={isLoading}
    />
  )
}
