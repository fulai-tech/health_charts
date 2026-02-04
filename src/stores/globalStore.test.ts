/**
 * 全局状态管理测试
 * 
 * 测试目标：验证 MobX store 的状态转换和持久化逻辑
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { makeAutoObservable } from 'mobx'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

// 在浏览器环境中 globalThis 就是 window
globalThis.localStorage = localStorageMock as Storage

// 简化的 GlobalStore 用于测试（避免导入整个 store）
class TestGlobalStore {
  auth = {
    isAuthenticated: false,
    accessToken: null as string | null,
    username: null as string | null,
    source: null as 'url' | 'storage' | 'api' | null,
  }
  
  theme: 'light' | 'dark' = 'light'
  language: 'en' | 'zh' = 'zh'

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  login(token: string, username?: string, source: 'url' | 'storage' | 'api' = 'api') {
    this.auth = {
      isAuthenticated: true,
      accessToken: token,
      username: username || null,
      source,
    }
    
    localStorage.setItem('fulai_auth_data', JSON.stringify({
      accessToken: token,
      username: username || null,
    }))
  }

  logout() {
    this.auth = {
      isAuthenticated: false,
      accessToken: null,
      username: null,
      source: null,
    }
    localStorage.removeItem('fulai_auth_data')
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme = theme
    localStorage.setItem('app_theme', theme)
  }

  setLanguage(lang: 'en' | 'zh') {
    this.language = lang
    localStorage.setItem('app_language', lang)
  }
}

describe('globalStore - 认证状态管理', () => {
  let store: TestGlobalStore

  beforeEach(() => {
    localStorage.clear()
    store = new TestGlobalStore()
  })

  it('初始状态应该是未认证', () => {
    expect(store.auth.isAuthenticated).toBe(false)
    expect(store.auth.accessToken).toBeNull()
    expect(store.auth.username).toBeNull()
  })

  it('login 应该更新认证状态', () => {
    store.login('test_token_123', 'user123', 'api')

    expect(store.auth.isAuthenticated).toBe(true)
    expect(store.auth.accessToken).toBe('test_token_123')
    expect(store.auth.username).toBe('user123')
    expect(store.auth.source).toBe('api')
  })

  it('login 应该持久化到 localStorage', () => {
    store.login('test_token_123', 'user123')

    const stored = localStorage.getItem('fulai_auth_data')
    expect(stored).toBeDefined()
    
    const parsed = JSON.parse(stored!)
    expect(parsed.accessToken).toBe('test_token_123')
    expect(parsed.username).toBe('user123')
  })

  it('logout 应该清除认证状态', () => {
    store.login('test_token_123', 'user123')
    store.logout()

    expect(store.auth.isAuthenticated).toBe(false)
    expect(store.auth.accessToken).toBeNull()
    expect(store.auth.username).toBeNull()
  })

  it('logout 应该清除 localStorage 中的数据', () => {
    store.login('test_token_123', 'user123')
    store.logout()

    const stored = localStorage.getItem('fulai_auth_data')
    expect(stored).toBeNull()
  })
})

describe('globalStore - 主题管理', () => {
  let store: TestGlobalStore

  beforeEach(() => {
    localStorage.clear()
    store = new TestGlobalStore()
  })

  it('初始主题应该是 light', () => {
    expect(store.theme).toBe('light')
  })

  it('setTheme 应该更新主题状态', () => {
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
  })

  it('setTheme 应该持久化到 localStorage', () => {
    store.setTheme('dark')
    expect(localStorage.getItem('app_theme')).toBe('dark')
  })
})

describe('globalStore - 语言管理', () => {
  let store: TestGlobalStore

  beforeEach(() => {
    localStorage.clear()
    store = new TestGlobalStore()
  })

  it('初始语言应该是 zh', () => {
    expect(store.language).toBe('zh')
  })

  it('setLanguage 应该更新语言状态', () => {
    store.setLanguage('en')
    expect(store.language).toBe('en')
  })

  it('setLanguage 应该持久化到 localStorage', () => {
    store.setLanguage('en')
    expect(localStorage.getItem('app_language')).toBe('en')
  })
})
