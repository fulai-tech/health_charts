import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { BarChart3, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES, EMOTION_COLORS } from '@/config/theme'
import { getChartAnimationProps } from '@/lib/utils'
import type { EmotionDomainModel } from '../types'
import { memo, useMemo } from 'react'

interface EmotionStatisticsCardProps {
  data?: EmotionDomainModel
  className?: string
  isLoading?: boolean
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
    color: string
    payload: {
      weekdayKey: string
      positivePercent: number
      neutralPercent: number
      negativePercent: number
    }
  }>
}

const CustomTooltip = memo(({ active, payload }: CustomTooltipProps) => {
  const { t } = useTranslation()

  if (!active || !payload || payload.length === 0) return null

  const data = payload[0]?.payload
  if (!data) return null

  return (
    <div className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
      <p className="font-medium mb-1">{t(data.weekdayKey)}</p>
      <p style={{ color: EMOTION_COLORS.positive }}>
        {t('page.emotion.positive')}: {data.positivePercent}%
      </p>
      <p style={{ color: EMOTION_COLORS.neutral }}>
        {t('page.emotion.neutral')}: {data.neutralPercent}%
      </p>
      <p style={{ color: EMOTION_COLORS.negative }}>
        {t('page.emotion.negative')}: {data.negativePercent}%
      </p>
    </div>
  )
})

/**
 * Emotion Statistics Card - Stacked Bar Chart for emotion composition
 */
const EmotionStatisticsCardInner = ({ data, className, isLoading }: EmotionStatisticsCardProps) => {
  const { t } = useTranslation()
  const animationProps = getChartAnimationProps()

  // Prepare chart data
  const chartData = useMemo(
    () => data?.compositionData?.map((point, index) => ({
      name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7],
      weekdayKey: point.weekdayKey,
      positivePercent: point.positivePercent,
      neutralPercent: point.neutralPercent,
      negativePercent: point.negativePercent,
    })) ?? [],
    [data?.compositionData]
  )

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
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" style={{ color: EMOTION_COLORS.primary }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.emotion.statistics')}
        </h3>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: EMOTION_COLORS.positive }}
          />
          <span className="text-xs text-slate-500">{t('page.emotion.positive')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: EMOTION_COLORS.neutral }}
          />
          <span className="text-xs text-slate-500">{t('page.emotion.neutral')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: EMOTION_COLORS.negative }}
          />
          <span className="text-xs text-slate-500">{t('page.emotion.negative')}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            barCategoryGap="40%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="positivePercent"
              stackId="emotion"
              fill={EMOTION_COLORS.positive}
              radius={[0, 0, 0, 0]}
              barSize={12}
              {...animationProps}
            />
            <Bar
              dataKey="neutralPercent"
              stackId="emotion"
              fill={EMOTION_COLORS.neutral}
              radius={[0, 0, 0, 0]}
              barSize={12}
              {...animationProps}
            />
            <Bar
              dataKey="negativePercent"
              stackId="emotion"
              fill={EMOTION_COLORS.negative}
              radius={[4, 4, 0, 0]}
              barSize={12}
              {...animationProps}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export const EmotionStatisticsCard = memo(EmotionStatisticsCardInner)
