import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { UI_COLORS } from '@/config/theme'

export type TrendDirection = 'up' | 'down' | 'stable'

export interface SubMetric {
  labelKey: string
  value: number | string
  unit?: string
}

export interface MetricSummaryCardProps {
  /** Translation key for the title */
  titleKey: string
  /** Main value to display */
  value: number | string
  /** Unit of the value */
  unit: string
  /** Trend direction */
  trend?: TrendDirection
  /** Optional trend value (e.g., "+5%") */
  trendValue?: string
  /** Sub-metrics to display below the main value */
  subMetrics?: SubMetric[]
  /** Accent color for the card */
  accentColor?: string
  className?: string
}

/**
 * MetricSummaryCard - Displays a health metric with trend and sub-metrics
 * Used for blood pressure, blood oxygen, glucose summaries
 */
export function MetricSummaryCard({
  titleKey,
  value,
  unit,
  trend = 'stable',
  trendValue,
  subMetrics = [],
  accentColor,
  className,
}: MetricSummaryCardProps) {
  const { t } = useTranslation()

  // Safely get trend icon with fallback
  const trendIconMap = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  }
  const TrendIcon = trendIconMap[trend] || Minus

  const trendColorMap = {
    up: UI_COLORS.trend.up,
    down: UI_COLORS.trend.down,
    stable: UI_COLORS.trend.stable,
  }
  const trendColor = trendColorMap[trend] || UI_COLORS.trend.stable

  return (
    <Card
      className={cn('relative overflow-hidden', className)}
      style={{
        borderLeftWidth: accentColor ? '4px' : undefined,
        borderLeftColor: accentColor,
      }}
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600">
          {t(titleKey)}
        </span>
        {/* Trend Badge */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${trendColor}15`,
            color: trendColor,
          }}
        >
          <TrendIcon className="w-3 h-3" />
          {trendValue && <span>{trendValue}</span>}
        </div>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold text-slate-900">{value}</span>
        <span className="text-lg text-slate-500">{unit}</span>
      </div>

      {/* Sub Metrics */}
      {subMetrics.length > 0 && (
        <div className="flex gap-4 pt-3 border-t border-slate-100">
          {subMetrics.map((metric, index) => (
            <div key={index} className="flex-1">
              <div className="text-xs text-slate-500 mb-0.5">
                {t(metric.labelKey)}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold text-slate-800">
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-xs text-slate-400">{metric.unit}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
