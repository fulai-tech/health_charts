/**
 * Demo Mode Configuration
 * 
 * Controls whether the healthy feature uses real backend data or dummy data.
 * When demo mode is enabled, all API calls will be bypassed and mock data will be used instead.
 */

const DEMO_MODE_KEY = 'healthy_demo_mode'

/**
 * Check if demo mode is enabled
 * @returns true if demo mode is enabled, false otherwise
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
 * When enabled, all API calls will return mock data
 */
export function enableDemoMode(): void {
    try {
        localStorage.setItem(DEMO_MODE_KEY, 'true')
        console.log('✅ [Demo Mode] Enabled - Using dummy data')
    } catch (error) {
        console.error('[Demo Mode] Failed to enable:', error)
    }
}

/**
 * Disable demo mode
 * When disabled, API calls will fetch real backend data
 */
export function disableDemoMode(): void {
    try {
        localStorage.setItem(DEMO_MODE_KEY, 'false')
        console.log('✅ [Demo Mode] Disabled - Using backend data')
    } catch (error) {
        console.error('[Demo Mode] Failed to disable:', error)
    }
}

/**
 * Toggle demo mode on/off
 * @returns new demo mode state
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
