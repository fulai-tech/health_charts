/**
 * Hooks 统一导出
 * 
 * 按功能分类，便于管理和使用
 */

// ==================== URL & Navigation ====================
export { useQueryParams, useUrlParam, useUrlParams } from './useUrlParams'
export { useUrlThemeConfig, useUrlThemeMode, THEME_CONFIGS } from './useUrlTheme'
export { useWeekNavigation } from './useWeekNavigation'
export { useSwipeNavigation } from './useSwipeNavigation'

// ==================== Authentication & Validation ====================
export { useTokenValidation } from './useTokenValidation'

// ==================== UI & Interaction ====================
export { useTheme } from './useTheme'
export { useChartAnimation } from './useChartAnimation'
export { useHideTooltipOnScroll } from './useHideTooltipOnScroll'
export { useInViewport } from './useInViewport'

// ==================== Data & API ====================
export { 
  useHealthyDailyData, 
  useEmotionDailyData, 
  useSleepDailyData,
  dailyQueryKeys 
} from './useDailyData'

// ==================== Native Bridge ====================
export { useNativeBridge } from './useNativeBridge'

// ==================== Store Hooks ====================
// 这些来自 stores，为了统一导入而在此重新导出
export { 
  useAuthStore, 
  useThemeStore, 
  useLanguageStore, 
  useGlobalStore 
} from '@/stores'