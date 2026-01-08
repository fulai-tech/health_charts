import type { GlucoseDetailData } from '@/services/api/types'
import type {
  GlucoseDomainModel,
  GlucoseDataPoint,
  GlucoseStatus,
  TrendDirection,
} from './types'
import { ensureFullWeekData, WEEKDAY_LABEL_MAP, getDateForWeekday, getCurrentWeekDateRange } from '@/lib/dateUtils'

/**
 * Map Chinese glucose type labels to translation keys
 */
const GLUCOSE_TYPE_MAP: Record<string, string> = {
  空腹: 'vitals.fasting',
  餐后: 'vitals.postMeal',
  随机: 'common.value',
}

/**
 * Format date to MM/DD
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

/**
 * Determine glucose status based on fasting value (mmol/L)
 * Normal: 3.9-6.1, Elevated: 6.1-7.0, High: >7.0, Low: <3.9
 */
function determineGlucoseStatus(value: number): GlucoseStatus {
  if (value < 3.9) return 'low'
  if (value <= 6.1) return 'normal'
  if (value <= 7.0) return 'elevated'
  return 'high'
}

/**
 * Safely get trend direction
 */
function safeTrend(trend?: string): TrendDirection {
  if (trend === 'up' || trend === 'down' || trend === 'stable') {
    return trend
  }
  return 'stable'
}

/**
 * Adapter function to transform API response to frontend domain model
 */
export function adaptGlucoseData(apiData: GlucoseDetailData): GlucoseDomainModel {
  console.log('[Glucose Adapter] Input:', apiData)

  const rawData = apiData?.trend_chart?.chart_data || []
  const { start: currentMonday } = getCurrentWeekDateRange()

  // Transform each data point - now with min/max range
  const partialChartData: GlucoseDataPoint[] = rawData.map((point) => {
    const date = new Date(point.date)
    const max = point.max ?? point.value ?? 0
    const min = point.min ?? point.value ?? 0

    return {
      date,
      dateLabel: formatDate(point.date),
      weekdayKey: WEEKDAY_LABEL_MAP[point.label] || 'weekdays.mon',
      max,
      min,
      avg: (max + min) / 2,
      typeKey: point.type ? GLUCOSE_TYPE_MAP[point.type] : undefined,
    }
  })

  // Ensure all 7 weekdays are present (fill missing days with 0 values)
  const chartData = ensureFullWeekData(partialChartData, (weekdayKey, index) => ({
    date: getDateForWeekday(currentMonday, index),
    dateLabel: '',
    weekdayKey,
    max: 0,
    min: 0,
    avg: 0,
    typeKey: undefined,
  }))

  // Get values from overview
  const overview = apiData?.overview || {}
  const avgValue = overview.average || 0
  const maxValue = overview.max ?? (chartData.length > 0 ? Math.max(...chartData.map(p => p.max)) : 0)
  const minValue = overview.min ?? (chartData.length > 0 ? Math.min(...chartData.map(p => p.min)) : 0)
  const maxWeekdayKey = overview.max_label ? (WEEKDAY_LABEL_MAP[overview.max_label] || 'weekdays.mon') : 'weekdays.mon'
  const minWeekdayKey = overview.min_label ? (WEEKDAY_LABEL_MAP[overview.min_label] || 'weekdays.mon') : 'weekdays.mon'

  const avgFasting = overview.fasting_avg
  const avgPostMeal = overview.post_meal_avg

  // Determine status
  const status = determineGlucoseStatus(avgFasting || avgValue)

  // Get trend from comparison with safe defaults
  const comparison = apiData?.comparison || {}
  const changes = comparison.changes || {}
  const trend = safeTrend(changes.average?.trend)
  const changeValue = changes.average?.value || 0
  const previousAvg = comparison.previous?.average || 0

  // Get latest reading
  const latestReading =
    chartData.length > 0
      ? {
        value: chartData[chartData.length - 1].avg,
        typeKey: chartData[chartData.length - 1].typeKey,
        date: chartData[chartData.length - 1].date,
      }
      : null

  // Get normal range
  const normalRange = apiData?.normal_range ||
    apiData?.trend_chart?.normal_range ||
    { min: 3.9, max: 6.1 }

  // Get weekly summary
  const weeklySummary = apiData?.weekly_summary || {}

  const result: GlucoseDomainModel = {
    chartData,
    yAxisRange: apiData?.trend_chart?.y_axis_range || { min: 2, max: 9 },
    averageLine: apiData?.trend_chart?.average_line || avgValue,
    normalRange,
    summary: {
      avgValue,
      minValue,
      maxValue,
      minWeekdayKey,
      maxWeekdayKey,
      previousAvg,
      avgFasting,
      avgPostMeal,
      status,
      statusKey: `status.${status}`,
      trend,
      changeValue,
      totalCount: apiData?.statistics?.total_count || 0,
      distribution: apiData?.statistics?.distribution || [],
    },
    comparison: {
      current: { average: comparison.current?.average || avgValue },
      previous: { average: previousAvg },
      insight: comparison.insight || null,
    },
    weeklySummary: {
      overview: weeklySummary.overview || null,
      highlights: weeklySummary.highlights || null,
      suggestions: weeklySummary.suggestions || [],
      dataAnalysis: weeklySummary.data_analysis || [],
    },
    latestReading,
  }

  console.log('[Glucose Adapter] Output:', result)
  return result
}
