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
import type { HRDomainModel } from '../types'
import { memo, useMemo } from 'react'

interface HRTrendyReportCardProps {
  data?: HRDomainModel
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
})

/**
 * HR Trendy Report Card
 */
const HRTrendyReportCardInner = ({ data, className, isLoading }: HRTrendyReportCardProps) => {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.heartRate
  const animationProps = getChartAnimationProps()

  // Placeholder data when no real data
  const placeholderChartData = useMemo(() => [
    { name: 'Mon', weekdayKey: 'weekday.mon', range: [60, 85] as [number, number], avg: 72, max: 85, min: 60 },
    { name: 'Tues', weekdayKey: 'weekday.tue', range: [62, 88] as [number, number], avg: 75, max: 88, min: 62 },
    { name: 'Wed', weekdayKey: 'weekday.wed', range: [58, 82] as [number, number], avg: 70, max: 82, min: 58 },
    { name: 'Thu', weekdayKey: 'weekday.thu', range: [65, 90] as [number, number], avg: 78, max: 90, min: 65 },
    { name: 'Fri', weekdayKey: 'weekday.fri', range: [60, 84] as [number, number], avg: 72, max: 84, min: 60 },
    { name: 'Sat', weekdayKey: 'weekday.sat', range: [55, 80] as [number, number], avg: 68, max: 80, min: 55 },
    { name: 'Sun', weekdayKey: 'weekday.sun', range: [58, 83] as [number, number], avg: 70, max: 83, min: 58 },
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
    const color = isUp ? UI_COLORS.trend.up : UI_COLORS.trend.down

    return (
      <span className="flex items-center gap-0.5 text-sm" style={{ color }}>
        <Icon className="w-3 h-3" />
        {Math.abs(changeValue)}
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
          {t('page.heartRate.trendyReport')}
        </h3>
      </div>

      {/* Summary Box - All stats in one container */}
      <div className="rounded-xl px-5 py-4 mb-4 mx-1" style={{ backgroundColor: UI_COLORS.background.summaryBox }}>
        {/* Top Row: Average + Last Week */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t('page.heartRate.weeksAverage')}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold" style={{ color: themeColor }}>
                {data?.summary?.avgValue ?? '--'}
              </span>
              <span className="text-lg text-slate-500">/{t('units.minute')}</span>
              {getTrendDisplay()}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('time.lastWeek')}: {data?.summary?.previousAvg ?? '--'}/{t('units.minute')}
            </p>
          </div>
        </div>

        {/* Bottom Row: Highest / Lowest */}
        <div className="flex gap-6">
          <div>
            <span className="text-xs text-slate-400">{t('common.max')}({data ? t(data.summary.maxWeekdayKey) : '--'})</span>
            <p className="text-xl font-semibold" style={{ color: themeColor }}>
              {data?.summary?.maxValue ?? '--'} <span className="text-sm font-normal">/{t('units.minute')}</span>
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">{t('common.min')}({data ? t(data.summary.minWeekdayKey) : '--'})</span>
            <p className="text-xl font-semibold text-slate-600">
              {data?.summary?.minValue ?? '--'} <span className="text-sm font-normal">/{t('units.minute')}</span>
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
              domain={[data?.yAxisRange?.min ?? 50, data?.yAxisRange?.max ?? 120]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={data?.averageLine ?? 72}
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
              {...animationProps}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke={themeColor}
              strokeWidth={2}
              dot={{ fill: themeColor, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: themeColor, strokeWidth: 2, fill: '#fff' }}
              name="hr-avg"
              {...animationProps}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export const HRTrendyReportCard = memo(HRTrendyReportCardInner)
