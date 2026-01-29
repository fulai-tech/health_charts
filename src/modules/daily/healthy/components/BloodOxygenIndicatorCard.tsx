/**
 * BloodOxygenIndicatorCard
 * 
 * Displays blood oxygen (SpO2) indicator with area chart.
 * Shows: Newest Value, Average, Highest, Lowest
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { VITAL_COLORS } from '@/config/theme'
import { StatBox } from './StatBox'
import type { IndicatorChartPoint, ChangeIndicator } from '../types'

export interface BloodOxygenIndicatorCardProps {
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
    /** Reference range (e.g., "93-100") */
    reference: string
    /** Status badge */
    status?: string | null
    /** Chart data */
    chart: IndicatorChartPoint[]
    /** Y-axis range from API */
    yAxisRange?: { min: number; max: number }
    /** Additional class names */
    className?: string
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
            <p className="text-cyan-300">
                {t('daily.average', 'Average')}: {data.value}
            </p>
        </div>
    )
})

CustomTooltip.displayName = 'SpO2CustomTooltip'

/**
 * Stat item component
 */
interface StatItemProps {
    value: number | null
    label: string
    isHighlighted?: boolean
    themeColor?: string
    changeIndicator?: React.ReactNode
}

const StatItem = memo(({ value, label, isHighlighted, themeColor, changeIndicator }: StatItemProps) => (
    <div className="flex-1 text-center">
        <div className="flex items-baseline justify-center gap-1">
            <span
                className={`font-bold ${isHighlighted ? 'text-3xl' : 'text-2xl'}`}
                style={isHighlighted && themeColor ? { color: themeColor } : { color: '#334155' }}
            >
                {value ?? '--'}
            </span>
            {changeIndicator}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
))

StatItem.displayName = 'StatItem'

const BloodOxygenIndicatorCardInner = ({
    latest,
    change,
    avg,
    max,
    min,
    reference,
    chart,
    yAxisRange,
    className = '',
}: BloodOxygenIndicatorCardProps) => {
    const { t } = useTranslation()
    const themeColor = VITAL_COLORS.spo2

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!chart || chart.length === 0) {
            // Placeholder data
            return [
                { time: '00:00', value: 97 },
                { time: '04:00', value: 96 },
                { time: '08:00', value: 98 },
                { time: '12:00', value: 97 },
                { time: '16:00', value: 98 },
                { time: '20:00', value: 97 },
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
        // For SpO2, higher is better, so down is bad
        const color = change.trend === 'up' ? '#10B981' : '#EF4444'

        return (
            <span className="flex items-center gap-0.5 text-sm" style={{ color }}>
                <Icon className="w-3 h-3" />
                {change.value}
            </span>
        )
    }, [change])

    // Y-axis domain
    const yDomain = useMemo(() => {
        if (yAxisRange) {
            return [yAxisRange.min, yAxisRange.max] as [number, number]
        }
        return [88, 102] as [number, number]
    }, [yAxisRange])

    return (
        <Card className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" style={{ color: themeColor }} />
                    <span className="text-base font-semibold text-slate-800">
                        SpO2
                    </span>
                    <span className="text-xs text-slate-400">%</span>
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
                    />
                    <StatItem
                        value={avg}
                        label={t('daily.average', 'Average')}
                    />
                    <StatItem
                        value={max}
                        label={t('daily.highest', 'Highest')}
                    />
                    <StatItem
                        value={min}
                        label={t('daily.lowest', 'Lowest')}
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
                        label: 'SpO2',
                        showArea: true,
                        gradientId: 'spo2Gradient',
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

export const BloodOxygenIndicatorCard = memo(BloodOxygenIndicatorCardInner)
