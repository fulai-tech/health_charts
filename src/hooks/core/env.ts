/**
 * Environment detection for development vs production.
 * Works in Vite (import.meta.env) and Node (process.env) without assuming process exists in browser.
 */
export function isDevelopment(): boolean {
  if (typeof import.meta !== 'undefined' && import.meta.env != null) {
    const env = import.meta.env as { DEV?: boolean; MODE?: string }
    return env.DEV === true || env.MODE === 'development'
  }
  try {
    const g = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {})
    const proc = (g as Record<string, unknown>).process as { env?: Record<string, string> } | undefined
    if (proc?.env) {
      return proc.env.NODE_ENV === 'development' || proc.env.MODE === 'development'
    }
  } catch {
    // process not available (e.g. browser without polyfill)
  }
  return false
}
