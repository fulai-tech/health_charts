/**
 * EmotionProportionChart
 * 
 * Time-based stacked bar chart showing emotion proportions throughout the day.
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { EMOTION_COLORS, UI_STYLES } from '@/config/theme'
import { TimeAxisBarChart } from '@/components/charts/TimeAxisBarChart'
import type { EmotionChartPoint } from '../types'

export interface EmotionProportionChartProps {
    /** Chart data */
    data: EmotionChartPoint[]
    /** Additional class names */
    className?: string
}

const EmotionProportionChartInner = ({
    data,
    className = '',
}: EmotionProportionChartProps) => {
    const { t } = useTranslation()

    const layers = [
        {
            dataKey: 'positive',
            color: EMOTION_COLORS.positive,
            label: t('page.emotion.positive', 'Positive'),
        },
        {
            dataKey: 'neutral',
            color: EMOTION_COLORS.neutral,
            label: t('page.emotion.neutral', 'Neutral'),
        },
        {
            dataKey: 'negative',
            color: EMOTION_COLORS.negative,
            label: t('page.emotion.negative', 'Negative'),
        },
    ]

    return (
        <div className={`bg-white py-5 shadow-sm ${className}`} style={{
            borderRadius: UI_STYLES.cardBorderRadius,
            paddingLeft: UI_STYLES.cardPaddingX,
            paddingRight: UI_STYLES.cardPaddingX,
        }}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-4 rounded-full bg-orange-400" />
                <h3 className="text-base font-semibold text-slate-800">
                    {t('daily.emotionProportion', 'Emotional proportion analysis')}
                </h3>
            </div>

            <TimeAxisBarChart
                data={data}
                layers={layers}
                height={200}
                yAxisDomain={[0, 100]}
                showLegend={true}
                maxBarSize={10}
            />
        </div>
    )
}

export const EmotionProportionChart = memo(EmotionProportionChartInner)
