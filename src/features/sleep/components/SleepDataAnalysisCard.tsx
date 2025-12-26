import { useTranslation } from 'react-i18next'
import { FileBarChart, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import type { SleepDomainModel } from '../types'
import { memo } from 'react'

interface SleepDataAnalysisCardProps {
    data?: SleepDomainModel
    className?: string
    isLoading?: boolean
}

const SLEEP_THEME_COLOR = '#A78BFA'

/**
 * Sleep Data Analysis Card
 */
const SleepDataAnalysisCardInner = ({
    data,
    className,
    isLoading,
}: SleepDataAnalysisCardProps) => {
    const { t } = useTranslation()

    const dataAnalysis = data?.weeklySummary?.dataAnalysis ?? []

    // Default analysis if no data
    const defaultAnalysis = [
        t('page.sleep.defaultAnalysis1', {
            defaultValue: 'The average blood oxygen saturation this week was 97%, the same as last week.'
        }),
        t('page.sleep.defaultAnalysis2', {
            defaultValue: 'Your blood oxygen level remained at a high level (98%) from Tuesday to Thursday this week.'
        }),
        t('page.sleep.defaultAnalysis3', {
            defaultValue: 'On Friday, a blood oxygen level of 94% was recorded, slightly below the lower limit of the normal range.'
        }),
    ]

    const analysisItems = dataAnalysis.length > 0 ? dataAnalysis : defaultAnalysis

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
                <FileBarChart className="w-5 h-5" style={{ color: SLEEP_THEME_COLOR }} />
                <h3 className="text-base font-semibold text-slate-800">
                    {t('page.sleep.dataAnalysis')}
                </h3>
            </div>

            <div className="space-y-3">
                {analysisItems.map((item, index) => (
                    <p key={index} className="text-sm text-slate-600 leading-relaxed">
                        {item}
                    </p>
                ))}
            </div>
        </Card>
    )
}

export const SleepDataAnalysisCard = memo(SleepDataAnalysisCardInner)
