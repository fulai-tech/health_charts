/**
 * Demo Mode Toggle Component
 * 
 * A toggle switch component for enabling/disabling demo mode.
 * When demo mode is enabled, the healthy feature will use dummy data instead of backend API.
 * 
 * @example
 * ```tsx
 * <DemoModeToggle />
 * ```
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { isDemoModeEnabled, toggleDemoMode } from '../demoMode'

export interface DemoModeToggleProps {
    /** Additional CSS classes */
    className?: string
    /** Callback when demo mode changes */
    onChange?: (enabled: boolean) => void
}

export function DemoModeToggle({ className = '', onChange }: DemoModeToggleProps) {
    const { t } = useTranslation()
    const [isEnabled, setIsEnabled] = useState(isDemoModeEnabled)

    useEffect(() => {
        // Sync state with localStorage on mount
        setIsEnabled(isDemoModeEnabled())
    }, [])

    const handleToggle = () => {
        const newState = toggleDemoMode()
        setIsEnabled(newState)
        onChange?.(newState)

        // Reload the page to apply the new mode
        window.location.reload()
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <span className="text-sm font-medium text-slate-700">
                {t('healthy.demoMode', 'Demo Mode')}
            </span>

            {/* Toggle Switch */}
            <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${isEnabled ? 'bg-orange-500' : 'bg-slate-300'
                    }`}
                role="switch"
                aria-checked={isEnabled}
                aria-label={t('healthy.toggleDemoMode', 'Toggle demo mode')}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>

            {/* Status Text */}
            <span className="text-xs text-slate-500">
                {isEnabled
                    ? t('healthy.demoModeOn', 'Using dummy data')
                    : t('healthy.demoModeOff', 'Using backend data')
                }
            </span>
        </div>
    )
}
