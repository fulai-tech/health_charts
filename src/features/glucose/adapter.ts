import type { GlucoseDetailData } from '@/services/api/types'
import type {
  GlucoseDomainModel,
  GlucoseDataPoint,
  GlucoseStatus,
  TrendDirection,
} from './types'

/**
 * Map Chinese weekday labels to translation keys
 */
const WEEKDAY_MAP: Record<string, string> = {
  周一: 'weekdays.mon',
  周二: 'weekdays.tue',
  周三: 'weekdays.wed',
  周四: 'weekdays.thu',
  周五: 'weekdays.fri',
  周六: 'weekdays.sat',
  周日: 'weekdays.sun',
}

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

  // Transform each data point
  const chartData: GlucoseDataPoint[] = rawData.map((point) => {
    const date = new Date(point.date)

    return {
      date,
      dateLabel: formatDate(point.date),
      weekdayKey: WEEKDAY_MAP[point.label] || 'weekdays.mon',
      value: point.value || 0,
      typeKey: point.type ? GLUCOSE_TYPE_MAP[point.type] : undefined,
    }
  })

  // Get average from API
  const avgValue = apiData?.overview?.average || 0
  const avgFasting = apiData?.overview?.fasting_avg
  const avgPostMeal = apiData?.overview?.post_meal_avg

  // Calculate min/max from chart data
  const minValue =
    chartData.length > 0
      ? Math.round(Math.min(...chartData.map((p) => p.value)) * 10) / 10
      : 0
  const maxValue =
    chartData.length > 0
      ? Math.round(Math.max(...chartData.map((p) => p.value)) * 10) / 10
      : 0

  // Determine status
  const status = determineGlucoseStatus(avgFasting || avgValue)

  // Get trend from comparison with safe defaults
  const comparison = apiData?.comparison || {}
  const changes = comparison.changes || {}
  const trend = safeTrend(changes.average?.trend)
  const changeValue = changes.average?.value || 0

  // Get latest reading
  const latestReading =
    chartData.length > 0
      ? {
          value: chartData[chartData.length - 1].value,
          typeKey: chartData[chartData.length - 1].typeKey,
          date: chartData[chartData.length - 1].date,
        }
      : null

  const result: GlucoseDomainModel = {
    chartData,
    yAxisRange: apiData?.trend_chart?.y_axis_range || { min: 3, max: 12 },
    summary: {
      avgValue,
      minValue,
      maxValue,
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
      previous: { average: comparison.previous?.average || 0 },
      insight: comparison.insight || null,
    },
    latestReading,
  }

  console.log('[Glucose Adapter] Output:', result)
  return result
}
