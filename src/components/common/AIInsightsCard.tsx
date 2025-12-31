/**
 * AIInsightsCard
 * 
 * Displays AI health insights with gradient badge.
 * Shows multiple insight items in a styled card.
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES } from '@/config/theme'

export interface AIInsightsCardProps {
    /** List of insight messages */
    insights: string[]
    /** Theme color for styling */
    themeColor?: string
    /** Additional class names */
    className?: string
}

const AIInsightsCardInner = ({
    insights,
    themeColor = '#FB923D',
    className = '',
}: AIInsightsCardProps) => {
    const { t } = useTranslation()

    if (!insights || insights.length === 0) {
        return null
    }
    // Convert rgb() to rgba() for gradient end color
    const themeColorTransparent = themeColor.replace('rgb(', 'rgba(').replace(')', ', 0.8)')

    return (
        <div className={`${className} py-6`} style={{
            backgroundColor: '#ffddb8ff',
            borderRadius: UI_STYLES.cardBorderRadius,
            paddingLeft: UI_STYLES.cardPaddingX,
            paddingRight: UI_STYLES.cardPaddingX,
        }}>
            {/* Header badge */}
            <div
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium mb-4"
                style={{
                    background: `#FE760C`,
                }}
            >
                <span>{t('daily.aiHealthInsights', 'AI health related insights')}</span>
            </div>

            {/* Insight items */}
            <div className="space-y-3">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
                    >
                        <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const AIInsightsCard = memo(AIInsightsCardInner)
