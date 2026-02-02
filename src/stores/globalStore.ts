/**
 * 全局状态管理 - MobX 版
 *
 * 管理：auth（登录状态）、theme（主题）、language（语言）
 * 使用 mobx + mobx-react-lite，与 localStorage 同步
 */

import { makeAutoObservable, runInAction } from 'mobx'

// ==================== Types ====================

export type Theme = 'light' | 'dark'
export type Language = 'en' | 'zh'

export interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  username: string | null
  /** 登录来源：'url' = 从 URL 参数登录, 'storage' = 从 localStorage 恢复, 'api' = API 登录 */
  source: 'url' | 'storage' | 'api' | null
}

export interface GlobalState {
  auth: AuthState
  theme: Theme
  language: Language
}

// ==================== Storage Keys ====================

const STORAGE_KEYS = {
  AUTH: 'fulai_auth_data',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
} as const

// ==================== Default State ====================

const getDefaultAuth = (): AuthState => ({
  isAuthenticated: false,
  accessToken: null,
  username: null,
  source: null,
})

// ==================== Global Store (MobX) ====================

class GlobalStore {
  auth: AuthState = getDefaultAuth()
  theme: Theme = 'light'
  language: Language = 'zh'

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.loadFromStorage()
    this.setupStorageListener()
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEYS.AUTH) this.syncAuthFromStorage()
      else if (e.key === STORAGE_KEYS.THEME) this.syncThemeFromStorage()
      else if (e.key === STORAGE_KEYS.LANGUAGE) this.syncLanguageFromStorage()
    })
  }

  private loadFromStorage(): void {
    try {
      const authData = localStorage.getItem(STORAGE_KEYS.AUTH)
      if (authData) {
        const parsed = JSON.parse(authData)
        if (parsed.accessToken) {
          runInAction(() => {
            this.auth = {
              isAuthenticated: true,
              accessToken: parsed.accessToken,
              username: parsed.username ?? parsed.user?.deviceId ?? null,
              source: 'storage',
            }
          })
        }
      }

      const theme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null
      if (theme === 'light' || theme === 'dark') {
        runInAction(() => { this.theme = theme })
      } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        runInAction(() => { this.theme = 'dark' })
      }

      const language = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language | null
      if (language === 'en' || language === 'zh') {
        runInAction(() => { this.language = language })
      }
    } catch (e) {
      console.error('[GlobalStore] Failed to load from storage:', e)
    }
  }

  /** 从 localStorage 同步认证状态（供 authService 写入后调用） */
  syncAuthFromStorage(): void {
    try {
      const authData = localStorage.getItem(STORAGE_KEYS.AUTH)
      if (authData) {
        const parsed = JSON.parse(authData)
        const newAccessToken = parsed.accessToken ?? null
        if (newAccessToken !== this.auth.accessToken) {
          runInAction(() => {
            this.auth = {
              isAuthenticated: !!newAccessToken,
              accessToken: newAccessToken,
              username: parsed.username ?? parsed.user?.deviceId ?? null,
              source: 'storage',
            }
          })
        }
      } else if (this.auth.isAuthenticated) {
        runInAction(() => {
          this.auth = getDefaultAuth()
        })
      }
    } catch {
      // ignore
    }
  }

  private syncThemeFromStorage(): void {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null
    if ((theme === 'light' || theme === 'dark') && theme !== this.theme) {
      runInAction(() => { this.theme = theme })
    }
  }

  private syncLanguageFromStorage(): void {
    const language = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language | null
    if ((language === 'en' || language === 'zh') && language !== this.language) {
      runInAction(() => { this.language = language })
    }
  }

  // ==================== Auth Actions ====================

  setAuthFromUrl(token: string): void {
    this.logout()
    const authData = {
      user: { id: 'android', type: 'device', deviceId: 'Android', permissions: [] as string[] },
      accessToken: token,
      refreshToken: token,
      accessTokenExpiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
      refreshTokenExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
      username: 'Android',
    }
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData))
    runInAction(() => {
      this.auth = {
        isAuthenticated: true,
        accessToken: token,
        username: 'Android',
        source: 'url',
      }
    })
  }

  setAuthFromApi(accessToken: string, username: string): void {
    runInAction(() => {
      this.auth = {
        isAuthenticated: true,
        accessToken,
        username,
        source: 'api',
      }
    })
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH)
    runInAction(() => {
      this.auth = getDefaultAuth()
    })
  }

  // ==================== Theme Actions ====================

  setTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    runInAction(() => { this.theme = theme })
  }

  toggleTheme(): Theme {
    const newTheme = this.theme === 'light' ? 'dark' : 'light'
    this.setTheme(newTheme)
    return newTheme
  }

  // ==================== Language Actions ====================

  setLanguage(language: Language): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language)
    runInAction(() => { this.language = language })
  }
}

// ==================== Singleton ====================

export const globalStore = new GlobalStore()

// ==================== React Hooks ====================
// 使用这些 hook 的组件需用 observer() 包裹，才能响应 store 变化

export function useGlobalStore(): GlobalState {
  return {
    auth: globalStore.auth,
    theme: globalStore.theme,
    language: globalStore.language,
  }
}

export function useAuthStore() {
  return {
    ...globalStore.auth,
    setAuthFromUrl: globalStore.setAuthFromUrl,
    setAuthFromApi: globalStore.setAuthFromApi,
    logout: globalStore.logout,
  }
}

export function useThemeStore() {
  return {
    theme: globalStore.theme,
    isDark: globalStore.theme === 'dark',
    setTheme: globalStore.setTheme,
    toggleTheme: globalStore.toggleTheme,
  }
}

export function useLanguageStore() {
  return {
    language: globalStore.language,
    setLanguage: globalStore.setLanguage,
  }
}
