/**
 * Demo Mode Configuration for Healthy Daily
 * 
 * Controls whether the healthy daily feature uses real backend data or dummy data.
 */

const DEMO_MODE_KEY = 'healthy_daily_demo_mode'

/**
 * Check if demo mode is enabled
 */
export function isDemoModeEnabled(): boolean {
    try {
        const stored = localStorage.getItem(DEMO_MODE_KEY)
        return stored === 'true'
    } catch (error) {
        console.warn('[Demo Mode] Failed to read from localStorage:', error)
        return false
    }
}

/**
 * Enable demo mode
 */
export function enableDemoMode(): void {
    try {
        localStorage.setItem(DEMO_MODE_KEY, 'true')
        console.log('✅ [Healthy Daily Demo Mode] Enabled - Using dummy data')
    } catch (error) {
        console.error('[Demo Mode] Failed to enable:', error)
    }
}

/**
 * Disable demo mode
 */
export function disableDemoMode(): void {
    try {
        localStorage.setItem(DEMO_MODE_KEY, 'false')
        console.log('✅ [Healthy Daily Demo Mode] Disabled - Using backend data')
    } catch (error) {
        console.error('[Demo Mode] Failed to disable:', error)
    }
}

/**
 * Toggle demo mode on/off
 */
export function toggleDemoMode(): boolean {
    const newState = !isDemoModeEnabled()
    if (newState) {
        enableDemoMode()
    } else {
        disableDemoMode()
    }
    return newState
}
