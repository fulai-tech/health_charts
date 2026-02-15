/**
 * Nutrition Feature Adapter
 * 
 * This adapter merges backend API data with mock data to ensure components always have 
 * complete data to display, even when backend doesn't provide all required fields.
 */

import type {
  NutritionDomainModel,
  BackendNutritionResponse,
  WeeklyManagementData,
  MetabolismTrendData,
  NutrientStructureData,
  MicroElementData,
  DietaryComponentData,
  NutritionAnalysisData,
  NutritionWeeklySummary,
  CategoryEvaluations,
  WeeklyComparisonData,
  ComparisonDishData
} from './types'
// dateUtils imports removed - WEEKDAY_LABEL_MAP and getCurrentWeekDateRange were unused

/**
 * Helper to get nutrition status from backend data safely
 * Supports both data.report.nutrition_status and data.nutrition_status
 */
function getNutritionStatus(backendData: BackendNutritionResponse | null) {
  if (!backendData?.data) return null
  return backendData.data.report?.nutrition_status || (backendData.data as Record<string, unknown>).nutrition_status
}

/**
 * Convert backend nutrition status to WeeklyManagementData
 * Supports both old format (能量) and new format (能量（千卡）)
 */
function adaptWeeklyManagement(backendData: BackendNutritionResponse | null, mockData: WeeklyManagementData): WeeklyManagementData {
  if (!backendData?.data?.report) {
    return mockData
  }

  const report = backendData.data.report
  const caloriesOverview = report.weekly_calories_overview
  const ns = getNutritionStatus(backendData)

  // Try new format first: use weekly_calories_overview
  if (caloriesOverview?.average_calories && caloriesOverview?.target_calories) {
    const currentCal = caloriesOverview.average_calories
    const targetCal = caloriesOverview.target_calories
    const percentage = Math.round((currentCal / targetCal) * 100)

    // Determine status based on percentage
    let status: 'good' | 'warning' | 'alert' = 'good'
    if (percentage < 80) {
      status = 'warning'
    } else if (percentage > 120) {
      status = 'alert'
    }

    return {
      currentCal: Math.round(currentCal),
      targetCal: Math.round(targetCal),
      remainingCal: Math.round(currentCal - targetCal), // Note: positive means over target
      percentage,
      status
    }
  }

  // Fallback to nutrition_status (support both old and new key formats)
  const energyData = ns?.['能量（千卡）'] || ns?.能量
  if (!energyData) {
    return mockData
  }

  const currentCal = energyData.value
  const targetCal = energyData.target
  const percentage = energyData.percentage

  // Determine status based on percentage
  let status: 'good' | 'warning' | 'alert' = 'good'
  if (percentage < 80) {
    status = 'warning'
  } else if (percentage > 120) {
    status = 'alert'
  }

  return {
    currentCal: Math.round(currentCal),
    targetCal: Math.round(targetCal),
    remainingCal: Math.round(currentCal - targetCal), // Note: positive means over target
    percentage: Math.round(percentage),
    status
  }
}

/**
 * Map Chinese weekday labels to English abbreviations
 */
const WEEKDAY_ABBR_MAP: Record<string, string> = {
  周一: 'Mon',
  周二: 'Tue',
  周三: 'Wed',
  周四: 'Thu',
  周五: 'Fri',
  周六: 'Sat',
  周日: 'Sun',
}

/**
 * Convert backend data to MetabolismTrendData
 * Extracts daily trend data from backend if available, otherwise uses mock data
 * Supports both new format (daily_calories array) and old format (trend_chart)
 */
function adaptMetabolismTrend(backendData: BackendNutritionResponse | null, mockData: MetabolismTrendData[]): MetabolismTrendData[] {
  if (!backendData?.data?.report) {
    return mockData
  }

  const report = backendData.data.report
  const caloriesOverview = report.weekly_calories_overview

  // Try new format first: use daily_calories array
  if (caloriesOverview?.daily_calories && caloriesOverview.daily_calories.length === 7) {
    const targetCal = caloriesOverview.target_calories || 2000
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const trendData: MetabolismTrendData[] = caloriesOverview.daily_calories.map((value, index) => ({
      date: weekdays[index],
      value: Math.round(value),
      target: Math.round(targetCal)
    }))

    console.log('[Nutrition Adapter] Successfully extracted trend data from daily_calories array:', trendData)
    return trendData
  }

  // Fallback to old format: try trend_chart
  const trendChart = backendData.data.trend_chart || report.trend_chart
  const chartData = trendChart?.chart_data

  if (chartData && chartData.length > 0) {
    // Get target calories from weekly_calories_overview or nutrition_status
    const targetCal = caloriesOverview?.target_daily_calories
      || caloriesOverview?.target_calories
      || report.nutrition_status?.['能量（千卡）']?.target
      || report.nutrition_status?.能量?.target
      || 2000 // Default target

    // Transform backend chart data to frontend format
    const trendData: MetabolismTrendData[] = chartData.map((point) => {
      // Convert Chinese weekday label to English abbreviation
      const dateLabel = WEEKDAY_ABBR_MAP[point.label] || point.label

      return {
        date: dateLabel,
        value: Math.round(point.value),
        target: point.target || Math.round(targetCal)
      }
    })

    if (trendData.length > 0) {
      console.log('[Nutrition Adapter] Successfully extracted trend data from trend_chart:', trendData)
      return trendData
    }
  }

  console.log('[Nutrition Adapter] No trend data found, using mock data')
  return mockData
}

/**
 * Convert backend nutrition_status to NutrientStructureData
 * Supports both old format (without units) and new format (with units)
 */
function adaptNutrientStructure(backendData: BackendNutritionResponse | null, mockData: NutrientStructureData[]): NutrientStructureData[] {
  const ns = getNutritionStatus(backendData)
  if (!ns) {
    return mockData
  }

  const nutrients: NutrientStructureData[] = []

  // Carbs (碳水化合物) - try new format first, then old format
  const carbs = ns['碳水化合物(g)'] || ns.碳水化合物
  if (carbs) {
    nutrients.push({
      label: 'Carbs',
      current: Math.round(carbs.value * 10) / 10,
      total: carbs.target,
      unit: 'g',
      color: '#86EFAC'
    })
  }

  // Fat (脂肪) - try new format first, then old format
  const fat = ns['脂肪(g)'] || ns.脂肪
  if (fat) {
    nutrients.push({
      label: 'Fat',
      current: Math.round(fat.value * 10) / 10,
      total: fat.target,
      unit: 'g',
      color: '#FB923D'
    })
  }

  // Protein (蛋白质) - try new format first, then old format
  const protein = ns['蛋白质(g)'] || ns.蛋白质
  if (protein) {
    nutrients.push({
      label: 'Protein',
      current: Math.round(protein.value * 10) / 10,
      total: protein.target,
      unit: 'g',
      color: '#93C5FD'
    })
  }

  // If backend doesn't provide all, use mock as fallback
  return nutrients.length === 3 ? nutrients : mockData
}

/**
 * Convert backend nutrition_status to MicroElementData
 */
function adaptMicroElements(backendData: BackendNutritionResponse | null, mockData: MicroElementData[]): MicroElementData[] {
  const ns = getNutritionStatus(backendData)
  if (!ns) {
    return mockData
  }

  const elements: MicroElementData[] = []

  // Mapping of backend keys to display names
  // Try new format (with units) first, then old format (without units)
  const microElementMap: Array<{ newKey: string; oldKey: string; name: string; unit: string }> = [
    { newKey: '钙(mg)', oldKey: '钙', name: 'Calcium (Ca)', unit: 'mg' },
    { newKey: '钠(mg)', oldKey: '钠', name: 'Sodium (Na)', unit: 'mg' },
    { newKey: '铁(mg)', oldKey: '铁', name: 'Iron (Fe)', unit: 'mg' },
    { newKey: '锌(mg)', oldKey: '锌', name: 'Zinc (Zn)', unit: 'mg' },
    { newKey: '维生素C(mg)', oldKey: '维生素C', name: 'Vitamin C', unit: 'mg' },
    { newKey: '维生素D(ug)', oldKey: '维生素D', name: 'Vitamin D', unit: 'μg' },
  ]

  microElementMap.forEach(({ newKey, oldKey, name, unit }) => {
    // Try new format first, then old format
    const item = ns[newKey] || ns[oldKey]
    if (item) {
      // Convert status from Chinese to English
      let status: 'low' | 'normal' | 'high' = 'normal'
      if (item.status === '不足') {
        status = 'low'
      } else if (item.status === '超标') {
        status = 'high'
      }

      // Calculate range based on target and percentage
      const minRange = item.target * 0.8
      const maxRange = item.target * 1.2

      elements.push({
        name,
        value: Math.round(item.value * 10) / 10,
        unit,
        range: [Math.round(minRange), Math.round(maxRange)],
        status
      })
    }
  })

  // If backend doesn't provide enough data, use mock as fallback
  return elements.length >= 4 ? elements : mockData
}

/**
 * Convert backend nutrition_status to DietaryComponentData
 * Extracts dietary fiber (膳食纤维) and purine (嘌呤) data
 */
function adaptDietaryComponents(backendData: BackendNutritionResponse | null, mockData: DietaryComponentData[]): DietaryComponentData[] {
  const ns = getNutritionStatus(backendData)
  if (!ns) {
    return mockData
  }

  const components: DietaryComponentData[] = []

  // Mapping of backend keys to display names
  const dietaryComponentMap: Array<{ newKey: string; oldKey: string; name: string; unit: string }> = [
    { newKey: '膳食纤维(g)', oldKey: '膳食纤维', name: 'Dietary fiber', unit: 'g' },
    { newKey: '嘌呤(mg)', oldKey: '嘌呤', name: 'Purine', unit: 'mg' },
  ]

  dietaryComponentMap.forEach(({ newKey, oldKey, name, unit }) => {
    // Try new format first, then old format
    const item = ns[newKey] || ns[oldKey]
    if (item) {
      // Convert status from Chinese to English
      let status: 'low' | 'normal' | 'high' = 'normal'
      if (item.status === '不足') {
        status = 'low'
      } else if (item.status === '超标') {
        status = 'high'
      }

      components.push({
        name,
        value: Math.round(item.value * 10) / 10,
        target: item.target,
        unit,
        status
      })
    }
  })

  // If backend doesn't provide data, use mock as fallback
  return components.length > 0 ? components : mockData
}

/**
 * Convert backend data to NutritionAnalysisData
 * Only uses data_analysis field - category_evaluations are displayed separately
 */
function adaptAnalysis(backendData: BackendNutritionResponse | null, mockData: NutritionAnalysisData): NutritionAnalysisData {
  if (!backendData?.data) {
    return mockData
  }

  const report = backendData.data.report

  // Calculate score based on nutrition status
  let score = 85 // Default score
  const ns = getNutritionStatus(backendData)

  if (ns) {
    const statusItems = Object.values(ns as object)
    const normalCount = statusItems.filter((item: Record<string, unknown>) => item.status === '达标').length
    const totalCount = statusItems.length
    score = Math.round((normalCount / totalCount) * 100)
  }

  // Handle report-level fields which might also be directly under data now
  const dataAnalysis = report?.data_analysis || (backendData.data as Record<string, unknown>).data_analysis

  // Use data_analysis as summary (can be string or array)
  let summary: string = mockData.summary
  if (typeof dataAnalysis === 'string') {
    summary = dataAnalysis
  } else if (Array.isArray(dataAnalysis) && dataAnalysis.length > 0) {
    // Use first item as summary if it's an array
    summary = dataAnalysis[0]
  }

  // Only use data_analysis for details (category_evaluations are shown separately in element cards)
  const details: string[] = []

  // If data_analysis is an array, use all items as details
  if (Array.isArray(dataAnalysis) && dataAnalysis.length > 0) {
    details.push(...dataAnalysis)
  } else if (typeof dataAnalysis === 'string') {
    details.push(dataAnalysis)
  }

  // If no details, use mock
  if (details.length === 0) {
    return mockData
  }

  return {
    score,
    summary,
    details
  }
}

/**
 * Convert backend data to NutritionWeeklySummary
 * Uses new backend format with weekly_summary.overview, weekly_summary.highlights
 * Ignores backend suggestions as per requirement
 */
function adaptWeeklySummary(backendData: BackendNutritionResponse | null, mockData: NutritionWeeklySummary): NutritionWeeklySummary {
  // Try new backend format first (weekly_summary.overview, weekly_summary.highlights)
  const weeklySummary = (backendData?.data as Record<string, unknown>)?.weekly_summary as Record<string, unknown> | undefined
  if (weeklySummary) {
    return {
      overview: (weeklySummary.overview as string) || mockData.overview,
      highlights: (weeklySummary.highlights as string) || mockData.highlights,
      // Ignore backend suggestions as per requirement
      suggestions: []
    }
  }

  // Fallback to old backend format (report.weekly_overview)
  if (!backendData?.data?.report?.weekly_overview) {
    return mockData
  }

  const weeklyOverview = backendData.data.report.weekly_overview
  const caloriesOverview = backendData.data.report.weekly_calories_overview

  return {
    overview: weeklyOverview.overall_trend || mockData.overview,
    highlights: weeklyOverview.anomaly_alert || caloriesOverview?.evaluation || mockData.highlights,
    // Ignore backend suggestions as per requirement
    suggestions: []
  }
}

/**
 * Convert backend category_evaluations to CategoryEvaluations
 */
function adaptCategoryEvaluations(backendData: BackendNutritionResponse | null): CategoryEvaluations {
  const defaultEvaluations: CategoryEvaluations = {
    macroNutrients: null,
    microNutrients: null,
    dietaryComponents: null
  }

  if (!backendData?.data) {
    return defaultEvaluations
  }

  const report = backendData.data.report
  const categoryEvaluations = report?.category_evaluations || (backendData.data as Record<string, unknown>).category_evaluations

  if (!categoryEvaluations) {
    return defaultEvaluations
  }

  return {
    macroNutrients: categoryEvaluations.macro_nutrients || null,
    microNutrients: categoryEvaluations.micro_nutrients || null,
    dietaryComponents: categoryEvaluations.dietary_components || null
  }
}

/**
 * Map Chinese meal type to frontend enum
 */
const MEAL_TYPE_MAP: Record<string, 'breakfast' | 'lunch' | 'dinner' | 'snacks'> = {
  '早餐': 'breakfast',
  '午餐': 'lunch',
  '晚餐': 'dinner',
  '加餐': 'snacks',
  '零食': 'snacks',
}

/**
 * Convert backend comparison_with_last_week to WeeklyComparisonData
 */
function adaptWeeklyComparison(backendData: BackendNutritionResponse | null): WeeklyComparisonData | undefined {
  if (!backendData?.data?.report?.comparison_with_last_week) {
    return undefined
  }

  const comparison = backendData.data.report.comparison_with_last_week

  // Check if we have the required fields
  if (
    comparison.last_week_calories === undefined ||
    comparison.this_week_calories === undefined
  ) {
    return undefined
  }

  // Adapt main cause dishes
  const mainCauseDishes: ComparisonDishData[] = []
  if (comparison.main_cause_dishes && comparison.main_cause_dishes.length > 0) {
    comparison.main_cause_dishes.forEach((dish) => {
      mainCauseDishes.push({
        dishName: dish.dish_name,
        calories: dish.calories,
        mealType: MEAL_TYPE_MAP[dish.meal_type] || 'dinner',
        date: new Date(dish.date),
        remark: dish.remark,
        imageUrl: dish.image_url
      })
    })
  }

  return {
    calorieChange: comparison.calories_change ?? (comparison.this_week_calories - comparison.last_week_calories),
    lastWeekCalories: comparison.last_week_calories,
    thisWeekCalories: comparison.this_week_calories,
    trendAnalysis: comparison.trend_analysis || '',
    mainCauseDishes
  }
}

/**
 * Main adapter function
 * Merges backend data with mock data to ensure complete NutritionDomainModel
 */
export const adaptNutritionData = (
  backendData: BackendNutritionResponse | null,
  mockData: NutritionDomainModel
): NutritionDomainModel => {
  console.log('[Nutrition Adapter] Data received:', backendData)

  return {
    weeklyManagement: adaptWeeklyManagement(backendData, mockData.weeklyManagement),
    metabolismTrend: adaptMetabolismTrend(backendData, mockData.metabolismTrend),
    nutrientStructure: adaptNutrientStructure(backendData, mockData.nutrientStructure),
    microElements: adaptMicroElements(backendData, mockData.microElements),
    dietaryComponents: adaptDietaryComponents(backendData, mockData.dietaryComponents),
    recipes: mockData.recipes, // Backend doesn't provide recipes, always use mock
    analysis: adaptAnalysis(backendData, mockData.analysis),
    weeklySummary: adaptWeeklySummary(backendData, mockData.weeklySummary),
    categoryEvaluations: adaptCategoryEvaluations(backendData),
    weeklyComparison: adaptWeeklyComparison(backendData)
  }
}
