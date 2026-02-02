import { useSearchParams } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * 统一的 URL Query 参数 Hook
 * 返回当前 URL 上所有 query 参数的键值对（只取每个 key 的第一个值）
 * 页面/组件应优先使用此 hook 再按需取具体参数，避免各处重复 useSearchParams().get('xxx')
 *
 * @example
 * const params = useQueryParams()
 * const rid = params.rid
 * const date = params.date
 * const theme = params.theme
 */
export function useQueryParams(): Record<string, string> {
  const [searchParams] = useSearchParams()
  return useMemo(() => {
    const record: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      record[key] = value
    })
    return record
  }, [searchParams])
}

/**
 * Theme modes: light or dark
 */
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

export const THEMES: Record<ThemeMode, ThemeConfig> = {
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
 * Hook to get theme mode from URL params
 * Usage: /details/blood-pressure?theme=light or ?theme=dark
 */
export function useThemeMode(): ThemeConfig {
  const params = useQueryParams()
  const theme = (params.theme as ThemeMode | undefined) ?? null

  return useMemo(() => {
    if (theme === 'dark') {
      return THEMES.dark
    }
    return THEMES.light
  }, [theme])
}

/**
 * Hook to handle language from URL params
 * Usage: /details/blood-pressure?lang=zh or ?lang=en
 * 实际“应用”由 initPage 统一做；这里仅返回当前语言供组件使用。
 */
export function useUrlLanguage(): string {
  const params = useQueryParams()
  const { i18n } = useTranslation()
  const lang = params.lang

  useEffect(() => {
    if (lang && (lang === 'en' || lang === 'zh')) {
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  return i18n.language
}

/**
 * Combined hook for theme and language
 * Usage: /details/blood-pressure?theme=dark&lang=zh
 */
export function useUrlConfig() {
  const themeConfig = useThemeMode()
  const language = useUrlLanguage()

  return {
    theme: themeConfig,
    language,
  }
}
