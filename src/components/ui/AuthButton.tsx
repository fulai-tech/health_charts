import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { authService } from '@/services/auth/authService'
import { IS_TEST_ENV, TOKEN_CHECK_INTERVAL } from '@/config/config'
import { LoginDialog } from './LoginDialog'

/**
 * AuthButton - Authentication button component
 * Shows login button when not authenticated
 * Shows user dropdown with logout when authenticated
 * Only visible in test environment
 */
export function AuthButton() {
  const { t } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check authentication status
  const checkAuth = useCallback(() => {
    const authenticated = authService.isAuthenticated()
    setIsAuthenticated(authenticated)
    
    if (authenticated) {
      const authData = authService.getAuthData()
      // Display username (login name) or fallback to deviceId
      setUsername(authData?.username || authData?.user?.deviceId || null)
    } else {
      setUsername(null)
    }
  }, [])

  // Initial check and periodic token validation
  useEffect(() => {
    checkAuth()

    // Periodic token check
    const intervalId = setInterval(() => {
      if (!authService.isAuthenticated() && authService.getAuthData()) {
        // Token expired, trigger re-login
        console.log('Token expired, please login again')
        checkAuth()
      }
    }, TOKEN_CHECK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [checkAuth])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle login
  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true)
    setLoginError(null)

    try {
      await authService.login({ username, password })
      checkAuth()
      setShowLoginDialog(false)
    } catch (error) {
      console.error('Login failed:', error)
      setLoginError(
        error instanceof Error ? error.message : t('auth.loginFailed')
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    authService.logout()
    setShowDropdown(false)
    checkAuth()
  }

  // Don't render in production environment
  if (!IS_TEST_ENV) {
    return null
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {isAuthenticated ? (
          // Authenticated: Show user button with dropdown
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors',
              'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
              showDropdown && 'bg-slate-100'
            )}
          >
            {/* User icon */}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="max-w-[100px] truncate">{username}</span>
            {/* Dropdown arrow */}
            <svg
              className={cn(
                'w-3 h-3 transition-transform',
                showDropdown && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        ) : (
          // Not authenticated: Show login button
          <button
            onClick={() => setShowLoginDialog(true)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors',
              'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            )}
          >
            {/* Login icon */}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <span>{t('auth.login')}</span>
          </button>
        )}

        {/* Dropdown menu */}
        {showDropdown && isAuthenticated && (
          <div
            className={cn(
              'absolute right-0 top-full mt-1 w-40 py-1',
              'bg-white rounded-lg shadow-lg border border-slate-200',
              'z-50'
            )}
          >
            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
                'text-red-600 hover:bg-red-50 transition-colors'
              )}
            >
              {/* Logout icon */}
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Login Dialog */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => {
          setShowLoginDialog(false)
          setLoginError(null)
        }}
        onLogin={handleLogin}
        isLoading={isLoading}
        error={loginError}
      />
    </>
  )
}
