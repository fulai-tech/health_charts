/**
 * SBP & Sleep Duration Trend Chart Widget
 * 双折线图：收缩压(SBP) 与 睡眠时长(Sleep duration) 一周趋势
 * 复用 @/components/charts/TrendLineChart
 */

import { useMemo } from 'react'
import { TrendLineChart, type ChartLine } from '@/components/charts/TrendLineChart'
import { BP_COLORS, VITAL_COLORS } from '@/config/theme'
import { clsx } from 'clsx'

// ============================================
// 类型定义
// ============================================

export interface SbpSleepTrendDataPoint {
  /** X 轴：星期几，如 "Mon", "Tue", ... "Sun" */
  day: string
  /** 收缩压 (mmHg) */
  sbp: number
  /** 睡眠时长（小时，如 5.4 表示 5h24min） */
  sleepDuration: number
}

export interface SbpSleepTrendChartData {
  /** 图表数据点，按 Mon-Sun 顺序 */
  data: SbpSleepTrendDataPoint[]
  /** 可选：SBP 图例文案，默认 "SBP" */
  sbpLabel?: string
  /** 可选：Sleep duration 图例文案，默认 "Sleep duration" */
  sleepDurationLabel?: string
  /** 可选：SBP 线条颜色 */
  sbpColor?: string
  /** 可选：Sleep duration 线条颜色 */
  sleepDurationColor?: string
}

// ============================================
// 默认配置
// ============================================

const DEFAULT_SBP_LABEL = 'SBP'
const DEFAULT_SLEEP_LABEL = 'Sleep duration'

// ============================================
// 主组件
// ============================================

export interface SbpSleepTrendChartWidgetProps {
  data: SbpSleepTrendChartData
  /** 图表高度 */
  height?: number | string
  /** 是否显示图例 */
  showLegend?: boolean
  /** 是否显示面积填充 */
  showArea?: boolean
  className?: string
}

export function SbpSleepTrendChartWidget({
  data,
  height = 224,
  showLegend = true,
  showArea = false,
  className,
}: SbpSleepTrendChartWidgetProps) {
  const sbpColor = data.sbpColor ?? BP_COLORS.systolic
  const sleepColor = data.sleepDurationColor ?? VITAL_COLORS.sleep
  const sbpLabel = data.sbpLabel ?? DEFAULT_SBP_LABEL
  const sleepLabel = data.sleepDurationLabel ?? DEFAULT_SLEEP_LABEL

  const lines: ChartLine[] = useMemo(
    () => [
      {
        dataKey: 'sbp',
        color: sbpColor,
        label: sbpLabel,
        showArea: showArea,
        legendShape: 'circle',
        strokeWidth: 2,
      },
      {
        dataKey: 'sleepDuration',
        color: sleepColor,
        label: sleepLabel,
        showArea: showArea,
        legendShape: 'circle',
        strokeWidth: 2,
      },
    ],
    [sbpColor, sleepColor, sbpLabel, sleepLabel, showArea]
  )

  const chartData = useMemo(
    () =>
      data.data.map((d) => ({
        day: d.day,
        sbp: d.sbp,
        sleepDuration: d.sleepDuration,
      })),
    [data.data]
  )

  if (!chartData.length) return null

  return (
    <div className={clsx('w-full max-w-md', className)}>
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <TrendLineChart
          data={chartData}
          lines={lines}
          xAxisKey="day"
          height={height}
          showLegend={showLegend}
          chartMargin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        />
      </div>
    </div>
  )
}
