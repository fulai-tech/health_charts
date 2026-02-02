/**
 * 每周健康分数 Widget 页面（type-7）
 * 路由: /widget/type-7
 */

import { useState, useEffect } from 'react'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { BarChart3, Moon, Activity, Utensils } from 'lucide-react'
import {
  VITAL_COLORS,
  VITAL_COLORS_ALPHA,
  HEALTH_COLORS,
  HEALTHY_COLORS,
  widgetBGColor,
} from '@/config/theme'

interface WeeklyHealthScoreMetric {
  type: 'sleep' | 'exercise' | 'dietary'
  label: string
  value: number | string
  unit?: string
}

interface WeeklyHealthScoreData {
  weeklyScore: number
  maxScore?: number
  weekNumber: number
  daysToTarget?: number
  pointsHigherThanLastWeek?: number
  metrics: [WeeklyHealthScoreMetric, WeeklyHealthScoreMetric, WeeklyHealthScoreMetric]
}

const PAGE_CONFIG = { pageId: 'weekly-health-score', pageName: '每周健康分数卡片', type: 7 } as const

const DEFAULT_DATA: WeeklyHealthScoreData = {
  weeklyScore: 92,
  maxScore: 100,
  weekNumber: 42,
  daysToTarget: 5,
  pointsHigherThanLastWeek: 12,
  metrics: [
    { type: 'sleep', label: 'Sleep duration', value: 324, unit: 'min' },
    { type: 'exercise', label: 'Exercise', value: 3, unit: 'times' },
    { type: 'dietary', label: 'Dietary', value: 'Goal', unit: '' },
  ],
}

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
  if (type === 'sleep' && typeof value === 'number') return { main: formatSleepDuration(value), suffix: '' }
  if (type === 'exercise' && typeof value === 'number') return { main: String(value), suffix: unit ? ` ${unit}` : ' times' }
  if (type === 'dietary') return { main: typeof value === 'string' ? value : 'Goal', suffix: '' }
  return { main: String(value), suffix: unit ? ` ${unit}` : '' }
}

function getMetricStyle(type: 'sleep' | 'exercise' | 'dietary') {
  switch (type) {
    case 'sleep': return { bg: VITAL_COLORS_ALPHA.sleep, iconColor: VITAL_COLORS.sleep }
    case 'exercise': return { bg: VITAL_COLORS_ALPHA.spo2, iconColor: VITAL_COLORS.spo2 }
    case 'dietary': return { bg: HEALTHY_COLORS.alpha, iconColor: HEALTHY_COLORS.primary }
    default: return { bg: 'rgb(248, 248, 248)', iconColor: 'rgb(31, 41, 55)' }
  }
}

function parseWeeklyHealthScoreData(raw: unknown): WeeklyHealthScoreData | null {
  let data = raw
  if (typeof raw === 'string') {
    try { data = JSON.parse(raw) } catch { return null }
  }
  const obj = data as Record<string, unknown>
  const card = (obj.weekly_health_score_card ?? obj) as Record<string, unknown>
  if (typeof card.weeklyScore !== 'number' || typeof card.weekNumber !== 'number' || !Array.isArray(card.metrics) || card.metrics.length < 3) return null
  const m0 = card.metrics[0] as Record<string, unknown>
  const m1 = card.metrics[1] as Record<string, unknown>
  const m2 = card.metrics[2] as Record<string, unknown>
  return {
    weeklyScore: card.weeklyScore as number,
    maxScore: (card.maxScore as number) ?? 100,
    weekNumber: card.weekNumber as number,
    daysToTarget: card.daysToTarget as number | undefined,
    pointsHigherThanLastWeek: card.pointsHigherThanLastWeek as number | undefined,
    metrics: [
      { type: 'sleep', label: (m0.label as string) ?? 'Sleep duration', value: (m0.value as number) ?? 0, unit: (m0.unit as string) ?? 'min' },
      { type: 'exercise', label: (m1.label as string) ?? 'Exercise', value: (m1.value as number) ?? 0, unit: (m1.unit as string) ?? 'times' },
      { type: 'dietary', label: (m2.label as string) ?? 'Dietary', value: (m2.value as string | number) ?? 'Goal', unit: (m2.unit as string) ?? '' },
    ],
  }
}

function MetricCard({
  type,
  label,
  value,
  unit,
  valueColor = HEALTH_COLORS.primary,
}: {
  type: 'sleep' | 'exercise' | 'dietary'
  label: string
  value: number | string
  unit?: string
  valueColor?: string
}) {
  const style = getMetricStyle(type)
  const { main, suffix } = getMetricDisplay(type, value, unit)
  const Icon = type === 'sleep' ? Moon : type === 'exercise' ? Activity : Utensils
  return (
    <div className="rounded-2xl p-4 flex flex-col" style={{ backgroundColor: style.bg }}>
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

export function Type7_WeeklyHealthScoreWidgetPage() {
  const [data, setData] = useState<WeeklyHealthScoreData>(DEFAULT_DATA)
  const { onData, send, isReady } = useNativeBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
  })

  useEffect(() => {
    onData((rawData) => {
      const parsed = parseWeeklyHealthScoreData(rawData)
      if (parsed) setData(parsed)
    })
  }, [onData])

  const maxScore = data.maxScore ?? 100

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <div className="w-full max-w-md p-4">
        <div className="rounded-2xl p-4 mb-3 text-white" style={{ backgroundColor: HEALTH_COLORS.weeklyScoreHeader }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Weekly health score</span>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: HEALTH_COLORS.weeklyScoreButtonBg, color: HEALTH_COLORS.weeklyScoreButtonText }}
              onClick={() => send('summaryClick', { pageId: PAGE_CONFIG.pageId, weekNumber: data.weekNumber })}
            >
              Week {data.weekNumber} Summary
            </button>
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-4xl font-bold">{data.weeklyScore}</span>
            <span className="text-lg opacity-90">/ {maxScore}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.daysToTarget != null && (
              <span className="px-2.5 py-1 rounded-lg text-sm" style={{ backgroundColor: HEALTH_COLORS.weeklyScoreButtonBg }}>
                {data.daysToTarget} days to reach target
              </span>
            )}
            {data.pointsHigherThanLastWeek != null && (
              <span className="px-2.5 py-1 rounded-lg text-sm" style={{ backgroundColor: HEALTH_COLORS.weeklyScoreButtonBg }}>
                {data.pointsHigherThanLastWeek} points higher than last week
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {data.metrics.map((m) => (
            <MetricCard key={m.type} type={m.type} label={m.label} value={m.value} unit={m.unit} />
          ))}
        </div>
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">NativeBridge Ready: {isReady ? '✅' : '⏳'}</div>
        )}
      </div>
    </WidgetLayout>
  )
}
