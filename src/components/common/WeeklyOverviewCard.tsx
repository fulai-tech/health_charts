import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import { Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { memo } from 'react'

export interface WeeklyOverviewCardProps {
    titleKey?: string
    Icon: LucideIcon
    overallText: string
    highlightText: string
    highlightLabelKey?: string // 'needsAttention' or 'anomalyAlert'
    highlightColor?: string // e.g. amber-400 for warning
    suggestions?: string[]
    themeColor: string
    className?: string
    isLoading?: boolean
}

const WeeklyOverviewCardInner = ({
    titleKey = 'common.weeklyOverview',
    Icon,
    overallText,
    highlightText,
    highlightLabelKey = 'page.sleep.needsAttention', // Default, but often overridden
    highlightColor = '#FBBF24', // Default amber-400 hex roughly
    suggestions = [],
    themeColor,
    className,
    isLoading,
}: WeeklyOverviewCardProps) => {
    const { t } = useTranslation()

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

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5" style={{ color: themeColor }} />
                <h3 className="text-base font-semibold text-slate-800">
                    {t(titleKey)}
                </h3>
            </div>

            {/* Overall Situation */}
            <div className="mb-5">
                <span
                    className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium mb-2"
                    style={{ backgroundColor: themeColor }}
                >
                    {t('page.bloodPressure.overallSituation')}
                    {/* Note: 'overallSituation' is actually in page.bloodPressure.overallSituation in zh.json/en.json based on previous context, 
                        BUT checking zh.json provided earlier, it is duplicated in page.spo2 etc. 
                        Ideally it should be in 'common'. Let's use 'common.overallSituation' if it existed, but based on file read 
                        it seems to be spread. Let's rely on a check or assume it's moved to common?
                        Wait, earlier 'zh.json' showed 'common' section has 'average', 'max' etc. but NOT 'overallSituation'.
                        It IS in multiple pages. Let's try to find a common one or standardise usage.
                        Actually, 'page.sleep.overallSituation' exists. 'page.bloodPressure.overallSituation' exists.
                        The key might be passed, or we hardcode one that works if they are all uniform strings.
                        Let's check zh.json again.
                    */}
                </span>
                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: '#F8F9FA',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {overallText}
                    </p>
                </div>
            </div>

            {/* Highlight / Needs Attention / Anomaly Alert */}
            <div>
                <span
                    className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium mb-2"
                    style={{ backgroundColor: highlightColor }}
                >
                    {t(highlightLabelKey)}
                </span>
                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: '#F8F9FA',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {highlightText}
                    </p>
                </div>
            </div>

            {/* Suggestions */}
            {suggestions && suggestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <ul className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                                <span style={{ color: themeColor }}>•</span>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    )
}

export const WeeklyOverviewCard = memo(WeeklyOverviewCardInner)
