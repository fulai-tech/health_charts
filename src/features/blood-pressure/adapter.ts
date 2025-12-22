import type { BPDetailData } from '@/services/api/types'
import type {
  BPDomainModel,
  BPDataPoint,
  BPStatus,
  TrendDirection,
} from './types'

/**
 * Map Chinese weekday labels to translation keys
 * This is part of the Adapter Pattern - NEVER display backend strings directly
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
 * Map Chinese BP status labels to standard type codes
 * Backend returns Chinese, we convert to standard codes
 */
const BP_STATUS_MAP: Record<string, string> = {
  '正常血压': 'normal',
  '正常': 'normal',
  '正常高值': 'high_normal',
  '低血压': 'low_bp',
  '高血压': 'high_bp',
  '过低': 'low_bp',
  '过高': 'high_bp',
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
 * Determine blood pressure status based on systolic/diastolic values
 * Based on American Heart Association guidelines
 */
function determineBPStatus(systolic: number, diastolic: number): BPStatus {
  if (systolic < 90 || diastolic < 60) {
    return 'low'
  }
  if (systolic < 120 && diastolic < 80) {
    return 'normal'
  }
  if (systolic < 130 && diastolic < 80) {
    return 'elevated'
  }
  return 'high'
}

/**
 * Adapter function to transform API response to frontend domain model
 * This is the core of the Adapter Pattern:
 * - Converts date strings to Date objects
 * - Maps Chinese labels to translation keys
 * - Calculates derived statistics
 */
export function adaptBPData(apiData: BPDetailData): BPDomainModel {
  console.log('[BP Adapter] Input:', apiData)
  
  const rawData = apiData?.trend_chart?.chart_data || []

  // Transform each data point
  const chartData: BPDataPoint[] = rawData.map((point) => {
    const date = new Date(point.date)

    return {
      date,
      dateLabel: formatDate(point.date),
      weekdayKey: WEEKDAY_MAP[point.label] || 'weekdays.mon',
      systolic: point.systolic || 0,
      diastolic: point.diastolic || 0,
    }
  })

  // Get averages from API response with fallbacks
  const avgSystolic = apiData?.overview?.systolic_avg || 0
  const avgDiastolic = apiData?.overview?.diastolic_avg || 0

  // Determine status
  const status = determineBPStatus(avgSystolic, avgDiastolic)

  // Get trends from comparison
  const comparison = apiData?.comparison || {}
  
  // Calculate trend based on actual values (current vs previous)
  const currentSystolic = comparison.current?.systolic_avg || avgSystolic
  const previousSystolic = comparison.previous?.systolic_avg || 0
  const currentDiastolic = comparison.current?.diastolic_avg || avgDiastolic
  const previousDiastolic = comparison.previous?.diastolic_avg || 0
  
  // Determine trend direction from actual difference
  const systolicDiff = currentSystolic - previousSystolic
  const diastolicDiff = currentDiastolic - previousDiastolic
  
  const systolicTrend: TrendDirection = systolicDiff > 0 ? 'up' : systolicDiff < 0 ? 'down' : 'stable'
  const diastolicTrend: TrendDirection = diastolicDiff > 0 ? 'up' : diastolicDiff < 0 ? 'down' : 'stable'
  
  // Use absolute value for display
  const systolicChange = Math.abs(systolicDiff)
  const diastolicChange = Math.abs(diastolicDiff)

  // Get latest reading
  const latestReading =
    chartData.length > 0
      ? {
          systolic: chartData[chartData.length - 1].systolic,
          diastolic: chartData[chartData.length - 1].diastolic,
          date: chartData[chartData.length - 1].date,
        }
      : null

  // Map distribution labels to standard types
  const rawDistribution = apiData?.statistics?.distribution || []
  const mappedDistribution = rawDistribution.map((item) => ({
    ...item,
    type: BP_STATUS_MAP[item.label] || item.type || 'normal',
  }))

  const result: BPDomainModel = {
    chartData,
    yAxisRange: apiData?.trend_chart?.y_axis_range || { min: 60, max: 160 },
    summary: {
      avgSystolic,
      avgDiastolic,
      status,
      statusKey: `status.${status}`,
      systolicTrend,
      diastolicTrend,
      systolicChange,
      diastolicChange,
      totalCount: apiData?.statistics?.total_count || 0,
      distribution: mappedDistribution,
    },
    comparison: {
      current: {
        systolic: comparison.current?.systolic_avg || avgSystolic,
        diastolic: comparison.current?.diastolic_avg || avgDiastolic,
      },
      previous: {
        systolic: comparison.previous?.systolic_avg || 0,
        diastolic: comparison.previous?.diastolic_avg || 0,
      },
      insight: comparison.insight || null,
    },
    latestReading,
  }

  console.log('[BP Adapter] Output:', result)
  return result
}
