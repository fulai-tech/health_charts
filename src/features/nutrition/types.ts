/**
 * Nutrition Feature Data Types
 */

// ===== Backend API Response Types =====

/**
 * Backend API Response - Nutrition Status Item
 */
export interface BackendNutritionStatusItem {
  value: number
  target: number
  percentage: number
  status: '达标' | '不足' | '超标'
}

/**
 * Backend API Response - Main Cause Dish
 */
export interface BackendMainCauseDish {
  name: string
  calories: number
  frequency: number
  remark: string
}

/**
 * Backend API Response - Full Report Structure
 */
export interface BackendNutritionReport {
  category_evaluations: {
    macro_nutrients: string
    micro_nutrients: string
    dietary_components: string
  }
  comparison_with_last_week: {
    trend: string
    calories_change: number
    protein_change: number
  }
  data_analysis: string
  dietary_alerts: {
    over_intake_days: number
    main_cause_dishes: BackendMainCauseDish[]
  }
  dietary_insights: string[]
  meal_distribution: {
    breakfast: number
    lunch: number
    dinner: number
    snacks: number
  }
  nutrition_status: {
    能量: BackendNutritionStatusItem
    碳水化合物: BackendNutritionStatusItem
    蛋白质: BackendNutritionStatusItem
    脂肪: BackendNutritionStatusItem
    钙: BackendNutritionStatusItem
    铁: BackendNutritionStatusItem
    锌: BackendNutritionStatusItem
    钠: BackendNutritionStatusItem
    维生素C: BackendNutritionStatusItem
    维生素D: BackendNutritionStatusItem
    膳食纤维: BackendNutritionStatusItem
    嘌呤: BackendNutritionStatusItem
    [key: string]: BackendNutritionStatusItem // Index signature for dynamic keys
  }
  weekly_calories_overview: {
    target_daily_calories: number
    average_daily_calories: number
    difference: number
    evaluation: string
  }
  weekly_overview: {
    overall_trend: string
    anomaly_alert: string
  }
}

/**
 * Backend API Response - Full Structure
 */
export interface BackendNutritionResponse {
  code: number
  message: string
  data: {
    week_start_date: string
    week_end_date: string
    report: BackendNutritionReport
  }
}

// ===== Frontend Domain Types =====

export interface WeeklyManagementData {
  currentCal: number
  targetCal: number
  remainingCal: number
  percentage: number
  status: 'good' | 'warning' | 'alert'
}

export interface MetabolismTrendData {
  date: string
  value: number
  target: number
}

export interface NutrientStructureData {
  label: string
  current: number
  total: number
  unit: string
  color: string
}

export interface MicroElementData {
  name: string
  value: number
  unit: string
  status: 'low' | 'normal' | 'high'
  range: [number, number] // [min, max]
}

export interface RecipeData {
  id: string
  title: string
  calories: number
  imageUrl: string
  tags: string[]
}

export interface NutritionAnalysisData {
  score: number
  summary: string
  details: string[]
}

export interface NutritionWeeklySummary {
  overview: string | null
  highlights: string | null
  suggestions: string[]
}

export interface NutritionDomainModel {
  weeklyManagement: WeeklyManagementData
  metabolismTrend: MetabolismTrendData[]
  nutrientStructure: NutrientStructureData[]
  microElements: MicroElementData[]
  recipes: RecipeData[]
  analysis: NutritionAnalysisData
  weeklySummary: NutritionWeeklySummary
}
