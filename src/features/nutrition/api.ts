/**
 * Nutrition Feature API
 */

import { useQuery } from '@tanstack/react-query'
import type { NutritionDomainModel, BackendNutritionResponse } from './types'
import { adaptNutritionData } from './adapter'
import { usePrefetchData, type DateRange } from '@/lib/usePrefetchData'

// Re-export DateRange for backwards compatibility
export type { DateRange }

// Demo Mode Toggle
const USE_DEMO = false // Set to false to use real backend API

// API Configuration for Nutrition (different from other indicators)
const API_BASE_URL = 'https://test.fulai.tech'
const NUTRITION_API_URL = `${API_BASE_URL}/ns/nutrition/calc/weekly_nutrition_report_app_new`
const API_TOKEN = 'sk-proj-VvBPGYkFpr0SFMfZJvwDfNwJV4N_hdx5'
const USER_ID = '69521a739c443012172f98b3'

/**
 * Fetch nutrition data from backend API
 * Uses specific nutrition endpoint with week_start_date and week_end_date
 */
async function fetchBackendNutritionData(weekStartDate: string, weekEndDate: string): Promise<BackendNutritionResponse | null> {
  // Skip backend request if in demo mode
  if (USE_DEMO) {
    console.log('[Nutrition API] Demo mode enabled, using mock data')
    return null
  }

  try {
    const response = await fetch(NUTRITION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        user_id: USER_ID,
        force_refresh: false,
        week_start_date: weekStartDate,
        week_end_date: weekEndDate
      })
    })

    if (!response.ok) {
      console.warn('[Nutrition API] Backend request failed:', response.status)
      return null
    }

    const data: BackendNutritionResponse = await response.json()
    console.log('[Nutrition API] Response:', data)

    if (data.code !== 200) {
      console.warn('[Nutrition API] Backend returned error code:', data.code)
      return null
    }

    return data
  } catch (error) {
    console.warn('[Nutrition API] Backend request error:', error)
    return null
  }
}

// Mock Data for fallback
const MOCK_DATA: NutritionDomainModel = {
  weeklyManagement: {
    currentCal: 33520,
    targetCal: 2350,
    remainingCal: 2350,
    percentage: 75,
    status: 'good'
  },
  metabolismTrend: [
    { date: 'Mon', value: 2050, target: 2000 },    // Goal - 达标
    { date: 'Tue', value: 2493, target: 2000 },    // Exceed - 超标
    { date: 'Wed', value: 1520, target: 2000 },    // Insufficient - 不足
    { date: 'Thu', value: 2680, target: 2000 },    // Exceed - 超标
    { date: 'Fri', value: 2380, target: 2000 },    // Exceed - 超标
    { date: 'Sat', value: 1850, target: 2000 },    // Insufficient - 不足
    { date: 'Sun', value: 1980, target: 2000 },    // Goal - 达标
  ],
  nutrientStructure: [
    { label: 'Carbs', current: 300, total: 350, unit: 'g', color: '#86EFAC' },    // Goal (85.7%)
    { label: 'Fat', current: 62.3, total: 50, unit: 'g', color: '#FB923D' },      // Exceed (124.6%)
    { label: 'Protein', current: 13, total: 65, unit: 'mg', color: '#93C5FD' },   // Insufficient (20%)
  ],
  microElements: [
    { name: 'Calcium (Ca)', value: 721, unit: 'mg', range: [800, 1200], status: 'low' },
    { name: 'Sodium (Na)', value: 2543, unit: 'mg', range: [1000, 2000], status: 'high' },
    { name: 'Iron (Fe)', value: 15, unit: 'mg', range: [10, 20], status: 'normal' },
    { name: 'Zinc (Zn)', value: 8, unit: 'mg', range: [10, 15], status: 'low' },
    { name: 'Vitamin A', value: 113, unit: 'μg', range: [600, 900], status: 'low' },
    { name: 'Vitamin C', value: 95, unit: 'mg', range: [60, 100], status: 'normal' },
    { name: 'Vitamin D', value: 22, unit: 'μg', range: [10, 20], status: 'high' },
    { name: 'Vitamin E', value: 18, unit: 'mg', range: [12, 20], status: 'normal' },
  ],
  recipes: [
    {
      id: '1',
      title: 'Grilled Salmon with Quinoa',
      calories: 485,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
      tags: ['High Protein', 'Omega-3', 'Dinner']
    },
    {
      id: '2',
      title: 'Mediterranean Salad Bowl',
      calories: 320,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
      tags: ['Healthy', 'Vegetarian', 'Lunch']
    },
    {
      id: '3',
      title: 'Chicken Stir-Fry',
      calories: 425,
      imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80',
      tags: ['High Protein', 'Low Carb', 'Dinner']
    },
  ],
  analysis: {
    score: 85,
    summary: 'Your diet structure is good, but you need to pay attention to Vitamin intake.',
    details: [
      'Fat intake is slightly high, consider reducing oil usage.',
      'Protein intake is good, keep it up.',
      'Micro-elements Calcium and Vitamin A are insufficient.',
      'Sodium levels are above the recommended range, try to reduce salt intake.',
      'Your carbohydrate intake is well balanced and within the healthy range.'
    ]
  },
  weeklySummary: {
    overview: 'Your nutritional intake this week has been generally balanced. Total calorie consumption fluctuated slightly but remained within the target range. Most macronutrient goals were met, with a slight variation in fat intake.',
    highlights: 'Analysis indicates consistent protein intake throughout the week. However, fat consumption exceeded recommended levels on the weekend. We suggest incorporating more vegetables to optimize micronutrient balance and offset calorie surplus.',
    suggestions: []
  }
}

/**
 * Query keys for nutrition data
 */
export const nutritionQueryKeys = {
  all: ['nutrition'] as const,
  detail: (dateRange?: DateRange) =>
    [...nutritionQueryKeys.all, 'detail', dateRange?.startDate, dateRange?.endDate] as const,
}

/**
 * Main fetch function that combines backend data with mock data
 */
export const fetchNutritionData = async (dateRange?: { start_date?: string, end_date?: string }): Promise<NutritionDomainModel> => {
  // Use start_date as week_start_date and end_date as week_end_date
  const weekStartDate = dateRange?.start_date || new Date().toISOString().split('T')[0]
  const weekEndDate = dateRange?.end_date || new Date().toISOString().split('T')[0]

  console.log('[Nutrition API] Fetching with week range:', weekStartDate, 'to', weekEndDate)

  // Try to fetch from backend
  const backendData = await fetchBackendNutritionData(weekStartDate, weekEndDate)

  // Use adapter to merge backend data with mock data
  return adaptNutritionData(backendData, MOCK_DATA)
}

/**
 * React Query hook for nutrition data
 */
export function useNutritionData(dateRange?: DateRange) {
  return useQuery({
    queryKey: nutritionQueryKeys.detail(dateRange),
    queryFn: async () => {
      const apiDateRange = dateRange
        ? { start_date: dateRange.startDate, end_date: dateRange.endDate }
        : undefined

      // fetchNutritionData already returns adapted data
      return await fetchNutritionData(apiDateRange)
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Prefetch hook for nutrition data
 */
export function usePrefetchNutritionData() {
  return usePrefetchData({
    featureName: 'Nutrition',
    queryKeyFn: nutritionQueryKeys.detail,
    fetchFn: (dateRange) => fetchNutritionData({
      start_date: dateRange.startDate,
      end_date: dateRange.endDate
    })
  })
}
