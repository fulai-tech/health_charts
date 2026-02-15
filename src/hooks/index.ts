/**
 * Hooks barrel: URL, navigation, auth, UI, data, native bridge, stores.
 */

export * from './core'

export {
  useQueryParams,
  useUrlParam,
  useUrlParams,
  useUrlParamTyped,
  useUrlParamDate,
  useUrlParamNumber,
  useUrlParamBoolean,
  isKnownParamKey,
  type UrlParamParsed,
} from './useUrlParams'
export { useUrlThemeConfig, useUrlThemeMode, THEME_CONFIGS } from './useUrlTheme'
export { useWeekNavigation } from './useWeekNavigation'
export { useSwipeNavigation } from './useSwipeNavigation'

export { useTokenValidation } from './useTokenValidation'

export { useTheme } from './useTheme'
export { useChartAnimation } from './useChartAnimation'
export { useHideTooltipOnScroll } from './useHideTooltipOnScroll'
export { useInViewport } from './useInViewport'

export {
  useHealthyDailyData,
  useEmotionDailyData,
  useSleepDailyData,
  dailyQueryKeys,
} from './useDailyData'

export { useNativeBridge } from './useNativeBridge'

export {
  useAuthStore,
  useThemeStore,
  useLanguageStore,
  useGlobalStore,
} from '@/stores'

// Reactive orchestration layer (pipeline architecture)
export {
  useGuardChain,
  useProjection,
  useAutoProjection,
  useMultiProjection,
  useOrchestrator,
} from '@/lib/pipeline/hooks'

// Worker isolation layer (gRPC transport + mutex synchronization)
export {
  useWorkerBridge,
  useWorkerAuth,
  useWorkerStorage,
  useWorkerStorageValue,
  useWorkerPrefetch,
  useWorkerDiagnostics,
  useWorkerLock,
} from '@/lib/pipeline/worker'
