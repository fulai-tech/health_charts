import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { API_CONFIG } from '@/config/api'

interface LoginDialogProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (username: string, password: string) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

/**
 * LoginDialog - Modal dialog for user login
 * Shows default test credentials that can be modified
 */
export function LoginDialog({
  isOpen,
  onClose,
  onLogin,
  isLoading = false,
  error = null,
}: LoginDialogProps) {
  const { t } = useTranslation()
  const [username, setUsername] = useState<string>(API_CONFIG.device.username)
  const [password, setPassword] = useState<string>(API_CONFIG.device.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onLogin(username, password)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl',
          'transform transition-all duration-200',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">
            {t('auth.login')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('auth.loginDescription')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Username field */}
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-700"
            >
              {t('auth.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className={cn(
                'w-full px-3 py-2 text-sm border rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'disabled:bg-slate-50 disabled:text-slate-500',
                'transition-colors'
              )}
              placeholder={t('auth.usernamePlaceholder')}
              required
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={cn(
                'w-full px-3 py-2 text-sm border rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'disabled:bg-slate-50 disabled:text-slate-500',
                'transition-colors'
              )}
              placeholder={t('auth.passwordPlaceholder')}
              required
            />
          </div>

          {/* Test credentials hint */}
          <div className="p-3 text-xs text-slate-500 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-600 mb-1">
              {t('auth.testCredentials')}
            </p>
            <p>
              {t('auth.username')}: <code className="px-1 py-0.5 bg-slate-200 rounded">{API_CONFIG.device.username}</code>
            </p>
            <p>
              {t('auth.password')}: <code className="px-1 py-0.5 bg-slate-200 rounded">{API_CONFIG.device.password}</code>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium text-slate-600 rounded-lg',
              'hover:bg-slate-200 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {t('auth.cancel')}
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !username || !password}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg',
              'hover:bg-blue-600 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {isLoading && (
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isLoading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className={cn(
            'absolute top-4 right-4 p-1 text-slate-400 rounded-full',
            'hover:text-slate-600 hover:bg-slate-100 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
