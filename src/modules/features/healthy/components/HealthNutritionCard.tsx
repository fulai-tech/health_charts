/**
 * Health Nutrition Card
 * 
 * Displays nutrition summary with average value and line chart.
 * Shows readings over a specified period with navigation arrow.
 * 
 * @example
 * ```tsx
 * <HealthNutritionCard
 *   data={nutritionData}
 *   onClick={() => navigate('/details/nutrition')}
 *   isLoading={false}
 * />
 * ```
 */

import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  YAxis,
} from 'recharts'
import { Apple, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES } from '@/config/theme'
import { LazyChart } from '@/components/charts/LazyChart'
import { CHART_CONFIG } from '@/config/chartConfig'
import type { NutritionCardData } from '../types'

/** Nutrition theme color - coral/red */
const NUTRITION_COLOR = VITAL_COLORS.heartRate

export interface HealthNutritionCardProps {
  /** Nutrition data to display */
  data?: NutritionCardData
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Click handler for navigation */
  onClick?: () => void
}

const HealthNutritionCardInner = ({
  data,
  className,
  isLoading,
  onClick,
}: HealthNutritionCardProps) => {
  const { t } = useTranslation()

  // Placeholder data - wave pattern (lazy init to avoid impure Math.random in render)
  const [placeholderData] = useState(() => Array.from({ length: 15 }, (_, i) => ({
    x: i,
    value: 70 + Math.sin(i * 0.3) * 20 + Math.random() * 10,
  })))

  const chartData = useMemo(
    () => data?.chartData ?? placeholderData,
    [data?.chartData, placeholderData]
  )

  const avgValue = data?.avgValue ?? 74
  const unit = data?.unit ?? '/ minute'
  const referenceLine = data?.referenceLine ?? 70
  const periodDescription = data?.periodDescription ?? '12 weeks'

  // Log missing data
  if (!data) {
    console.log('⚠️ HealthNutritionCard: No data provided, using dummy data')
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Apple className="w-5 h-5" style={{ color: NUTRITION_COLOR }} />
          <h3 className="text-base font-semibold text-slate-800">
            {t('vitals.nutrition', 'Nutrition')}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        {t('healthy.nutritionDescription', 'Your average systolic blood pressure over the past {{period}} was ', { period: periodDescription })}
        <span style={{ color: NUTRITION_COLOR, fontWeight: 600 }}>136 mmHg</span>
        {t('healthy.nutritionDescriptionCont', ', and your average diastolic blood pressure was ')}
        <span style={{ color: NUTRITION_COLOR, fontWeight: 600 }}>86 mmHg</span>.
      </p>

      {/* Chart with Value Label */}
      <div className="relative">
        <LazyChart height={80}>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <ReferenceLine
                y={referenceLine}
                stroke={NUTRITION_COLOR}
                strokeDasharray="4 4"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={NUTRITION_COLOR}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: NUTRITION_COLOR }}
                {...CHART_CONFIG.animation}
              />
            </LineChart>
          </ResponsiveContainer>
        </LazyChart>

        {/* Value Label */}
        <div className="flex justify-center mt-3">
          <div
            className="px-4 py-1.5 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: NUTRITION_COLOR }}
          >
            {t('healthy.heartRateLabel', 'Heart rate')}: {avgValue} {unit}
          </div>
        </div>
      </div>
    </Card>
  )
}

export const HealthNutritionCard = memo(HealthNutritionCardInner)
