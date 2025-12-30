/**
 * SleepDistributionCard
 * 
 * Displays sleep stage distribution as a donut chart with labels.
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Info } from 'lucide-react'
import { SLEEP_COLORS } from '@/config/theme'
import type { SleepStructureItem } from '../types'

export interface SleepDistributionCardProps {
    items: SleepStructureItem[]
    totalMinutes?: number
    className?: string
}

const getStageColor = (type: string): string => {
    const colorMap: Record<string, string> = SLEEP_COLORS
    return colorMap[type.toLowerCase()] || '#94a3b8'
}

const SleepDistributionCardInner = ({
    items,
    totalMinutes,
    className = '',
}: SleepDistributionCardProps) => {
    const { t } = useTranslation()

    const pieData = useMemo(() => {
        return items.map((item) => ({
            name: item.label,
            value: item.percent,
            color: getStageColor(item.type),
        }))
    }, [items])

    // Calculate hours and minutes
    const hours = totalMinutes ? Math.floor(totalMinutes / 60) : '--'
    const mins = totalMinutes ? totalMinutes % 60 : '--'

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-4 rounded-full bg-violet-400" />
                <h3 className="text-base font-semibold text-slate-800">
                    {t('daily.sleepDistribution', 'Sleep distribution')}
                </h3>
                <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="flex items-center gap-6">
                {/* Legend */}
                <div className="flex-1 space-y-2">
                    {items.map((item) => (
                        <div key={item.type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: getStageColor(item.type) }}
                                />
                                <span className="text-sm text-slate-600">{item.label}</span>
                                <span className="text-sm font-medium text-slate-800">
                                    {item.percent}%
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">{item.duration}</span>
                                {item.status && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                                        {item.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pie chart with center label - single column layout */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={63}
                                paddingAngle={3}
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
                        <span className="text-2xl font-bold text-slate-800">{hours}</span>
                        <span className="text-xs text-slate-400">
                            {t('daily.totalHours', 'Total hours')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const SleepDistributionCard = memo(SleepDistributionCardInner)
