/**
 * API Response Types
 * Based on the actual backend API contract
 */

import type { IndicatorType, ViewType } from '@/config/api'

// ============================================
// Common Types
// ============================================

export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// ============================================
// Overview API Types
// ============================================

export interface OverviewRequest {
  view_type: ViewType
}

export interface OverviewChartDataPoint {
  label: string
  date: string
  score: number | null
  highlight: boolean | null
}

export interface OverviewData {
  chart_data: OverviewChartDataPoint[]
  average_score: number | null
  ai_insight: string
}

/** Blood pressure chart data in overview */
export interface BPOverviewChartData {
  date: string
  max: number
  min: number
}

/** Heart rate / Blood glucose chart data in overview */
export interface SimpleValueChartData {
  date: string
  val: number
}

/** Blood oxygen chart data in overview */
export interface SpO2OverviewChartData {
  date: string
  max: number
  min: number
}

/** Sleep chart data in overview */
export interface SleepOverviewChartData {
  date: string
  total_minutes: number
  deep_sleep_percent: number
  light_sleep_percent: number
  awake_percent: number
  rem_percent: number
}

/** Base indicator in overview response */
export interface OverviewIndicator<T = unknown> {
  type: IndicatorType
  title: string
  statistic: {
    label: string
    average?: number
    systolic_avg?: number
    diastolic_avg?: number
  }
  chart_data: T[]
}

export interface OverviewResponse {
  overview: OverviewData
  indicators: OverviewIndicator[]
}

// ============================================
// Indicator Detail API Types
// ============================================

export interface IndicatorDetailRequest {
  indicator_type: IndicatorType
}

/** Blood pressure trend chart data point */
export interface BPTrendChartDataPoint {
  date: string
  label: string
  systolic: number
  diastolic: number
}

/** Blood pressure detail response */
export interface BPDetailData {
  indicator_type: 'blood_pressure'
  title: string
  overview: {
    systolic_avg: number
    diastolic_avg: number
  }
  trend_chart: {
    chart_data: BPTrendChartDataPoint[]
    y_axis_range: {
      min: number
      max: number
    }
  }
  statistics: {
    total_count: number
    distribution: {
      type: string
      label: string
      count: number
      percent: number
    }[]
  }
  comparison: {
    current: {
      systolic_avg: number
      diastolic_avg: number
    }
    previous: {
      systolic_avg: number
      diastolic_avg: number
    }
    changes: {
      systolic: { value: number; trend: 'up' | 'down' | 'stable' }
      diastolic: { value: number; trend: 'up' | 'down' | 'stable' }
    }
    insight: string | null
  }
  weekly_summary: {
    overview: string | null
    highlights: string | null
    suggestions: string[]
  }
}

/** Heart rate trend chart data point */
export interface HRTrendChartDataPoint {
  date: string
  label: string
  value: number
}

/** Heart rate detail response */
export interface HRDetailData {
  indicator_type: 'heart_rate'
  title: string
  overview: {
    average: number
    resting_avg?: number
  }
  trend_chart: {
    chart_data: HRTrendChartDataPoint[]
    y_axis_range: {
      min: number
      max: number
    }
  }
  statistics: {
    total_count: number
    distribution: {
      type: string
      label: string
      count: number
      percent: number
    }[]
  }
  comparison: {
    current: { average: number }
    previous: { average: number }
    changes: {
      average: { value: number; trend: 'up' | 'down' | 'stable' }
    }
    insight: string | null
  }
  weekly_summary: {
    overview: string | null
    highlights: string | null
    suggestions: string[]
  }
}

/** Blood glucose trend chart data point */
export interface GlucoseTrendChartDataPoint {
  date: string
  label: string
  value: number
  type?: string // 空腹/餐后
}

/** Blood glucose detail response */
export interface GlucoseDetailData {
  indicator_type: 'blood_glucose'
  title: string
  overview: {
    average: number
    fasting_avg?: number
    post_meal_avg?: number
  }
  trend_chart: {
    chart_data: GlucoseTrendChartDataPoint[]
    y_axis_range: {
      min: number
      max: number
    }
  }
  statistics: {
    total_count: number
    distribution: {
      type: string
      label: string
      count: number
      percent: number
    }[]
  }
  comparison: {
    current: { average: number }
    previous: { average: number }
    changes: {
      average: { value: number; trend: 'up' | 'down' | 'stable' }
    }
    insight: string | null
  }
  weekly_summary: {
    overview: string | null
    highlights: string | null
    suggestions: string[]
  }
}

/** Blood oxygen trend chart data point */
export interface SpO2TrendChartDataPoint {
  date: string
  label: string
  max: number
  min: number
  avg?: number
}

/** Blood oxygen detail response */
export interface SpO2DetailData {
  indicator_type: 'blood_oxygen'
  title: string
  overview: {
    average: number
  }
  trend_chart: {
    chart_data: SpO2TrendChartDataPoint[]
    y_axis_range: {
      min: number
      max: number
    }
  }
  statistics: {
    total_count: number
    distribution: {
      type: string
      label: string
      count: number
      percent: number
    }[]
  }
  comparison: {
    current: { average: number }
    previous: { average: number }
    changes: {
      average: { value: number; trend: 'up' | 'down' | 'stable' }
    }
    insight: string | null
  }
  weekly_summary: {
    overview: string | null
    highlights: string | null
    suggestions: string[]
  }
}

/** Union type for all indicator detail responses */
export type IndicatorDetailData =
  | BPDetailData
  | HRDetailData
  | GlucoseDetailData
  | SpO2DetailData

