import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/auth'
import { useQueryParams } from '@/hooks/useUrlParams'

export interface InitPageOptions {
  i18n?: { changeLanguage: (lng: string) => void }
}

/**
 * 页面初始化逻辑：从 URL 参数统一处理 token、lang。
 * - token: 若有则视为新登录态，仅当与当前 token 不同时更新（不删 URL，下次仍从 URL 检查）
 * - lang: 若有且为 en/zh 则同步到 i18n
 * theme 仍由各组件通过 useThemeMode() 从 URL 读取，不在此“应用”。
 */
export function initPage(params: Record<string, string>, options?: InitPageOptions): void {
  if (params.token) {
    authService.setTokenFromUrl(params.token)
  }
  const lang = params.lang
  if (lang && (lang === 'en' || lang === 'zh') && options?.i18n) {
    options.i18n.changeLanguage(lang)
  }
}

/**
 * Hook：在任意页面挂载时执行一次 initPage，且 URL 变化时重新执行（不重复跑同一路由多次）。
 * 应在全局唯一处调用（如 App 内 InitPageRunner），保证所有路由都会经过且只随 URL 变化跑一次。
 */
export function useInitPage(): void {
  const params = useQueryParams()
  const { i18n } = useTranslation()

  useEffect(() => {
    initPage(params, { i18n })
  }, [params, i18n])
}
