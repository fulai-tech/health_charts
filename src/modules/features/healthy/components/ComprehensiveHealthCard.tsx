/**
 * Comprehensive Health Card
 * 
 * Displays overall health score with bar chart, Daily/Weekly toggle,
 * AI generated summary, and trend indicator.
 * 
 * @example
 * ```tsx
 * <ComprehensiveHealthCard
 *   data={comprehensiveHealthData}
 *   period="weekly"
 *   onPeriodChange={(period) => setPeriod(period)}
 *   isLoading={false}
 * />
 * ```
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import { LazyChart } from '@/components/charts/LazyChart'
import { CHART_CONFIG } from '@/config/chartConfig'
import type { ComprehensiveHealthData, TimePeriod } from '../types'

/** Theme color for comprehensive health */
const HEALTH_COLOR = '#FB923D'
/** Target/reference line color */
const TARGET_LINE_COLOR = '#FB923D'

export interface ComprehensiveHealthCardProps {
  /** Health data to display */
  data?: ComprehensiveHealthData
  /** Current time period selection */
  period?: TimePeriod
  /** Callback when period changes */
  onPeriodChange?: (period: TimePeriod) => void
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
}

/** Custom bar icon component */
const BarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="4" width="6" height="16" rx="1" fill={HEALTH_COLOR} />
    <rect x="14" y="8" width="6" height="12" rx="1" fill={HEALTH_COLOR} opacity="0.6" />
  </svg>
)

const ComprehensiveHealthCardInner = ({
  data,
  period = 'weekly',
  onPeriodChange,
  className,
  isLoading,
}: ComprehensiveHealthCardProps) => {
  const { t } = useTranslation()

  // Placeholder data
  const placeholderData = [
    { day: 'Mon', score: 52 },
    { day: 'Tues', score: 78 },
    { day: 'Wed', score: 48 },
    { day: 'Thur', score: 92 },
    { day: 'Fri', score: 68 },
    { day: 'Sat', score: 45 },
    { day: 'Sun', score: 28 },
  ]

  const chartData = useMemo(
    () => data?.chartData ?? placeholderData,
    [data?.chartData]
  )

  const weeklyAverage = data?.weeklyAverage ?? 72
  const aiSummary = data?.aiSummary ?? "This week's average score is 72. Your overall condition is steadily improving; please continue to maintain your normal routine."

  // Log data source for debugging
  if (!data) {
    console.log('⚠️ ComprehensiveHealthCard: No data provided, using dummy data')
  } else if (!data.chartData || data.chartData.length === 0) {
    console.log('⚠️ ComprehensiveHealthCard: Empty chartData from API, using placeholder')
  } else {
    console.log('✅ ComprehensiveHealthCard: Using API data, points:', data.chartData.length)
  }

  // Highlight the average score in the summary
  const renderHighlightedSummary = () => {
    if (!weeklyAverage || !aiSummary) return aiSummary

    const avgStr = String(weeklyAverage)
    const parts = aiSummary.split(avgStr)

    if (parts.length === 1) return aiSummary

    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && (
          <span style={{ color: HEALTH_COLOR, fontWeight: 600 }}>
            {avgStr}
          </span>
        )}
      </span>
    ))
  }

  return (
    <Card className={`${className} relative overflow-hidden`}>
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        style={{ backgroundColor: UI_STYLES.loadingOverlay }}
      >
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarIcon />
          <h3 className="text-base font-semibold text-slate-800">
            {t('healthy.comprehensiveHealth', 'Comprehensive health data')}
          </h3>
        </div>

        {/* Period Toggle - 更接近设计稿的样式 */}
        <div className="flex items-center bg-slate-100 rounded-full p-0.5">
          <button
            onClick={() => onPeriodChange?.('daily')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${period === 'daily'
              ? 'text-slate-800'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {t('common.daily', 'Daily')}
          </button>
          <button
            onClick={() => onPeriodChange?.('weekly')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${period === 'weekly'
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-600'
              }`}
            style={period === 'weekly' ? { backgroundColor: HEALTH_COLOR } : {}}
          >
            {t('common.weekly', 'Weekly')}
          </button>
        </div>
      </div>

      {/* Y-axis label */}
      <div className="text-xs text-slate-400 mb-1 ml-1">Score</div>

      {/* Chart - 更大的高度和更好的间距 */}
      <div className="-mx-1 mb-5">
        <LazyChart height={176}>
          <ResponsiveContainer width="100%" height={176}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
              barCategoryGap="25%"
            >
              {/* Background horizontal grid lines - 在柱子下面 */}
              <CartesianGrid
                horizontal={true}
                vertical={false}
                strokeDasharray="4 4"
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                width={30}
              />
              {/* Bar 柱子 - 在灰色参考线之上 */}
              <Bar
                dataKey="score"
                radius={[20, 20, 4, 4]}
                maxBarSize={36}
                {...CHART_CONFIG.animation}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={HEALTH_COLOR}
                  />
                ))}
              </Bar>
              {/* Target/Average reference line with arrow markers - 在柱子之上 */}
              <ReferenceLine
                y={weeklyAverage}
                stroke={TARGET_LINE_COLOR}
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  position: 'left',
                  value: '▶',
                  fill: TARGET_LINE_COLOR,
                  fontSize: 10,
                  dx: -5,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </LazyChart>
      </div>

      {/* AI Summary - 浅绿色背景 */}
      <div
        className="rounded-xl p-4 relative"
        style={{ backgroundColor: '#ECFDF5' }}
      >
        {/* AI Generated badge - 右上角悬浮，渐变色 */}
        <div className="absolute -top-3 right-4">
          <span
            className="px-3 py-1.5 text-xs font-medium text-white rounded-full shadow-sm"
            style={{
              background: 'linear-gradient(90deg, #FFCC2B 0%, #FEA80D 100%)',
            }}
          >
            {t('healthy.aiGenerated', 'AI Generated')}
          </span>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed pt-1">
          {renderHighlightedSummary()}
        </p>
      </div>
    </Card>
  )
}

export const ComprehensiveHealthCard = memo(ComprehensiveHealthCardInner)
