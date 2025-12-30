/**
 * SleepQualityIndicators
 * 
 * Grid of 6 sleep quality metrics.
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import type { QualityIndicator } from '../types'

export interface SleepQualityIndicatorsProps {
    indicators: {
        bedTime: QualityIndicator
        sleepTime: QualityIndicator
        wakeTime: QualityIndicator
        getUpTime: QualityIndicator
        sleepLatency: QualityIndicator
        sleepEfficiency: QualityIndicator
    }
    className?: string
}

const IndicatorCell = ({
    label,
    value,
    unit,
    reference,
}: {
    label: string
    value: string | number | null
    unit?: string
    reference: string
}) => (
    <div className="bg-slate-50 rounded-xl p-3">
        <div className="text-xs text-slate-500 mb-1">{label}</div>
        <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-800">
                {value ?? '--'}
            </span>
            {unit && <span className="text-sm text-slate-500">{unit}</span>}
        </div>
        <div className="flex items-center gap-1 mt-1">
            <Info className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">
                Standard: {reference}
            </span>
        </div>
    </div>
)

const SleepQualityIndicatorsInner = ({
    indicators,
    className = '',
}: SleepQualityIndicatorsProps) => {
    const { t } = useTranslation()

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-4 rounded-full bg-violet-400" />
                <h3 className="text-base font-semibold text-slate-800">
                    {t('daily.sleepQuality', 'Sleep quality indicators')}
                </h3>
                <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3">
                <IndicatorCell
                    label={indicators.bedTime.label}
                    value={indicators.bedTime.value}
                    reference={indicators.bedTime.reference}
                />
                <IndicatorCell
                    label={indicators.sleepTime.label}
                    value={indicators.sleepTime.value}
                    reference={indicators.sleepTime.reference}
                />
                <IndicatorCell
                    label={indicators.wakeTime.label}
                    value={indicators.wakeTime.value}
                    reference={indicators.wakeTime.reference}
                />
                <IndicatorCell
                    label={indicators.getUpTime.label}
                    value={indicators.getUpTime.value}
                    reference={indicators.getUpTime.reference}
                />
                <IndicatorCell
                    label={indicators.sleepLatency.label}
                    value={indicators.sleepLatency.value}
                    unit={indicators.sleepLatency.unit}
                    reference={indicators.sleepLatency.reference}
                />
                <IndicatorCell
                    label={indicators.sleepEfficiency.label}
                    value={indicators.sleepEfficiency.value}
                    unit={indicators.sleepEfficiency.unit}
                    reference={indicators.sleepEfficiency.reference}
                />
            </div>
        </div>
    )
}

export const SleepQualityIndicators = memo(SleepQualityIndicatorsInner)
