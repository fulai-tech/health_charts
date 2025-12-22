import { useTranslation } from 'react-i18next'
import { MetricSummaryCard } from '@/components/business/MetricSummaryCard'
import { VITAL_COLORS } from '@/config/theme'
import { useBPTrendData } from '../api'
import { Card, CardContent } from '@/components/ui/card'

interface BPSummaryCardProps {
  className?: string
}

/**
 * Blood Pressure Summary Card
 * Displays the latest BP reading with trend and sub-metrics
 */
export function BPSummaryCard({ className }: BPSummaryCardProps) {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useBPTrendData()

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <div className="animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-1/4 mb-3" />
            <div className="h-10 bg-slate-200 rounded w-1/2 mb-4" />
            <div className="flex gap-4 pt-3 border-t border-slate-100">
              <div className="flex-1">
                <div className="h-2 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
              </div>
              <div className="flex-1">
                <div className="h-2 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
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
  const trendValue = summary.systolicChange !== 0 
    ? `${summary.systolicChange > 0 ? '+' : ''}${summary.systolicChange}`
    : undefined

  return (
    <MetricSummaryCard
      className={className}
      titleKey="vitals.bloodPressure"
      value={`${latestReading.systolic}/${latestReading.diastolic}`}
      unit={t('units.mmHg')}
      trend={summary.systolicTrend}
      trendValue={trendValue}
      accentColor={VITAL_COLORS.bp}
      subMetrics={[
        {
          labelKey: 'page.bloodPressure.averageReading',
          value: `${summary.avgSystolic}/${summary.avgDiastolic}`,
          unit: t('units.mmHg'),
        },
        {
          labelKey: 'status.' + summary.status,
          value: t(summary.statusKey),
        },
      ]}
    />
  )
}
