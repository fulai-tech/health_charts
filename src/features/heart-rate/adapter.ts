import type { HRDetailData } from '@/services/api/types'
import type {
  HRDomainModel,
  HRDataPoint,
  HRStatus,
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
 * Format date to MM/DD
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

/**
 * Determine heart rate status based on resting/average value
 * Normal: 60-100 bpm, Low: <60, Elevated: 100-120, High: >120
 */
function determineHRStatus(value: number): HRStatus {
  if (value < 60) return 'low'
  if (value <= 100) return 'normal'
  if (value <= 120) return 'elevated'
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
export function adaptHRData(apiData: HRDetailData): HRDomainModel {
  console.log('[HR Adapter] Input:', apiData)

  const rawData = apiData?.trend_chart?.chart_data || []

  // Transform each data point
  const chartData: HRDataPoint[] = rawData.map((point) => {
    const date = new Date(point.date)

    return {
      date,
      dateLabel: formatDate(point.date),
      weekdayKey: WEEKDAY_MAP[point.label] || 'weekdays.mon',
      value: point.value || 0,
    }
  })

  // Get average from API
  const avgValue = apiData?.overview?.average || 0
  const avgResting = apiData?.overview?.resting_avg

  // Calculate min/max from chart data
  const minValue =
    chartData.length > 0 ? Math.min(...chartData.map((p) => p.value)) : 0
  const maxValue =
    chartData.length > 0 ? Math.max(...chartData.map((p) => p.value)) : 0

  // Determine status
  const status = determineHRStatus(avgResting || avgValue)

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
          date: chartData[chartData.length - 1].date,
        }
      : null

  const result: HRDomainModel = {
    chartData,
    yAxisRange: apiData?.trend_chart?.y_axis_range || { min: 40, max: 160 },
    summary: {
      avgValue,
      minValue,
      maxValue,
      avgResting,
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

  console.log('[HR Adapter] Output:', result)
  return result
}
