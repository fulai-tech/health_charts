/**
 * BloodGlucoseIndicatorCard
 * 
 * Displays blood glucose (POCT) indicator with area chart.
 * Shows: Newest Value, Average, Highest, Lowest + Status Badge
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Droplets, ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { VITAL_COLORS } from '@/config/theme'
import { StatBox } from './StatBox'
import type { IndicatorChartPoint, ChangeIndicator } from '../types'

export interface BloodGlucoseIndicatorCardProps {
    /** Latest reading */
    latest: number | null
    /** Change indicator */
    change?: ChangeIndicator
    /** Average value */
    avg: number | null
    /** Maximum value (Highest) */
    max: number | null
    /** Minimum value (Lowest) */
    min: number | null
    /** Reference range (e.g., "3.9-6.1") */
    reference: string
    /** Status badge text (e.g., "偏高", "正常") */
    status: string | null
    /** Chart data */
    chart: IndicatorChartPoint[]
    /** Y-axis range from API */
    yAxisRange?: { min: number; max: number }
    /** Additional class names */
    className?: string
}

/**
 * Status badge colors mapping
 */
const getStatusBadgeStyle = (status: string | null): { bg: string; text: string } => {
    if (!status) return { bg: 'bg-slate-100', text: 'text-slate-500' }

    const statusLower = status.toLowerCase()
    // Chinese status mappings
    if (status.includes('高') || statusLower.includes('high') || statusLower.includes('exceed')) {
        return { bg: 'bg-orange-500', text: 'text-white' }
    }
    if (status.includes('低') || statusLower.includes('low')) {
        return { bg: 'bg-blue-500', text: 'text-white' }
    }
    if (status.includes('正常') || statusLower.includes('normal')) {
        return { bg: 'bg-green-500', text: 'text-white' }
    }
    return { bg: 'bg-amber-500', text: 'text-white' }
}

/**
 * Translate status to display text
 */
const getStatusText = (status: string | null, t: (key: string, fallback: string) => string): string => {
    if (!status) return ''
    
    // Map Chinese status to i18n keys
    if (status.includes('偏高') || status.includes('高')) {
        return t('status.exceed', 'Exceed')
    }
    if (status.includes('偏低') || status.includes('低')) {
        return t('status.low', 'Low')
    }
    if (status.includes('正常')) {
        return t('status.normal', 'Normal')
    }
    return status
}

/**
 * Custom Tooltip component
 */
interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{
        dataKey: string
        value: number
        payload: {
            time: string
            value: number
        }
    }>
}

const CustomTooltip = memo(({ active, payload }: CustomTooltipProps) => {
    const { t } = useTranslation()

    if (!active || !payload || payload.length === 0) return null

    const data = payload[0]?.payload
    if (!data) return null

    return (
        <div className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
            <p className="font-medium mb-1">{data.time}</p>
            <p className="text-amber-300">
                {t('daily.average', 'Average')}: {data.value?.toFixed(1)}
            </p>
        </div>
    )
})

CustomTooltip.displayName = 'GlucoseCustomTooltip'

/**
 * Stat item component
 */
interface StatItemProps {
    value: number | null
    label: string
    isHighlighted?: boolean
    themeColor?: string
    changeIndicator?: React.ReactNode
    formatValue?: (v: number) => string
}

const StatItem = memo(({ value, label, isHighlighted, themeColor, changeIndicator, formatValue }: StatItemProps) => (
    <div className="flex-1 text-center">
        <div className="flex items-baseline justify-center gap-1">
            <span
                className={`font-bold ${isHighlighted ? 'text-3xl' : 'text-2xl'}`}
                style={isHighlighted && themeColor ? { color: themeColor } : { color: '#334155' }}
            >
                {value !== null ? (formatValue ? formatValue(value) : value) : '--'}
            </span>
            {changeIndicator}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
))

StatItem.displayName = 'StatItem'

const BloodGlucoseIndicatorCardInner = ({
    latest,
    change,
    avg,
    max,
    min,
    reference,
    status,
    chart,
    yAxisRange,
    className = '',
}: BloodGlucoseIndicatorCardProps) => {
    const { t } = useTranslation()
    const themeColor = VITAL_COLORS.glucose

    // Format value with 1 decimal
    const formatValue = (v: number) => v.toFixed(1)

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!chart || chart.length === 0) {
            // Placeholder data
            return [
                { time: '00:00', value: 5.2 },
                { time: '04:00', value: 5.5 },
                { time: '08:00', value: 7.5 },
                { time: '12:00', value: 6.8 },
                { time: '16:00', value: 6.2 },
                { time: '20:00', value: 5.8 },
            ]
        }
        return chart.map((point) => ({
            time: point.time,
            value: point.value ?? point.avg ?? 0,
        }))
    }, [chart])

    // Change indicator element
    const changeElement = useMemo(() => {
        if (!change || change.value === null || change.trend === null) return null

        const Icon = change.trend === 'up' ? ArrowUp : ArrowDown
        // For glucose, higher is generally worse
        const color = change.trend === 'up' ? '#EF4444' : '#10B981'

        return (
            <span className="flex items-center gap-0.5 text-sm" style={{ color }}>
                <Icon className="w-3 h-3" />
                {change.value.toFixed(1)}
            </span>
        )
    }, [change])

    // Y-axis domain
    const yDomain = useMemo(() => {
        if (yAxisRange) {
            return [yAxisRange.min, yAxisRange.max] as [number, number]
        }
        return [2, 14] as [number, number]
    }, [yAxisRange])

    // Status badge
    const statusBadge = useMemo(() => {
        if (!status) return null
        const style = getStatusBadgeStyle(status)
        const text = getStatusText(status, t)
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
                {text}
            </span>
        )
    }, [status, t])

    return (
        <Card className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5" style={{ color: themeColor }} />
                    <span className="text-base font-semibold text-slate-800">
                        POCT
                    </span>
                    {statusBadge}
                    <span className="text-xs text-slate-400">mmol/L</span>
                </div>
                <span className="text-xs text-slate-400">
                    {t('daily.standard', 'Standard')}: {reference}
                </span>
            </div>

            {/* Stats row - 4 columns */}
            <StatBox>
                <div className="flex divide-x divide-slate-200">
                    <StatItem
                        value={latest}
                        label={t('daily.newestValue', 'Newest value')}
                        isHighlighted
                        themeColor={themeColor}
                        changeIndicator={changeElement}
                        formatValue={formatValue}
                    />
                    <StatItem
                        value={avg}
                        label={t('daily.average', 'Average')}
                        formatValue={formatValue}
                    />
                    <StatItem
                        value={max}
                        label={t('daily.highest', 'Highest')}
                        formatValue={formatValue}
                    />
                    <StatItem
                        value={min}
                        label={t('daily.lowest', 'Lowest')}
                        formatValue={formatValue}
                    />
                </div>
            </StatBox>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-2 px-1">
                <div className="flex items-center gap-1.5">
                    <span
                        className="w-4 h-0.5"
                        style={{ backgroundColor: themeColor }}
                    />
                    <span className="text-xs text-slate-500">
                        {t('daily.mean', 'Mean')}
                    </span>
                </div>
            </div>

            {/* Chart */}
            <TrendLineChart
                data={chartData}
                lines={[
                    {
                        dataKey: 'value',
                        color: themeColor,
                        label: 'POCT',
                        showArea: true,
                        gradientId: 'glucoseGradient',
                        legendShape: 'line',
                    },
                ]}
                xAxisKey="time"
                yAxisDomain={yDomain}
                renderTooltip={(props) => <CustomTooltip {...props} />}
                height={180}
                showLegend={false}
            />
        </Card>
    )
}

export const BloodGlucoseIndicatorCard = memo(BloodGlucoseIndicatorCardInner)
