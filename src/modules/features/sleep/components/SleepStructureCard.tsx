import { useTranslation } from 'react-i18next'
import { Activity, Loader2, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import type { SleepDomainModel } from '../types'
import { memo } from 'react'

interface SleepStructureCardProps {
    data?: SleepDomainModel
    className?: string
    isLoading?: boolean
}

// Theme colors matching design specification
const SLEEP_COLORS = {
    deep: '#A27EFD',
    light: '#D9CBFE',
    rem: '#ECE5FE',
    awake: '#F9933B',
}

const SLEEP_THEME_COLOR = '#A78BFA'

/**
 * Sleep Structure Card showing sleep stage percentages
 * Design with individual boxed cards for each stage
 */
const SleepStructureCardInner = ({ data, className, isLoading }: SleepStructureCardProps) => {
    const { t } = useTranslation()

    const stages = data?.sleepStructure?.stages ?? []

    // Placeholder stages to prevent layout shift during loading
    const placeholderStages = [
        { type: 'deep', percent: 0, reference: '', status: 'normal', statusText: '' },
        { type: 'light', percent: 0, reference: '', status: 'normal', statusText: '' },
        { type: 'rem', percent: 0, reference: '', status: 'normal', statusText: '' },
        { type: 'awake', percent: 0, reference: '', status: 'normal', statusText: '' },
    ]

    const displayStages = stages.length > 0 ? stages : placeholderStages

    const getStageLabel = (type: string) => {
        switch (type) {
            case 'deep':
                return t('page.sleep.deepSleep')
            case 'light':
                return t('page.sleep.lightSleep')
            case 'rem':
                return t('page.sleep.remSleep')
            case 'awake':
                return t('page.sleep.awake')
            default:
                return type
        }
    }

    const getStageColor = (type: string) => {
        switch (type) {
            case 'deep':
                return SLEEP_COLORS.deep
            case 'light':
                return SLEEP_COLORS.light
            case 'rem':
                return SLEEP_COLORS.rem
            case 'awake':
                return SLEEP_COLORS.awake
            default:
                return '#94a3b8'
        }
    }

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'high':
            case 'low':
                return '#F97316' // Orange for warnings
            default:
                return '#64748b' // Slate for normal
        }
    }

    return (
        <Card className={`${className} relative overflow-hidden`}>
            {/* Loading overlay */}
            <div
                className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                style={{ backgroundColor: UI_STYLES.loadingOverlay }}
            >
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5" style={{ color: SLEEP_THEME_COLOR }} />
                <h3 className="text-base font-semibold text-slate-800">
                    {t('page.sleep.sleepStructure')}
                </h3>
            </div>

            <div className="space-y-3">
                {displayStages.map((stage) => {
                    const color = getStageColor(stage.type)
                    const statusTextColor = getStatusTextColor(stage.status)
                    const hasWarning = stage.status !== 'normal' && stage.statusText

                    return (
                        <div
                            key={stage.type}
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: '#F8F9FA' }}
                        >
                            {/* Header row */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm text-slate-800">
                                    {getStageLabel(stage.type)} {stage.percent > 0 ? `(${stage.percent}%)` : ''}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {stage.reference ? `${t('page.sleep.standard')}: ${stage.reference}` : ''}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                                <div
                                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(stage.percent, 100)}%`,
                                        backgroundColor: color,
                                    }}
                                />
                            </div>

                            {/* Status text if abnormal */}
                            {hasWarning && (
                                <div className="flex items-start gap-1.5">
                                    <p
                                        className="text-xs font-medium flex-1"
                                        style={{ color: statusTextColor }}
                                    >
                                        {stage.statusText}
                                    </p>
                                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: statusTextColor }} />
                                </div>
                            )}

                            {/* Normal status text */}
                            {stage.status === 'normal' && stage.percent > 0 && (
                                <p className="text-xs text-slate-500">
                                    Normal
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}

export const SleepStructureCard = memo(SleepStructureCardInner)

