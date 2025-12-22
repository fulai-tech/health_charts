/**
 * Blood Glucose Types
 * Defines frontend domain models
 */

/** Status levels for glucose readings */
export type GlucoseStatus = 'normal' | 'elevated' | 'high' | 'low'

/** Trend direction */
export type TrendDirection = 'up' | 'down' | 'stable'

/** Distribution item */
export interface GlucoseDistribution {
  type: string
  label: string
  count: number
  percent: number
}

/** Processed data point for frontend use */
export interface GlucoseDataPoint {
  /** JavaScript Date object */
  date: Date
  /** Formatted date label based on locale */
  dateLabel: string
  /** Short weekday label (translation key) */
  weekdayKey: string
  /** Maximum glucose value in mmol/L */
  max: number
  /** Minimum glucose value in mmol/L */
  min: number
  /** Average glucose value (calculated from min/max) */
  avg: number
  /** Measurement type translation key */
  typeKey?: string
}

/** Summary statistics */
export interface GlucoseSummary {
  /** Average glucose value */
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
  /** Average fasting glucose */
  avgFasting?: number
  /** Average post-meal glucose */
  avgPostMeal?: number
  /** Status based on average values */
  status: GlucoseStatus
  /** Status translation key */
  statusKey: string
  /** Trend compared to previous period */
  trend: TrendDirection
  /** Change value */
  changeValue: number
  /** Total measurement count */
  totalCount: number
  /** Distribution data */
  distribution: GlucoseDistribution[]
}

/** Comparison data */
export interface GlucoseComparison {
  current: { average: number }
  previous: { average: number }
  insight: string | null
}

/** Weekly summary data */
export interface GlucoseWeeklySummary {
  overview: string | null
  highlights: string | null
  suggestions: string[]
  dataAnalysis: { content: string }[]
}

/** Complete domain model for glucose feature */
export interface GlucoseDomainModel {
  /** Processed chart data points */
  chartData: GlucoseDataPoint[]
  /** Y-axis range for chart */
  yAxisRange: { min: number; max: number }
  /** Average line value for chart */
  averageLine: number
  /** Normal range */
  normalRange: { min: number; max: number }
  /** Summary statistics */
  summary: GlucoseSummary
  /** Comparison with previous period */
  comparison: GlucoseComparison
  /** Weekly summary */
  weeklySummary: GlucoseWeeklySummary
  /** Latest reading */
  latestReading: {
    value: number
    typeKey?: string
    date: Date
  } | null
}
