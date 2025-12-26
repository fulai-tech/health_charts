import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Activity, Info, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES, STATUS_COLORS } from '@/config/theme'
import { getChartAnimationProps } from '@/lib/utils'
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
 * HR Statistics Card
 */
export function HRStatisticsCard({ data, className, isLoading }: HRStatisticsCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.heartRate
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
      color: STATUS_COLORS.heartRate[type as keyof typeof STATUS_COLORS.heartRate] || '#94A3B8',
    }
  })

  // Prepare pie chart data - only include items with data
  const pieData = orderedDistribution
    .filter(d => d.count > 0 || d.type === 'normal')
    .map((d) => ({
      name: d.label,
      value: d.percent > 0 ? d.percent : 0.1,
      color: d.color,
    }))

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
          {t('page.heartRate.statistics')}
        </h3>
        <Info className="w-4 h-4 text-slate-400" />
      </div>

      <div className="flex items-center justify-between">
        {/* Left: Stats Legend */}
        <div className="flex-1 min-w-0 space-y-2">
          {orderedDistribution.map((item) => (
            <div key={item.type} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600 w-12">{item.label}</span>
              <span
                className="text-sm font-semibold w-10"
                style={{ color: item.color }}
              >
                {item.percent}%
              </span>
              <span className="text-sm" style={{ color: item.color }}>
                {item.count} {t('common.times')}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Donut Chart */}
        <div className="w-32 h-32 relative flex-shrink-0 ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={58}
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
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: themeColor }}>
              {totalCount}
            </span>
            <span className="text-xs text-slate-400">{t('page.heartRate.totalTests')}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
