/**
 * Demo Mode for Emotion Daily
 */

const DEMO_MODE_KEY = 'emotion_daily_demo_mode'

export function isDemoModeEnabled(): boolean {
    try {
        const stored = localStorage.getItem(DEMO_MODE_KEY)
        return stored === 'true'
    } catch {
        return false
    }
}

export function enableDemoMode(): void {
    try {
        localStorage.setItem(DEMO_MODE_KEY, 'true')
        console.log('✅ [Emotion Daily Demo Mode] Enabled')
    } catch (error) {
        console.error('[Demo Mode] Failed to enable:', error)
    }
}

export function disableDemoMode(): void {
    try {
        localStorage.setItem(DEMO_MODE_KEY, 'false')
        console.log('✅ [Emotion Daily Demo Mode] Disabled')
    } catch (error) {
        console.error('[Demo Mode] Failed to disable:', error)
    }
}

export function toggleDemoMode(): boolean {
    const newState = !isDemoModeEnabled()
    newState ? enableDemoMode() : disableDemoMode()
    return newState
}
