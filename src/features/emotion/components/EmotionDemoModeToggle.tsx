/**
 * Emotion Demo Mode Toggle Component
 * 
 * A toggle switch component for enabling/disabling demo mode in emotion feature.
 * When demo mode is enabled, the emotion feature will use dummy data instead of backend API.
 * 
 * @example
 * ```tsx
 * <EmotionDemoModeToggle />
 * ```
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { isEmotionDemoModeEnabled, toggleEmotionDemoMode } from '../demoMode'

export interface EmotionDemoModeToggleProps {
    /** Additional CSS classes */
    className?: string
    /** Callback when demo mode changes */
    onChange?: (enabled: boolean) => void
}

export function EmotionDemoModeToggle({ className = '', onChange }: EmotionDemoModeToggleProps) {
    const { t } = useTranslation()
    const [isEnabled, setIsEnabled] = useState(isEmotionDemoModeEnabled)

    useEffect(() => {
        // Sync state with localStorage on mount
        setIsEnabled(isEmotionDemoModeEnabled())
    }, [])

    const handleToggle = () => {
        const newState = toggleEmotionDemoMode()
        setIsEnabled(newState)
        onChange?.(newState)

        // Reload the page to apply the new mode
        window.location.reload()
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <span className="text-sm font-medium text-slate-700">
                {t('page.emotion.demoMode', 'Demo Mode')}
            </span>

            {/* Toggle Switch */}
            <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isEnabled ? 'bg-purple-500' : 'bg-slate-300'
                    }`}
                role="switch"
                aria-checked={isEnabled}
                aria-label={t('page.emotion.toggleDemoMode', 'Toggle demo mode')}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>

            {/* Status Text */}
            <span className="text-xs text-slate-500">
                {isEnabled
                    ? t('page.emotion.demoModeOn', 'Using dummy data')
                    : t('page.emotion.demoModeOff', 'Using backend data')
                }
            </span>
        </div>
    )
}
