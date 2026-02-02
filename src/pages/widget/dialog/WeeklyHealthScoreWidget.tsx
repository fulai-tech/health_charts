/**
 * Weekly Health Score Widget
 * 每周健康分数概览卡片：分数区 + 睡眠/运动/饮食三张指标卡
 */

import { BarChart3, Moon, Activity, Utensils } from 'lucide-react'
import {
  VITAL_COLORS,
  VITAL_COLORS_ALPHA,
  HEALTH_COLORS,
  HEALTHY_COLORS,
} from '@/config/theme'
import { clsx } from 'clsx'

// ============================================
// 类型定义
// ============================================

export interface WeeklyHealthScoreMetric {
  /** 指标类型：sleep | exercise | dietary */
  type: 'sleep' | 'exercise' | 'dietary'
  /** 显示标签 key 或文案 */
  label: string
  /** 主数值（睡眠为分钟数，运动为次数，饮食为状态文案如 "Goal"） */
  value: number | string
  /** 单位或补充文案（如 "times", "h"） */
  unit?: string
}

export interface WeeklyHealthScoreData {
  /** 每周健康分数 (0–100) */
  weeklyScore: number
  /** 满分，默认 100 */
  maxScore?: number
  /** 周序号，如 42 */
  weekNumber: number
  /** 距离目标天数，可选 */
  daysToTarget?: number
  /** 比上周高出的分数，可选 */
  pointsHigherThanLastWeek?: number
  /** 下方三张指标卡 */
  metrics: [WeeklyHealthScoreMetric, WeeklyHealthScoreMetric, WeeklyHealthScoreMetric]
}

// ============================================
// 工具
// ============================================

function formatSleepDuration(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(5999, Math.round(totalMinutes)))
  const hours = Math.floor(clamped / 60)
  const minutes = clamped % 60
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} h`
  return `${hours} h ${minutes} min`
}

function getMetricDisplay(
  type: 'sleep' | 'exercise' | 'dietary',
  value: number | string,
  unit?: string
): { main: string; suffix: string } {
  if (type === 'sleep' && typeof value === 'number') {
    return { main: formatSleepDuration(value), suffix: '' }
  }
  if (type === 'exercise' && typeof value === 'number') {
    return { main: String(value), suffix: unit ? ` ${unit}` : ' times' }
  }
  if (type === 'dietary') {
    return { main: typeof value === 'string' ? value : 'Goal', suffix: '' }
  }
  return { main: String(value), suffix: unit ? ` ${unit}` : '' }
}

function getMetricStyle(type: 'sleep' | 'exercise' | 'dietary') {
  switch (type) {
    case 'sleep':
      return { bg: VITAL_COLORS_ALPHA.sleep, iconColor: VITAL_COLORS.sleep }
    case 'exercise':
      return { bg: VITAL_COLORS_ALPHA.spo2, iconColor: VITAL_COLORS.spo2 }
    case 'dietary':
      return { bg: HEALTHY_COLORS.alpha, iconColor: HEALTHY_COLORS.primary }
    default:
      return { bg: 'rgb(248, 248, 248)', iconColor: 'rgb(31, 41, 55)' }
  }
}

// ============================================
// 子组件：单张指标卡
// ============================================

interface MetricCardProps {
  type: 'sleep' | 'exercise' | 'dietary'
  label: string
  value: number | string
  unit?: string
  valueColor?: string
}

function MetricCard({ type, label, value, unit, valueColor = HEALTH_COLORS.primary }: MetricCardProps) {
  const style = getMetricStyle(type)
  const { main, suffix } = getMetricDisplay(type, value, unit)

  const Icon = type === 'sleep' ? Moon : type === 'exercise' ? Activity : Utensils

  return (
    <div
      className="rounded-2xl p-4 flex flex-col"
      style={{ backgroundColor: style.bg }}
    >
      <div className="flex justify-center mb-2">
        <Icon className="w-6 h-6" style={{ color: style.iconColor }} />
      </div>
      <div className="text-sm font-medium text-slate-600 mb-1">{label}</div>
      <div className="text-base font-semibold text-slate-800">
        <span style={{ color: valueColor }}>{main}</span>
        {suffix && <span className="text-slate-600">{suffix}</span>}
      </div>
    </div>
  )
}

// ============================================
// 主组件
// ============================================

export interface WeeklyHealthScoreWidgetProps {
  data: WeeklyHealthScoreData
  /** 周摘要按钮文案，如 "Week 42 Summary" */
  summaryButtonLabel?: string
  onSummaryClick?: () => void
  className?: string
}

export function WeeklyHealthScoreWidget({
  data,
  summaryButtonLabel,
  onSummaryClick,
  className,
}: WeeklyHealthScoreWidgetProps) {
  const maxScore = data.maxScore ?? 100
  const summaryLabel =
    summaryButtonLabel ?? `Week ${data.weekNumber} Summary`

  return (
    <div className={clsx('w-full max-w-md', className)}>
      {/* 顶部：每周健康分 */}
      <div
        className="rounded-2xl p-4 mb-3 text-white"
        style={{ backgroundColor: HEALTH_COLORS.weeklyScoreHeader }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">Weekly health score</span>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: HEALTH_COLORS.weeklyScoreButtonBg,
              color: HEALTH_COLORS.weeklyScoreButtonText,
            }}
            onClick={onSummaryClick}
          >
            {summaryLabel}
          </button>
        </div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-4xl font-bold">{data.weeklyScore}</span>
          <span className="text-lg opacity-90">/ {maxScore}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.daysToTarget != null && (
            <span
              className="px-2.5 py-1 rounded-lg text-sm"
              style={{ backgroundColor: HEALTH_COLORS.weeklyScoreButtonBg }}
            >
              {data.daysToTarget} days to reach target
            </span>
          )}
          {data.pointsHigherThanLastWeek != null && (
            <span
              className="px-2.5 py-1 rounded-lg text-sm"
              style={{ backgroundColor: HEALTH_COLORS.weeklyScoreButtonBg }}
            >
              {data.pointsHigherThanLastWeek} points higher than last week
            </span>
          )}
        </div>
      </div>

      {/* 下方：三张指标卡 */}
      <div className="grid grid-cols-3 gap-3">
        {data.metrics.map((m) => (
          <MetricCard
            key={m.type}
            type={m.type}
            label={m.label}
            value={m.value}
            unit={m.unit}
          />
        ))}
      </div>
    </div>
  )
}
