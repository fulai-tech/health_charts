/**
 * Demo Mode Configuration for Emotion Feature
 * 
 * Controls whether the emotion feature uses real backend data or dummy data.
 * When demo mode is enabled, all API calls will be bypassed and mock data will be used instead.
 */

const DEMO_MODE_KEY = 'emotion_demo_mode'

/**
 * Check if demo mode is enabled for emotion feature
 * @returns true if demo mode is enabled, false otherwise
 */
export function isEmotionDemoModeEnabled(): boolean {
    try {
        const stored = localStorage.getItem(DEMO_MODE_KEY)
        return stored === 'true'
    } catch (error) {
        console.warn('[Emotion Demo Mode] Failed to read from localStorage:', error)
        return false
    }
}

/**
 * Enable emotion demo mode
 * When enabled, all API calls will return mock data
 */
export function enableEmotionDemoMode(): void {
    try {
        localStorage.setItem(DEMO_MODE_KEY, 'true')
        console.log('✅ [Emotion Demo Mode] Enabled - Using dummy data')
    } catch (error) {
        console.error('[Emotion Demo Mode] Failed to enable:', error)
    }
}

/**
 * Disable emotion demo mode
 * When disabled, API calls will fetch real backend data
 */
export function disableEmotionDemoMode(): void {
    try {
        localStorage.setItem(DEMO_MODE_KEY, 'false')
        console.log('✅ [Emotion Demo Mode] Disabled - Using backend data')
    } catch (error) {
        console.error('[Emotion Demo Mode] Failed to disable:', error)
    }
}

/**
 * Toggle emotion demo mode on/off
 * @returns new demo mode state
 */
export function toggleEmotionDemoMode(): boolean {
    const newState = !isEmotionDemoModeEnabled()
    if (newState) {
        enableEmotionDemoMode()
    } else {
        disableEmotionDemoMode()
    }
    return newState
}
