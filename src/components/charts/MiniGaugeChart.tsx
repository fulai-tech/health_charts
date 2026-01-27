import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

/**
 * MiniGaugeChart Props
 */
export interface MiniGaugeChartProps {
  /** 当前值百分比 (0-100)，决定指针位置 */
  percent: number
  /** 数值显示 */
  value?: number | string
  /** 单位 */
  unit?: string
  /** 仪表盘高度，默认 90px */
  height?: number
  /** 是否显示数值，默认 true */
  showValue?: boolean
  /** 自定义颜色区间配置 */
  segments?: Array<{
    name: string
    value: number
    color: string
  }>
  /** 指针颜色，默认 #6B7280 */
  needleColor?: string
  /** 主题色（用于数值显示），默认 #FB923D */
  themeColor?: string
}

/**
 * 默认仪表盘区间配置
 * 绿色(正常) -> 灰色(中等) -> 红色(危险)
 */
const DEFAULT_SEGMENTS = [
  { name: 'Low', value: 33, color: 'rgb(34, 197, 94)' },      // Green-500
  { name: 'Normal', value: 34, color: 'rgb(209, 213, 219)' }, // Gray-300
  { name: 'High', value: 33, color: 'rgb(239, 68, 68)' },     // Red-500
]

/**
 * MiniGaugeChart - 迷你仪表盘组件
 * 
 * 使用 Recharts PieChart 实现的小型仪表盘，适合作为图标展示。
 * 支持自定义颜色区间和指针位置。
 * 
 * @example
 * ```tsx
 * // 基本用法
 * <MiniGaugeChart percent={60} value={8} unit="mg" />
 * 
 * // 不显示数值（纯图标）
 * <MiniGaugeChart percent={45} showValue={false} />
 * 
 * // 自定义颜色区间
 * <MiniGaugeChart 
 *   percent={70}
 *   segments={[
 *     { name: 'Low', value: 30, color: '#93C5FD' },
 *     { name: 'Normal', value: 25, color: '#86EFAC' },
 *     { name: 'Excess', value: 45, color: '#FB923D' },
 *   ]}
 * />
 * ```
 */
export function MiniGaugeChart({
  percent,
  value,
  unit,
  height = 80,
  showValue = true,
  segments = DEFAULT_SEGMENTS,
  needleColor = 'rgb(107, 114, 128)',
  themeColor = 'rgb(251, 146, 61)',
}: MiniGaugeChartProps) {
  // 限制 percent 在 0-100 范围内
  const clampedPercent = Math.min(100, Math.max(0, percent))
  
  // 计算各项尺寸（基于高度）
  const chartHeight = height
  const chartWidth = height * 2 // 半圆仪表盘标准 2:1 比例
  
  // 根据高度动态计算指针尺寸
  const needleSize = Math.max(8, height * 0.1)
  const needleLength = Math.max(20, height * 0.28)

  return (
    <div 
      className="relative flex flex-col items-center justify-center mx-auto overflow-hidden"
      style={{ height: chartHeight, width: chartWidth }}
    >
      {/* Recharts 半圆仪表盘 */}
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              cx="50%"
              cy="85%"
              startAngle={180}
              endAngle={0}
              innerRadius="55%"
              outerRadius="75%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {segments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 指针层 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 指针容器定位在圆心 */}
        <div className="absolute left-1/2 top-[78%] w-0 h-0">
          {/* 旋转的指针 */}
          <div
            className="absolute left-0 top-0 w-0 h-0 flex items-center justify-start transition-transform duration-700 ease-out"
            style={{
              transform: `rotate(${-180 + (clampedPercent * 180 / 100)}deg)`,
            }}
          >
            {/* 指针主体 */}
            <div className="relative flex items-center" style={{ transformOrigin: 'left center' }}>
              {/* 中心圆点 */}
              <div 
                className="absolute rounded-full z-20 border-2 border-white shadow-sm"
                style={{ 
                  backgroundColor: needleColor,
                  width: needleSize,
                  height: needleSize,
                  left: -needleSize / 2,
                  top: -needleSize / 2,
                }}
              />
              {/* 指针棒 */}
              <div 
                className="absolute rounded-r-full"
                style={{ 
                  backgroundColor: needleColor,
                  height: needleSize * 0.35,
                  width: needleLength,
                  left: needleSize * 0.2,
                  top: -needleSize * 0.175,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 数值显示 */}
      {showValue && value !== undefined && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex items-baseline gap-0.5"
          style={{ bottom: height * 0.08 }}
        >
          <span 
            className="font-bold leading-none"
            style={{ color: themeColor, fontSize: Math.max(16, height * 0.2) }}
          >
            {value}
          </span>
          {unit && (
            <span className="text-slate-500" style={{ fontSize: Math.max(10, height * 0.12) }}>{unit}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default MiniGaugeChart
