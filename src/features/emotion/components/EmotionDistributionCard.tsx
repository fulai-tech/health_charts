import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { PieChart as PieChartIcon, Loader2, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES, EMOTION_COLORS } from '@/config/theme'
import { getChartAnimationProps } from '@/lib/utils'
import type { EmotionDomainModel } from '../types'
import { memo, useMemo } from 'react'

// Emotion type colors mapping to theme
const EMOTION_TYPE_COLORS: Record<string, string> = {
  happy: EMOTION_COLORS.happy,
  surprised: EMOTION_COLORS.surprised,
  calm: EMOTION_COLORS.calm,
  sad: EMOTION_COLORS.sad,
  angry: EMOTION_COLORS.angry,
  fearful: EMOTION_COLORS.fearful,
  disgusted: EMOTION_COLORS.disgusted,
  neutral: EMOTION_COLORS.calm, // neutral maps to calm color
}

interface EmotionDistributionCardProps {
  data?: EmotionDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * Emotion Distribution Card - Donut chart showing emotion type distribution
 */
const EmotionDistributionCardInner = ({ data, className, isLoading }: EmotionDistributionCardProps) => {
  const { t } = useTranslation()
  const animationProps = getChartAnimationProps()

  const distribution = data?.distribution?.distribution ?? []
  const totalCount = data?.distribution?.totalCount ?? 0
  const dominantEmotion = data?.distribution?.dominantEmotion ?? ''

  // Prepare pie chart data (only items with count > 0 for the chart)
  const pieData = useMemo(() =>
    distribution
      .filter(d => d.count > 0)
      .map((d) => ({
        name: d.label,
        value: d.percent > 0 ? d.percent : 0.1,
        color: EMOTION_TYPE_COLORS[d.type] || EMOTION_COLORS.calm,
      })),
    [distribution]
  )

  // All items for legend (show all, including zero counts)
  const displayItems = useMemo(() =>
    distribution.map((d) => ({
      ...d,
      color: EMOTION_TYPE_COLORS[d.type] || EMOTION_COLORS.calm,
    })),
    [distribution]
  )

  // Check if we have any data to show in the chart
  const hasChartData = pieData.length > 0

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
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon className="w-5 h-5" style={{ color: EMOTION_COLORS.primary }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.emotion.distribution')}
        </h3>
        <Info className="w-4 h-4 text-slate-400 ml-auto" />
      </div>

      <div className="flex items-center justify-between gap-6">
        {/* Left: Legend - Always show all emotions, including zeros */}
        <div className="flex-1 min-w-0">
          {/* Distribution legend - 2 columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {displayItems.map((item) => (
              <div key={item.type} className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-700 flex-shrink-0">{item.label}</span>
                <span
                  className="text-sm font-medium ml-auto flex-shrink-0"
                  style={{ color: item.color }}
                >
                  {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Donut Chart - Only show if there's data */}
        {hasChartData && (
          <div className="w-40 h-40 relative flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                  {...animationProps}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-2xl font-bold text-center px-2"
                style={{ color: EMOTION_COLORS.primary }}
              >
                {dominantEmotion || t('page.emotion.neutral')}
              </span>
              <span className="text-xs text-slate-400 mt-1">as main</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export const EmotionDistributionCard = memo(EmotionDistributionCardInner)
