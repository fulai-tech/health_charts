import { useTranslation } from 'react-i18next'
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TrendLineChart as TrendChart } from '@/components/charts/TrendLineChart'
import { UI_STYLES, UI_COLORS, EMOTION_COLORS } from '@/config/theme'
import { EmotionFaceIcon } from '@/components/common/EmotionFaceIcon'
import type { EmotionDomainModel } from '../types'
import { memo, useMemo } from 'react'

interface EmotionTrendyReportCardProps {
  data?: EmotionDomainModel
  className?: string
  isLoading?: boolean // Optional, kept for compatibility but unused for overlay
}

/**
 * Custom Tooltip component
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number | null
    payload: {
      name: string
      weekdayKey: string
      score: number | null
    }
  }>
}

const CustomTooltip = memo(({ active, payload }: CustomTooltipProps) => {
  const { t } = useTranslation()

  if (!active || !payload || payload.length === 0) return null

  const data = payload[0]?.payload
  if (!data || data.score === null) return null

  return (
    <div className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
      <p className="font-medium mb-1">{t(data.weekdayKey)}</p>
      <p style={{ color: EMOTION_COLORS.primary }}>
        {t('page.emotion.score')}: {data.score}
      </p>
    </div>
  )
})

/**
 * Emotion Trendy Report Card
 */
const EmotionTrendyReportCardInner = ({ data, className, isLoading }: EmotionTrendyReportCardProps) => {
  const { t } = useTranslation()

  // Prepare chart data
  const chartData = useMemo(
    () => data?.trendChartData?.map((point, index) => ({
      name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7],
      weekdayKey: point.weekdayKey,
      score: point.score,
    })) ?? [],
    [data?.trendChartData]
  )

  // Get trend icon and color
  const getTrendDisplay = () => {
    if (!data) return null
    const { trend, changeValue } = data.summary
    if (changeValue === 0) return null

    const isUp = trend === 'up'
    const Icon = isUp ? ArrowUp : ArrowDown
    // For emotion, up is generally better
    const color = isUp ? '#10B981' : '#EF4444'

    return (
      <span className="flex items-center gap-0.5 text-sm" style={{ color }}>
        <Icon className="w-3 h-3" />
        {Math.abs(changeValue)}
      </span>
    )
  }

  // Get emotion face component with label
  const getEmotionFace = () => {
    const level = data?.summary?.emotionLevel || 'neutral'
    const label = data?.summary?.emotionLabel || '--'
    return (
      <div className="flex flex-col items-center gap-1.5">
        <EmotionFaceIcon level={level} size={48} />
        <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">{label}</span>
      </div>
    )
  }

  return (
    <Card className={`${className} relative overflow-hidden`}>


      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5" style={{ color: EMOTION_COLORS.primary }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.emotion.trendyReport')}
        </h3>
      </div>

      {/* Summary Box */}
      <div className="rounded-xl px-5 py-4 mb-4 mx-1" style={{ backgroundColor: UI_COLORS.background.warning }}>
        {/* Top Row: Average + Emotion Level */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t('page.emotion.weeksAverage')}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold" style={{ color: EMOTION_COLORS.primary }}>
                {data?.summary?.avgValue ?? '--'}
              </span>
              <span className="text-lg text-slate-500">{t('page.emotion.points')}</span>
              {getTrendDisplay()}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('time.lastWeek')}: {data?.summary?.previousAvg ?? '--'} {t('page.emotion.points')}
            </p>
          </div>
          {/* Emotion Face Icon */}
          {getEmotionFace()}
        </div>

        {/* Bottom Row: Highest / Lowest */}
        <div className="flex gap-6">
          <div>
            <span className="text-xs text-slate-400">{t('common.max')}({data ? t(data.summary.maxWeekdayKey) : '--'})</span>
            <p className="text-xl font-semibold" style={{ color: EMOTION_COLORS.primary }}>
              {data?.summary?.maxValue ?? '--'} <span className="text-sm font-normal">{t('page.emotion.points')}</span>
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">{t('common.min')}({data ? t(data.summary.minWeekdayKey) : '--'})</span>
            <p className="text-xl font-semibold text-slate-600">
              {data?.summary?.minValue ?? '--'} <span className="text-sm font-normal">{t('page.emotion.points')}</span>
            </p>
          </div>
        </div>
      </div>

      <TrendChart
        data={chartData}
        lines={[
          {
            dataKey: 'score',
            color: EMOTION_COLORS.primary,
            label: t('page.emotion.score'),
            showArea: true,
            gradientId: 'emotionLineGradient',
            legendShape: 'circle',
          },
        ]}
        xAxisKey="name"
        yAxisDomain={[data?.yAxisRange?.min ?? 0, data?.yAxisRange?.max ?? 100]}
        renderTooltip={(props) => <CustomTooltip {...props} />}
        showLegend={false}
        height={224}
      />
    </Card>
  )
}

export const EmotionTrendyReportCard = memo(EmotionTrendyReportCardInner)
