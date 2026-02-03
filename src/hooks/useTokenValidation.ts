/**
 * Token validation hook: listens to auth store, handles expiry and optional auto re-login.
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

type ValidationPhase = 'idle' | 'refreshing' | 'expired_notified'

interface TokenValidationState {
  phase: ValidationPhase
  isRefreshing: boolean
  lastChecked: number | null
}

function normalizeOptions(
  options: UseTokenValidationOptions | undefined
): Required<Pick<UseTokenValidationOptions, 'interval' | 'autoReLogin'>> & Pick<UseTokenValidationOptions, 'onTokenExpired'> {
  const opts = options ?? {}
  const interval = typeof opts.interval === 'number' && opts.interval > 0
    ? opts.interval
    : TOKEN_CHECK_INTERVAL
  const autoReLogin = opts.autoReLogin !== false
  return { ...opts, interval, autoReLogin }
}

export function useTokenValidation(options: UseTokenValidationOptions = {}) {
  const { interval, onTokenExpired, autoReLogin } = normalizeOptions(options)

  const { isAuthenticated } = useAuthStore()
  const [state, setState] = useState<TokenValidationState>({
    phase: 'idle',
    isRefreshing: false,
    lastChecked: null,
  })

  const isRefreshingRef = useRef(false)
  const prevAuthenticatedRef = useRef(isAuthenticated)

  useEffect(() => {
    const wasAuthenticated = prevAuthenticatedRef.current
    prevAuthenticatedRef.current = isAuthenticated

    if (wasAuthenticated && !isAuthenticated && !isRefreshingRef.current) {
      console.log('[TokenValidation] Token expired, authentication lost')
      setState((prev) => (prev.phase === 'expired_notified' ? prev : { ...prev, phase: 'expired_notified' }))
      onTokenExpired?.()
    }
  }, [isAuthenticated, onTokenExpired])

  const attemptReLogin = useCallback(async () => {
    if (!IS_TEST_ENV) return
    if (isRefreshingRef.current) return
    if (isAuthenticated) return
    if (getTokenFromUrl()) return

    const authData = authService.getAuthData()
    if (!authData || !authService.canRefresh()) return

    setState((prev) => {
      if (prev.phase === 'refreshing') return prev
      return { ...prev, phase: 'refreshing', isRefreshing: true }
    })
    isRefreshingRef.current = true

    if (!autoReLogin) {
      isRefreshingRef.current = false
      setState((prev) => ({ ...prev, phase: 'idle', isRefreshing: false, lastChecked: Date.now() }))
      return
    }

    try {
      console.log('[TokenValidation] Attempting auto re-login...')
      await authService.login()
      console.log('[TokenValidation] Re-login successful')
      setState({
        phase: 'idle',
        isRefreshing: false,
        lastChecked: Date.now(),
      })
    } catch (error) {
      console.error('[TokenValidation] Re-login failed:', error)
      authService.logout()
      setState({
        phase: 'idle',
        isRefreshing: false,
        lastChecked: Date.now(),
      })
    } finally {
      isRefreshingRef.current = false
    }
  }, [autoReLogin, isAuthenticated])

  useEffect(() => {
    if (!IS_TEST_ENV) return
    const checkInterval = setInterval(() => {
      setState((prev) => ({ ...prev, lastChecked: Date.now() }))
      if (!isAuthenticated) attemptReLogin()
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
