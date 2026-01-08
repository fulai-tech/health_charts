/**
 * BloodPressureIndicatorCard
 * 
 * Displays blood pressure indicator with dual-line chart (SBP/DBP).
 * Reference design: src/features/blood-pressure/components/BPTrendyReportCard.tsx
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { VITAL_COLORS, UI_COLORS } from '@/config/theme'
import type { IndicatorChartPoint } from '../types'

export interface BloodPressureIndicatorCardProps {
    /** Latest reading */
    latest: { systolic: number; diastolic: number } | null
    /** 7-day average */
    avg: { systolic: number; diastolic: number } | null
    /** Maximum value */
    max: { systolic: number; diastolic: number } | null
    /** Minimum value */
    min: { systolic: number; diastolic: number } | null
    /** Reference range */
    reference: { systolic: string; diastolic: string }
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
        name: string
        payload: {
            time: string
            systolic: number
            diastolic: number
        }
    }>
}

const CustomTooltip = memo(({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0]?.payload
    if (!data) return null

    return (
        <div className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
            <p className="font-medium mb-1">{data.time}</p>
            <p className="text-orange-300">SBP: {data.systolic}</p>
            <p className="text-emerald-300">DBP: {data.diastolic}</p>
        </div>
    )
})

CustomTooltip.displayName = 'BPCustomTooltip'

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

const BloodPressureIndicatorCardInner = ({
    latest,
    avg,
    max,
    min,
    reference,
    status,
    chart,
    className = '',
}: BloodPressureIndicatorCardProps) => {
    const { t } = useTranslation()
    const themeColor = VITAL_COLORS.bp
    const dbpColor = '#10B981'

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!chart || chart.length === 0) {
            // Placeholder data
            return [
                { time: '00:00', systolic: 120, diastolic: 80 },
                { time: '04:00', systolic: 118, diastolic: 78 },
                { time: '08:00', systolic: 125, diastolic: 82 },
                { time: '12:00', systolic: 130, diastolic: 85 },
                { time: '16:00', systolic: 128, diastolic: 84 },
                { time: '20:00', systolic: 122, diastolic: 80 },
            ]
        }
        return chart.map((point) => ({
            time: point.time,
            systolic: point.systolic ?? 0,
            diastolic: point.diastolic ?? 0,
        }))
    }, [chart])

    // Calculate change from average
    const getChange = () => {
        if (!latest || !avg) return null
        const diff = latest.systolic - avg.systolic
        if (diff === 0) return null

        const Icon = diff > 0 ? ArrowUp : ArrowDown
        const color = diff > 0 ? UI_COLORS.trend.up : UI_COLORS.trend.down

        return (
            <span className="flex items-center gap-0.5 text-sm" style={{ color }}>
                <Icon className="w-3 h-3" />
                {Math.abs(diff)}
            </span>
        )
    }

    const refString = `${reference.systolic}/${reference.diastolic}`

    return (
        <Card className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: themeColor }} />
                    <span className="text-base font-semibold text-slate-800">
                        {t('vitals.bloodPressure', 'Blood pressure')}
                    </span>
                    <span className="text-xs text-slate-400">mmHg</span>
                </div>
                <span className="text-xs text-slate-400">
                    {t('daily.standard', 'Standard')}: {refString}
                </span>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 mb-4">
                <div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold" style={{ color: themeColor }}>
                            {latest ? `${latest.systolic}/${latest.diastolic}` : '--'}
                        </span>
                        {getChange()}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {t('daily.newestValue', 'Newest value')}
                    </p>
                </div>
                <div>
                    <span className="text-2xl font-semibold text-slate-700">
                        {avg ? `${avg.systolic}/${avg.diastolic}` : '--'}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {t('daily.average', 'Average')}
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColor }} />
                    <span className="text-xs text-slate-500">SBP</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: dbpColor }} />
                    <span className="text-xs text-slate-500">DBP</span>
                </div>
            </div>

            {/* Chart */}
            <TrendLineChart
                data={chartData}
                lines={[
                    {
                        dataKey: 'systolic',
                        color: themeColor,
                        label: 'SBP',
                        showArea: true,
                        gradientId: 'bpSbpGradient',
                        legendShape: 'circle',
                    },
                    {
                        dataKey: 'diastolic',
                        color: dbpColor,
                        label: 'DBP',
                        showArea: true,
                        gradientId: 'bpDbpGradient',
                        legendShape: 'circle',
                    },
                ]}
                xAxisKey="time"
                yAxisDomain={[50, 180]}
                renderTooltip={(props) => <CustomTooltip {...props} />}
                height={180}
                showLegend={false}
            />
        </Card>
    )
}

export const BloodPressureIndicatorCard = memo(BloodPressureIndicatorCardInner)
