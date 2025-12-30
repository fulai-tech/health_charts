import { useTranslation } from 'react-i18next'
import { BarChart3, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES, EMOTION_COLORS } from '@/config/theme'
import type { EmotionDomainModel } from '../types'
import { memo, useMemo } from 'react'
import { StackedBarChart, type BarLayer } from '@/components/charts/StackedBarChart'

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

  // Configure layers for StackedBarChart
  const chartLayers: BarLayer[] = [
    { dataKey: 'positivePercent', color: EMOTION_COLORS.positive, label: t('page.emotion.positive') },
    { dataKey: 'neutralPercent', color: EMOTION_COLORS.neutral, label: t('page.emotion.neutral') },
    { dataKey: 'negativePercent', color: EMOTION_COLORS.negative, label: t('page.emotion.negative') },
  ]

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

      <StackedBarChart
        data={chartData}
        layers={chartLayers}
        xAxisKey="name"
        yAxisDomain={[0, 100]}
        yAxisFormatter={(value) => `${value}%`}
        legendShape="square"
        renderTooltip={(props) => <CustomTooltip {...props} />}
        stackId="emotion"
        height={224}
      />
    </Card>
  )
}

export const EmotionStatisticsCard = memo(EmotionStatisticsCardInner)
