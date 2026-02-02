/**
 * Theme Hook
 * 
 * Manages application theme (light/dark mode).
 * 使用 globalStore 统一管理主题状态，确保响应式更新。
 */

import { useThemeStore } from '@/stores'

export type Theme = 'light' | 'dark'

/**
 * Theme management hook
 * 使用 globalStore 实现响应式订阅，状态变化时组件自动更新
 */
export function useTheme() {
    const { theme, isDark, setTheme, toggleTheme } = useThemeStore()

    return {
        theme,
        setTheme,
        toggleTheme,
        isDark,
    }
}
