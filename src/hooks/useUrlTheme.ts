/**
 * URL Theme Configuration Hook
 * 
 * 从 URL 参数中获取主题配置，用于需要基于 URL 覆盖主题的场景
 * 与 globalStore 的主题管理配合使用
 */

import { useMemo } from 'react'
import { useUrlParam } from './useUrlParams'

export type ThemeMode = 'light' | 'dark'

export interface ThemeConfig {
  mode: ThemeMode
  /** Page background color */
  background: string
  /** Card background color */
  cardBackground: string
  /** Primary text color */
  textPrimary: string
  /** Secondary text color */
  textSecondary: string
  /** Border color */
  border: string
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeConfig> = {
  light: {
    mode: 'light',
    background: '#F1EFEE',
    cardBackground: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
  },
  dark: {
    mode: 'dark',
    background: '#0F172A',
    cardBackground: '#1E293B',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
  },
}

/**
 * Hook to get theme configuration from URL params
 * 
 * 用于需要根据 URL 参数临时覆盖主题的场景（如 widget 页面）
 * URL 参数优先级高于 globalStore，但不会影响 globalStore 的状态
 * 
 * Usage: /widget/type-1?theme=dark
 */
export function useUrlThemeConfig(): ThemeConfig {
  const urlTheme = useUrlParam('theme') as ThemeMode | undefined

  return useMemo(() => {
    if (urlTheme === 'dark') {
      return THEME_CONFIGS.dark
    }
    return THEME_CONFIGS.light
  }, [urlTheme])
}

/**
 * 获取 URL 中指定的主题模式
 */
export function useUrlThemeMode(): ThemeMode | null {
  const urlTheme = useUrlParam('theme') as ThemeMode | undefined
  return urlTheme === 'light' || urlTheme === 'dark' ? urlTheme : null
}