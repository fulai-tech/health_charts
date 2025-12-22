import { useTranslation } from 'react-i18next'
import { VitalTrendChart } from '@/components/charts/VitalTrendChart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CHART_COLORS } from '@/config/theme'
import { useBPTrendData } from '../api'
import { cn } from '@/lib/utils'

interface BPTrendWidgetProps {
  /** Show card wrapper (true for standalone, false for embedding) */
  showCard?: boolean
  /** Chart height */
  height?: number
  className?: string
}

/**
 * Blood Pressure Trend Widget
 * Displays a trend chart with systolic/diastolic values
 * Can be used standalone or embedded in larger components
 */
export function BPTrendWidget({
  showCard = true,
  height = 200,
  className,
}: BPTrendWidgetProps) {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useBPTrendData()

  // Loading skeleton
  if (isLoading) {
    return (
      <SkeletonWrapper showCard={showCard} className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-3 bg-slate-200 rounded"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        </div>
      </SkeletonWrapper>
    )
  }

  // Error state
  if (isError || !data) {
    return (
      <SkeletonWrapper showCard={showCard} className={className}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-slate-500 mb-3">{t('common.error')}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium text-white bg-bp rounded-lg hover:opacity-90 transition-opacity"
          >
            {t('common.retry')}
          </button>
        </div>
      </SkeletonWrapper>
    )
  }

  // Transform data for range chart
  const chartData = data.chartData.map((point) => ({
    dateLabel: point.dateLabel,
    high: point.systolic,
    low: point.diastolic,
    date: point.date,
  }))

  const chartContent = (
    <>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-0.5 rounded"
            style={{ backgroundColor: CHART_COLORS.bp.primary }}
          />
          <span className="text-xs text-slate-500">{t('vitals.systolic')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-0.5 rounded border-dashed"
            style={{
              borderBottomWidth: 2,
              borderColor: CHART_COLORS.bp.secondary,
            }}
          />
          <span className="text-xs text-slate-500">{t('vitals.diastolic')}</span>
        </div>
      </div>

      {/* Chart */}
      <VitalTrendChart
        data={chartData}
        type="range"
        color={CHART_COLORS.bp.primary}
        secondaryColor={CHART_COLORS.bp.secondary}
        height={height}
        yDomain={[data.yAxisRange.min, data.yAxisRange.max]}
      />
    </>
  )

  if (!showCard) {
    return <div className={className}>{chartContent}</div>
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('page.bloodPressure.trendTitle')}</CardTitle>
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  )
}

// Helper component for consistent wrapper
function SkeletonWrapper({
  showCard,
  className,
  children,
}: {
  showCard: boolean
  className?: string
  children: React.ReactNode
}) {
  if (!showCard) {
    return <div className={cn('p-4', className)}>{children}</div>
  }

  return (
    <Card className={className}>
      <CardContent className="py-4">{children}</CardContent>
    </Card>
  )
}
