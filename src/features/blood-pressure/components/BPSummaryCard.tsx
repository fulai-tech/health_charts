import { useTranslation } from 'react-i18next'
import { MetricSummaryCard } from '@/components/common/MetricSummaryCard'
import { VITAL_COLORS } from '@/config/theme'
import { useBPTrendData } from '../api'
import { Card, CardContent } from '@/components/ui/card'
import { memo, useMemo } from 'react'
import { Loader2 } from 'lucide-react'

interface BPSummaryCardProps {
  className?: string
}

const BPSummaryCardInner = ({ className }: BPSummaryCardProps) => {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useBPTrendData()

  if (isError || !data || !data.latestReading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-slate-500">{t('common.noData')}</p>
        </CardContent>
      </Card>
    )
  }

  const { summary, latestReading } = data

  const trendValue = useMemo(
    () =>
      summary.systolicChange !== 0
        ? `${summary.systolicChange > 0 ? '+' : ''}${summary.systolicChange}`
        : undefined,
    [summary.systolicChange]
  )

  const subMetrics = useMemo(
    () => [
      {
        labelKey: 'page.bloodPressure.averageReading',
        value: `${summary.avgSystolic}/${summary.avgDiastolic}`,
        unit: t('units.mmHg'),
      },
      {
        labelKey: 'status.' + summary.status,
        value: t(summary.statusKey),
      },
    ],
    [summary.avgSystolic, summary.avgDiastolic, summary.status, summary.statusKey, t]
  )

  return (
    <MetricSummaryCard
      className={className}
      titleKey="vitals.bloodPressure"
      value={`${latestReading.systolic}/${latestReading.diastolic}`}
      unit={t('units.mmHg')}
      trend={summary.systolicTrend}
      trendValue={trendValue}
      accentColor={VITAL_COLORS.bp}
      subMetrics={subMetrics}
      loadingIndicator={
        isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{t('common.loading')}</span>
          </div>
        )
      }
    />
  )
}

export const BPSummaryCard = memo(BPSummaryCardInner)
