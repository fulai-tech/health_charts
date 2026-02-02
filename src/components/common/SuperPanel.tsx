/**
 * Super Panel - Development/Test Environment Control Panel
 * 
 * A floating button that opens a control panel for:
 * - Language switching (Chinese/English)
 * - User login/logout
 * - Theme switching (Light/Dark)
 * - Demo mode toggle
 * 
 * Only rendered when IS_TEST_ENV is true.
 * Uses conditional compilation to exclude from production builds.
 */

import { useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { Settings, Globe, User, Sun, Moon, Database, LogIn, LogOut, X } from 'lucide-react'
import { IS_TEST_ENV } from '@/config/config'
import { cn } from '@/lib/utils'
import { authService } from '@/services/auth/authService'
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore, useLanguageStore } from '@/stores'
import { isGlobalDemoModeEnabled, setGlobalDemoMode } from '@/config/globalDemoMode'
import { LoginDialog } from '@/components/ui/LoginDialog'

// Don't render anything in production
if (!IS_TEST_ENV) {
    // This component will be tree-shaken in production builds
}

/**
 * Toggle Switch Component
 */
interface ToggleSwitchProps {
    enabled: boolean
    onChange: (enabled: boolean) => void
    size?: 'sm' | 'md'
}

function ToggleSwitch({ enabled, onChange, size = 'md' }: ToggleSwitchProps) {
    const sizeClasses = size === 'sm' 
        ? 'h-5 w-9' 
        : 'h-6 w-11'
    const dotSizeClasses = size === 'sm'
        ? 'h-3 w-3'
        : 'h-4 w-4'
    const translateClasses = size === 'sm'
        ? (enabled ? 'translate-x-5' : 'translate-x-1')
        : (enabled ? 'translate-x-6' : 'translate-x-1')

    return (
        <button
            onClick={() => onChange(!enabled)}
            className={cn(
                'relative inline-flex items-center rounded-full transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
                sizeClasses,
                enabled ? 'bg-orange-500' : 'bg-slate-300'
            )}
            role="switch"
            aria-checked={enabled}
        >
            <span
                className={cn(
                    'inline-block transform rounded-full bg-white transition-transform',
                    dotSizeClasses,
                    translateClasses
                )}
            />
        </button>
    )
}

/**
 * Control Row Component
 */
interface ControlRowProps {
    icon: React.ReactNode
    label: string
    children: React.ReactNode
}

function ControlRow({ icon, label, children }: ControlRowProps) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    {icon}
                </div>
                <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    )
}

/**
 * Super Panel Component（使用 MobX store 同步登录/主题/语言，observer 保证响应式）
 */
function SuperPanelInner() {
    const { t, i18n } = useTranslation()
    const { theme, toggleTheme } = useTheme()
    const { isAuthenticated, username: authUsername, logout } = useAuthStore()
    const { language, setLanguage } = useLanguageStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isDemoMode, setIsDemoMode] = useState(isGlobalDemoModeEnabled)
    const [showLoginDialog, setShowLoginDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loginError, setLoginError] = useState<string | null>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    // Don't render in production
    if (!IS_TEST_ENV) {
        return null
    }

    // Sync demo mode state
    useEffect(() => {
        setIsDemoMode(isGlobalDemoModeEnabled())
    }, [])

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // Handle language toggle
    const handleLanguageToggle = () => {
        const newLang = i18n.language.startsWith('en') ? 'zh' : 'en'
        i18n.changeLanguage(newLang)
        setLanguage(newLang as 'en' | 'zh')
    }

    // Handle theme toggle
    const handleThemeToggle = () => {
        toggleTheme()
    }

    // Handle demo mode toggle
    const handleDemoModeToggle = (enabled: boolean) => {
        setGlobalDemoMode(enabled)
        setIsDemoMode(enabled)
        // Reload to apply changes
        window.location.reload()
    }

    // Handle login
    const handleLogin = async (username: string, password: string) => {
        setIsLoading(true)
        setLoginError(null)
        try {
            await authService.login({ username, password })
            // authService 会更新 localStorage，globalStore 会自动同步
            setShowLoginDialog(false)
        } catch (error) {
            console.error('Login failed:', error)
            setLoginError(error instanceof Error ? error.message : t('auth.loginFailed'))
        } finally {
            setIsLoading(false)
        }
    }

    // Handle logout
    const handleLogout = () => {
        logout()
    }

    const isEnglish = i18n.language.startsWith('en')
    const isDark = theme === 'dark'

    return (
        <>
            {/* Floating Button */}
            <div
                ref={panelRef}
                className="fixed bottom-6 right-6 z-[9999]"
            >
                {/* Control Panel */}
                {isOpen && (
                    <div
                        className={cn(
                            'absolute bottom-16 right-0 w-72',
                            'bg-white rounded-2xl shadow-2xl border border-slate-200',
                            'transform transition-all duration-200 origin-bottom-right',
                            'animate-fade-in'
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-orange-500" />
                                <span className="text-sm font-semibold text-slate-800">
                                    Super Panel
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="px-4 py-2">
                            {/* Language */}
                            <ControlRow
                                icon={<Globe className="w-4 h-4" />}
                                label={t('superPanel.language', '语言')}
                            >
                                <button
                                    onClick={handleLanguageToggle}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                                        'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    )}
                                >
                                    {isEnglish ? '中文' : 'English'}
                                </button>
                            </ControlRow>

                            {/* User */}
                            <ControlRow
                                icon={<User className="w-4 h-4" />}
                                label={t('superPanel.user', '用户')}
                            >
                                {isAuthenticated ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 max-w-[80px] truncate">
                                            {authUsername}
                                        </span>
                                        <button
                                            onClick={handleLogout}
                                            className={cn(
                                                'p-1.5 rounded-lg transition-colors',
                                                'bg-red-50 hover:bg-red-100 text-red-600'
                                            )}
                                            title={t('auth.logout')}
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowLoginDialog(true)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                                            'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                        )}
                                    >
                                        <LogIn className="w-3.5 h-3.5" />
                                        {t('auth.login')}
                                    </button>
                                )}
                            </ControlRow>

                            {/* Theme */}
                            <ControlRow
                                icon={isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                label={t('superPanel.theme', '主题')}
                            >
                                <div className="flex items-center gap-2">
                                    <Sun className="w-3.5 h-3.5 text-slate-400" />
                                    <ToggleSwitch
                                        enabled={isDark}
                                        onChange={handleThemeToggle}
                                        size="sm"
                                    />
                                    <Moon className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </ControlRow>

                            {/* Demo Mode */}
                            <ControlRow
                                icon={<Database className="w-4 h-4" />}
                                label={t('superPanel.demoMode', 'Demo 模式')}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400">
                                        {isDemoMode ? t('superPanel.mockData', '假数据') : t('superPanel.realData', '真数据')}
                                    </span>
                                    <ToggleSwitch
                                        enabled={isDemoMode}
                                        onChange={handleDemoModeToggle}
                                        size="sm"
                                    />
                                </div>
                            </ControlRow>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 bg-slate-50 rounded-b-2xl">
                            <p className="text-[10px] text-slate-400 text-center">
                                Test Environment Only
                            </p>
                        </div>
                    </div>
                )}

                {/* Floating Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'w-14 h-14 rounded-full shadow-lg',
                        'flex items-center justify-center',
                        'transition-all duration-200 transform',
                        'hover:scale-110 active:scale-95',
                        isOpen
                            ? 'bg-orange-500 text-white rotate-90'
                            : 'bg-white text-orange-500 border border-slate-200'
                    )}
                    aria-label="Open Super Panel"
                >
                    <Settings className="w-6 h-6" />
                </button>
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

export const SuperPanel = observer(SuperPanelInner)
