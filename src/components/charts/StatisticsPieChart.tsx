/**
 * StatisticsPieChart
 * 
 * Reusable pie/donut chart component for statistics display.
 */

import { memo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { getChartAnimationProps } from '@/lib/utils'

export interface PieChartData {
  name: string
  value: number
  color: string
  /** Optional count for display in tooltip */
  count?: number
}

export interface StatisticsPieChartProps {
  /** Chart data items */
  data: PieChartData[]
  /** Inner radius (percentage string '60%' or number) */
  innerRadius: string | number
  /** Outer radius (percentage string '80%' or number) */
  outerRadius: string | number
  /** Padding angle between sectors */
  paddingAngle?: number
  /** Start angle (default: 90) */
  startAngle?: number
  /** End angle (default: -270) */
  endAngle?: number
  /** Center content (text/label) to display in donut hole */
  children?: React.ReactNode
  /** Chart container width style class (default: w-full) */
  widthClass?: string
  /** Chart container height style class (default: h-full) */
  heightClass?: string
  /** Animation props for Recharts */
  animationProps?: any
  /** Additional class names */
  className?: string

  /** Whether to use corner radius (default: true) */
  useCornerRadius?: boolean
}



const StatisticsPieChartInner = ({
  data,
  innerRadius,
  outerRadius,
  paddingAngle = 0,
  startAngle = 90,
  endAngle = -270,
  children,
  widthClass = 'w-full',
  heightClass = 'h-full',
  animationProps = getChartAnimationProps(),
  className = '',

  useCornerRadius = true,
  smallSectorThreshold = 0.02, // Default threshold 2%
}: StatisticsPieChartProps & { smallSectorThreshold?: number }) => {

  const renderShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

    // Calculate the arc length in pixels
    const midRadius = (innerRadius + outerRadius) / 2
    const angleDiff = Math.abs(endAngle - startAngle)
    const arcLength = (angleDiff * Math.PI / 180) * midRadius

    // If the arc length is very small (less than ~14px), render as a circle
    // This prevents the "square" look when arc length is comparable to corner radius
    if (useCornerRadius && arcLength < 14) {
      const midAngle = (startAngle + endAngle) / 2
      const RADIAN = Math.PI / 180
      const x = cx + midRadius * Math.cos(-midAngle * RADIAN)
      const y = cy + midRadius * Math.sin(-midAngle * RADIAN)

      const ringWidth = outerRadius - innerRadius
      // Use a consistent dot size, maxing out at cornerRadius (5) or half ring width
      const dotRadius = Math.min(ringWidth / 2, 5)

      return <circle cx={x} cy={y} r={dotRadius} fill={fill} />
    }

    return (
      <Sector
        {...props}
        cornerRadius={useCornerRadius ? 5 : 0}
        strokeWidth={0}
      />
    )
  }

  return (
    <div className={`relative transform-gpu will-change-transform ${widthClass} ${heightClass} ${className}`} data-swipe-ignore>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey="value"
            startAngle={startAngle}
            endAngle={endAngle}
            strokeWidth={0}
            shape={renderShape}
            {...animationProps}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ outline: 'none' }} // Remove focus outline
              />
            ))}
          </Pie>

        </PieChart>
      </ResponsiveContainer>

      {/* Center content */}
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {children}
        </div>
      )}
    </div>
  )
}

export const StatisticsPieChart = memo(StatisticsPieChartInner)
