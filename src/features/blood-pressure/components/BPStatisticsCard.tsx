import { useTranslation } from 'react-i18next'
import { Activity } from 'lucide-react'
import { DistributionCard, type DistributionItem } from '@/components/common/DistributionCard'
import { VITAL_COLORS, STATUS_COLORS } from '@/config/theme'
import type { BPDomainModel } from '../types'
import { useMemo, memo } from 'react'

interface BPStatisticsCardProps {
  data?: BPDomainModel
  className?: string
  isLoading?: boolean
}

const STAT_LABELS: Record<string, string> = {
  normal: 'status.normal',
  high_normal: 'status.normalHighValue',
  low_bp: 'status.tooLow',
  high_bp: 'status.tooHigh',
}

const STAT_ORDER = ['normal', 'high_normal', 'low_bp', 'high_bp']

/**
 * BP Statistics Card - Uses common DistributionCard with highlight mode
 */
const BPStatisticsCardInner = ({ data, className, isLoading }: BPStatisticsCardProps) => {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.bp

  const distribution = data?.summary?.distribution ?? []
  const totalCount = data?.summary?.totalCount ?? 0

  const items: DistributionItem[] = useMemo(
    () => STAT_ORDER.map((type) => {
      const found = distribution.find((d) => d.type === type)
      return {
        type,
        label: t(STAT_LABELS[type]),
        count: found?.count || 0,
        percent: found?.percent || 0,
        color: STATUS_COLORS.bp[type as keyof typeof STATUS_COLORS.bp] || '#94A3B8',
      }
    }),
    [distribution, t]
  )

  const normalCount = useMemo(
    () =>
      items
        .filter((d) => d.type === 'normal' || d.type === 'high_normal')
        .reduce((sum, d) => sum + (d.count || 0), 0),
    [items]
  )

  return (
    <DistributionCard
      title={t('page.bloodPressure.bpStatistics')}
      icon={Activity}
      themeColor={themeColor}
      items={items}
      centerValue={t('common.good')}
      centerLabel={t('common.inAverage')}
      highlightValue={normalCount}
      highlightLabel={`/ ${totalCount} ${t('common.times')}`}
      highlightDescription={t('page.bloodPressure.normalResults')}
      gridColumns={2}
      className={className}
      isLoading={isLoading}
    />
  )
}

export const BPStatisticsCard = memo(BPStatisticsCardInner)
