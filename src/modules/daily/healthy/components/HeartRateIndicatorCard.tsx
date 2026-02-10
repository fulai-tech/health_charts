/**
 * HeartRateIndicatorCard
 * 
 * Displays heart rate indicator with area chart showing Range and Mean.
 * Shows: Newest Value, Average, Highest, Lowest
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { VITAL_COLORS } from '@/config/theme'
import { StatBox } from './StatBox'
import type { IndicatorChartPoint, ChangeIndicator } from '../types'

export interface HeartRateIndicatorCardProps {
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
    /** Reference range (e.g., "60-100") */
    reference: string
    /** Status badge */
    status?: string | null
    /** Chart data with avg/max/min per point */
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
            avg: number
            max?: number
            min?: number
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
            <p className="text-red-300">
                {t('daily.average', 'Average')}: {data.avg}
            </p>
            {data.max !== undefined && (
                <p className="text-red-200">
                    {t('daily.highest', 'Highest')}: {data.max}
                </p>
            )}
            {data.min !== undefined && (
                <p className="text-red-200">
                    {t('daily.lowest', 'Lowest')}: {data.min}
                </p>
            )}
        </div>
    )
})

CustomTooltip.displayName = 'HRCustomTooltip'

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
    <div className="pl-5">
        <div className="flex items-baseline gap-1">
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

const HeartRateIndicatorCardInner = ({
    latest,
    change,
    avg,
    max,
    min,
    reference,
    chart,
    yAxisRange,
    className = '',
}: HeartRateIndicatorCardProps) => {
    const { t } = useTranslation()
    const themeColor = VITAL_COLORS.heartRate

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!chart || chart.length === 0) {
            // Placeholder chart data
            return [
                { time: '00:00', avg: 65, range: [60, 70] as [number, number] },
                { time: '04:00', avg: 62, range: [58, 68] as [number, number] },
                { time: '08:00', avg: 75, range: [70, 85] as [number, number] },
                { time: '12:00', avg: 82, range: [75, 90] as [number, number] },
                { time: '16:00', avg: 78, range: [72, 88] as [number, number] },
                { time: '20:00', avg: 70, range: [65, 78] as [number, number] },
            ]
        }
        return chart.map((point) => ({
            time: point.time,
            avg: point.avg ?? 0,
            range: [point.min ?? point.avg ?? 0, point.max ?? point.avg ?? 0] as [number, number],
        }))
    }, [chart])

    // Change indicator element
    const changeElement = useMemo(() => {
        if (!change || change.value === null || change.trend === null) return null

        const Icon = change.trend === 'up' ? ArrowUp : ArrowDown
        const color = change.trend === 'up' ? '#EF4444' : '#10B981'

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
        return [40, 120] as [number, number]
    }, [yAxisRange])

    return (
        <Card className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" style={{ color: themeColor }} />
                    <span className="text-base font-semibold text-slate-800">
                        {t('vitals.heartRate', 'Heart rate')}
                    </span>
                    <span className="text-xs text-slate-400">bpm</span>
                </div>
                <span className="text-xs text-slate-400">
                    {t('daily.standard', 'Standard')}: {reference}
                </span>
            </div>

            {/* Stats row - 4 columns */}
            <StatBox>
                <div className="grid grid-cols-4">
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
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: `${themeColor}40` }}
                    />
                    <span className="text-xs text-slate-500">
                        {t('daily.range', 'Range')}
                    </span>
                </div>
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
                        dataKey: 'avg',
                        areaDataKey: 'range',
                        color: themeColor,
                        label: t('vitals.heartRate', 'Heart Rate'),
                        showArea: true,
                        gradientId: 'hrGradient',
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

export const HeartRateIndicatorCard = memo(HeartRateIndicatorCardInner)
