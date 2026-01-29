/**
 * Healthy Feature - Data Adapter
 * Transforms API responses to frontend domain models
 */

import type {
  HealthyDomainModel,
  HealthScoreDataPoint,
  BPMiniDataPoint,
  HRMiniDataPoint,
  BloodSugarDataPoint,
  SpO2MiniDataPoint,
  SleepDataPoint,
  EmotionDataPoint,
  NutritionDataPoint,
  ApiHealthyResponse,
  ApiBPIndicator,
  ApiValueIndicator,
  ApiSleepIndicator,
  ApiEmotionIndicator,
  ApiNutritionIndicator,
  TrendDirection,
} from './types'

/**
 * Helper: Parse day label from date string (e.g., "2025-01-15" -> "Mon")
 */
function getDayLabel(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const date = new Date(dateStr)
  return days[date.getDay()] || dateStr
}

/**
 * Helper: Parse time label (e.g., "2025-01-15 10:30" -> "10:30")
 */
function getTimeLabel(timeStr: string): string {
  const parts = timeStr.split(' ')
  return parts[1] || timeStr
}

/**
 * Helper: Determine trend direction from change object
 */
function getTrend(change: { value: number; trend: string } | null): TrendDirection {
  if (!change) return 'stable'
  if (change.trend === 'up') return 'up'
  if (change.trend === 'down') return 'down'
  return 'stable'
}

/**
 * Transform API response to domain model
 * @param response - Raw API response from /trend-review/overview
 * @returns Transformed domain model for all components
 */
export function transformHealthyApiResponse(response: ApiHealthyResponse): HealthyDomainModel {
  const { overview, indicators } = response.data

  // Transform overview chart data - filter out null scores
  const healthScoreData: HealthScoreDataPoint[] = overview.chart_data
    .filter((item) => item.score !== null)
    .map((item) => ({
      day: item.label,
      score: item.score ?? 0,
      date: new Date(item.date),
    }))
  const healthScoreChartData = healthScoreData.length > 0 ? healthScoreData : undefined

  // Extract indicators by position
  const bpIndicator = indicators[0] as ApiBPIndicator
  const hrIndicator = indicators[1] as ApiValueIndicator
  const glucoseIndicator = indicators[2] as ApiValueIndicator
  const spo2Indicator = indicators[3] as ApiValueIndicator
  const sleepIndicator = indicators[4] as ApiSleepIndicator
  const emotionIndicator = indicators[5] as ApiEmotionIndicator
  const nutritionIndicator = indicators[6] as ApiNutritionIndicator

  // Transform blood pressure chart data
  const bpData: BPMiniDataPoint[] = bpIndicator?.chart?.map((item) => ({
    day: getTimeLabel(item.time),
    systolic: item.systolic,
    diastolic: item.diastolic,
  })) || []

  // Transform heart rate chart data
  const hrData: HRMiniDataPoint[] = hrIndicator?.chart?.map((item, idx) => ({
    x: idx,
    value: item.value,
  })) || []
  // If chart data is empty, set to undefined so component can use placeholder
  const hrChartData = hrData.length > 0 ? hrData : undefined

  // Transform blood sugar chart data
  const bloodSugarData: BloodSugarDataPoint[] = glucoseIndicator?.chart?.map((item, idx) => ({
    x: idx,
    value: item.value,
  })) || []
  const bloodSugarChartData = bloodSugarData.length > 0 ? bloodSugarData : undefined

  // Transform SpO2 chart data
  const spo2Data: SpO2MiniDataPoint[] = spo2Indicator?.chart?.map((item) => ({
    day: getTimeLabel(item.time),
    value: item.value,
  })) || []
  const spo2ChartData = spo2Data.length > 0 ? spo2Data : undefined

  // Transform sleep chart data
  const sleepData: SleepDataPoint[] = sleepIndicator?.chart_data?.map((item) => ({
    day: getDayLabel(item.date),
    hours: item.total_minutes / 60,
    quality: (item.deep_sleep_percent + item.rem_percent) * 100, // Deep + REM as quality
    deepPercent: item.deep_sleep_percent,
    lightPercent: item.light_sleep_percent,
    awakePercent: item.awake_percent,
    remPercent: item.rem_percent,
  })) || []
  const sleepChartData = sleepData.length > 0 ? sleepData : undefined

  // Transform emotion chart data
  const emotionData: EmotionDataPoint[] = emotionIndicator?.chart_data?.map((item) => ({
    day: getDayLabel(item.date),
    positive: item.positive,
    neutral: item.neutral,
    negative: item.negative,
  })) || []
  const emotionChartData = emotionData.length > 0 ? emotionData : undefined

  // Transform nutrition chart data
  const nutritionData: NutritionDataPoint[] = nutritionIndicator?.chart_data?.map((item, idx) => ({
    x: idx,
    value: item.value,
  })) || []
  const nutritionChartData = nutritionData.length > 0 ? nutritionData : undefined

  // Calculate average sleep time
  const avgSleepMinutes = sleepIndicator?.statistic?.average ?? 0
  const avgSleepHours = Math.floor(avgSleepMinutes / 60)
  const avgSleepMins = Math.round(avgSleepMinutes % 60)

  return {
    comprehensiveHealth: {
      chartData: healthScoreChartData,
      weeklyAverage: overview.average_score ?? 0,
      aiSummary: overview.ai_insight || '',
      targetScore: 60,
      trend: getTrend(bpIndicator?.change),
    },
    bloodPressure: {
      avgSystolic: bpIndicator?.avg?.systolic ?? 0,
      avgDiastolic: bpIndicator?.avg?.diastolic ?? 0,
      latestSystolic: bpIndicator?.latest?.systolic,
      latestDiastolic: bpIndicator?.latest?.diastolic,
      maxSystolic: bpIndicator?.max?.systolic,
      maxDiastolic: bpIndicator?.max?.diastolic,
      minSystolic: bpIndicator?.min?.systolic,
      minDiastolic: bpIndicator?.min?.diastolic,
      reference: bpIndicator?.reference,
      status: bpIndicator?.status,
      periodDescription: '12 weeks',
      chartData: bpData,
    },
    heartRate: {
      avgHeartRate: hrIndicator?.avg ?? 0,
      latestValue: hrIndicator?.latest,
      maxValue: hrIndicator?.max,
      minValue: hrIndicator?.min,
      reference: hrIndicator?.reference,
      status: hrIndicator?.status,
      periodDescription: '12 weeks',
      chartData: hrChartData,
      referenceLine: hrIndicator?.avg ?? 70,
    },
    bloodSugar: {
      poctValue: glucoseIndicator?.latest ?? 0,
      avgValue: glucoseIndicator?.avg,
      maxValue: glucoseIndicator?.max,
      minValue: glucoseIndicator?.min,
      reference: glucoseIndicator?.reference,
      status: glucoseIndicator?.status,
      unit: 'mmol/L',
      periodDescription: '12 weeks',
      chartData: bloodSugarChartData,
    },
    bloodOxygen: {
      avgSpO2: spo2Indicator?.avg ?? 0,
      latestValue: spo2Indicator?.latest,
      maxValue: spo2Indicator?.max,
      minValue: spo2Indicator?.min,
      reference: spo2Indicator?.reference,
      status: spo2Indicator?.status,
      periodDescription: '12 weeks',
      chartData: spo2ChartData,
      referenceLine: 95,
    },
    sleep: {
      avgSleepTime: { hours: avgSleepHours, minutes: avgSleepMins },
      label: sleepIndicator?.statistic?.label,
      periodDescription: '12 weeks',
      chartData: sleepChartData,
    },
    emotion: {
      dominantEmotion: 'positive',
      label: emotionIndicator?.statistic?.label,
      periodDescription: '12 weeks',
      chartData: emotionChartData,
    },
    nutrition: {
      avgValue: nutritionIndicator?.statistic?.average ?? 0,
      label: nutritionIndicator?.statistic?.label,
      unit: '/ minute',
      periodDescription: '12 weeks',
      chartData: nutritionChartData,
      referenceLine: 70,
    },
  }
}

/**
 * Generate mock data for demonstration/fallback
 */
export function generateMockHealthyData(): HealthyDomainModel {
  // Generate weekly health score data
  const healthScoreData: HealthScoreDataPoint[] = [
    { day: 'Mon', score: 52, date: new Date() },
    { day: 'Tue', score: 78, date: new Date() },
    { day: 'Wed', score: 48, date: new Date() },
    { day: 'Thu', score: 92, date: new Date() },
    { day: 'Fri', score: 68, date: new Date() },
    { day: 'Sat', score: 45, date: new Date() },
    { day: 'Sun', score: 28, date: new Date() },
  ]

  // Blood pressure mini chart data
  const bpData: BPMiniDataPoint[] = Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    systolic: 120 + Math.random() * 30,
    diastolic: 75 + Math.random() * 15,
  }))

  // Heart rate mini chart data - 12 points with larger variation
  const hrData: HRMiniDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
    x: i,
    value: 74 + Math.sin(i * 0.6) * 30 + Math.random() * 20,
  }))

  // Blood sugar data - 12 points with larger variation
  const bloodSugarData: BloodSugarDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
    x: i,
    value: 6.5 + Math.sin(i * 0.5) * 2.5 + Math.random() * 1.5,
  }))

  // SpO2 data - 12 points with larger variation
  const spo2Data: SpO2MiniDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
    day: `D${i + 1}`,
    value: 95 + Math.sin(i * 0.5) * 3 + Math.random() * 2,
  }))

  // Sleep data - 12 points with larger variation
  const sleepData: SleepDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
    day: `D${i + 1}`,
    hours: 7 + Math.sin(i * 0.4) * 2 + Math.random() * 1.5,
    quality: 65 + Math.sin(i * 0.4) * 20 + Math.random() * 15,
  }))

  // Emotion data - 12 points with larger variation
  const emotionData: EmotionDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
    day: `D${i + 1}`,
    positive: 35 + Math.sin(i * 0.5) * 25 + Math.random() * 15,
    neutral: 25 + Math.random() * 20,
    negative: 15 + Math.random() * 15,
  }))

  // Nutrition data - 12 points with larger variation
  const nutritionData: NutritionDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
    x: i,
    value: 75 + Math.sin(i * 0.4) * 25 + Math.random() * 20,
  }))

  return {
    comprehensiveHealth: {
      chartData: healthScoreData,
      weeklyAverage: 72,
      aiSummary: "This week's average score is 72. Your overall condition is steadily improving; please continue to maintain your normal routine.",
      targetScore: 60,
      trend: 'up',
    },
    bloodPressure: {
      avgSystolic: 136,
      avgDiastolic: 86,
      periodDescription: '12 weeks',
      chartData: bpData,
    },
    heartRate: {
      avgHeartRate: 74,
      periodDescription: '12 weeks',
      chartData: hrData,
      referenceLine: 70,
    },
    bloodSugar: {
      poctValue: 7.4,
      unit: 'mmol/L',
      periodDescription: '12 weeks',
      chartData: bloodSugarData,
    },
    bloodOxygen: {
      avgSpO2: 94.9,
      periodDescription: '12 weeks',
      chartData: spo2Data,
      referenceLine: 95,
    },
    sleep: {
      avgSleepTime: { hours: 7, minutes: 11 },
      periodDescription: '12 weeks',
      chartData: sleepData,
    },
    emotion: {
      dominantEmotion: 'positive',
      periodDescription: '12 weeks',
      chartData: emotionData,
    },
    nutrition: {
      avgValue: 74,
      unit: '/ minute',
      periodDescription: '12 weeks',
      chartData: nutritionData,
      referenceLine: 70,
    },
  }
}
