import { memo } from 'react'
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceLine as RechartsReferenceLine,
    Tooltip,
} from 'recharts'
import { getChartAnimationProps } from '@/lib/utils'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { useHideTooltipOnScroll } from '@/hooks/useHideTooltipOnScroll'

/**
 * Legend indicator shape type
 */
export type LegendShape = 'circle' | 'square' | 'line'

/**
 * Single line/area configuration
 */
export interface ChartLine {
    dataKey: string // Data key for line
    color: string // Line color
    label: string // Legend label
    showArea?: boolean // Show gradient area fill
    areaDataKey?: string // For range areas: use different key (e.g., [min, max] tuple)
    gradientId?: string // Custom gradient ID (auto-generated if not provided)
    strokeWidth?: number // Line thickness (default: 2)
    legendShape?: LegendShape // Legend indicator shape (default: 'circle')
}

/**
 * Reference line configuration
 */
export interface ReferenceLine {
    value: number // Y value
    color: string // Line color
    strokeDasharray?: string // Dash pattern (default: "4 4")
    strokeWidth?: number // Line thickness (default: 1.5)
    show?: boolean // Toggle visibility (default: true)
}

/**
 * Props for TrendLineChart component
 */
export interface TrendLineChartProps {
    data: Array<Record<string, any>> // Chart data
    lines: ChartLine[] // Line configurations
    xAxisKey: string // X-axis data key
    yAxisDomain?: [number, number] // Y-axis range
    yAxisFormatter?: (value: number) => string // Y-axis tick formatter
    height?: number | string // Chart height (default: 176px)
    className?: string // Container class
    renderTooltip?: (props: any) => React.ReactNode // Custom tooltip
    referenceLine?: ReferenceLine // Optional reference line
    showLegend?: boolean // Show legend (default: true)
    chartMargin?: { top: number; right: number; left: number; bottom: number }
}

/**
 * Auto-generate gradient ID from dataKey
 */
const generateGradientId = (dataKey: string, index: number): string => {
    return `gradient-${dataKey}-${index}`
}

/**
 * TrendLineChart Component
 *
 * A highly configurable line chart component supporting:
 * - Single or multiple lines
 * - Optional gradient area fills
 * - Range-based areas (min-max)
 * - Reference lines with toggle
 * - Flexible legend styles (circle/square/line)
 *
 * @example
 * ```tsx
 * // Single line with area
 * <TrendLineChart
 *   data={chartData}
 *   lines={[{
 *     dataKey: 'value',
 *     color: '#FB923D',
 *     label: 'Average',
 *     showArea: true,
 *     legendShape: 'circle'
 *   }]}
 *   xAxisKey="name"
 * />
 *
 * // Dual lines with areas (blood pressure)
 * <TrendLineChart
 *   data={chartData}
 *   lines={[
 *     { dataKey: 'systolic', color: '#FB923D', label: 'SBP', showArea: true },
 *     { dataKey: 'diastolic', color: '#10B981', label: 'DBP', showArea: true }
 *   ]}
 *   xAxisKey="name"
 * />
 *
 * // Range area + mean line with reference
 * <TrendLineChart
 *   data={chartData}
 *   lines={[{
 *     dataKey: 'avg',
 *     areaDataKey: 'range',
 *     color: '#F59E0B',
 *     label: 'Mean',
 *     showArea: true,
 *     legendShape: 'line'
 *   }]}
 *   xAxisKey="name"
 *   referenceLine={{ value: 5.5, color: '#F59E0B' }}
 * />
 * ```
 */
const TrendLineChartInner = ({
    data,
    lines,
    xAxisKey,
    yAxisDomain,
    yAxisFormatter,
    height = 224,
    className = '',
    renderTooltip,
    referenceLine,
    showLegend = true,
    chartMargin = { top: 10, right: 10, left: -15, bottom: 0 },
}: TrendLineChartProps) => {
    const animationProps = useChartAnimation()
    const chartContainerRef = useHideTooltipOnScroll<HTMLDivElement>()

    // Generate gradients for each line if not provided
    const linesWithGradients = lines.map((line, index) => ({
        ...line,
        gradientId: line.gradientId || generateGradientId(line.dataKey, index),
        legendShape: line.legendShape || 'circle',
        strokeWidth: line.strokeWidth ?? 2,
    }))

    // Render legend indicator based on shape
    const renderLegendIndicator = (line: ChartLine & { gradientId: string }) => {
        const { legendShape, color } = line

        if (legendShape === 'circle') {
            return <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        } else if (legendShape === 'square') {
            return <span className="w-3 h-3 rounded" style={{ backgroundColor: `${color}40` }} />
        } else if (legendShape === 'line') {
            return <span className="w-4 h-0.5" style={{ backgroundColor: color }} />
        }
        return null
    }

    return (
        <div className={`w-full transform-gpu will-change-transform ${className}`}>
            {/* Legend */}
            {showLegend && (
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                    {linesWithGradients.map((line) => (
                        <div key={line.dataKey} className="flex items-center gap-1.5">
                            {renderLegendIndicator(line)}
                            <span className="text-xs text-slate-500">{line.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Chart */}
            <div ref={chartContainerRef} style={{ height }} className="-mx-2">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <ComposedChart data={data} margin={chartMargin}>
                        {/* Gradient Definitions */}
                        <defs>
                            {linesWithGradients
                                .filter((line) => line.showArea)
                                .map((line) => (
                                    <linearGradient
                                        key={line.gradientId}
                                        id={line.gradientId}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={line.color} stopOpacity={0.1} />
                                    </linearGradient>
                                ))}
                        </defs>

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

                        {/* Reference Line */}
                        {referenceLine && referenceLine.show !== false && (
                            <RechartsReferenceLine
                                y={referenceLine.value}
                                stroke={referenceLine.color}
                                strokeDasharray={referenceLine.strokeDasharray || '4 4'}
                                strokeWidth={referenceLine.strokeWidth || 1.5}
                            />
                        )}

                        {/* Areas (render before lines for proper z-ordering) */}
                        {linesWithGradients
                            .filter((line) => line.showArea)
                            .map((line) => (
                                <Area
                                    key={`area-${line.dataKey}`}
                                    type="monotone"
                                    dataKey={line.areaDataKey || line.dataKey}
                                    stroke="transparent"
                                    fill={`url(#${line.gradientId})`}
                                    name={`${line.dataKey}-area`}
                                    {...animationProps}
                                />
                            ))}

                        {/* Lines */}
                        {linesWithGradients.map((line) => (
                            <Line
                                key={`line-${line.dataKey}`}
                                type="monotone"
                                dataKey={line.dataKey}
                                stroke={line.color}
                                strokeWidth={line.strokeWidth}
                                dot={{ fill: line.color, strokeWidth: 0, r: 4 }}
                                activeDot={{ r: 6, stroke: line.color, strokeWidth: 2, fill: '#fff' }}
                                name={line.dataKey}
                                {...animationProps}
                            />
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

TrendLineChartInner.displayName = 'TrendLineChart'

console.log('TrendLineChart module loaded')
export const TrendLineChart = memo(TrendLineChartInner)
