/**
 * Healthy Feature Types
 * Defines API response types and frontend domain models for comprehensive health data
 */

// ============================================
// API Response Types
// ============================================

/** API view type parameter */
export type ViewType = 'day' | 'week'

/** Overview chart data item from API */
export interface ApiOverviewChartItem {
  label: string
  date: string
  score: number | null
  highlight: string | null
}

/** Overview data from API */
export interface ApiOverviewData {
  chart_data: ApiOverviewChartItem[]
  average_score: number | null
  ai_insight: string
}

/** Blood pressure chart item from API */
export interface ApiBPChartItem {
  time: string
  systolic: number
  diastolic: number
}

/** Blood pressure indicator from API */
export interface ApiBPIndicator {
  latest: { systolic: number; diastolic: number }
  change: { value: number; trend: 'up' | 'down' | 'flat' } | null
  avg: { systolic: number; diastolic: number }
  max: { systolic: number; diastolic: number }
  min: { systolic: number; diastolic: number }
  reference: { systolic: string; diastolic: string }
  status: string
  chart: ApiBPChartItem[]
}

/** Single value chart item from API */
export interface ApiValueChartItem {
  time: string
  value: number
}

/** Single value indicator from API (heart rate, glucose, spo2) */
export interface ApiValueIndicator {
  latest: number
  change: { value: number; trend: 'up' | 'down' | 'flat' } | null
  avg: number
  max: number
  min: number
  reference: string
  status: string
  chart: ApiValueChartItem[]
}

/** Sleep chart data item from API */
export interface ApiSleepChartItem {
  date: string
  total_minutes: number
  deep_sleep_percent: number
  light_sleep_percent: number
  awake_percent: number
  rem_percent: number
}

/** Sleep indicator from API */
export interface ApiSleepIndicator {
  type: 'sleep'
  title: string
  statistic: {
    label: string
    average: number | null
  }
  chart_data: ApiSleepChartItem[]
}

/** Emotion chart data item from API */
export interface ApiEmotionChartItem {
  date: string
  positive: number
  neutral: number
  negative: number
}

/** Emotion indicator from API */
export interface ApiEmotionIndicator {
  type: 'emotion'
  title: string
  statistic: {
    label: string
  }
  chart_data: ApiEmotionChartItem[]
}

/** Nutrition indicator from API */
export interface ApiNutritionIndicator {
  type: 'nutrition'
  title: string
  statistic: {
    label: string
    average: number | null
  }
  chart_data: ApiValueChartItem[]
}

/** Union type for all indicators */
export type ApiIndicator =
  | ApiBPIndicator
  | ApiValueIndicator
  | ApiSleepIndicator
  | ApiEmotionIndicator
  | ApiNutritionIndicator

/** Complete API response */
export interface ApiHealthyResponse {
  code: number
  msg: string
  data: {
    overview: ApiOverviewData
    indicators: ApiIndicator[]
  }
}

// ============================================
// Common Types
// ============================================

/** Time period for data display */
export type TimePeriod = 'daily' | 'weekly'

/** Trend direction */
export type TrendDirection = 'up' | 'down' | 'stable'

/** Health status level */
export type HealthStatus = 'excellent' | 'good' | 'normal' | 'warning' | 'poor'

// ============================================
// Comprehensive Health Score
// ============================================

/** Daily health score data point */
export interface HealthScoreDataPoint {
  /** Day label (Mon, Tue, etc.) */
  day: string
  /** Health score (0-100) */
  score: number
  /** Date object */
  date: Date
}

/** Comprehensive health data summary */
export interface ComprehensiveHealthData {
  /** Chart data points */
  chartData?: HealthScoreDataPoint[]
  /** Weekly average score */
  weeklyAverage: number
  /** AI generated summary text */
  aiSummary: string
  /** Target/reference line value */
  targetScore: number
  /** Trend compared to previous period */
  trend: TrendDirection
}

// ============================================
// Blood Pressure Card Data
// ============================================

/** Blood pressure data point for mini chart */
export interface BPMiniDataPoint {
  /** Day label */
  day: string
  /** Systolic value */
  systolic: number
  /** Diastolic value */
  diastolic: number
}

/** Blood pressure card data */
export interface BloodPressureCardData {
  /** Average systolic over period */
  avgSystolic: number
  /** Average diastolic over period */
  avgDiastolic: number
  /** Latest systolic value */
  latestSystolic?: number
  /** Latest diastolic value */
  latestDiastolic?: number
  /** Max systolic value */
  maxSystolic?: number
  /** Max diastolic value */
  maxDiastolic?: number
  /** Min systolic value */
  minSystolic?: number
  /** Min diastolic value */
  minDiastolic?: number
  /** Reference ranges */
  reference?: { systolic: string; diastolic: string }
  /** Status text */
  status?: string
  /** Period description (e.g., "12 weeks") */
  periodDescription: string
  /** Mini chart data */
  chartData: BPMiniDataPoint[]
}

// ============================================
// Heart Rate Card Data
// ============================================

/** Heart rate data point for mini chart */
export interface HRMiniDataPoint {
  /** X position or day */
  x: number
  /** Heart rate value */
  value: number
}

/** Heart rate card data */
export interface HeartRateCardData {
  /** Average heart rate */
  avgHeartRate: number
  /** Latest heart rate value */
  latestValue?: number
  /** Max value */
  maxValue?: number
  /** Min value */
  minValue?: number
  /** Reference range text */
  reference?: string
  /** Status text */
  status?: string
  /** Period description */
  periodDescription: string
  /** Mini chart data */
  chartData?: HRMiniDataPoint[]
  /** Reference line value */
  referenceLine: number
}

// ============================================
// Blood Sugar Card Data
// ============================================

/** Blood sugar data point */
export interface BloodSugarDataPoint {
  /** X position or day */
  x: number
  /** Blood sugar value in mmol/L */
  value: number
}

/** Blood sugar card data */
export interface BloodSugarCardData {
  /** POCT (Point-of-Care Testing) value */
  poctValue: number
  /** Average value */
  avgValue?: number
  /** Max value */
  maxValue?: number
  /** Min value */
  minValue?: number
  /** Reference range text */
  reference?: string
  /** Status text */
  status?: string
  /** Unit (mmol/L) */
  unit: string
  /** Period description */
  periodDescription: string
  /** Mini chart data */
  chartData?: BloodSugarDataPoint[]
}

// ============================================
// Blood Oxygen Card Data
// ============================================

/** Blood oxygen data point */
export interface SpO2MiniDataPoint {
  /** Day label */
  day: string
  /** SpO2 percentage value */
  value: number
}

/** Blood oxygen card data */
export interface BloodOxygenCardData {
  /** Average SpO2 */
  avgSpO2: number
  /** Latest value */
  latestValue?: number
  /** Max value */
  maxValue?: number
  /** Min value */
  minValue?: number
  /** Reference range text */
  reference?: string
  /** Status text */
  status?: string
  /** Period description */
  periodDescription: string
  /** Mini chart data */
  chartData?: SpO2MiniDataPoint[]
  /** Reference line value */
  referenceLine: number
}

// ============================================
// Sleep Card Data
// ============================================

/** Sleep data point */
export interface SleepDataPoint {
  /** Day label */
  day: string
  /** Sleep duration in hours */
  hours: number
  /** Sleep quality (0-100) */
  quality: number
  /** Deep sleep percentage */
  deepPercent?: number
  /** Light sleep percentage */
  lightPercent?: number
  /** Awake percentage */
  awakePercent?: number
  /** REM sleep percentage */
  remPercent?: number
}

/** Sleep card data */
export interface SleepCardData {
  /** Average sleep time */
  avgSleepTime: {
    hours: number
    minutes: number
  }
  /** Label text from API */
  label?: string
  /** Period description */
  periodDescription: string
  /** Mini chart data */
  chartData?: SleepDataPoint[]
}

// ============================================
// Emotion Card Data
// ============================================

/** Emotion types */
export type EmotionType = 'positive' | 'neutral' | 'negative'

/** Emotion data point */
export interface EmotionDataPoint {
  /** Day label */
  day: string
  /** Positive emotion score */
  positive: number
  /** Neutral emotion score */
  neutral: number
  /** Negative emotion score */
  negative: number
}

/** Emotion card data */
export interface EmotionCardData {
  /** Dominant emotion this period */
  dominantEmotion: EmotionType
  /** Label text from API */
  label?: string
  /** Period description */
  periodDescription: string
  /** Mini chart data */
  chartData?: EmotionDataPoint[]
}

// ============================================
// Nutrition Card Data
// ============================================

/** Nutrition data point */
export interface NutritionDataPoint {
  /** X position or day */
  x: number
  /** Nutrition score or intake value */
  value: number
}

/** Nutrition card data */
export interface NutritionCardData {
  /** Average daily calories or score */
  avgValue: number
  /** Label text from API */
  label?: string
  /** Unit (kcal, score, etc.) */
  unit: string
  /** Period description */
  periodDescription: string
  /** Mini chart data */
  chartData?: NutritionDataPoint[]
  /** Reference line value */
  referenceLine: number
}

// ============================================
// Complete Domain Model
// ============================================

/** Complete healthy feature domain model */
export interface HealthyDomainModel {
  /** Comprehensive health score data */
  comprehensiveHealth: ComprehensiveHealthData
  /** Blood pressure card data */
  bloodPressure: BloodPressureCardData
  /** Heart rate card data */
  heartRate: HeartRateCardData
  /** Blood sugar card data */
  bloodSugar: BloodSugarCardData
  /** Blood oxygen card data */
  bloodOxygen: BloodOxygenCardData
  /** Sleep card data */
  sleep: SleepCardData
  /** Emotion card data */
  emotion: EmotionCardData
  /** Nutrition card data */
  nutrition: NutritionCardData
}

// ============================================
// Component Props Types
// ============================================

/** Common card props */
export interface BaseCardProps {
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Click handler for navigation */
  onClick?: () => void
}
