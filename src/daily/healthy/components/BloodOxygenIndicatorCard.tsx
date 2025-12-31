/**
 * BloodOxygenIndicatorCard
 * 
 * Displays blood oxygen (SpO2) indicator with area chart.
 * Reference design: src/features/spo2/components/SpO2TrendyReportCard.tsx
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { VITAL_COLORS, UI_COLORS } from '@/config/theme'
import type { IndicatorChartPoint } from '../types'

export interface BloodOxygenIndicatorCardProps {
    /** Latest reading */
    latest: number | null
    /** 7-day average */
    avg: number | null
    /** Maximum value */
    max: number | null
    /** Minimum value */
    min: number | null
    /** Reference range */
    reference: string
    /** Status badge */
    status: string | null
    /** Chart data */
    chart: IndicatorChartPoint[]
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
                SpO2: {data.value}%
            </p>
        </div>
    )
})

CustomTooltip.displayName = 'SpO2CustomTooltip'

const BloodOxygenIndicatorCardInner = ({
    latest,
    avg,
    max,
    min,
    reference,
    status,
    chart,
    className = '',
}: BloodOxygenIndicatorCardProps) => {
    const { t } = useTranslation()
    const themeColor = VITAL_COLORS.spo2

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!chart || chart.length === 0) {
            // Placeholder data
            return [
                { time: '00:00', value: 97, range: [95, 98] as [number, number] },
                { time: '04:00', value: 96, range: [94, 98] as [number, number] },
                { time: '08:00', value: 98, range: [96, 99] as [number, number] },
                { time: '12:00', value: 97, range: [95, 99] as [number, number] },
                { time: '16:00', value: 98, range: [96, 99] as [number, number] },
                { time: '20:00', value: 97, range: [95, 98] as [number, number] },
            ]
        }
        return chart.map((point) => ({
            time: point.time,
            value: point.value ?? 0,
            range: [Math.max(90, (point.value ?? 97) - 2), Math.min(100, (point.value ?? 97) + 2)] as [number, number],
        }))
    }, [chart])

    // Calculate change from average
    const getChange = () => {
        if (latest === null || avg === null) return null
        const diff = latest - avg
        if (diff === 0) return null

        const Icon = diff > 0 ? ArrowUp : ArrowDown
        // For SpO2, higher is better
        const color = diff > 0 ? UI_COLORS.trend.down : UI_COLORS.trend.up

        return (
            <span className="flex items-center gap-0.5 text-sm" style={{ color }}>
                <Icon className="w-3 h-3" />
                {Math.abs(diff)}
            </span>
        )
    }

    return (
        <Card className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: themeColor }} />
                    <span className="text-base font-semibold text-slate-800">
                        {t('vitals.spo2', 'SpO2')}
                    </span>
                    <span className="text-xs text-slate-400">%</span>
                </div>
                <span className="text-xs text-slate-400">
                    {t('daily.standard', 'Standard')}: {reference}
                </span>
            </div>

            {/* Stats row */}
            <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4">
                <div className="flex gap-6">
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-bold" style={{ color: themeColor }}>
                                {latest ?? '--'}
                            </span>
                            {getChange()}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {t('daily.newestValue', 'Newest value')}
                        </p>
                    </div>
                    <div>
                        <span className="text-2xl font-semibold text-slate-700">
                            {avg ?? '--'}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {t('daily.average', 'Average')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <TrendLineChart
                data={chartData}
                lines={[
                    {
                        dataKey: 'value',
                        areaDataKey: 'range',
                        color: themeColor,
                        label: 'SpO2',
                        showArea: true,
                        gradientId: 'spo2Gradient',
                        legendShape: 'line',
                    },
                ]}
                xAxisKey="time"
                yAxisDomain={[90, 100]}
                renderTooltip={(props) => <CustomTooltip {...props} />}
                height={180}
                showLegend={false}
            />
        </Card>
    )
}

export const BloodOxygenIndicatorCard = memo(BloodOxygenIndicatorCardInner)
