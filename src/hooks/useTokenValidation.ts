import { useEffect, useCallback, useRef, useState } from 'react'
import { authService } from '@/services/auth/authService'
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
  isExpired: boolean
  isRefreshing: boolean
  lastChecked: number | null
}

/**
 * Hook to periodically validate token and handle expiration
 * Automatically checks token validity and optionally re-logins
 */
export function useTokenValidation(options: UseTokenValidationOptions = {}) {
  const {
    interval = TOKEN_CHECK_INTERVAL,
    onTokenExpired,
    autoReLogin = true,
  } = options

  const [state, setState] = useState<TokenValidationState>({
    isExpired: false,
    isRefreshing: false,
    lastChecked: null,
  })

  const isRefreshingRef = useRef(false)

  const checkAndRefreshToken = useCallback(async () => {
    // Skip if not in test environment or already refreshing
    if (!IS_TEST_ENV || isRefreshingRef.current) {
      return
    }

    const authData = authService.getAuthData()
    
    // No auth data means not logged in, skip check
    if (!authData) {
      return
    }

    const isValid = authService.isAuthenticated()

    if (!isValid) {
      // Token expired
      console.log('[TokenValidation] Token expired')
      setState((prev) => ({ ...prev, isExpired: true }))
      onTokenExpired?.()

      if (autoReLogin && authService.canRefresh()) {
        // Try to re-login automatically
        isRefreshingRef.current = true
        setState((prev) => ({ ...prev, isRefreshing: true }))

        try {
          console.log('[TokenValidation] Auto re-login...')
          await authService.login()
          console.log('[TokenValidation] Re-login successful')
          setState({
            isExpired: false,
            isRefreshing: false,
            lastChecked: Date.now(),
          })
        } catch (error) {
          console.error('[TokenValidation] Re-login failed:', error)
          // Clear auth data on failure
          authService.logout()
          setState({
            isExpired: true,
            isRefreshing: false,
            lastChecked: Date.now(),
          })
        } finally {
          isRefreshingRef.current = false
        }
      }
    } else {
      setState({
        isExpired: false,
        isRefreshing: false,
        lastChecked: Date.now(),
      })
    }
  }, [autoReLogin, onTokenExpired])

  useEffect(() => {
    // Initial check
    checkAndRefreshToken()

    // Periodic check
    const intervalId = setInterval(checkAndRefreshToken, interval)

    return () => clearInterval(intervalId)
  }, [checkAndRefreshToken, interval])

  return {
    ...state,
    checkNow: checkAndRefreshToken,
  }
}
