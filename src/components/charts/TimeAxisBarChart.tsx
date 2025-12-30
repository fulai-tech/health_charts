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
    Cell,
} from 'recharts'
import { getChartAnimationProps } from '@/lib/utils'

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

const TimeAxisBarChartInner = ({
    data,
    layers,
    height = 200,
    yAxisDomain = [0, 100],
    showLegend = true,
    renderTooltip,
    className = '',
}: TimeAxisBarChartProps) => {
    const animationProps = getChartAnimationProps()

    // Transform data to include position
    const chartData = useMemo(() => {
        // Create fixed time slots
        const slots = [0, 6, 12, 18, 24]
        const slotData = slots.map((hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            position: hour,
            ...layers.reduce((acc, layer) => ({ ...acc, [layer.dataKey]: 0 }), {}),
        }))

        // Place actual data points at their positions
        const result = data.map((point) => ({
            ...point,
            position: hourToPosition(point.hour),
        }))

        return result
    }, [data, layers])

    // Fixed X-axis ticks
    const xAxisTicks = ['00:00', '06:00', '12:00', '18:00', '24:00']

    return (
        <div className={className}>
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

            {/* Chart */}
            <div style={{ height }} className="-mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
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
                        {layers.map((layer, index) => (
                            <Bar
                                key={layer.dataKey}
                                dataKey={layer.dataKey}
                                stackId="stack"
                                fill={layer.color}
                                radius={index === layers.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                maxBarSize={30}
                                {...animationProps}
                            />
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export const TimeAxisBarChart = memo(TimeAxisBarChartInner)
