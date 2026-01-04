import { useSearchParams } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

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
  const [searchParams] = useSearchParams()
  const theme = searchParams.get('theme') as ThemeMode | null

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
 */
export function useUrlLanguage(): string {
  const [searchParams] = useSearchParams()
  const { i18n } = useTranslation()

  const lang = searchParams.get('lang')

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
