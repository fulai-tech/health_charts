/**
 * Health Heart Rate Card
 * 
 * Displays heart rate summary with average BPM and wave-style line chart.
 * Shows readings over a specified period with navigation arrow.
 * 
 * @example
 * ```tsx
 * <HealthHeartRateCard
 *   data={heartRateData}
 *   onClick={() => navigate('/details/heart-rate')}
 *   isLoading={false}
 * />
 * ```
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
} from 'recharts'
import { Heart, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import { LazyChart } from '@/components/charts/LazyChart'
import { CHART_CONFIG } from '@/config/chartConfig'
import type { HeartRateCardData } from '../types'

// Theme color - coral/salmon pink
const HR_COLOR = '#F87171' // red-400

export interface HealthHeartRateCardProps {
  /** Heart rate data to display */
  data?: HeartRateCardData
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Click handler for navigation */
  onClick?: () => void
}

// Placeholder data - wave pattern with values above and below average (74)
const PLACEHOLDER_DATA = [
  { x: 0, value: 68 },
  { x: 1, value: 70 },
  { x: 2, value: 76 },
  { x: 3, value: 78 },
  { x: 4, value: 88 },
  { x: 5, value: 90 },
  { x: 6, value: 85 },
  { x: 7, value: 75 },
  { x: 8, value: 68 },
]

const HealthHeartRateCardInner = ({
  data,
  className,
  isLoading,
  onClick,
}: HealthHeartRateCardProps) => {
  const { t } = useTranslation()

  const chartData = useMemo(
    () => data?.chartData ?? PLACEHOLDER_DATA,
    [data?.chartData]
  )

  const avgHeartRate = data?.avgHeartRate ?? 74
  const periodDescription = data?.periodDescription ?? '12 weeks'

  // Log data source for debugging
  if (!data) {
    console.log('⚠️ HealthHeartRateCard: No data provided, using dummy data')
  } else if (!data.chartData || data.chartData.length === 0) {
    console.log('⚠️ HealthHeartRateCard: Empty chartData from API, using placeholder')
  } else {
    console.log('✅ HealthHeartRateCard: Using API data, points:', data.chartData.length)
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
          <Heart className="w-5 h-5" style={{ color: HR_COLOR }} />
          <h3 className="text-base font-semibold text-slate-800">
            {t('vitals.heartRate', 'Heart rate')}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>

      {/* Summary Box */}
      <div className="bg-slate-50 rounded-xl p-4 mb-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          {t('healthy.hrDescription', 'Your average systolic blood pressure over the past {{period}} was ', { period: periodDescription })}
          <span style={{ color: '#F97316', fontWeight: 600 }}>136 mmHg</span>
          {t('healthy.hrDescriptionCont', ', and your average diastolic blood pressure was ')}
          <span style={{ color: '#F97316', fontWeight: 600 }}>86 mmHg</span>.
        </p>
      </div>

      {/* Chart Area with Reference Line */}
      <LazyChart height={208}>
        <ResponsiveContainer width="100%" height={208}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
          >
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <Line
              type="linear"
              dataKey="value"
              stroke="#CBD5E1"
              strokeWidth={2}
              dot={{ fill: '#CBD5E1', stroke: '#CBD5E1', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 5, fill: HR_COLOR }}
              {...CHART_CONFIG.animation}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Custom Reference Line with Badge */}
        <div
          className="absolute left-0 right-0 flex items-center"
          style={{ top: '40%' }}
        >
          {/* Left Arrow */}
          <div
            className="w-0 h-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: `8px solid ${HR_COLOR}`,
            }}
          />
          {/* Dashed Line */}
          <div
            className="flex-1 border-t-2 border-dashed"
            style={{ borderColor: HR_COLOR }}
          />
          {/* Center Badge */}
          <div
            className="absolute left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-white text-sm font-semibold whitespace-nowrap z-10"
            style={{ backgroundColor: HR_COLOR }}
          >
            {t('healthy.heartRateLabel', 'Heart rate')}: {avgHeartRate} / minute
          </div>
          {/* Right Arrow */}
          <div
            className="w-0 h-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: `8px solid ${HR_COLOR}`,
            }}
          />
        </div>
      </LazyChart>
    </Card>
  )
}

export const HealthHeartRateCard = memo(HealthHeartRateCardInner)
