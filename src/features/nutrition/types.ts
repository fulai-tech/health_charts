/**
 * Nutrition Feature Data Types
 */

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
