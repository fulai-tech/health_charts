/**
 * EmotionDistributionCard
 * 
 * Displays emotion distribution as a pie chart with main emotion highlight.
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Info } from 'lucide-react'
import { EMOTION_COLORS } from '@/config/theme'
import type { EmotionDistributionItem } from '../types'

export interface EmotionDistributionCardProps {
    /** Main emotion type */
    mainEmotion: string
    /** Main emotion label */
    mainEmotionLabel: string
    /** Distribution items */
    items: EmotionDistributionItem[]
    /** Additional class names */
    className?: string
}

/**
 * Get color for emotion type
 */
const getEmotionColor = (type: string): string => {
    const typeUpper = type.toUpperCase()
    const colorMap: Record<string, string> = {
        HAPPY: EMOTION_COLORS.happy,
        CALM: EMOTION_COLORS.calm,
        NEUTRAL: EMOTION_COLORS.neutral,
        SURPRISED: EMOTION_COLORS.surprised,
        SAD: EMOTION_COLORS.sad,
        ANGRY: EMOTION_COLORS.angry,
        FEARFUL: EMOTION_COLORS.fearful,
        DISGUSTED: EMOTION_COLORS.disgusted,
    }
    return colorMap[typeUpper] || '#94a3b8'
}

const EmotionDistributionCardInner = ({
    mainEmotion,
    mainEmotionLabel,
    items,
    className = '',
}: EmotionDistributionCardProps) => {
    const { t } = useTranslation()

    // Prepare pie data
    const pieData = useMemo(() => {
        return items.map((item) => ({
            name: item.label,
            value: item.percent,
            color: getEmotionColor(item.type),
        }))
    }, [items])

    // Split items into two columns
    const leftItems = items.filter((_, i) => i % 2 === 0)
    const rightItems = items.filter((_, i) => i % 2 === 1)

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-4 rounded-full bg-orange-400" />
                <h3 className="text-base font-semibold text-slate-800">
                    {t('daily.emotionDistribution', 'Emotion distribution')}
                </h3>
                <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="flex items-center gap-6">
                {/* Legend grid */}
                <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                    {items.slice(0, 8).map((item) => (
                        <div key={item.type} className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getEmotionColor(item.type) }}
                            />
                            <span className="text-sm text-slate-600">{item.label}</span>
                            <span className="text-sm font-medium text-slate-800">
                                {item.percent}%
                            </span>
                        </div>
                    ))}
                </div>

                {/* Pie chart with center label - large for 2-column layout */}
                <div className="relative w-48 h-48 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={95}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                            className="text-xl font-bold"
                            style={{ color: getEmotionColor(mainEmotion) }}
                        >
                            {mainEmotionLabel}
                        </span>
                        <span className="text-xs text-slate-400">
                            {t('daily.asMain', 'as main')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const EmotionDistributionCard = memo(EmotionDistributionCardInner)
