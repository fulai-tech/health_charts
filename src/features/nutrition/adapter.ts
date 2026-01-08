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
  NutritionAnalysisData,
  NutritionWeeklySummary
} from './types'

/**
 * Helper to get nutrition status from backend data safely
 * Supports both data.report.nutrition_status and data.nutrition_status
 */
function getNutritionStatus(backendData: BackendNutritionResponse | null) {
  if (!backendData?.data) return null
  return backendData.data.report?.nutrition_status || (backendData.data as any).nutrition_status
}

/**
 * Convert backend nutrition status to WeeklyManagementData
 */
function adaptWeeklyManagement(backendData: BackendNutritionResponse | null, mockData: WeeklyManagementData): WeeklyManagementData {
  const ns = getNutritionStatus(backendData)
  if (!ns?.能量) {
    return mockData
  }

  const energyData = ns.能量
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
    remainingCal: Math.round(targetCal - currentCal),
    percentage: Math.round(percentage),
    status
  }
}

/**
 * Convert backend data to MetabolismTrendData
 * Note: Backend doesn't provide daily breakdown, so we use mock data
 */
function adaptMetabolismTrend(backendData: BackendNutritionResponse | null, mockData: MetabolismTrendData[]): MetabolismTrendData[] {
  // Backend doesn't provide daily trend data, use mock
  return mockData
}

/**
 * Convert backend nutrition_status to NutrientStructureData
 */
function adaptNutrientStructure(backendData: BackendNutritionResponse | null, mockData: NutrientStructureData[]): NutrientStructureData[] {
  const ns = getNutritionStatus(backendData)
  if (!ns) {
    return mockData
  }

  const nutrients: NutrientStructureData[] = []

  // Carbs (碳水化合物)
  if (ns.碳水化合物) {
    nutrients.push({
      label: 'Carbs',
      current: Math.round(ns.碳水化合物.value * 10) / 10,
      total: ns.碳水化合物.target,
      unit: 'g',
      color: '#86EFAC'
    })
  }

  // Fat (脂肪)
  if (ns.脂肪) {
    nutrients.push({
      label: 'Fat',
      current: Math.round(ns.脂肪.value * 10) / 10,
      total: ns.脂肪.target,
      unit: 'g',
      color: '#FB923D'
    })
  }

  // Protein (蛋白质)
  if (ns.蛋白质) {
    nutrients.push({
      label: 'Protein',
      current: Math.round(ns.蛋白质.value * 10) / 10,
      total: ns.蛋白质.target,
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
  const microElementMap: Array<{ key: string; name: string; unit: string }> = [
    { key: '钙', name: 'Calcium (Ca)', unit: 'mg' },
    { key: '钠', name: 'Sodium (Na)', unit: 'mg' },
    { key: '铁', name: 'Iron (Fe)', unit: 'mg' },
    { key: '锌', name: 'Zinc (Zn)', unit: 'mg' },
    { key: '维生素C', name: 'Vitamin C', unit: 'mg' },
    { key: '维生素D', name: 'Vitamin D', unit: 'μg' },
  ]

  microElementMap.forEach(({ key, name, unit }) => {
    const item = ns[key]
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
 * Convert backend data to NutritionAnalysisData
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
    const normalCount = statusItems.filter((item: any) => item.status === '达标').length
    const totalCount = statusItems.length
    score = Math.round((normalCount / totalCount) * 100)
  }

  // Handle report-level fields which might also be directly under data now
  const dataAnalysis = report?.data_analysis || (backendData.data as any).data_analysis
  const dietaryInsights = report?.dietary_insights || (backendData.data as any).dietary_insights
  const categoryEvaluations = report?.category_evaluations || (backendData.data as any).category_evaluations

  // Use data_analysis as summary
  const summary = dataAnalysis || mockData.summary

  // Combine dietary_insights with category_evaluations
  const details: string[] = []

  if (dietaryInsights && dietaryInsights.length > 0) {
    details.push(...dietaryInsights)
  }

  if (categoryEvaluations) {
    if (categoryEvaluations.macro_nutrients) {
      details.push(categoryEvaluations.macro_nutrients)
    }
    if (categoryEvaluations.micro_nutrients) {
      details.push(categoryEvaluations.micro_nutrients)
    }
    if (categoryEvaluations.dietary_components) {
      details.push(categoryEvaluations.dietary_components)
    }
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
  const weeklySummary = (backendData?.data as any)?.weekly_summary
  if (weeklySummary) {
    return {
      overview: weeklySummary.overview || mockData.overview,
      highlights: weeklySummary.highlights || mockData.highlights,
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
    recipes: mockData.recipes, // Backend doesn't provide recipes, always use mock
    analysis: adaptAnalysis(backendData, mockData.analysis),
    weeklySummary: adaptWeeklySummary(backendData, mockData.weeklySummary)
  }
}
