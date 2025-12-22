import type { SpO2DetailData } from '@/services/api/types'
import type {
  SpO2DomainModel,
  SpO2DataPoint,
  SpO2Status,
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
 * Determine SpO2 status based on value
 * Normal: 95-100%, Low: 90-94%, Danger: <90%
 */
function determineSpO2Status(value: number): SpO2Status {
  if (value >= 95) return 'normal'
  if (value >= 90) return 'low'
  return 'danger'
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
export function adaptSpO2Data(apiData: SpO2DetailData): SpO2DomainModel {
  console.log('[SpO2 Adapter] Input:', apiData)

  const rawData = apiData?.trend_chart?.chart_data || []

  // Transform each data point
  const chartData: SpO2DataPoint[] = rawData.map((point) => {
    const date = new Date(point.date)
    const avg = point.avg ?? Math.round((point.max + point.min) / 2)

    return {
      date,
      dateLabel: formatDate(point.date),
      weekdayKey: WEEKDAY_MAP[point.label] || 'weekdays.mon',
      max: point.max || 0,
      min: point.min || 0,
      avg,
      range: [point.min || 0, point.max || 0] as [number, number],
    }
  })

  // Get average from API
  const avgValue = apiData?.overview?.average || 0

  // Calculate min/max from chart data
  const minValue =
    chartData.length > 0 ? Math.min(...chartData.map((p) => p.min)) : 0
  const maxValue =
    chartData.length > 0 ? Math.max(...chartData.map((p) => p.max)) : 0

  // Determine status
  const status = determineSpO2Status(avgValue)

  // Get trend from comparison with safe defaults
  const comparison = apiData?.comparison || {}
  const changes = comparison.changes || {}
  const trend = safeTrend(changes.average?.trend)
  const changeValue = changes.average?.value || 0

  // Get latest reading
  const latestReading =
    chartData.length > 0
      ? {
          avg: chartData[chartData.length - 1].avg,
          min: chartData[chartData.length - 1].min,
          max: chartData[chartData.length - 1].max,
          date: chartData[chartData.length - 1].date,
        }
      : null

  const result: SpO2DomainModel = {
    chartData,
    yAxisRange: apiData?.trend_chart?.y_axis_range || { min: 85, max: 100 },
    summary: {
      avgValue,
      minValue,
      maxValue,
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

  console.log('[SpO2 Adapter] Output:', result)
  return result
}
