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
  avg: number
  max: number
  min: number
  value?: number // legacy support
}

/** Heart rate detail response */
export interface HRDetailData {
  indicator_type: 'heart_rate'
  title: string
  overview: {
    average: number
    max?: number
    max_label?: string
    min?: number
    min_label?: string
    resting_avg?: number
  }
  trend_chart: {
    chart_data: HRTrendChartDataPoint[]
    average_line?: number
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
    data_analysis?: { content: string }[]
  }
}

/** Blood glucose trend chart data point */
export interface GlucoseTrendChartDataPoint {
  date: string
  label: string
  max: number
  min: number
  value?: number // legacy support
  type?: string // 空腹/餐后
}

/** Blood glucose detail response */
export interface GlucoseDetailData {
  indicator_type: 'blood_glucose'
  title: string
  normal_range?: {
    min: number
    max: number
  }
  overview: {
    average: number
    max?: number
    max_label?: string
    min?: number
    min_label?: string
    standard_deviation?: number
    fasting_avg?: number
    post_meal_avg?: number
  }
  trend_chart: {
    chart_data: GlucoseTrendChartDataPoint[]
    average_line?: number
    y_axis_range: {
      min: number
      max: number
    }
    normal_range?: {
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
    data_analysis?: { content: string }[]
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
    max: number
    max_label: string
    min: number
    min_label: string
  }
  trend_chart: {
    chart_data: SpO2TrendChartDataPoint[]
    average_line: number
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
    data_analysis: string[]
  }
}

/** Union type for all indicator detail responses */
export type IndicatorDetailData =
  | BPDetailData
  | HRDetailData
  | GlucoseDetailData
  | SpO2DetailData
  | SleepDetailData

/** Sleep trend chart data point */
export interface SleepTrendChartDataPoint {
  date: string
  label: string
  total: number
  total_text: string
  deep: number
  deep_text: string
  light: number
  light_text: string
  rem: number
  rem_text: string
  awake: number
  awake_text: string
}

/** Sleep stage data */
export interface SleepStageData {
  type: 'deep' | 'light' | 'rem' | 'awake'
  label: string
  percent: number
  reference: string
  evaluation: 'normal' | 'high' | 'low'
  evaluation_text: string
  color: string
}

/** Sleep detail response */
export interface SleepDetailData {
  indicator_type: 'sleep'
  title: string
  overview: {
    average: number
    average_text: string
    previous_average: number
    previous_average_text: string
    change: {
      value: number
      value_text: string
      trend: 'up' | 'dn' | 'same'
    }
    max: number
    max_text: string
    max_label: string
    min: number
    min_text: string
    min_label: string
  }
  trend_chart: {
    chart_data: SleepTrendChartDataPoint[]
    y_axis_range: {
      min: number
      max: number
    }
    stage_colors: {
      deep: string
      light: string
      rem: string
      awake: string
    }
  }
  sleep_structure: {
    has_data: boolean
    stages: SleepStageData[]
  }
  sleep_routine: {
    has_data: boolean
    avg_sleep_time: {
      minutes: number
      time_text: string
      change: {
        value: number
        trend: 'up' | 'dn' | 'same'
        text: string
      }
    }
    avg_wake_time: {
      minutes: number
      time_text: string
      change: {
        value: number
        trend: 'up' | 'dn' | 'same'
        text: string
      }
    }
    insight: string | null
  }
  weekly_summary: {
    overview: string | null
    highlights: string | null
    suggestions: string[]
    data_analysis: string[]
  }
}

