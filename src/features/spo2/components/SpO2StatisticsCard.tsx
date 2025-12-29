import { useTranslation } from 'react-i18next'
import { Activity } from 'lucide-react'
import { DistributionCard, type DistributionItem } from '@/components/common/DistributionCard'
import { VITAL_COLORS, STATUS_COLORS } from '@/config/theme'
import type { SpO2DomainModel } from '../types'

interface SpO2StatisticsCardProps {
  data?: SpO2DomainModel
  className?: string
  isLoading?: boolean
}

// Status order for display
const STAT_ORDER = ['normal', 'low', 'too_low']

// Status label keys
const STAT_LABELS: Record<string, string> = {
  normal: 'status.normal',
  low: 'status.low',
  too_low: 'status.tooLow',
}

/**
 * SpO2 Statistics Card - Uses common DistributionCard
 */
export function SpO2StatisticsCard({ data, className, isLoading }: SpO2StatisticsCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.spo2

  const distribution = data?.summary?.distribution ?? []
  const totalCount = data?.summary?.totalCount ?? 0

  // Order distribution by our defined order
  const items: DistributionItem[] = STAT_ORDER.map((type) => {
    const found = distribution.find((d) => d.type === type)
    return {
      type,
      label: t(STAT_LABELS[type] || `status.${type}`),
      count: found?.count || 0,
      percent: found?.percent || 0,
      color: STATUS_COLORS.spo2[type as keyof typeof STATUS_COLORS.spo2] || '#94A3B8',
    }
  })

  return (
    <DistributionCard
      title={t('page.spo2.statistics')}
      icon={Activity}
      themeColor={themeColor}
      items={items}
      centerValue={totalCount}
      centerLabel={t('common.times')}
      showCount={true}
      columns={1}
      className={className}
      isLoading={isLoading}
    />
  )
}
