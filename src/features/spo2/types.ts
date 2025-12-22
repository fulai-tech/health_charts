/**
 * SpO2 (Blood Oxygen) Types
 * Defines frontend domain models
 */

/** Status levels for SpO2 readings */
export type SpO2Status = 'normal' | 'low' | 'danger'

/** Trend direction */
export type TrendDirection = 'up' | 'down' | 'stable'

/** Distribution item */
export interface SpO2Distribution {
  type: string
  label: string
  count: number
  percent: number
}

/** Processed data point for frontend use */
export interface SpO2DataPoint {
  /** JavaScript Date object */
  date: Date
  /** Formatted date label based on locale */
  dateLabel: string
  /** Short weekday label (translation key) */
  weekdayKey: string
  /** Highest SpO2 value */
  max: number
  /** Lowest SpO2 value */
  min: number
  /** Average SpO2 value */
  avg: number
  /** Range array for chart rendering */
  range: [number, number]
}

/** Summary statistics */
export interface SpO2Summary {
  /** Average SpO2 value */
  avgValue: number
  /** Minimum recorded value */
  minValue: number
  /** Maximum recorded value */
  maxValue: number
  /** Status based on average values */
  status: SpO2Status
  /** Status translation key */
  statusKey: string
  /** Trend compared to previous period */
  trend: TrendDirection
  /** Change value */
  changeValue: number
  /** Total measurement count */
  totalCount: number
  /** Distribution data */
  distribution: SpO2Distribution[]
}

/** Comparison data */
export interface SpO2Comparison {
  current: { average: number }
  previous: { average: number }
  insight: string | null
}

/** Complete domain model for SpO2 feature */
export interface SpO2DomainModel {
  /** Processed chart data points */
  chartData: SpO2DataPoint[]
  /** Y-axis range for chart */
  yAxisRange: { min: number; max: number }
  /** Summary statistics */
  summary: SpO2Summary
  /** Comparison with previous period */
  comparison: SpO2Comparison
  /** Latest reading */
  latestReading: {
    avg: number
    min: number
    max: number
    date: Date
  } | null
}
