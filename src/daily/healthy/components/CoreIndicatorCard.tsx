/**
 * CoreIndicatorCard
 * 
 * Displays a single health indicator with mini chart and stats grid.
 * Shows latest reading, 7-day average, max/min values.
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { TimeAxisLineChart } from '@/components/charts/TimeAxisLineChart'
import type { IndicatorChartPoint } from '../types'

export interface CoreIndicatorCardProps {
    /** Indicator type */
    type: 'bloodPressure' | 'heartRate' | 'bloodGlucose' | 'bloodOxygen'
    /** Title */
    title: string
    /** Theme color */
    color: string
    /** Latest reading (for BP: object, others: number) */
    latest: number | { systolic: number; diastolic: number } | null
    /** 7-day average */
    avg: number | { systolic: number; diastolic: number } | null
    /** Maximum value */
    max: number | { systolic: number; diastolic: number } | null
    /** Minimum value */
    min: number | { systolic: number; diastolic: number } | null
    /** Reference range */
    reference: string | { systolic: string; diastolic: string }
    /** Status badge */
    status: string | null
    /** Chart data */
    chart: IndicatorChartPoint[]
    /** Additional class names */
    className?: string
}

/**
 * Format value for display
 */
const formatValue = (
    value: number | { systolic: number; diastolic: number } | null,
    type: string
): string => {
    if (value === null) return '--'

    if (typeof value === 'object' && 'systolic' in value) {
        return `${value.systolic}/${value.diastolic}`
    }

    // Format glucose with decimal
    if (type === 'bloodGlucose' && typeof value === 'number') {
        return value.toFixed(1)
    }

    return String(value)
}

/**
 * Get status color
 */
const getStatusColor = (status: string | null): string => {
    if (!status) return '#94a3b8'
    const statusLower = status.toLowerCase()

    if (statusLower.includes('normal')) return '#10B981'
    if (statusLower.includes('high') || statusLower.includes('danger')) return '#EF4444'
    if (statusLower.includes('low')) return '#3B82F6'

    return '#F59E0B'
}

const CoreIndicatorCardInner = ({
    type,
    title,
    color,
    latest,
    avg,
    max,
    min,
    reference,
    status,
    chart,
    className = '',
}: CoreIndicatorCardProps) => {
    const { t } = useTranslation()

    // Prepare chart data for line chart
    const chartData = chart
        .map((point) => ({
            time: point.time,
            value: type === 'bloodPressure' ? point.systolic ?? 0 : point.value ?? 0,
        }))
        .filter((point): point is { time: string; value: number } => typeof point.value === 'number' && point.value >= 0)

    const refString = typeof reference === 'object'
        ? `${reference.systolic}/${reference.diastolic}`
        : reference

    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-slate-700">{title}</span>
                    {status && (
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: `${getStatusColor(status)}20`,
                                color: getStatusColor(status),
                            }}
                        >
                            {status}
                        </span>
                    )}
                </div>
                <span className="text-xs text-slate-400">
                    {t('daily.reference', 'Reference')}: {refString}
                </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
                <div>
                    <div className="text-lg font-bold" style={{ color }}>
                        {formatValue(latest, type)}
                    </div>
                    <div className="text-xs text-slate-400">{t('daily.latest', 'Latest')}</div>
                </div>
                <div>
                    <div className="text-lg font-semibold text-slate-700">
                        {formatValue(avg, type)}
                    </div>
                    <div className="text-xs text-slate-400">{t('daily.weekAvg', '7d Avg')}</div>
                </div>
                <div>
                    <div className="text-lg font-semibold text-slate-700">
                        {formatValue(max, type)}
                    </div>
                    <div className="text-xs text-slate-400">{t('common.max', 'Max')}</div>
                </div>
                <div>
                    <div className="text-lg font-semibold text-slate-700">
                        {formatValue(min, type)}
                    </div>
                    <div className="text-xs text-slate-400">{t('common.min', 'Min')}</div>
                </div>
            </div>

            {/* Mini chart */}
            {chartData.length > 0 && (
                <TimeAxisLineChart
                    data={chartData}
                    color={color}
                    height={80}
                    showArea={true}
                    showYAxis={false}
                />
            )}
        </div>
    )
}

export const CoreIndicatorCard = memo(CoreIndicatorCardInner)
