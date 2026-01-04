import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  type TooltipProps,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { cn, getChartAnimationProps } from '@/lib/utils'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { useHideTooltipOnScroll } from '@/hooks/useHideTooltipOnScroll'
import { useMemo, memo } from 'react'

export type ChartType = 'line' | 'area' | 'range' | 'mixed'

export interface ChartDataPoint {
  /** Formatted date string for display */
  dateLabel: string
  /** Primary value (for line/area charts) */
  value?: number
  /** For range charts - high value (e.g., systolic) */
  high?: number
  /** For range charts - low value (e.g., diastolic) */
  low?: number
  /** For mixed charts - average value (rendered as line) */
  avg?: number
  /** For mixed charts - min value of range */
  min?: number
  /** For mixed charts - max value of range */
  max?: number
  /** Range array [min, max] for error bar style rendering */
  range?: [number, number]
  /** Original date for tooltip */
  date?: Date
}

export interface VitalTrendChartProps {
  data: ChartDataPoint[]
  type?: ChartType
  color: string
  /** Secondary color for range charts */
  secondaryColor?: string
  height?: number
  className?: string
  /** Show grid lines */
  showGrid?: boolean
  /** Animation duration in ms */
  animationDuration?: number
  /** Y-axis domain padding */
  domainPadding?: number
  /** Custom Y-axis domain */
  yDomain?: [number | string, number | string]
}

interface CustomTooltipPayloadItem {
  name: string
  value: number
  color: string
  dataKey: string
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean
  payload?: CustomTooltipPayloadItem[]
  label?: string
}

const CustomTooltip = memo(({ active, payload, label }: CustomTooltipProps) => {
  const { t } = useTranslation()

  if (!active || !payload || payload.length === 0) {
    return null
  }

  const filteredPayload = payload.filter(
    (item) => item.dataKey !== 'range' && item.value !== undefined
  )

  const getDisplayName = (name: string): string => {
    const nameMap: Record<string, string> = {
      high: t('vitals.systolic'),
      low: t('vitals.diastolic'),
      avg: t('common.average', 'Avg'),
      max: t('common.max', 'Max'),
      min: t('common.min', 'Min'),
      value: t('common.value', 'Value'),
    }
    return nameMap[name] || name
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-slate-100">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {filteredPayload.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm font-medium text-slate-800">
            {getDisplayName(item.name)}: {item.value}
          </span>
        </div>
      ))}
    </div>
  )
})

/**
 * VitalTrendChart - Recharts wrapper for health vital visualization
 * Supports line, area, range (dual line), and mixed (range bar + line) chart types
 */
export function VitalTrendChart({
  data,
  type = 'line',
  color,
  secondaryColor,
  height = 200,
  className,
  showGrid = true,
  animationDuration = 300,
  domainPadding = 5,
  yDomain,
}: VitalTrendChartProps) {

  const commonProps = useMemo(
    () => ({
      data,
      margin: { top: 10, right: 10, left: -20, bottom: 0 },
    }),
    [data]
  )

  const axisProps = useMemo(
    () => ({
      tick: { fontSize: 11, fill: '#94a3b8' },
      tickLine: false,
      axisLine: false,
    }),
    []
  )

  const animationProps = useChartAnimation();
  const chartContainerRef = useHideTooltipOnScroll<HTMLDivElement>()

  const getYDomain = useMemo(() => {
    return (): [number | string, number | string] => {
      if (yDomain) return yDomain
      return [`dataMin - ${domainPadding}`, `dataMax + ${domainPadding}`]
    }
  }, [yDomain, domainPadding])

  const renderChart = () => {
    if (type === 'mixed') {
      const transformedData = useMemo(() => data.map((point) => ({
        ...point,
        rangeBase: point.min ?? point.range?.[0] ?? 0,
        rangeHeight:
          (point.max ?? point.range?.[1] ?? 0) -
          (point.min ?? point.range?.[0] ?? 0),
      })), [data])

      return (
        <ComposedChart {...commonProps} data={transformedData}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
          )}
          <XAxis dataKey="dateLabel" {...axisProps} />
          <YAxis {...axisProps} domain={getYDomain()} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="rangeBase"
            stackId="range"
            fill="transparent"
            {...animationProps}
          />
          <Bar
            dataKey="rangeHeight"
            stackId="range"
            fill={`${color}40`}
            radius={[4, 4, 4, 4]}
            {...animationProps}
          >
            {transformedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={`${color}40`} />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="avg"
            stroke={color}
            strokeWidth={2.5}
            dot={{ fill: color, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#fff' }}
            {...animationProps}
          />
        </ComposedChart>
      )
    }

    if (type === 'area') {
      return (
        <AreaChart {...commonProps}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
          )}
          <XAxis dataKey="dateLabel" {...axisProps} />
          <YAxis {...axisProps} domain={getYDomain()} />
          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
            {...animationProps}
          />
        </AreaChart>
      )
    }

    if (type === 'range') {
      return (
        <LineChart {...commonProps}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
          )}
          <XAxis dataKey="dateLabel" {...axisProps} />
          <YAxis {...axisProps} domain={getYDomain()} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="high"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, stroke: color, strokeWidth: 2, fill: '#fff' }}
            {...animationProps}
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke={secondaryColor || color}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: secondaryColor || color, strokeWidth: 0, r: 3 }}
            activeDot={{
              r: 5,
              stroke: secondaryColor || color,
              strokeWidth: 2,
              fill: '#fff',
            }}
            {...animationProps}
          />
        </LineChart>
      )
    }

    return (
      <LineChart {...commonProps}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
        )}
        <XAxis dataKey="dateLabel" {...axisProps} />
        <YAxis {...axisProps} domain={getYDomain()} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, stroke: color, strokeWidth: 2, fill: '#fff' }}
          {...animationProps}
        />
      </LineChart>
    )
  }

  return (
    <div ref={chartContainerRef} className={cn('w-full transform-gpu will-change-transform', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}
