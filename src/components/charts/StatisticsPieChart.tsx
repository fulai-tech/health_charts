/**
 * StatisticsPieChart
 * 
 * Reusable pie/donut chart component for statistics display.
 */

import { memo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
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
}: StatisticsPieChartProps) => {


  return (
    <div className={`relative transform-gpu will-change-transform ${widthClass} ${heightClass} ${className}`}>
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
            cornerRadius={useCornerRadius ? 5 : 0}
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
