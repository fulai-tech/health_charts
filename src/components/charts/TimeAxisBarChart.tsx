/**
 * TimeAxisBarChart
 * 
 * Stacked bar chart with fixed time axis (00:00, 06:00, 12:00, 18:00, 24:00).
 * Data points are positioned proportionally based on their hour value.
 * Used for emotion proportion analysis over time.
 */

import { memo, useMemo } from 'react'
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Rectangle,
} from 'recharts'
import { getChartAnimationProps } from '@/lib/utils'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { useHideTooltipOnScroll } from '@/hooks/useHideTooltipOnScroll'
import { ChartClickTooltipOverlay } from './ChartClickTooltipOverlay'

export interface TimeDataPoint {
    /** Hour in format "HH:00" (e.g., "11:00", "14:00") */
    hour: string
    /** Label for tooltip */
    label?: string
    /** Values for each layer - all properties must be assignable to TimeDataPoint */
    [key: string]: string | number | undefined
}

export interface BarLayer {
    /** Data key for this layer */
    dataKey: string
    /** Fill color */
    color: string
    /** Display label for legend */
    label: string
}

export interface TimeAxisBarChartProps {
    /** Chart data with hour and values */
    data: TimeDataPoint[]
    /** Layer configurations (stacked from bottom to top) */
    layers: BarLayer[]
    /** Chart height (default: 200) */
    height?: number
    /** Y-axis domain (default: [0, 100]) */
    yAxisDomain?: [number, number]
    /** Show legend (default: true) */
    showLegend?: boolean
    /** Custom tooltip renderer */
    renderTooltip?: (props: any) => React.ReactNode
    /** Maximum bar width (default: 20) */
    maxBarSize?: number
    /** Bar border radius for top bar [topLeft, topRight, bottomRight, bottomLeft] (default: [4, 4, 0, 0]) */
    barRadius?: [number, number, number, number]
    /** Gap between bars in the same category (default: undefined) */
    barGap?: number
    /** Gap between bar categories (default: undefined) */
    barCategoryGap?: number
    /** Additional class names */
    className?: string
}

/**
 * Convert hour string to position (0-24)
 */
const hourToPosition = (hour: string): number => {
    const [h] = hour.split(':').map(Number)
    return h
}

/**
 * Custom tooltip component
 */
const DefaultTooltip = memo(({ active, payload, layers }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0]?.payload
    if (!data) return null

    return (
        <div className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
            <p className="font-medium mb-1">{data.label || data.hour}</p>
            {layers.map((layer: BarLayer) => (
                <p key={layer.dataKey} style={{ color: layer.color }}>
                    {layer.label}: {data[layer.dataKey]}%
                </p>
            ))}
        </div>
    )
})

/**
 * Internal component for rendering bars with rounded tops
 */
const RoundedTopBar = memo((props: any) => {
    const { fill, x, y, width, height, payload, dataKey, layers, barRadius } = props

    // Determine which layer is the topmost with data
    let topKey = null
    for (let i = layers.length - 1; i >= 0; i--) {
        const key = layers[i].dataKey
        if (payload[key] && payload[key] > 0) {
            topKey = key
            break
        }
    }

    const isTop = dataKey === topKey
    const radius = isTop ? barRadius : [0, 0, 0, 0]

    return <Rectangle {...props} radius={radius} />
})

RoundedTopBar.displayName = 'RoundedTopBar'

const TimeAxisBarChartInner = ({
    data,
    layers,
    height = 200,
    yAxisDomain = [0, 100],
    showLegend = true,
    renderTooltip,
    maxBarSize = 20,
    barRadius = [4, 4, 0, 0],
    barGap,
    barCategoryGap,
    className = '',
}: TimeAxisBarChartProps) => {
    const animationProps = useChartAnimation()
    const chartContainerRef = useHideTooltipOnScroll<HTMLDivElement>()

    // Transform data to include position
    const chartData = useMemo(() => {
        // Place actual data points at their positions
        const result = data.map((point) => ({
            ...point,
            position: hourToPosition(point.hour),
        }))

        return result
    }, [data])

    // Fixed X-axis ticks
    const xAxisTicks = ['00:00', '06:00', '12:00', '18:00', '24:00']

    return (
        <div className={`transform-gpu will-change-transform ${className}`}>
            {/* Legend */}
            {showLegend && (
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                    {layers.map((layer) => (
                        <div key={layer.dataKey} className="flex items-center gap-1.5">
                            <span
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: layer.color }}
                            />
                            <span className="text-xs text-slate-500">{layer.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Chart：透明遮罩仅点击触发 tooltip */}
            <div ref={chartContainerRef} style={{ height }} className="-mx-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                        barGap={barGap}
                        barCategoryGap={barCategoryGap}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="hour"
                            type="category"
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                            ticks={xAxisTicks}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                            domain={yAxisDomain}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            content={renderTooltip || ((props) => <DefaultTooltip {...props} layers={layers} />)}
                            wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
                            allowEscapeViewBox={{ x: false, y: false }}
                        />
                        {/* Stacked bars */}
                        {layers.map((layer) => (
                            <Bar
                                key={layer.dataKey}
                                dataKey={layer.dataKey}
                                stackId="stack"
                                fill={layer.color}
                                maxBarSize={maxBarSize}
                                shape={<RoundedTopBar layers={layers} barRadius={barRadius} />}
                                {...animationProps}
                            />
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
                <ChartClickTooltipOverlay containerRef={chartContainerRef} />
            </div>
        </div>
    )
}

export const TimeAxisBarChart = memo(TimeAxisBarChartInner)
