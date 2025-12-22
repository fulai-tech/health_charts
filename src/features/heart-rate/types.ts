/**
 * Heart Rate Types
 * Defines frontend domain models
 */

/** Status levels for heart rate readings */
export type HRStatus = 'normal' | 'elevated' | 'high' | 'low'

/** Trend direction */
export type TrendDirection = 'up' | 'down' | 'stable'

/** Distribution item */
export interface HRDistribution {
  type: string
  label: string
  count: number
  percent: number
}

/** Processed data point for frontend use */
export interface HRDataPoint {
  /** JavaScript Date object */
  date: Date
  /** Formatted date label based on locale */
  dateLabel: string
  /** Short weekday label (translation key) */
  weekdayKey: string
  /** Maximum heart rate value */
  max: number
  /** Minimum heart rate value */
  min: number
  /** Average heart rate value */
  avg: number
}

/** Summary statistics */
export interface HRSummary {
  /** Average heart rate */
  avgValue: number
  /** Minimum recorded value */
  minValue: number
  /** Maximum recorded value */
  maxValue: number
  /** Weekday key for min value */
  minWeekdayKey: string
  /** Weekday key for max value */
  maxWeekdayKey: string
  /** Previous week average */
  previousAvg: number
  /** Average resting heart rate */
  avgResting?: number
  /** Status based on average values */
  status: HRStatus
  /** Status translation key */
  statusKey: string
  /** Trend compared to previous period */
  trend: TrendDirection
  /** Change value */
  changeValue: number
  /** Total measurement count */
  totalCount: number
  /** Distribution data */
  distribution: HRDistribution[]
}

/** Comparison data */
export interface HRComparison {
  current: { average: number }
  previous: { average: number }
  insight: string | null
}

/** Weekly summary data */
export interface HRWeeklySummary {
  overview: string | null
  highlights: string | null
  suggestions: string[]
  dataAnalysis: { content: string }[]
}

/** Complete domain model for heart rate feature */
export interface HRDomainModel {
  /** Processed chart data points */
  chartData: HRDataPoint[]
  /** Y-axis range for chart */
  yAxisRange: { min: number; max: number }
  /** Average line value for chart */
  averageLine: number
  /** Summary statistics */
  summary: HRSummary
  /** Comparison with previous period */
  comparison: HRComparison
  /** Weekly summary */
  weeklySummary: HRWeeklySummary
  /** Latest reading */
  latestReading: {
    value: number
    date: Date
  } | null
}
