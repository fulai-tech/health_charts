/**
 * Nutrition Feature Adapter
 */

import type { NutritionDomainModel } from './types'

export const adaptNutritionData = (data: NutritionDomainModel): NutritionDomainModel => {
  // Pass through for now, can add transformation logic if API shape differs from Domain model
  return data
}
