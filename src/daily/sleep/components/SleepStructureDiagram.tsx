/**
 * SleepStructureDiagram
 * 
 * Shows total/deep duration and horizontal sleep stage chart.
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { SleepStructureChart } from '@/components/charts/SleepStructureChart'
import { SLEEP_COLORS } from '@/config/theme'
import type { SleepChartSegment } from '../types'

export interface SleepStructureDiagramProps {
    totalDuration: string
    deepDuration: string
    segments: SleepChartSegment[]
    className?: string
}

const SleepStructureDiagramInner = ({
    totalDuration,
    deepDuration,
    segments,
    className = '',
}: SleepStructureDiagramProps) => {
    const { t } = useTranslation()

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-4 rounded-full bg-violet-400" />
                <h3 className="text-base font-semibold text-slate-800">
                    {t('daily.sleepStructure', 'Sleep structure diagram')}
                </h3>
            </div>

            {/* Duration stats */}
            <div className="flex items-center gap-8 mb-4">
                <div>
                    <div className="text-2xl font-bold text-slate-800">{totalDuration}</div>
                    <div className="text-xs text-slate-400">
                        {t('daily.totalDuration', 'Total sleep duration')}
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-violet-500">{deepDuration}</div>
                    <div className="text-xs text-slate-400">
                        {t('daily.deepSleep', 'Deep sleep')}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: SLEEP_COLORS.deep }} />
                    <span className="text-xs text-slate-500">
                        {t('sleep.deep', 'Deep sleep')}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: SLEEP_COLORS.light }} />
                    <span className="text-xs text-slate-500">
                        {t('sleep.light', 'Light sleep')}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: SLEEP_COLORS.rem }} />
                    <span className="text-xs text-slate-500">
                        {t('sleep.rem', 'REM')}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: SLEEP_COLORS.awake }} />
                    <span className="text-xs text-slate-500">
                        {t('sleep.awake', 'Awake')}
                    </span>
                </div>
            </div>

            {/* Chart */}
            <SleepStructureChart data={segments} height={240} />
        </div>
    )
}

export const SleepStructureDiagram = memo(SleepStructureDiagramInner)
