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
import { TrendingUp, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES, UI_COLORS } from '@/config/theme'
import { getChartAnimationProps } from '@/lib/utils'
import type { GlucoseDomainModel } from '../types'
import { memo, useMemo } from 'react'

interface GlucoseTrendyReportCardProps {
  data?: GlucoseDomainModel
  className?: string
  isLoading?: boolean
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

const CustomTooltip = memo(({ active, payload }: CustomTooltipProps) => {
  const { t } = useTranslation()

  if (!active || !payload || payload.length === 0) return null

  const data = payload[0]?.payload
  if (!data) return null

  return (
    <div className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
      <p className="font-medium mb-1">{t(data.weekdayKey)}</p>
      <p className="text-amber-300">
        {t('common.max')}: {data.max} {t('units.mmolL')}
      </p>
      <p className="text-amber-200">
        {t('common.min')}: {data.min} {t('units.mmolL')}
      </p>
    </div>
  )
})

/**
 * Glucose Trendy Report Card
 */
const GlucoseTrendyReportCardInner = ({ data, className, isLoading }: GlucoseTrendyReportCardProps) => {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.glucose
  const animationProps = getChartAnimationProps()

  // Placeholder data when no real data
  const placeholderChartData = useMemo(() => [
    { name: 'Mon', weekdayKey: 'weekday.mon', range: [4.5, 6.5] as [number, number], avg: 5.5, max: 6.5, min: 4.5 },
    { name: 'Tues', weekdayKey: 'weekday.tue', range: [4.8, 7.0] as [number, number], avg: 5.8, max: 7.0, min: 4.8 },
    { name: 'Wed', weekdayKey: 'weekday.wed', range: [4.6, 6.8] as [number, number], avg: 5.6, max: 6.8, min: 4.6 },
    { name: 'Thu', weekdayKey: 'weekday.thu', range: [4.4, 6.4] as [number, number], avg: 5.4, max: 6.4, min: 4.4 },
    { name: 'Fri', weekdayKey: 'weekday.fri', range: [4.7, 6.9] as [number, number], avg: 5.7, max: 6.9, min: 4.7 },
    { name: 'Sat', weekdayKey: 'weekday.sat', range: [4.5, 6.6] as [number, number], avg: 5.5, max: 6.6, min: 4.5 },
    { name: 'Sun', weekdayKey: 'weekday.sun', range: [4.6, 6.7] as [number, number], avg: 5.6, max: 6.7, min: 4.6 },
  ], [])

  // Prepare chart data with range as [min, max] tuple for Area
  const chartData = useMemo(
    () => data?.chartData?.map((point, index) => ({
      name: ['Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7],
      weekdayKey: point.weekdayKey,
      range: [point.min, point.max] as [number, number],
      avg: point.avg,
      max: point.max,
      min: point.min,
    })) ?? placeholderChartData,
    [data?.chartData, placeholderChartData]
  )

  // Get trend icon and color
  const getTrendDisplay = () => {
    if (!data) return null
    const { trend, changeValue } = data.summary
    if (changeValue === 0) return null

    const isUp = trend === 'up'
    const Icon = isUp ? ArrowUp : ArrowDown
    // For glucose, down is generally better
    const color = isUp ? '#EF4444' : '#10B981'

    return (
      <span className="flex items-center gap-0.5 text-sm" style={{ color }}>
        <Icon className="w-3 h-3" />
        {Math.abs(changeValue).toFixed(1)}
      </span>
    )
  }

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
        <TrendingUp className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.glucose.trendyReport')}
        </h3>
      </div>

      {/* Summary Box - All stats in one container */}
      <div className="rounded-xl px-5 py-4 mb-4 mx-1" style={{ backgroundColor: UI_COLORS.background.warning }}>
        {/* Top Row: Average + Normal Range */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t('page.glucose.weeksAverage')}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold" style={{ color: themeColor }}>
                {data?.summary?.avgValue?.toFixed(1) ?? '--'}
              </span>
              <span className="text-lg text-slate-500">{t('units.mmolL')}</span>
              {getTrendDisplay()}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('time.lastWeek')}: {data?.summary?.previousAvg?.toFixed(1) ?? '--'} {t('units.mmolL')}
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-white/60">
            <p>{t('page.glucose.normalRange')}: {data?.normalRange?.min ?? 3.9}-{data?.normalRange?.max ?? 6.1} {t('units.mmolL')}</p>
          </div>
        </div>

        {/* Bottom Row: Highest / Lowest */}
        <div className="flex gap-6">
          <div>
            <span className="text-xs text-slate-400">{t('common.max')}({data ? t(data.summary.maxWeekdayKey) : '--'})</span>
            <p className="text-xl font-semibold" style={{ color: themeColor }}>
              {data?.summary?.maxValue?.toFixed(1) ?? '--'} <span className="text-sm font-normal">{t('units.mmolL')}</span>
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">{t('common.min')}({data ? t(data.summary.minWeekdayKey) : '--'})</span>
            <p className="text-xl font-semibold text-slate-600">
              {data?.summary?.minValue?.toFixed(1) ?? '--'} <span className="text-sm font-normal">{t('units.mmolL')}</span>
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
          <span className="text-xs text-slate-500">{t('page.glucose.range')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5" style={{ backgroundColor: themeColor }} />
          <span className="text-xs text-slate-500">{t('page.glucose.mean')}</span>
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
              <linearGradient id="glucoseRangeGradient" x1="0" y1="0" x2="0" y2="1">
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
              domain={[data?.yAxisRange?.min ?? 3, data?.yAxisRange?.max ?? 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={data?.averageLine ?? 5.5}
              stroke={themeColor}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            {/* Range Area using [min, max] tuple */}
            <Area
              type="monotone"
              dataKey="range"
              stroke="transparent"
              fill="url(#glucoseRangeGradient)"
              name="glucose-range"
              {...animationProps}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke={themeColor}
              strokeWidth={2}
              dot={{ fill: themeColor, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: themeColor, strokeWidth: 2, fill: '#fff' }}
              name="glucose-avg"
              {...animationProps}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export const GlucoseTrendyReportCard = memo(GlucoseTrendyReportCardInner)
