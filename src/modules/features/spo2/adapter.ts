import type { SpO2DetailData } from '@/services/api/types'
import type {
  SpO2DomainModel,
  SpO2DataPoint,
  SpO2Status,
  TrendDirection,
  SpO2WeeklySummary,
} from './types'
import { ensureFullWeekData, WEEKDAY_LABEL_MAP, getDateForWeekday, getCurrentWeekDateRange } from '@/lib/dateUtils'

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
 * Normal: 95-100%, Low: 90-94%, Too Low: <90%
 */
function determineSpO2Status(value: number): SpO2Status {
  if (value >= 95) return 'normal'
  if (value >= 90) return 'low'
  return 'too_low'
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
 * Get weekday key from Chinese label
 */
function getWeekdayKey(label?: string): string {
  if (!label) return 'weekdays.mon'
  return WEEKDAY_LABEL_MAP[label] || 'weekdays.mon'
}

/**
 * Adapter function to transform API response to frontend domain model
 */
export function adaptSpO2Data(apiData: SpO2DetailData): SpO2DomainModel {
  console.log('[SpO2 Adapter] Input:', apiData)

  const rawData = apiData?.trend_chart?.chart_data || []
  const { start: currentMonday } = getCurrentWeekDateRange()

  // Transform each data point
  const partialChartData: SpO2DataPoint[] = rawData.map((point) => {
    const date = new Date(point.date)
    const avg = point.avg ?? Math.round((point.max + point.min) / 2)

    return {
      date,
      dateLabel: formatDate(point.date),
      weekdayKey: WEEKDAY_LABEL_MAP[point.label] || 'weekdays.mon',
      max: point.max || 0,
      min: point.min || 0,
      avg,
      range: [point.min || 0, point.max || 0] as [number, number],
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
    range: [0, 0] as [number, number],
  }))

  // Get average from API
  const avgValue = apiData?.overview?.average || 0

  // Get min/max from overview
  const minValue = apiData?.overview?.min || 0
  const maxValue = apiData?.overview?.max || 0
  const maxWeekdayKey = getWeekdayKey(apiData?.overview?.max_label)
  const minWeekdayKey = getWeekdayKey(apiData?.overview?.min_label)

  // Determine status
  const status = determineSpO2Status(avgValue)

  // Get trend from comparison with safe defaults
  const comparison = apiData?.comparison || {}
  const changes = comparison.changes || {}
  const trend = safeTrend(changes.average?.trend)
  const changeValue = changes.average?.value || 0

  // Get previous average
  const previousAvg = comparison.previous?.average || 0

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

  // Process weekly summary
  const weeklySummaryRaw = apiData?.weekly_summary || {}
  const weeklySummary: SpO2WeeklySummary = {
    overview: weeklySummaryRaw.overview || null,
    highlights: weeklySummaryRaw.highlights || null,
    suggestions: weeklySummaryRaw.suggestions || [],
    dataAnalysis: (weeklySummaryRaw.data_analysis || []).map((item: string) => ({
      content: item,
    })),
  }

  const result: SpO2DomainModel = {
    chartData,
    yAxisRange: apiData?.trend_chart?.y_axis_range || { min: 85, max: 100 },
    averageLine: apiData?.trend_chart?.average_line || avgValue,
    summary: {
      avgValue,
      minValue,
      maxValue,
      maxWeekdayKey,
      minWeekdayKey,
      status,
      statusKey: `status.${status}`,
      trend,
      changeValue,
      totalCount: apiData?.statistics?.total_count || 0,
      distribution: apiData?.statistics?.distribution || [],
      previousAvg,
    },
    comparison: {
      current: { average: comparison.current?.average || avgValue },
      previous: { average: comparison.previous?.average || 0 },
      insight: comparison.insight || null,
    },
    weeklySummary,
    latestReading,
  }

  console.log('[SpO2 Adapter] Output:', result)
  return result
}
