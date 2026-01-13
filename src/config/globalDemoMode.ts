/**
 * Global Demo Mode Configuration
 * 
 * Controls whether the entire application uses real backend data or dummy data.
 * This is a global setting that affects all features.
 */

const GLOBAL_DEMO_MODE_KEY = 'global_demo_mode'

/**
 * Check if global demo mode is enabled
 * @returns true if demo mode is enabled, false otherwise
 */
export function isGlobalDemoModeEnabled(): boolean {
    try {
        const stored = localStorage.getItem(GLOBAL_DEMO_MODE_KEY)
        return stored === 'true'
    } catch (error) {
        console.warn('[Global Demo Mode] Failed to read from localStorage:', error)
        return false
    }
}

/**
 * Set global demo mode state
 * @param enabled - true to enable demo mode, false to disable
 */
export function setGlobalDemoMode(enabled: boolean): void {
    try {
        localStorage.setItem(GLOBAL_DEMO_MODE_KEY, String(enabled))
        console.log(`✅ [Global Demo Mode] ${enabled ? 'Enabled' : 'Disabled'}`)
    } catch (error) {
        console.error('[Global Demo Mode] Failed to set:', error)
    }
}

/**
 * Toggle global demo mode on/off
 * @returns new demo mode state
 */
export function toggleGlobalDemoMode(): boolean {
    const newState = !isGlobalDemoModeEnabled()
    setGlobalDemoMode(newState)
    return newState
}
