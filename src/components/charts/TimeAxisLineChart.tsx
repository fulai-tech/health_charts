/**
 * TimeAxisLineChart
 * 
 * Line chart with time axis for daily indicator data.
 * Supports area fill and positions points proportionally on 00:00-24:00 axis.
 */

import { memo, useMemo } from 'react'
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts'
import { getChartAnimationProps } from '@/lib/utils'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { useHideTooltipOnScroll } from '@/hooks/useHideTooltipOnScroll'
import { ChartClickTooltipOverlay } from './ChartClickTooltipOverlay'

export interface TimeLineDataPoint {
    /** Time in format "HH:00" (e.g., "01:00", "14:00") */
    time: string
    /** Value at this time point */
    value: number
    /** Optional additional values for multi-line charts */
    [key: string]: number | string | undefined
}

export interface TimeAxisLineChartProps {
    /** Chart data with time and values */
    data: TimeLineDataPoint[]
    /** Data key for line value (default: 'value') */
    dataKey?: string
    /** Line color */
    color: string
    /** Show gradient area fill (default: true) */
    showArea?: boolean
    /** Chart height (default: 120) */
    height?: number
    /** Y-axis domain */
    yAxisDomain?: [number, number]
    /** Show Y-axis (default: false for mini charts) */
    showYAxis?: boolean
    /** Custom tooltip renderer */
    renderTooltip?: (props: any) => React.ReactNode
    /** Additional class names */
    className?: string
    /** Gradient ID (auto-generated if not provided) */
    gradientId?: string
}

/**
 * Default tooltip component
 */
const DefaultTooltip = memo(({ active, payload, dataKey }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0]?.payload
    if (!data) return null

    return (
        <div className="bg-slate-700 text-white px-2 py-1 rounded text-xs shadow-lg">
            <p>{data.time}: {data[dataKey]}</p>
        </div>
    )
})

const TimeAxisLineChartInner = ({
    data,
    dataKey = 'value',
    color,
    showArea = true,
    height = 120,
    yAxisDomain,
    showYAxis = false,
    renderTooltip,
    className = '',
    gradientId,
}: TimeAxisLineChartProps) => {
    const animationProps = useChartAnimation()
    const chartContainerRef = useHideTooltipOnScroll<HTMLDivElement>()
    const uniqueGradientId = gradientId || `timeLineGradient-${Math.random().toString(36).substr(2, 9)}`

    // Fixed X-axis ticks
    const xAxisTicks = ['00:00', '06:00', '12:00', '18:00', '24:00']

    // Calculate Y-axis domain if not provided
    const calculatedDomain = useMemo(() => {
        if (yAxisDomain) return yAxisDomain
        if (!data || data.length === 0) return [0, 100]

        const values = data.map((d) => d[dataKey] as number).filter((v) => typeof v === 'number')
        if (values.length === 0) return [0, 100]

        const min = Math.min(...values)
        const max = Math.max(...values)
        const padding = (max - min) * 0.1

        return [Math.floor(min - padding), Math.ceil(max + padding)]
    }, [data, dataKey, yAxisDomain])

    return (
        <div ref={chartContainerRef} className={`transform-gpu will-change-transform relative ${className}`} style={{ height }} data-swipe-ignore>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{ top: 5, right: 5, left: showYAxis ? -15 : -30, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id={uniqueGradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={false}
                        ticks={xAxisTicks}
                    />

                    {showYAxis && (
                        <YAxis
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                            domain={calculatedDomain}
                        />
                    )}

                    <Tooltip
                        content={renderTooltip || ((props) => <DefaultTooltip {...props} dataKey={dataKey} />)}
                        wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
                        allowEscapeViewBox={{ x: false, y: false }}
                    />

                    {showArea && (
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke="transparent"
                            fill={`url(#${uniqueGradientId})`}
                            {...animationProps}
                        />
                    )}

                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, stroke: color, strokeWidth: 2, fill: '#fff' }}
                        {...animationProps}
                    />
                </ComposedChart>
            </ResponsiveContainer>
            <ChartClickTooltipOverlay containerRef={chartContainerRef} />
        </div>
    )
}

export const TimeAxisLineChart = memo(TimeAxisLineChartInner)
