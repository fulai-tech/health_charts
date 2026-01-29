/**
 * Weekly Report Types
 * 周报模块类型定义
 */

// ============================================
// API Response Types (后端返回结构)
// ============================================

/** 周期范围 */
export interface WeekRangeAPI {
  start_date: string
  end_date: string
  display_range: string
  week_number: number
  title: string
}

/** 状态等级 */
export interface StatusAPI {
  level: 'S' | 'A' | 'B' | 'C' | 'D'
  label: string
  badge?: string
}

/** 分数变化 */
export interface ScoreChangeAPI {
  value: number
  text: string
}

/** 整体概览 */
export interface OverallAPI {
  score: number
  status: StatusAPI
  evaluate: string
  peer_compare: string
  days_on_target: number
  score_change: ScoreChangeAPI
}

/** 趋势图数据点 - 单值 */
export interface TrendChartItemAPI {
  date: string
  label: string
  value: number | null
}

/** 趋势图数据点 - 血压 */
export interface BPTrendChartItemAPI {
  date: string
  label: string
  value: {
    systolic: number
    diastolic: number
  }
}

/** 心率数据 */
export interface HeartRateAPI {
  has_data: boolean
  avg: number
  unit: string
  status: StatusAPI
  trend_chart: TrendChartItemAPI[]
}

/** 血压数据 */
export interface BloodPressureAPI {
  has_data: boolean
  systolic_avg: number
  diastolic_avg: number
  unit: string
  status: StatusAPI
  trend_chart: BPTrendChartItemAPI[]
}

/** 血氧数据 */
export interface BloodOxygenAPI {
  has_data: boolean
  avg: number
  unit: string
  status: StatusAPI
  trend_chart: TrendChartItemAPI[]
}

/** 血糖数据 */
export interface BloodGlucoseAPI {
  has_data: boolean
  avg: number
  unit: string
  status: StatusAPI
  trend_chart: TrendChartItemAPI[]
}

/** 生命体征模块 */
export interface VitalSignsAPI {
  ai_insight: string
  heart_rate: HeartRateAPI
  blood_pressure: BloodPressureAPI
  blood_oxygen: BloodOxygenAPI
  blood_glucose: BloodGlucoseAPI
}

/** 睡眠阶段 */
export interface SleepStageAPI {
  type: 'deep' | 'light' | 'rem' | 'awake'
  label: string
  percent?: number
  value?: number
  text?: string
  ratio?: number
}

/** 睡眠结构 */
export interface SleepStructureAPI {
  stages: SleepStageAPI[]
}

/** 睡眠趋势项 */
export interface SleepTrendItemAPI {
  date: string
  label: string
  total: number | null
  total_text: string | null
  stages: SleepStageAPI[] | null
}

/** 平均时长 */
export interface AvgDurationAPI {
  value: number
  display: string
}

/** 睡眠模块 */
export interface SleepAPI {
  has_data: boolean
  ai_insight: string
  status: StatusAPI
  avg_duration: AvgDurationAPI
  sleep_structure: SleepStructureAPI
  trend_chart: SleepTrendItemAPI[]
}

/** 情绪分布项 */
export interface EmotionDistributionItemAPI {
  type: 'negative' | 'neutral' | 'positive'
  label: string
  percent: number
}

/** 情绪趋势项 */
export interface EmotionTrendItemAPI {
  date: string
  label: string
  score: number | null
  distribution: EmotionDistributionItemAPI[] | null
}

/** 情绪模块 */
export interface EmotionAPI {
  has_data: boolean
  ai_insight: string
  status: StatusAPI
  avg_score: number
  avg_distribution: EmotionDistributionItemAPI[]
  trend_chart: EmotionTrendItemAPI[]
}

/** 用药详情 */
export interface MedicationDetailAPI {
  taken: number
  delayed: number
  missed: number
  total: number
}

/** 用药趋势项 */
export interface MedicationChartItemAPI {
  date: string
  label: string
  status: 'taken' | 'delayed' | 'missed'
  status_label: string
  detail: MedicationDetailAPI
}

/** 用药模块 */
export interface MedicationAPI {
  has_data: boolean
  ai_insight: string
  status: StatusAPI
  compliance_rate: number
  miss_count: number
  chart_data: MedicationChartItemAPI[]
}

/** 餐食平均热量 */
export interface MealAvgAPI {
  type: 'breakfast' | 'lunch' | 'dinner'
  label: string
  avg_calories: number
}

/** 日均热量 */
export interface AvgDailyCaloriesAPI {
  label: string
  value: number
}

/** 营养趋势项 */
export interface NutritionChartItemAPI {
  date: string
  label: string
  calories: number
  status: 'on_target' | 'over' | 'under'
  status_label: string
}

/** 营养模块 */
export interface NutritionAPI {
  has_data: boolean
  ai_insight: string
  status: StatusAPI
  compliance_rate: number
  avg_daily_calories: AvgDailyCaloriesAPI
  meal_avg: MealAvgAPI[]
  chart_data: NutritionChartItemAPI[]
}

/** 运动类型 */
export interface ExerciseTypeAPI {
  type: string
  label: string
  icon: string
}

/** 主要运动类型 */
export interface MainTypesAPI {
  title: string
  types: ExerciseTypeAPI[]
}

/** 效率评估 */
export interface EfficiencyAPI {
  title: string
  effect: string
  change: {
    direction: 'up' | 'down'
    value: number
  }
}

/** 运动趋势项 */
export interface ExerciseChartItemAPI {
  label: string
  completion_rate: number
  duration: number
}

/** 运动模块 */
export interface ExerciseAPI {
  has_data: boolean
  is_mock?: boolean
  ai_insight: string
  status: StatusAPI
  avg_completion_rate: number
  main_types: MainTypesAPI
  efficiency: EfficiencyAPI
  chart_data: ExerciseChartItemAPI[]
}

/** 影响因素 */
export interface InfluencingFactorAPI {
  factor: string
  impact: 'positive' | 'negative'
  description: string
}

/** 健康结果 */
export interface HealthOutcomeAPI {
  outcome: string
  trend: 'improving' | 'stable' | 'declining'
  description: string
}

/** 关联分析 */
export interface CorrelationAPI {
  title: string
  influencing_factors: InfluencingFactorAPI[]
  health_outcomes: HealthOutcomeAPI[]
  ai_insight: string
}

/** 改善建议时长 */
export interface SuggestionDurationAPI {
  days: number
  text: string
}

/** 改善建议难度 */
export interface SuggestionDifficultyAPI {
  level: 'easy' | 'medium' | 'hard'
  text: string
}

/** 改善建议 */
export interface ImprovementSuggestionAPI {
  suggestion_id: string
  title: string
  description: string
  category: string
  priority: number
  tags: string[]
  duration: SuggestionDurationAPI
  difficulty: SuggestionDifficultyAPI
}

/** 周报完整API响应数据 */
export interface WeeklyReportDataAPI {
  report_exists: boolean
  week_range: WeekRangeAPI
  generated_at: string
  overall: OverallAPI
  vital_signs: VitalSignsAPI
  sleep: SleepAPI
  emotion: EmotionAPI
  medication: MedicationAPI
  nutrition: NutritionAPI
  exercise: ExerciseAPI
  correlation: CorrelationAPI[]
  improvement_suggestions: ImprovementSuggestionAPI[]
}

/** API响应包装 */
export interface WeeklyReportResponseAPI {
  code: number
  msg: string
  data: WeeklyReportDataAPI
}

// ============================================
// Frontend Domain Models (前端领域模型)
// ============================================

/** 状态等级类型 */
export type StatusLevel = 'S' | 'A' | 'B' | 'C' | 'D'

/** 状态信息 */
export interface Status {
  level: StatusLevel
  label: string
  badge?: string
}

/** 周报领域模型 - 直接使用API数据结构，因为适配较少 */
export type WeeklyReportDomainModel = WeeklyReportDataAPI

/** 组合趋势图数据点 */
export interface CombinedTrendDataPoint {
  label: string
  date: string
  heartRate: number | null
  systolic: number | null
  diastolic: number | null
  bloodOxygen: number | null
  bloodGlucose: number | null
}
