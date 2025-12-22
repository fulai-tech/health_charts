import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Info, Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { BPDomainModel } from '../types'

interface BPStatisticsCardProps {
  data: BPDomainModel
  className?: string
}

// Fixed colors: Blue=Normal, Green=Normal High, Red=Too Low, Yellow=Too High
const STAT_COLORS = {
  normal: '#91C6FF',
  high_normal: '#B3EFB2',
  low_bp: '#FF9393',
  high_bp: '#FFD024',
}

const STAT_LABELS: Record<string, string> = {
  normal: 'status.normal',
  high_normal: 'status.normalHighValue',
  low_bp: 'status.tooLow',
  high_bp: 'status.tooHigh',
}

const STAT_ORDER = ['normal', 'high_normal', 'low_bp', 'high_bp']

/**
 * BP Statistics Card
 */
export function BPStatisticsCard({ data, className }: BPStatisticsCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.bp

  const { distribution, totalCount } = data.summary

  const orderedDistribution = STAT_ORDER.map((type) => {
    const found = distribution.find((d) => d.type === type)
    return {
      type,
      label: t(STAT_LABELS[type]),
      count: found?.count || 0,
      percent: found?.percent || 0,
      color: STAT_COLORS[type as keyof typeof STAT_COLORS],
    }
  })

  const normalCount = orderedDistribution
    .filter((d) => d.type === 'normal' || d.type === 'high_normal')
    .reduce((sum, d) => sum + d.count, 0)

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
          {t('page.bloodPressure.bpStatistics')}
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
              {t('page.bloodPressure.normalResults')}
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
