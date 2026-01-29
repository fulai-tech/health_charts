import { useTranslation } from 'react-i18next'
import { MetricSummaryCard } from '@/components/common/MetricSummaryCard'
import { VITAL_COLORS } from '@/config/theme'
import { useHRTrendData } from '../api'
import { Card, CardContent } from '@/components/ui/card'

interface HRSummaryCardProps {
  className?: string
}

/**
 * Heart Rate Summary Card
 */
export function HRSummaryCard({ className }: HRSummaryCardProps) {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useHRTrendData()

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
      titleKey="vitals.heartRate"
      value={latestReading.value}
      unit={t('units.bpm')}
      trend={summary.trend}
      trendValue={trendValue}
      accentColor={VITAL_COLORS.heartRate}
      subMetrics={[
        {
          labelKey: 'page.heartRate.restingHR',
          value: summary.avgResting || summary.avgValue,
          unit: t('units.bpm'),
        },
        {
          labelKey: 'page.heartRate.maxHR',
          value: summary.maxValue,
          unit: t('units.bpm'),
        },
      ]}
    />
  )
}
