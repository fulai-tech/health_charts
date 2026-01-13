/**
 * Theme Hook
 * 
 * Manages application theme (light/dark mode).
 * Persists theme preference to localStorage and applies it to the document.
 */

import { useState, useEffect, useCallback } from 'react'

const THEME_KEY = 'app_theme'

export type Theme = 'light' | 'dark'

/**
 * Get the current theme from localStorage or system preference
 */
function getInitialTheme(): Theme {
    try {
        const stored = localStorage.getItem(THEME_KEY) as Theme | null
        if (stored === 'light' || stored === 'dark') {
            return stored
        }
        // Fall back to system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark'
        }
    } catch (error) {
        console.warn('[Theme] Failed to read from localStorage:', error)
    }
    return 'light'
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme): void {
    const root = document.documentElement
    if (theme === 'dark') {
        root.classList.add('dark')
    } else {
        root.classList.remove('dark')
    }
}

/**
 * Theme management hook
 */
export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme)

    // Apply theme on mount and when it changes
    useEffect(() => {
        applyTheme(theme)
    }, [theme])

    // Set theme and persist to localStorage
    const setTheme = useCallback((newTheme: Theme) => {
        try {
            localStorage.setItem(THEME_KEY, newTheme)
            setThemeState(newTheme)
            console.log(`✅ [Theme] Set to ${newTheme}`)
        } catch (error) {
            console.error('[Theme] Failed to set:', error)
        }
    }, [])

    // Toggle between light and dark
    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        return newTheme
    }, [theme, setTheme])

    return {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
    }
}
