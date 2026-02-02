/**
 * Healthy Daily Module Exports
 */

// Types
export * from './types'

// Adapter
export {
    adaptHealthyDailyData,
    generateHealthyDemoData,
    generatePlaceholderData,
    isDataEmpty,
} from './adapter'

// API helpers (actual request via @/services/api/dailyService)
export { isEmptyValue, hasIndicatorData } from './api'

// Demo Mode
export {
    isDemoModeEnabled,
    enableDemoMode,
    disableDemoMode,
    toggleDemoMode,
} from './demoMode'

// Components
export { StatBox } from './components/StatBox'
export { BloodPressureIndicatorCard } from './components/BloodPressureIndicatorCard'
export { HeartRateIndicatorCard } from './components/HeartRateIndicatorCard'
export { BloodGlucoseIndicatorCard } from './components/BloodGlucoseIndicatorCard'
export { BloodOxygenIndicatorCard } from './components/BloodOxygenIndicatorCard'
