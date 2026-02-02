/**
 * Token Validation Hook
 * 
 * 使用 globalStore 监听认证状态，提供 token 校验和自动重新登录功能
 * 简化逻辑，避免与 globalStore 的状态管理冲突
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { useAuthStore } from '@/stores'
import { authService, getTokenFromUrl } from '@/services/auth/authService'
import { TOKEN_CHECK_INTERVAL, IS_TEST_ENV } from '@/config/config'

interface UseTokenValidationOptions {
  /** Check interval in milliseconds */
  interval?: number
  /** Callback when token expires */
  onTokenExpired?: () => void
  /** Whether to auto re-login when token expires */
  autoReLogin?: boolean
}

interface TokenValidationState {
  isRefreshing: boolean
  lastChecked: number | null
}

/**
 * Hook to periodically validate token and handle expiration
 * 基于 globalStore 的认证状态，提供自动重新登录能力
 */
export function useTokenValidation(options: UseTokenValidationOptions = {}) {
  const {
    interval = TOKEN_CHECK_INTERVAL,
    onTokenExpired,
    autoReLogin = true,
  } = options

  const { isAuthenticated, accessToken } = useAuthStore()
  const [state, setState] = useState<TokenValidationState>({
    isRefreshing: false,
    lastChecked: null,
  })

  const isRefreshingRef = useRef(false)
  const prevAuthenticatedRef = useRef(isAuthenticated)

  // 检测登录状态变化
  useEffect(() => {
    const wasAuthenticated = prevAuthenticatedRef.current
    prevAuthenticatedRef.current = isAuthenticated

    // 从已认证变为未认证 = token 过期
    if (wasAuthenticated && !isAuthenticated && !isRefreshingRef.current) {
      console.log('[TokenValidation] Token expired, authentication lost')
      onTokenExpired?.()
    }
  }, [isAuthenticated, onTokenExpired])

  const attemptReLogin = useCallback(async () => {
    if (!IS_TEST_ENV || isRefreshingRef.current || isAuthenticated) {
      return
    }

    // URL 带有 token 时绝不触发默认账户 re-login，避免顶替 Android 登录状态
    if (getTokenFromUrl()) {
      return
    }

    const authData = authService.getAuthData()
    if (!authData || !authService.canRefresh()) {
      return
    }

    if (autoReLogin) {
      isRefreshingRef.current = true
      setState((prev) => ({ ...prev, isRefreshing: true }))

      try {
        console.log('[TokenValidation] Attempting auto re-login...')
        await authService.login()
        console.log('[TokenValidation] Re-login successful')
        setState({
          isRefreshing: false,
          lastChecked: Date.now(),
        })
      } catch (error) {
        console.error('[TokenValidation] Re-login failed:', error)
        authService.logout()
        setState({
          isRefreshing: false,
          lastChecked: Date.now(),
        })
      } finally {
        isRefreshingRef.current = false
      }
    }
  }, [autoReLogin, isAuthenticated])

  // 定期检查
  useEffect(() => {
    if (!IS_TEST_ENV) {
      return
    }

    const checkInterval = setInterval(() => {
      setState((prev) => ({ ...prev, lastChecked: Date.now() }))
      
      // 如果当前未认证且有历史登录数据，尝试重新登录
      if (!isAuthenticated) {
        attemptReLogin()
      }
    }, interval)

    return () => clearInterval(checkInterval)
  }, [interval, isAuthenticated, attemptReLogin])

  return {
    isExpired: !isAuthenticated,
    isRefreshing: state.isRefreshing,
    lastChecked: state.lastChecked,
    checkNow: attemptReLogin,
  }
}
