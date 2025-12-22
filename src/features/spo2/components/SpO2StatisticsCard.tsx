import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Activity, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { SpO2DomainModel } from '../types'

interface SpO2StatisticsCardProps {
  data: SpO2DomainModel
  className?: string
}

// Status colors for SpO2
const STAT_COLORS: Record<string, string> = {
  normal: '#4ADE80',    // Green
  low: '#60A5FA',       // Blue
  too_low: '#F87171',   // Red
}

// Status order for display
const STAT_ORDER = ['normal', 'low', 'too_low']

// Status label keys
const STAT_LABELS: Record<string, string> = {
  normal: 'status.normal',
  low: 'status.low',
  too_low: 'status.tooLow',
}

/**
 * SpO2 Statistics Card
 */
export function SpO2StatisticsCard({ data, className }: SpO2StatisticsCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.spo2

  const { distribution, totalCount } = data.summary

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
  })

  // Prepare pie chart data
  const pieData = orderedDistribution.map((d) => ({
    name: d.label,
    value: d.percent > 0 ? d.percent : 0.1,
    color: d.color,
  }))

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.spo2.statistics')}
        </h3>
        <Info className="w-4 h-4 text-slate-400" />
      </div>

      <div className="flex items-center justify-between">
        {/* Left: Stats Legend */}
        <div className="flex-1 min-w-0 space-y-3">
          {orderedDistribution.map((item) => (
            <div key={item.type} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600 w-16">{item.label}</span>
              <span
                className="text-sm font-semibold w-12"
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
            <span className="text-xs text-slate-400">{t('common.times')}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

