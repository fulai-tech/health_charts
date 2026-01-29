/**
 * Health Emotion Card
 * 
 * Displays emotional state summary with stacked bar chart showing
 * positive, neutral, and negative emotions over time.
 * 
 * @example
 * ```tsx
 * <HealthEmotionCard
 *   data={emotionData}
 *   onClick={() => navigate('/details/emotion')}
 *   isLoading={false}
 * />
 * ```
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Smile, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import { LazyChart } from '@/components/charts/LazyChart'
import type { EmotionCardData } from '../types'

/** Emotion theme colors */
const EMOTION_COLORS = {
  positive: '#FBBF24', // Yellow (top)
  neutral: '#93C5FD', // Light Blue (middle)
  negative: '#3B82F6', // Blue (bottom)
}

export interface HealthEmotionCardProps {
  /** Emotion data to display */
  data?: EmotionCardData
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Click handler for navigation */
  onClick?: () => void
}

const HealthEmotionCardInner = ({
  data,
  className,
  isLoading,
  onClick,
}: HealthEmotionCardProps) => {
  const { t } = useTranslation()

  // Placeholder data - each segment as percentage (0-100) of its section
  // All bars have same total height, just different segment proportions
  const placeholderData = [
    { day: 'D1', positive: 35, neutral: 45, negative: 20 },
    { day: 'D2', positive: 30, neutral: 50, negative: 20 },
    { day: 'D3', positive: 40, neutral: 40, negative: 20 },
    { day: 'D4', positive: 25, neutral: 55, negative: 20 },
    { day: 'D5', positive: 45, neutral: 40, negative: 15 },
    { day: 'D6', positive: 35, neutral: 45, negative: 20 },
    { day: 'D7', positive: 30, neutral: 45, negative: 25 },
    { day: 'D8', positive: 40, neutral: 40, negative: 20 },
    { day: 'D9', positive: 35, neutral: 45, negative: 20 },
    { day: 'D10', positive: 45, neutral: 40, negative: 15 },
    { day: 'D11', positive: 38, neutral: 42, negative: 20 },
    { day: 'D12', positive: 32, neutral: 48, negative: 20 },
    { day: 'D13', positive: 28, neutral: 52, negative: 20 },
    { day: 'D14', positive: 50, neutral: 35, negative: 15 },
  ]

  const chartData = useMemo(
    () => data?.chartData ?? placeholderData,
    [data?.chartData]
  )

  const periodDescription = data?.periodDescription ?? '12 weeks'

  // Log missing data
  if (!data) {
    console.log('⚠️ HealthEmotionCard: No data provided, using dummy data')
  }

  return (
    <Card
      className={`${className} relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        style={{ backgroundColor: UI_STYLES.loadingOverlay }}
      >
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smile className="w-5 h-5" style={{ color: EMOTION_COLORS.positive }} />
          <h3 className="text-base font-semibold text-slate-800">
            {t('vitals.emotion', 'Emotion')}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>

      {/* Summary Box */}
      <div className="bg-slate-50 rounded-xl p-4 mb-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          {t('healthy.emotionDescription', 'Your average systolic blood pressure over the past {{period}} was ', { period: periodDescription })}
          <span style={{ color: '#F97316', fontWeight: 600 }}>136 mmHg</span>
          {t('healthy.emotionDescriptionCont', ', and your average diastolic blood pressure was ')}
          <span style={{ color: '#F97316', fontWeight: 600 }}>86 mmHg</span>.
        </p>
      </div>

      {/* Chart Area with Reference Lines */}
      <LazyChart height={224}>
        {/* Custom CSS Bar Chart - 柱状图区域 */}
        <div
          className="absolute left-0 right-0 flex items-center justify-between px-4"
          style={{ top: '8px', height: '180px' }}
        >
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-1"
              style={{ height: '100%', width: '3%' }}
            >
              {/* Top segment (positive - yellow) - 全圆角 */}
              <div
                className="w-full rounded-md transition-all duration-500 ease-out"
                style={{
                  backgroundColor: EMOTION_COLORS.positive,
                  flex: item.positive,
                }}
              />
              {/* Middle segment (neutral - light blue) - 全圆角 */}
              <div
                className="w-full rounded-md transition-all duration-500 ease-out"
                style={{
                  backgroundColor: EMOTION_COLORS.neutral,
                  flex: item.neutral,
                }}
              />
              {/* Bottom segment (negative - blue) - 全圆角 */}
              <div
                className="w-full rounded-md transition-all duration-500 ease-out"
                style={{
                  backgroundColor: EMOTION_COLORS.negative,
                  flex: item.negative,
                }}
              />
            </div>
          ))}
        </div>

        {/* Reference Line 1 (Positive - Yellow) - 在黄色区域中间 */}
        <div
          className="absolute left-0 right-0 flex items-center pointer-events-none"
          style={{ top: 'calc(8px + 180px * 0.18)' }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: `6px solid ${EMOTION_COLORS.positive}`,
            }}
          />
          <div
            className="flex-1 border-t-2 border-dashed"
            style={{ borderColor: EMOTION_COLORS.positive }}
          />
          <div
            className="w-0 h-0"
            style={{
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderRight: `6px solid ${EMOTION_COLORS.positive}`,
            }}
          />
        </div>

        {/* Reference Line 2 (Neutral - Light Blue) - 在浅蓝区域中间 */}
        <div
          className="absolute left-0 right-0 flex items-center pointer-events-none"
          style={{ top: 'calc(8px + 180px * 0.52)' }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: `6px solid ${EMOTION_COLORS.neutral}`,
            }}
          />
          <div
            className="flex-1 border-t-2 border-dashed"
            style={{ borderColor: EMOTION_COLORS.neutral }}
          />
          <div
            className="w-0 h-0"
            style={{
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderRight: `6px solid ${EMOTION_COLORS.neutral}`,
            }}
          />
        </div>

        {/* Reference Line 3 (Negative - Blue) - 在蓝色区域中间 */}
        <div
          className="absolute left-0 right-0 flex items-center pointer-events-none"
          style={{ top: 'calc(8px + 180px * 0.85)' }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: `6px solid ${EMOTION_COLORS.negative}`,
            }}
          />
          <div
            className="flex-1 border-t-2 border-dashed"
            style={{ borderColor: EMOTION_COLORS.negative }}
          />
          <div
            className="w-0 h-0"
            style={{
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderRight: `6px solid ${EMOTION_COLORS.negative}`,
            }}
          />
        </div>

        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: EMOTION_COLORS.positive }}
            />
            <span className="text-sm text-slate-600">
              {t('healthy.positive', '积极')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: EMOTION_COLORS.neutral }}
            />
            <span className="text-sm text-slate-600">
              {t('healthy.neutral', '中性')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: EMOTION_COLORS.negative }}
            />
            <span className="text-sm text-slate-600">
              {t('healthy.negative', '消极')}
            </span>
          </div>
        </div>
      </LazyChart>
    </Card>
  )
}

export const HealthEmotionCard = memo(HealthEmotionCardInner)
