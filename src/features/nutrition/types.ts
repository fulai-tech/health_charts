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
 * Backend API Response - Main Cause Dish (Old format)
 */
export interface BackendMainCauseDish {
  name: string
  calories: number
  frequency: number
  remark: string
}

/**
 * Backend API Response - Main Cause Dish (New format)
 */
export interface BackendMainCauseDishNew {
  dish_name: string
  calories: number
  meal_type: string
  date: string
  remark: string
  image_url?: string
}

/**
 * Backend API Response - Daily Trend Chart Data Point
 */
export interface BackendNutritionTrendChartDataPoint {
  date: string
  label: string // e.g., "周一", "周二"
  value: number // Daily calories
  target?: number // Daily target calories
}

/**
 * Backend API Response - Trend Chart Data
 */
export interface BackendNutritionTrendChart {
  chart_data?: BackendNutritionTrendChartDataPoint[]
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
    trend?: string
    calories_change?: number
    protein_change?: number
    last_week_calories?: number
    this_week_calories?: number
    trend_analysis?: string
    main_cause_dishes?: BackendMainCauseDishNew[]
  }
  data_analysis: string | string[] // Can be string or array of strings
  dietary_alerts?: {
    over_intake_days: number
    main_cause_dishes: BackendMainCauseDish[]
  }
  dietary_insights?: string[]
  meal_distribution: {
    breakfast: number
    lunch: number
    dinner: number
    snacks: number
  }
  nutrition_status: {
    // Old format keys (without units)
    能量?: BackendNutritionStatusItem
    碳水化合物?: BackendNutritionStatusItem
    蛋白质?: BackendNutritionStatusItem
    脂肪?: BackendNutritionStatusItem
    钙?: BackendNutritionStatusItem
    铁?: BackendNutritionStatusItem
    锌?: BackendNutritionStatusItem
    钠?: BackendNutritionStatusItem
    维生素C?: BackendNutritionStatusItem
    维生素D?: BackendNutritionStatusItem
    膳食纤维?: BackendNutritionStatusItem
    嘌呤?: BackendNutritionStatusItem
    // New format keys (with units)
    '能量（千卡）'?: BackendNutritionStatusItem
    '碳水化合物(g)'?: BackendNutritionStatusItem
    '蛋白质(g)'?: BackendNutritionStatusItem
    '脂肪(g)'?: BackendNutritionStatusItem
    '钙(mg)'?: BackendNutritionStatusItem
    '铁(mg)'?: BackendNutritionStatusItem
    '锌(mg)'?: BackendNutritionStatusItem
    '钠(mg)'?: BackendNutritionStatusItem
    '维生素C(mg)'?: BackendNutritionStatusItem
    '维生素D(ug)'?: BackendNutritionStatusItem
    '膳食纤维(g)'?: BackendNutritionStatusItem
    '嘌呤(mg)'?: BackendNutritionStatusItem
    [key: string]: BackendNutritionStatusItem | undefined // Index signature for dynamic keys
  }
  weekly_calories_overview: {
    // Old format
    target_daily_calories?: number
    average_daily_calories?: number
    difference?: number
    evaluation?: string
    // New format
    daily_calories?: number[] // Array of 7 daily calorie values
    average_calories?: number
    target_calories?: number
    status?: string
  }
  weekly_overview: {
    overall_trend: string
    anomaly_alert: string
  }
  trend_chart?: BackendNutritionTrendChart
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
    // Also support trend_chart at data level (alternative structure)
    trend_chart?: BackendNutritionTrendChart
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

/**
 * Frontend Domain Type - Comparison Main Cause Dish
 * Adapted from BackendMainCauseDishNew
 */
export interface ComparisonDishData {
  dishName: string
  calories: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
  date: Date
  remark: string
  imageUrl?: string
}

/**
 * Frontend Domain Type - Weekly Comparison Data
 * For the "Compare with last week" card
 */
export interface WeeklyComparisonData {
  calorieChange: number
  lastWeekCalories: number
  thisWeekCalories: number
  trendAnalysis: string
  mainCauseDishes: ComparisonDishData[]
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

export interface CategoryEvaluations {
  macroNutrients: string | null
  microNutrients: string | null
  dietaryComponents: string | null
}

export interface DietaryComponentData {
  name: string
  value: number
  target: number
  unit: string
  status: 'low' | 'normal' | 'high'
}

export interface NutritionDomainModel {
  weeklyManagement: WeeklyManagementData
  metabolismTrend: MetabolismTrendData[]
  nutrientStructure: NutrientStructureData[]
  microElements: MicroElementData[]
  dietaryComponents: DietaryComponentData[]
  recipes: RecipeData[]
  analysis: NutritionAnalysisData
  weeklySummary: NutritionWeeklySummary
  categoryEvaluations: CategoryEvaluations
  weeklyComparison?: WeeklyComparisonData
}
