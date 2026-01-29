/**
 * Blood Pressure Types
 * Defines API response types and frontend domain models
 */

// ============================================
// Frontend Domain Models
// ============================================

/** Status levels for blood pressure readings */
export type BPStatus = 'normal' | 'elevated' | 'high' | 'low'

/** Trend direction */
export type TrendDirection = 'up' | 'down' | 'stable'

/** Processed data point for frontend use */
export interface BPDataPoint {
  /** JavaScript Date object */
  date: Date
  /** Formatted date label based on locale */
  dateLabel: string
  /** Short weekday label (translation key) */
  weekdayKey: string
  /** Systolic (high) value */
  systolic: number
  /** Diastolic (low) value */
  diastolic: number
}

/** Distribution item */
export interface BPDistribution {
  type: string
  label: string
  count: number
  percent: number
}

/** Summary statistics */
export interface BPSummary {
  /** Average systolic value */
  avgSystolic: number
  /** Average diastolic value */
  avgDiastolic: number
  /** Status based on average values */
  status: BPStatus
  /** Status translation key */
  statusKey: string
  /** Trend for systolic */
  systolicTrend: TrendDirection
  /** Trend for diastolic */
  diastolicTrend: TrendDirection
  /** Systolic change value */
  systolicChange: number
  /** Diastolic change value */
  diastolicChange: number
  /** Total measurement count */
  totalCount: number
  /** Distribution data */
  distribution: BPDistribution[]
}

/** Comparison data */
export interface BPComparison {
  current: { systolic: number; diastolic: number }
  previous: { systolic: number; diastolic: number }
  insight: string | null
}

/** Complete domain model for blood pressure feature */
export interface BPDomainModel {
  /** Processed chart data points */
  chartData: BPDataPoint[]
  /** Y-axis range for chart */
  yAxisRange: { min: number; max: number }
  /** Summary statistics */
  summary: BPSummary
  /** Comparison with previous period */
  comparison: BPComparison
  /** Latest reading */
  latestReading: {
    systolic: number
    diastolic: number
    date: Date
  } | null
  /** Weekly summary */
  weeklySummary: {
    overview: string | null
    highlights: string | null
    suggestions: string[]
    dataAnalysis: string[]
  }
}
