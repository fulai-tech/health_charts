import { useTranslation } from 'react-i18next'
import { BarChart3, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import type { SleepDomainModel } from '../types'
import { memo, useMemo } from 'react'

interface SleepCompareCardProps {
    data?: SleepDomainModel
    className?: string
    isLoading?: boolean
}

const SLEEP_THEME_COLOR = '#A78BFA'

/**
 * Sleep Compare Card showing comparison with last week
 */
const SleepCompareCardInner = ({ data, className, isLoading }: SleepCompareCardProps) => {
    const { t } = useTranslation()

    const routine = data?.routine ?? {
        hasData: false,
        avgSleepTime: { text: '--:--', changeValue: 0, trend: 'stable', changeText: '' },
        avgWakeTime: { text: '--:--', changeValue: 0, trend: 'stable', changeText: '' },
        insight: null,
    }

    const insightText = useMemo(
        () =>
            routine.insight ||
            t('page.sleep.defaultInsight', {
                defaultValue: 'Your sleep schedule has been consistent this week. Maintaining a regular sleep routine is beneficial for your overall health and well-being.'
            }),
        [routine.insight, t]
    )

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
                <BarChart3 className="w-5 h-5" style={{ color: SLEEP_THEME_COLOR }} />
                <h3 className="text-base font-semibold text-slate-800">
                    {t('page.sleep.compareWithLastWeek')}
                </h3>
            </div>

            <div className="flex gap-3 mb-4">
                <div className="flex-1 p-3 rounded-xl bg-slate-50">
                    <p className="text-xs text-slate-500 mb-1">
                        {t('page.sleep.avgSleepTime')}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold" style={{ color: SLEEP_THEME_COLOR }}>
                            {routine.avgSleepTime.text}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        {routine.avgSleepTime.changeText || t('page.sleep.sameAsLastWeek')}
                    </p>
                </div>

                <div className="flex-1 p-3 rounded-xl bg-slate-50">
                    <p className="text-xs text-slate-500 mb-1">
                        {t('page.sleep.avgWakeTime')}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold" style={{ color: SLEEP_THEME_COLOR }}>
                            {routine.avgWakeTime.text}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        {routine.avgWakeTime.changeText || t('page.sleep.sameAsLastWeek')}
                    </p>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50">
                <p className="text-sm text-slate-700 leading-relaxed">
                    {insightText}
                </p>
            </div>
        </Card>
    )
}

export const SleepCompareCard = memo(SleepCompareCardInner)
