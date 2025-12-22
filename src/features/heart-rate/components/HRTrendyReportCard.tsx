import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
} from 'recharts'
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { HRDomainModel } from '../types'

interface HRTrendyReportCardProps {
  data: HRDomainModel
  className?: string
}

/**
 * Custom Tooltip component
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number | [number, number]
    payload: {
      name: string
      weekdayKey: string
      max: number
      min: number
      avg: number
    }
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  const { t } = useTranslation()

  if (!active || !payload || payload.length === 0) return null

  const data = payload[0]?.payload
  if (!data) return null

  return (
    <div className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
      <p className="font-medium mb-1">{t(data.weekdayKey)}</p>
      <p className="text-red-300">
        {t('common.average')}: {data.avg}
      </p>
      <p className="text-red-200">
        {t('common.max')}: {data.max}
      </p>
      <p className="text-red-100">
        {t('common.min')}: {data.min}
      </p>
    </div>
  )
}

/**
 * HR Trendy Report Card
 */
export function HRTrendyReportCard({ data, className }: HRTrendyReportCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.heartRate

  // Prepare chart data with range as [min, max] tuple for Area
  const chartData = data.chartData.map((point, index) => ({
    name: ['Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7],
    weekdayKey: point.weekdayKey,
    range: [point.min, point.max] as [number, number],
    avg: point.avg,
    max: point.max,
    min: point.min,
  }))

  // Get trend icon and color
  const getTrendDisplay = () => {
    const { trend, changeValue } = data.summary
    if (changeValue === 0) return null

    const isUp = trend === 'up'
    const Icon = isUp ? ArrowUp : ArrowDown
    const color = isUp ? '#EF4444' : '#10B981'

    return (
      <span className="flex items-center gap-0.5 text-sm" style={{ color }}>
        <Icon className="w-3 h-3" />
        {Math.abs(changeValue)}
      </span>
    )
  }

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.heartRate.trendyReport')}
        </h3>
      </div>

      {/* Summary Box - All stats in one container */}
      <div className="rounded-xl px-5 py-4 mb-4 mx-1" style={{ backgroundColor: '#FFF5F5' }}>
        {/* Top Row: Average + Last Week */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t('page.heartRate.weeksAverage')}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold" style={{ color: themeColor }}>
                {data.summary.avgValue}
              </span>
              <span className="text-lg text-slate-500">/{t('units.minute')}</span>
              {getTrendDisplay()}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('time.lastWeek')}: {data.summary.previousAvg}/{t('units.minute')}
            </p>
          </div>
        </div>

        {/* Bottom Row: Highest / Lowest */}
        <div className="flex gap-6">
          <div>
            <span className="text-xs text-slate-400">{t('common.max')}({t(data.summary.maxWeekdayKey)})</span>
            <p className="text-xl font-semibold" style={{ color: themeColor }}>
              {data.summary.maxValue} <span className="text-sm font-normal">/{t('units.minute')}</span>
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">{t('common.min')}({t(data.summary.minWeekdayKey)})</span>
            <p className="text-xl font-semibold text-slate-600">
              {data.summary.minValue} <span className="text-sm font-normal">/{t('units.minute')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: `${themeColor}40` }}
          />
          <span className="text-xs text-slate-500">{t('page.heartRate.range')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5" style={{ backgroundColor: themeColor }} />
          <span className="text-xs text-slate-500">{t('page.heartRate.mean')}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="hrRangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={themeColor} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              domain={[data.yAxisRange.min, data.yAxisRange.max]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={data.averageLine}
              stroke={themeColor}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            {/* Range Area using [min, max] tuple */}
            <Area
              type="monotone"
              dataKey="range"
              stroke="transparent"
              fill="url(#hrRangeGradient)"
              name="hr-range"
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke={themeColor}
              strokeWidth={2}
              dot={{ fill: themeColor, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: themeColor, strokeWidth: 2, fill: '#fff' }}
              name="hr-avg"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
