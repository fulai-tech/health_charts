import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryParams } from '@/hooks/useUrlParams'
import { globalStore, type Theme, type Language } from '@/stores'
import { authService } from '@/services/auth'

export interface InitPageOptions {
  i18n?: { changeLanguage: (lng: string) => void }
  /** 是否在没有 URL token 时尝试默认登录 */
  autoLogin?: boolean
}

/**
 * 页面初始化逻辑：从 URL 参数统一处理 token、theme、lang。
 * URL 参数优先级最高，会覆盖 localStorage 中的值并保存。
 * 只要传递了 ?token= 就按该 token 更新用户状态（先 logout 再 login Android），不触发默认账户登录。
 *
 * - token: 若有则先清空旧登录状态，再设置新 token（authService + globalStore 同步）
 * - theme: 若有且为 light/dark 则同步到 globalStore 并保存
 * - lang: 若有且为 en/zh 则同步到 globalStore 和 i18n 并保存
 */
export function initPage(params: Record<string, string>, options?: InitPageOptions): void {
  const hasUrlToken = Boolean(params.token)

  if (hasUrlToken) {
    console.log('🔐 [initPage] Token found in URL, setting auth state (Android)')
    authService.setTokenFromUrl(params.token)
    globalStore.setAuthFromUrl(params.token)
  }

  // 处理 theme（URL 优先，保存到 localStorage）
  const theme = params.theme as Theme | undefined
  if (theme === 'light' || theme === 'dark') {
    console.log(`🎨 [initPage] Theme found in URL: ${theme}`)
    globalStore.setTheme(theme)
  }

  // 处理 language（URL 优先，保存到 localStorage，同步到 i18n）
  const lang = params.lang as Language | undefined
  if (lang === 'en' || lang === 'zh') {
    console.log(`🌐 [initPage] Language found in URL: ${lang}`)
    globalStore.setLanguage(lang)
    if (options?.i18n) {
      options.i18n.changeLanguage(lang)
    }
  }

  // 默认登录：仅当 URL 没有 token 时才可能触发；有 token 时绝不触发默认账户登录
  const shouldAutoLogin = options?.autoLogin !== false
  if (shouldAutoLogin && !hasUrlToken) {
    authService.ensureAuthenticated().catch((error) => {
      console.error('[initPage] Auto login failed:', error)
    })
  }
}

/**
 * Hook：在任意页面挂载时执行一次 initPage，且 URL 变化时重新执行。
 * 使用 ref 记录已处理的参数，避免重复处理相同的 URL 参数。
 * 应在全局唯一处调用（如 App 内 InitPageRunner），保证所有路由都会经过且只随 URL 变化跑一次。
 */
export function useInitPage(): void {
  const params = useQueryParams()
  const { i18n } = useTranslation()
  const lastParamsRef = useRef<string>('')

  useEffect(() => {
    // 将参数序列化为字符串，用于比较是否变化
    const paramsKey = JSON.stringify(params)
    
    // 只有参数真正变化时才执行 initPage
    if (paramsKey !== lastParamsRef.current) {
      lastParamsRef.current = paramsKey
      initPage(params, { i18n, autoLogin: false })
    }
  }, [params, i18n])
}
