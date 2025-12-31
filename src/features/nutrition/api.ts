/**
 * Nutrition Feature Mock API
 */

import type { NutritionDomainModel } from './types'

// Mock Data
const MOCK_DATA: NutritionDomainModel = {
  weeklyManagement: {
    currentCal: 4350,
    targetCal: 2350, // Daily avg target? Or weekly? Assuming weekly accumulation logic or similar usage
    remainingCal: 2350, // Just using numbers from screenshot: Center 2350, Left +4350, Right --
    percentage: 75,
    status: 'good'
  },
  metabolismTrend: [
    { date: 'Mon', value: 1800, target: 2000 },
    { date: 'Tue', value: 2100, target: 2000 },
    { date: 'Wed', value: 2200, target: 2000 },
    { date: 'Thu', value: 1700, target: 2000 },
    { date: 'Fri', value: 2400, target: 2000 },
    { date: 'Sat', value: 2300, target: 2000 },
    { date: 'Sun', value: 1900, target: 2000 },
  ],
  nutrientStructure: [
    { label: 'Carb', current: 300, total: 400, unit: 'g', color: '#86EFAC' }, // Green
    { label: 'Fat', current: 62.3, total: 80, unit: 'g', color: '#FB923D' }, // Orange
    { label: 'Protein', current: 130, total: 150, unit: 'g', color: '#93C5FD' }, // Blue
  ],
  microElements: [
    { name: 'Ca', value: 721, unit: 'mg', range: [800, 1200], status: 'low' },
    { name: 'Na', value: 1743, unit: 'mg', range: [1000, 2000], status: 'normal' },
    { name: 'Fe', value: 13, unit: 'mg', range: [10, 20], status: 'normal' },
    { name: 'Zn', value: 12, unit: 'g', range: [10, 15], status: 'normal' }, // Unit g/mg check later
    { name: 'Vitamin A', value: 113, unit: 'μg', range: [600, 900], status: 'low' },
    { name: 'Vitamin C', value: 9, unit: 'mg', range: [60, 100], status: 'low' },
  ],
  recipes: [
    {
      id: '1',
      title: 'Barbecue',
      calories: 334,
      imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80',
      tags: ['High Protein', 'Lunch']
    },
    {
      id: '2',
      title: 'Salmon Salad',
      calories: 250,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
      tags: ['Healthy', 'Dinner']
    },
  ],
  analysis: {
    score: 85,
    summary: 'Your diet structure is good, but you need to pay attention to Vitamin intake.',
    details: [
      'Carbohydrate intake is within the normal range.',
      'Fat intake is slightly high, consider reducing oil usage.',
      'Protein intake is good, keep it up.',
      'Micro-elements Calcium and Vitamin A are insufficient.'
    ]
  }
}

export const fetchNutritionData = async (): Promise<NutritionDomainModel> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_DATA)
    }, 500)
  })
}
