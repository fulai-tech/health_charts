/**
 * BloodGlucoseIndicatorCard
 * 
 * Displays blood glucose (POCT) indicator with area chart.
 * Reference design: src/features/glucose/components/GlucoseTrendyReportCard.tsx
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { VITAL_COLORS, UI_COLORS } from '@/config/theme'
import type { IndicatorChartPoint } from '../types'

export interface BloodGlucoseIndicatorCardProps {
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
            <p className="text-amber-300">
                {t('vitals.bloodGlucose', 'Blood Glucose')}: {data.value.toFixed(1)} {t('units.mmolL', 'mmol/L')}
            </p>
        </div>
    )
})

CustomTooltip.displayName = 'GlucoseCustomTooltip'

const BloodGlucoseIndicatorCardInner = ({
    latest,
    avg,
    max,
    min,
    reference,
    status,
    chart,
    className = '',
}: BloodGlucoseIndicatorCardProps) => {
    const { t } = useTranslation()
    const themeColor = VITAL_COLORS.glucose

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!chart || chart.length === 0) {
            // Placeholder data
            return [
                { time: '06:00', value: 5.2, range: [4.5, 6.0] as [number, number] },
                { time: '08:00', value: 7.5, range: [6.5, 8.5] as [number, number] },
                { time: '10:00', value: 6.2, range: [5.5, 7.0] as [number, number] },
                { time: '12:00', value: 7.8, range: [7.0, 8.5] as [number, number] },
                { time: '14:00', value: 6.5, range: [5.8, 7.2] as [number, number] },
                { time: '18:00', value: 5.8, range: [5.0, 6.5] as [number, number] },
            ]
        }
        return chart.map((point) => ({
            time: point.time,
            value: point.value ?? 0,
            range: [Math.max(0, (point.value ?? 5.5) - 1), (point.value ?? 5.5) + 1] as [number, number],
        }))
    }, [chart])

    // Calculate change from average
    const getChange = () => {
        if (latest === null || avg === null) return null
        const diff = latest - avg
        if (Math.abs(diff) < 0.1) return null

        const Icon = diff > 0 ? ArrowUp : ArrowDown
        // For glucose, lower is generally better
        const color = diff > 0 ? '#EF4444' : '#10B981'

        return (
            <span className="flex items-center gap-0.5 text-sm" style={{ color }}>
                <Icon className="w-3 h-3" />
                {Math.abs(diff).toFixed(1)}
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
                        {t('vitals.bloodGlucose', 'POCT')}
                    </span>
                    <span className="text-xs text-slate-400">mmol/L</span>
                </div>
                <span className="text-xs text-slate-400">
                    {t('daily.standard', 'Standard')}: {reference}
                </span>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 mb-4">
                <div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold" style={{ color: themeColor }}>
                            {latest !== null ? latest.toFixed(1) : '--'}
                        </span>
                        {getChange()}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {t('daily.newestValue', 'Newest value')}
                    </p>
                </div>
                <div>
                    <span className="text-2xl font-semibold text-slate-700">
                        {avg !== null ? avg.toFixed(1) : '--'}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {t('daily.average', 'Average')}
                    </p>
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
                        label: t('vitals.bloodGlucose', 'Blood Glucose'),
                        showArea: true,
                        gradientId: 'glucoseGradient',
                        legendShape: 'line',
                    },
                ]}
                xAxisKey="time"
                yAxisDomain={[3, 12]}
                renderTooltip={(props) => <CustomTooltip {...props} />}
                height={180}
                showLegend={false}
            />
        </Card>
    )
}

export const BloodGlucoseIndicatorCard = memo(BloodGlucoseIndicatorCardInner)
