/**
 * Demo Mode for Sleep Daily
 */

const DEMO_MODE_KEY = 'sleep_daily_demo_mode'

export function isDemoModeEnabled(): boolean {
    try {
        return localStorage.getItem(DEMO_MODE_KEY) === 'true'
    } catch {
        return false
    }
}

export function enableDemoMode(): void {
    try {
        localStorage.setItem(DEMO_MODE_KEY, 'true')
        console.log('✅ [Sleep Daily Demo Mode] Enabled')
    } catch (e) {
        console.error('[Demo Mode] Failed:', e)
    }
}

export function disableDemoMode(): void {
    try {
        localStorage.setItem(DEMO_MODE_KEY, 'false')
        console.log('✅ [Sleep Daily Demo Mode] Disabled')
    } catch (e) {
        console.error('[Demo Mode] Failed:', e)
    }
}

export function toggleDemoMode(): boolean {
    const newState = !isDemoModeEnabled()
    newState ? enableDemoMode() : disableDemoMode()
    return newState
}
