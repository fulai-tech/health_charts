/**
 * Super Panel - Development/Test Environment Control Panel
 * 
 * A floating button that opens a control panel for:
 * - Test mode toggle (isTestEnv)
 * - Language switching (Chinese/English)
 * - User login/logout
 * - Console logs viewer
 * 
 * Visibility controlled by SHOW_SUPER_PANEL in config (hardcoded).
 */

import { useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { Settings, Globe, User, LogIn, LogOut, X, Terminal, Trash2, RotateCcw, Database, FlaskConical, Pin } from 'lucide-react'
import { SHOW_SUPER_PANEL } from '@/config/config'
import { cn } from '@/lib/utils'
import { authService } from '@/services/auth/authService'
import { useAuthStore, useLanguageStore, useTestEnvStore } from '@/stores'
import { LoginDialog } from '@/components/ui/LoginDialog'

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
// 日志接口定义
interface LogEntry {
    id: number
    timestamp: string
    level: 'log' | 'warn' | 'error' | 'info'
    message: string
    args: any[]
    count: number
    firstTimestamp: string
    lastTimestamp: string
}

// 提取出最大日志数量常量
const MAX_LOGS = 100

// localStorage key for pin state
const PIN_STORAGE_KEY = 'super_panel_pinned'

// 从 localStorage 读取 pin 状态
function getStoredPinState(): boolean {
    try {
        return localStorage.getItem(PIN_STORAGE_KEY) === 'true'
    } catch {
        return false
    }
}

function SuperPanelInner() {
    const { t, i18n } = useTranslation()
    const { isAuthenticated, username: authUsername, logout } = useAuthStore()
    const { language, setLanguage } = useLanguageStore()
    const { isTestEnv, setIsTestEnv } = useTestEnvStore()
    const [isOpen, setIsOpen] = useState(() => getStoredPinState()) // 如果 pinned，初始就打开
    const [isPinned, setIsPinned] = useState(() => getStoredPinState())
    const [showLoginDialog, setShowLoginDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loginError, setLoginError] = useState<string | null>(null)
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [showLogs, setShowLogs] = useState(false)
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)
    const logIdRef = useRef(0)
    // 增加一个 Ref 来充当"互斥锁"，防止处理日志时产生新日志造成的死循环
    const isProcessingLog = useRef(false)
    // 增加一个 Ref 缓存待处理的日志队列，用于批量更新
    const pendingLogsQueue = useRef<LogEntry[]>([])
    // 保存原始console方法的引用，供其他函数使用
    const originalConsoleRef = useRef<{
        log: typeof console.log
        warn: typeof console.warn
        error: typeof console.error
        info: typeof console.info
    } | null>(null)

    // 检测屏幕尺寸，自适应布局
    useEffect(() => {
        const checkScreenSize = () => {
            // 当屏幕宽度小于 360px 或高度小于 500px 时，认为是小屏幕
            const isSmall = window.innerWidth < 360 || window.innerHeight < 500
            setIsSmallScreen(isSmall)
        }

        // 初始检测
        checkScreenSize()

        // 监听窗口大小变化
        window.addEventListener('resize', checkScreenSize)
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    // 重写console方法来捕获日志 - 优化版本
    useEffect(() => {
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
        }
        
        // 保存到ref中供其他函数使用
        originalConsoleRef.current = originalConsole

        const createLogEntry = (level: LogEntry['level'], args: any[]): LogEntry => {
            logIdRef.current += 1
            const timestamp = new Date().toLocaleTimeString()
            
            // 优化：只有当需要渲染日志时，才去进行昂贵的 stringify 操作
            // 限制 stringify 的深度/长度，防止大对象卡死
            const message = args.map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    try {
                        // 简单的防止大对象卡死策略：截断
                        const str = JSON.stringify(arg, null, 2)
                        return str.length > 2000 ? str.slice(0, 2000) + '... (truncated)' : str
                    } catch (e) {
                        return '[Circular/Unserializable Object]'
                    }
                }
                return String(arg)
            }).join(' ')

            return {
                id: logIdRef.current,
                timestamp,
                level,
                message,
                args, // 保留原始引用，万一以后想做点击展开看详情
                count: 1,
                firstTimestamp: timestamp,
                lastTimestamp: timestamp
            }
        }

        // 批量更新函数：每 500ms 执行一次状态更新
        // 解决"性能雪崩"问题
        const flushLogs = () => {
            if (pendingLogsQueue.current.length === 0) return

            setLogs(prev => {
                // 复制一份当前的日志进行操作
                let newLogs = [...prev]
                const incomingLogs = [...pendingLogsQueue.current]
                pendingLogsQueue.current = [] // 清空队列

                incomingLogs.forEach(newLog => {
                    const lastLog = newLogs[newLogs.length - 1]
                    // 合并逻辑
                    if (lastLog && lastLog.level === newLog.level && lastLog.message === newLog.message) {
                        newLogs[newLogs.length - 1] = {
                            ...lastLog,
                            count: lastLog.count + 1,
                            lastTimestamp: newLog.timestamp,
                            timestamp: newLog.timestamp
                        }
                    } else {
                        newLogs.push(newLog)
                    }
                })

                // 截断日志数组，防止内存泄漏
                if (newLogs.length > MAX_LOGS) {
                    newLogs = newLogs.slice(-MAX_LOGS)
                }
                return newLogs
            })
        }

        // 使用 setInterval 来做批量更新
        const intervalId = setInterval(flushLogs, 500)

        const intercept = (level: LogEntry['level']) => (...args: any[]) => {
            // 1. 先执行原生 console，保证开发者工具里能看到
            originalConsole[level].apply(console, args)

            // 2. 死循环熔断机制：如果当前正在处理日志逻辑，直接忽略新进来的日志
            if (isProcessingLog.current) return

            try {
                isProcessingLog.current = true

                // 3. 过滤逻辑
                const msgStr = args.join(' ')
                if (msgStr.includes('i18next::translator: missingKey')) return
                if (msgStr.includes('SuperPanel') && msgStr.includes('translation')) return

                // 4. 将日志加入队列，而不是直接 setState
                const entry = createLogEntry(level, args)
                pendingLogsQueue.current.push(entry)

            } catch (err) {
                // 如果处理日志本身报错了，不要再 console.error，否则会死循环
                // 默默吞掉错误
            } finally {
                isProcessingLog.current = false
            }
        }

        // 覆盖 console
        console.log = intercept('log')
        console.warn = intercept('warn')
        console.error = intercept('error')
        console.info = intercept('info')

        return () => {
            // 还原 console
            console.log = originalConsole.log
            console.warn = originalConsole.warn
            console.error = originalConsole.error
            console.info = originalConsole.info
            clearInterval(intervalId)
        }
    }, [])

    // Close panel when clicking outside (unless pinned)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isPinned) return // 固定时不关闭
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen && !isPinned) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, isPinned])

    // Handle pin toggle
    const handlePinToggle = () => {
        const newValue = !isPinned
        setIsPinned(newValue)
        try {
            localStorage.setItem(PIN_STORAGE_KEY, String(newValue))
        } catch {
            // ignore
        }
    }

    // Don't render if SHOW_SUPER_PANEL is false (hardcoded in config)
    if (!SHOW_SUPER_PANEL) {
        return null
    }

    // Handle language toggle
    const handleLanguageToggle = () => {
        const newLang = i18n.language.startsWith('en') ? 'zh' : 'en'
        i18n.changeLanguage(newLang)
        setLanguage(newLang as 'en' | 'zh')
    }

    // Handle log toggle
    const handleLogToggle = () => {
        setShowLogs(!showLogs)
    }

    // Handle clear logs
    const handleClearLogs = () => {
        setLogs([])
    }

    // Handle page reload
    const handlePageReload = () => {
        window.location.reload()
    }

    // Handle clear all storage
    const handleClearAllStorage = () => {
        try {
            // Clear localStorage
            localStorage.clear()
            
            // Clear sessionStorage
            sessionStorage.clear()
            
            // Clear all cookies
            document.cookie.split(";").forEach(cookie => {
                const eqPos = cookie.indexOf("=")
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
            })
            
            // Clear IndexedDB (if any)
            if ('indexedDB' in window) {
                indexedDB.databases().then(databases => {
                    databases.forEach(db => {
                        if (db.name) {
                            indexedDB.deleteDatabase(db.name)
                        }
                    })
                }).catch(() => {})
            }
            
            // Show confirmation and reload
            alert(isEnglish ? 'All storage cleared! Page will reload.' : '所有存储已清空！页面即将重新加载。')
            window.location.reload()
        } catch (error) {
            originalConsoleRef.current?.error?.('Clear storage failed:', error) || console.error('Clear storage failed:', error)
            alert(isEnglish ? 'Failed to clear storage completely' : '清空存储失败')
        }
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
            // 使用原始console.error避免循环，并且不触发日志拦截
            originalConsoleRef.current?.error?.('Login failed:', error) || console.error('Login failed:', error)
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

    return (
        <>
            {/* Floating Button */}
            <div
                ref={panelRef}
                className={cn(
                    "fixed z-[9999]",
                    // 小屏幕时调整位置，避免溢出
                    isSmallScreen ? "bottom-3 right-3" : "bottom-6 right-6"
                )}
            >
                {/* Control Panel */}
                {isOpen && (
                    <div
                        className={cn(
                            'absolute right-0',
                            // 小屏幕时调整弹出位置
                            isSmallScreen ? 'bottom-14' : 'bottom-16',
                            // 响应式宽度：小屏幕时使用可用宽度，否则固定宽度
                            isSmallScreen 
                                ? 'w-[calc(100vw-24px)] max-w-72' 
                                : 'w-72',
                            // 限制最大高度，防止溢出屏幕
                            isSmallScreen
                                ? 'max-h-[calc(100vh-70px)]'
                                : 'max-h-[calc(100vh-100px)]',
                            'overflow-hidden flex flex-col',
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
                            <div className="flex items-center gap-1">
                                {/* Pin Button */}
                                <button
                                    onClick={handlePinToggle}
                                    className={cn(
                                        "p-1 rounded-lg transition-colors",
                                        isPinned 
                                            ? "bg-orange-100 text-orange-500" 
                                            : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                    )}
                                    title={isPinned ? (isEnglish ? 'Unpin' : '取消固定') : (isEnglish ? 'Pin' : '固定')}
                                >
                                    <Pin className={cn("w-4 h-4", isPinned && "rotate-45")} />
                                </button>
                                {/* Close Button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Controls - 可滚动区域 */}
                        <div className="px-4 py-2 overflow-y-auto flex-1 min-h-0">
                            {/* Test Environment Toggle */}
                            <ControlRow
                                icon={<FlaskConical className="w-4 h-4" />}
                                label={isEnglish ? 'Test Mode' : '测试模式'}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400">
                                        {isTestEnv ? (isEnglish ? 'ON' : '开') : (isEnglish ? 'OFF' : '关')}
                                    </span>
                                    <ToggleSwitch
                                        enabled={isTestEnv}
                                        onChange={setIsTestEnv}
                                        size="sm"
                                    />
                                </div>
                            </ControlRow>

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

                            {/* Console Logs */}
                            <ControlRow
                                icon={<Terminal className="w-4 h-4" />}
                                label={isEnglish ? 'Console' : '控制台'}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400">
                                        {logs.length} {isEnglish ? 'logs' : '条日志'}
                                    </span>
                                    <button
                                        onClick={handleClearLogs}
                                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                        title={isEnglish ? 'Clear logs' : '清空日志'}
                                        disabled={logs.length === 0}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                    <ToggleSwitch
                                        enabled={showLogs}
                                        onChange={handleLogToggle}
                                        size="sm"
                                    />
                                </div>
                            </ControlRow>

                            {/* Page Reload */}
                            <ControlRow
                                icon={<RotateCcw className="w-4 h-4" />}
                                label={isEnglish ? 'Reload' : '重新加载'}
                            >
                                <button
                                    onClick={handlePageReload}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                                        'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                    )}
                                >
                                    {isEnglish ? 'Reload Page' : '重载页面'}
                                </button>
                            </ControlRow>

                            {/* Clear Storage */}
                            <ControlRow
                                icon={<Database className="w-4 h-4" />}
                                label={isEnglish ? 'Storage' : '存储'}
                            >
                                <button
                                    onClick={handleClearAllStorage}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                                        'bg-red-50 hover:bg-red-100 text-red-600'
                                    )}
                                >
                                    {isEnglish ? 'Clear All' : '清空全部'}
                                </button>
                            </ControlRow>
                        </div>

                        {/* Console Logs */}
                        {showLogs && (
                            <div className="border-t border-slate-100 flex-shrink-0">
                                <div className="px-4 py-2 bg-slate-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-slate-600">
                                            {isEnglish ? 'Console Logs' : '控制台日志'}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {isEnglish ? 'Latest 100' : '最新 100 条'}
                                        </span>
                                    </div>
                                </div>
                                {/* 小屏幕时减小日志区高度 */}
                                <div className={cn(
                                    "overflow-y-auto bg-slate-900 text-green-400 font-mono text-[10px]",
                                    isSmallScreen ? "max-h-32" : "max-h-48"
                                )}>
                                    {logs.length === 0 ? (
                                        <div className="p-3 text-slate-500 text-center">
                                            {isEnglish ? 'No logs' : '暂无日志'}
                                        </div>
                                    ) : (
                                        logs.map(log => (
                                            <div
                                                key={log.id}
                                                className={cn(
                                                    'px-3 py-1 border-b border-slate-800',
                                                    log.level === 'error' && 'text-red-400',
                                                    log.level === 'warn' && 'text-yellow-400',
                                                    log.level === 'info' && 'text-blue-400',
                                                    log.level === 'log' && 'text-green-400'
                                                )}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <span className="text-slate-500 shrink-0">
                                                        [{log.timestamp}]
                                                    </span>
                                                    <span className="text-slate-400 shrink-0 uppercase">
                                                        {log.level}:
                                                    </span>
                                                    <div className="flex-1">
                                                        <span className="break-all whitespace-pre-wrap">
                                                            {log.message}
                                                        </span>
                                                        {log.count > 1 && (
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-medium bg-orange-500 text-white">
                                                                    × {log.count}
                                                                </span>
                                                                <span className="text-[8px] text-slate-400">
                                                                    {log.firstTimestamp} - {log.lastTimestamp}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-4 py-2 bg-slate-50 rounded-b-2xl">
                            <p className="text-[10px] text-slate-400 text-center">
                                Test Environment Only
                            </p>
                        </div>
                    </div>
                )}

                {/* Floating Button - 小屏幕时缩小 */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'rounded-full shadow-lg',
                        'flex items-center justify-center',
                        'transition-all duration-200 transform',
                        'hover:scale-110 active:scale-95',
                        // 小屏幕时缩小按钮
                        isSmallScreen ? 'w-11 h-11' : 'w-14 h-14',
                        isOpen
                            ? 'bg-orange-500 text-white rotate-90'
                            : 'bg-white text-orange-500 border border-slate-200'
                    )}
                    aria-label="Open Super Panel"
                >
                    <Settings className={cn(isSmallScreen ? "w-5 h-5" : "w-6 h-6")} />
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
