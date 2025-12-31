import { memo } from 'react'
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

/**
 * Interface for a single bar layer in the stack
 */
export interface BarLayer {
    dataKey: string // Key in data object
    color: string // Fill color
    label: string // Display label for legend
}

/**
 * Props for StackedBarChart component
 */
export interface StackedBarChartProps {
    data: Array<Record<string, any>> // Chart data
    layers: BarLayer[] // Stack configuration (from bottom to top)
    xAxisKey: string // X-axis data key
    yAxisDomain?: [number, number] // Y-axis range
    yAxisFormatter?: (value: number) => string // Y-axis tick format
    legendShape?: 'circle' | 'square' // Legend indicator shape
    barSize?: number // Bar width
    height?: number | string // Chart height (default: 176px = h-44)
    className?: string // Container class
    renderTooltip?: (props: any) => React.ReactNode // Custom tooltip
    showRoundedTop?: boolean // Enable rounded top (default: true)
    stackId?: string // Stack identifier (default: 'stack')
    showLegend?: boolean // Show legend (default: true)
}

/**
 * Internal component for rendering bars with rounded tops
 */
const RoundedTopBar = memo((props: any) => {
    const { fill, x, y, width, height, payload, dataKey, layers } = props

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
    const radius = isTop ? [3, 3, 0, 0] : [0, 0, 0, 0]

    return <Rectangle {...props} radius={radius} />
})

RoundedTopBar.displayName = 'RoundedTopBar'

/**
 * StackedBarChart Component
 * 
 * A reusable stacked bar chart component with configurable legend shapes,
 * custom tooltips, and rounded top bars.
 * 
 * @example
 * ```tsx
 * <StackedBarChart
 *   data={chartData}
 *   layers={[
 *     { dataKey: 'value1', color: '#A27EFD', label: 'Category 1' },
 *     { dataKey: 'value2', color: '#D9CBFE', label: 'Category 2' },
 *   ]}
 *   xAxisKey="name"
 *   legendShape="circle"
 *   yAxisFormatter={(v) => `${v}h`}
 *   renderTooltip={(props) => <CustomTooltip {...props} />}
 * />
 * ```
 */
const StackedBarChartInner = ({
    data,
    layers,
    xAxisKey,
    yAxisDomain,
    yAxisFormatter,
    legendShape = 'circle',
    barSize = 12,
    height = 176, // h-44 equivalent
    className = '',
    renderTooltip,
    showRoundedTop = true,
    stackId = 'stack',
    showLegend = true,
}: StackedBarChartProps) => {
    const animationProps = useChartAnimation()

    // Determine legend indicator class based on shape
    const indicatorClass = legendShape === 'circle' ? 'rounded-full' : 'rounded'

    return (
        <div className={`transform-gpu will-change-transform ${className}`}>
            {/* Legend */}
            {showLegend && (
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                    {layers.map((layer) => (
                        <div key={layer.dataKey} className="flex items-center gap-1.5">
                            <span
                                className={`w-3 h-3 ${indicatorClass}`}
                                style={{ backgroundColor: layer.color }}
                            />
                            <span className="text-xs text-slate-500">{layer.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Chart */}
            <div style={{ height }} className="-mx-2">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <ComposedChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                        barCategoryGap="40%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey={xAxisKey}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                            domain={yAxisDomain}
                            tickFormatter={yAxisFormatter}
                        />
                        {renderTooltip && (
                            <Tooltip
                                content={renderTooltip}
                                wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
                                allowEscapeViewBox={{ x: false, y: false }}
                            />
                        )}
                        {layers.map((layer) => (
                            <Bar
                                key={layer.dataKey}
                                dataKey={layer.dataKey}
                                stackId={stackId}
                                fill={layer.color}
                                barSize={barSize}
                                shape={showRoundedTop ? <RoundedTopBar layers={layers} /> : undefined}
                                {...animationProps}
                            />
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

StackedBarChartInner.displayName = 'StackedBarChart'

export const StackedBarChart = memo(StackedBarChartInner)
