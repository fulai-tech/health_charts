/**
 * Health Sleep Card
 * 
 * Displays sleep duration summary with average time and bar chart.
 * Shows readings over a specified period with navigation arrow.
 * 
 * @example
 * ```tsx
 * <HealthSleepCard
 *   data={sleepData}
 *   onClick={() => navigate('/details/sleep')}
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
  Cell,
  YAxis,
} from 'recharts'
import { Moon, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import type { SleepCardData } from '../types'

/** Sleep theme color - purple */
const SLEEP_COLOR = '#818CF8'

export interface HealthSleepCardProps {
  /** Sleep data to display */
  data?: SleepCardData
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Click handler for navigation */
  onClick?: () => void
}

const HealthSleepCardInner = ({
  data,
  className,
  isLoading,
  onClick,
}: HealthSleepCardProps) => {
  const { t } = useTranslation()

  // Placeholder data
  const placeholderData = Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    hours: 6 + Math.random() * 3,
    quality: 60 + Math.random() * 30,
  }))

  const chartData = useMemo(
    () => data?.chartData ?? placeholderData,
    [data?.chartData]
  )

  const avgSleepTime = data?.avgSleepTime ?? { hours: 7, minutes: 11 }
  const periodDescription = data?.periodDescription ?? '12 weeks'

  // Log missing data
  if (!data) {
    console.log('⚠️ HealthSleepCard: No data provided, using dummy data')
  }

  return (
    <Card
      className={`${className} relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: UI_STYLES.loadingOverlay }}
      >
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5" style={{ color: SLEEP_COLOR }} />
          <h3 className="text-base font-semibold text-slate-800">
            {t('vitals.sleep', 'Sleep')}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        {t('healthy.sleepDescription', 'Your average systolic blood pressure over the past {{period}} was ', { period: periodDescription })}
        <span style={{ color: SLEEP_COLOR, fontWeight: 600 }}>136 mmHg</span>
        {t('healthy.sleepDescriptionCont', ', and your average diastolic blood pressure was ')}
        <span style={{ color: SLEEP_COLOR, fontWeight: 600 }}>86 mmHg</span>.
      </p>

      {/* Chart with Value Label */}
      <div className="relative">
        {/* Chart Area */}
        <div className="h-28 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 15, bottom: 0 }}
              barCategoryGap="20%"
            >
              <YAxis hide domain={[0, 12]} />
              {/* Deep sleep (darker) */}
              <Bar
                dataKey="hours"
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
                stackId="sleep"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="#9CA3AF"
                  />
                ))}
              </Bar>
              {/* Light sleep (lighter) - stacked on top */}
              <Bar
                dataKey="quality"
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
                stackId="sleep"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-light-${index}`}
                    fill="#D1D5DB"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* CSS Reference Line with Arrows */}
          <div 
            className="absolute left-0 right-0 flex items-center pointer-events-none"
            style={{ top: 'calc(10px + 112px * 0.45)' }}
          >
            {/* Left Arrow */}
            <div 
              style={{
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: '6px solid #818CF8',
                marginLeft: '4px',
              }}
            />
            {/* Dashed Line */}
            <div 
              className="flex-1 mx-0"
              style={{
                height: '1px',
                backgroundImage: 'linear-gradient(to right, #818CF8 50%, transparent 50%)',
                backgroundSize: '8px 1px',
              }}
            />
            {/* Right Arrow */}
            <div 
              style={{
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: '6px solid #818CF8',
                marginRight: '4px',
              }}
            />
          </div>

          {/* Value Label - Positioned on Reference Line */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{ top: 'calc(10px + 112px * 0.45 - 14px)' }}
          >
            <div
              className="px-4 py-1.5 rounded-full text-white text-sm font-medium whitespace-nowrap"
              style={{ backgroundColor: SLEEP_COLOR }}
            >
              {t('healthy.sleepTime', 'Sleep time')}: {avgSleepTime.hours} hours {avgSleepTime.minutes} minutes
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export const HealthSleepCard = memo(HealthSleepCardInner)
