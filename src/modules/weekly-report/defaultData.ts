/**
 * 周报缺省数据 - 用于首屏占位，无骨架屏
 * 加载中时用此数据渲染同一 DOM 结构，数据返回后无缝替换
 */

import type { WeeklyReportDataAPI } from './types'

const PLACEHOLDER = '—'
const EMPTY_TREND_LABELS = ['一', '二', '三', '四', '五', '六', '日']

/** 格式化为中文日期显示：M月D日 */
function formatDisplayDate(d: Date): string {
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${m}月${day}日`
}

function buildDefaultWeekRange() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - 6)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  // 周数：当月第几周（1 日起为第 1 周，8 日起第 2 周…）
  const weekNumber = Math.ceil(now.getDate() / 7) || 1
  return {
    start_date: iso(start),
    end_date: iso(now),
    display_range: `${formatDisplayDate(start)} - ${formatDisplayDate(now)}`,
    week_number: weekNumber,
    title: PLACEHOLDER,
  }
}

export function getDefaultWeeklyReportData(): WeeklyReportDataAPI {
  const week_range = buildDefaultWeekRange()
  const trendChartItem = (label: string) => ({ date: '', label, value: null as number | null })
  const bpTrendItem = (label: string) => ({
    date: '',
    label,
    value: { systolic: 0, diastolic: 0 },
  })
  const trendChart = EMPTY_TREND_LABELS.map((l, _i) => trendChartItem(l))
  const bpTrendChart = EMPTY_TREND_LABELS.map((l) => bpTrendItem(l))

  return {
    report_exists: true,
    week_range,
    generated_at: '',
    overall: {
      score: 0,
      status: { level: 'B', label: PLACEHOLDER },
      evaluate: PLACEHOLDER,
      peer_compare: PLACEHOLDER,
      days_on_target: 0,
      score_change: { value: 0, text: PLACEHOLDER },
    },
    vital_signs: {
      ai_insight: PLACEHOLDER,
      heart_rate: {
        has_data: false,
        avg: 0,
        unit: 'BPM',
        status: { level: 'B', label: PLACEHOLDER },
        trend_chart: trendChart,
      },
      blood_pressure: {
        has_data: false,
        systolic_avg: 0,
        diastolic_avg: 0,
        unit: 'mmHg',
        status: { level: 'B', label: PLACEHOLDER },
        trend_chart: bpTrendChart,
      },
      blood_oxygen: {
        has_data: false,
        avg: 0,
        unit: '%',
        status: { level: 'B', label: PLACEHOLDER },
        trend_chart: trendChart,
      },
      blood_glucose: {
        has_data: false,
        avg: 0,
        unit: 'mmol/L',
        status: { level: 'B', label: PLACEHOLDER },
        trend_chart: trendChart,
      },
    },
    sleep: {
      has_data: false,
      ai_insight: PLACEHOLDER,
      status: { level: 'B', label: PLACEHOLDER },
      avg_duration: { value: 0, display: PLACEHOLDER },
      sleep_structure: {
        stages: [
          { type: 'deep', label: PLACEHOLDER, percent: 0 },
          { type: 'light', label: PLACEHOLDER, percent: 0 },
          { type: 'rem', label: PLACEHOLDER, percent: 0 },
          { type: 'awake', label: PLACEHOLDER, percent: 0 },
        ],
      },
      trend_chart: EMPTY_TREND_LABELS.map((l) => ({
        date: '',
        label: l,
        total: null,
        total_text: null,
        stages: null,
      })),
    },
    emotion: {
      has_data: false,
      ai_insight: PLACEHOLDER,
      status: { level: 'B', label: PLACEHOLDER },
      avg_score: 0,
      avg_distribution: [
        { type: 'positive', label: PLACEHOLDER, percent: 0 },
        { type: 'neutral', label: PLACEHOLDER, percent: 0 },
        { type: 'negative', label: PLACEHOLDER, percent: 0 },
      ],
      trend_chart: EMPTY_TREND_LABELS.map((l) => ({
        date: '',
        label: l,
        score: null,
        distribution: null,
      })),
    },
    medication: {
      has_data: false,
      ai_insight: PLACEHOLDER,
      status: { level: 'B', label: PLACEHOLDER },
      compliance_rate: 0,
      miss_count: 0,
      chart_data: EMPTY_TREND_LABELS.map((l) => ({
        date: '',
        label: l,
        status: 'taken' as const,
        status_label: PLACEHOLDER,
        detail: { taken: 0, delayed: 0, missed: 0, total: 0 },
      })),
    },
    nutrition: {
      has_data: false,
      ai_insight: PLACEHOLDER,
      status: { level: 'B', label: PLACEHOLDER },
      compliance_rate: 0,
      avg_daily_calories: { label: PLACEHOLDER, value: 0 },
      meal_avg: [
        { type: 'breakfast', label: PLACEHOLDER, avg_calories: 0 },
        { type: 'lunch', label: PLACEHOLDER, avg_calories: 0 },
        { type: 'dinner', label: PLACEHOLDER, avg_calories: 0 },
      ],
      chart_data: EMPTY_TREND_LABELS.map((l) => ({
        date: '',
        label: l,
        calories: 0,
        status: 'on_target' as const,
        status_label: PLACEHOLDER,
      })),
    },
    exercise: {
      has_data: false,
      ai_insight: PLACEHOLDER,
      status: { level: 'B', label: PLACEHOLDER },
      avg_completion_rate: 0,
      main_types: { title: PLACEHOLDER, types: [] },
      efficiency: {
        title: PLACEHOLDER,
        effect: PLACEHOLDER,
        change: { direction: 'up', value: 0 },
      },
      chart_data: EMPTY_TREND_LABELS.map((l) => ({
        label: l,
        completion_rate: 0,
        duration: 0,
      })),
    },
    correlation: [],
    improvement_suggestions: [],
  }
}
