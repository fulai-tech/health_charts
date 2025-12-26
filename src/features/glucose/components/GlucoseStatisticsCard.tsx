import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Activity, Info, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES } from '@/config/theme'
import { getChartAnimationProps } from '@/lib/utils'
import type { GlucoseDomainModel } from '../types'

interface GlucoseStatisticsCardProps {
  data?: GlucoseDomainModel
  className?: string
  isLoading?: boolean
}

// Status colors for Glucose
const STAT_COLORS: Record<string, string> = {
  normal: '#4ADE80',     // Green
  high: '#FBBF24',       // Yellow - 偏高
  too_high: '#F87171',   // Red - 过高
  too_low: '#60A5FA',    // Blue - 过低
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
 * Glucose Statistics Card
 */
export function GlucoseStatisticsCard({ data, className, isLoading }: GlucoseStatisticsCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.glucose
  const animationProps = getChartAnimationProps()

  const distribution = data?.summary?.distribution ?? []
  const totalCount = data?.summary?.totalCount ?? 0

  // Order distribution by our defined order
  const orderedDistribution = STAT_ORDER.map((type) => {
    const found = distribution.find((d) => d.type === type)
    return {
      type,
      label: t(STAT_LABELS[type] || `status.${type}`),
      count: found?.count || 0,
      percent: found?.percent || 0,
      color: STAT_COLORS[type] || '#94A3B8',
    }
  }).filter(d => d.count > 0 || d.type === 'normal') // Only show types with data or normal

  // Prepare pie chart data
  const pieData = orderedDistribution.map((d) => ({
    name: d.label,
    value: d.percent > 0 ? d.percent : 0.1,
    color: d.color,
  }))

  // Calculate normal count
  const normalCount = orderedDistribution
    .filter((d) => d.type === 'normal')
    .reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className={`${className} relative overflow-hidden`}>
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        style={{ backgroundColor: UI_STYLES.loadingOverlay }}
      >
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.glucose.statistics')}
        </h3>
        <Info className="w-4 h-4 text-slate-400" />
      </div>

      <div className="flex items-center justify-between">
        {/* Left: Stats */}
        <div className="flex-1 min-w-0">
          {/* Normal count */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold" style={{ color: themeColor }}>
                {normalCount}
              </span>
              <span className="text-base text-slate-400">/ {totalCount} {t('common.times')}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {t('page.glucose.normalResults')}
            </p>
          </div>

          {/* Distribution legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {orderedDistribution.map((item) => (
              <div key={item.type} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span
                  className="text-base font-semibold ml-[18px]"
                  style={{ color: item.color }}
                >
                  {item.count} {item.count === 1 ? t('common.time') : t('common.times')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Donut Chart */}
        <div className="w-40 h-40 relative flex-shrink-0 ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
                {...animationProps}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold" style={{ color: themeColor }}>
              {t('common.good')}
            </span>
            <span className="text-xs text-slate-400">{t('common.inAverage')}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
