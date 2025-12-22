import { useTranslation } from 'react-i18next'
import { MetricSummaryCard } from '@/components/business/MetricSummaryCard'
import { VITAL_COLORS } from '@/config/theme'
import { useGlucoseTrendData } from '../api'
import { Card, CardContent } from '@/components/ui/card'

interface GlucoseSummaryCardProps {
  className?: string
}

/**
 * Glucose Summary Card
 */
export function GlucoseSummaryCard({ className }: GlucoseSummaryCardProps) {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGlucoseTrendData()

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
  const trendValue = summary.changeValue !== 0 
    ? `${summary.changeValue > 0 ? '+' : ''}${summary.changeValue}`
    : undefined

  return (
    <MetricSummaryCard
      className={className}
      titleKey="vitals.glucose"
      value={latestReading.value}
      unit={t('units.mmolL')}
      trend={summary.trend}
      trendValue={trendValue}
      accentColor={VITAL_COLORS.glucose}
      subMetrics={[
        {
          labelKey: 'page.glucose.averageReading',
          value: summary.avgValue,
          unit: t('units.mmolL'),
        },
        {
          labelKey: 'status.' + summary.status,
          value: t(summary.statusKey),
        },
      ]}
    />
  )
}
