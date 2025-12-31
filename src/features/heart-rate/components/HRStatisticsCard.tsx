import { useTranslation } from 'react-i18next'
import { Activity } from 'lucide-react'
import { DistributionCard, type DistributionItem } from '@/components/common/DistributionCard'
import { VITAL_COLORS, STATUS_COLORS } from '@/config/theme'
import type { HRDomainModel } from '../types'

interface HRStatisticsCardProps {
  data?: HRDomainModel
  className?: string
  isLoading?: boolean
}

// Status order for display
const STAT_ORDER = ['too_high', 'high', 'normal', 'slow']

// Status label keys
const STAT_LABELS: Record<string, string> = {
  normal: 'status.normal',
  high: 'status.high',
  too_high: 'status.tooHigh',
  slow: 'status.slow',
  low: 'status.low',
}

/**
 * HR Statistics Card - Uses common DistributionCard
 */
export function HRStatisticsCard({ data, className, isLoading }: HRStatisticsCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.heartRate

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
      color: STATUS_COLORS.heartRate[type as keyof typeof STATUS_COLORS.heartRate] || '#94A3B8',
    }
  })

  return (
    <DistributionCard
      title={t('page.heartRate.statistics')}
      icon={Activity}
      themeColor={themeColor}
      pieChartSize="medium"
      donutThickness={12}
      items={items}
      centerValue={totalCount}
      centerLabel={t('page.heartRate.totalTests')}
      showCount={true}
      columns={1}
      className={className}
      isLoading={isLoading}
    />
  )
}
