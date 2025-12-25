/**
 * Health Blood Sugar Card
 * 
 * Displays blood sugar/glucose summary with POCT value and line chart.
 * Shows readings over a specified period with navigation arrow.
 * 
 * @example
 * ```tsx
 * <HealthBloodSugarCard
 *   data={bloodSugarData}
 *   onClick={() => navigate('/details/glucose')}
 *   isLoading={false}
 * />
 * ```
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
} from 'recharts'
import { Droplets, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import type { BloodSugarCardData } from '../types'

// Theme color - yellow/gold
const BS_COLOR = '#F59E0B' // amber-500

export interface HealthBloodSugarCardProps {
  /** Blood sugar data to display */
  data?: BloodSugarCardData
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Click handler for navigation */
  onClick?: () => void
}

const HealthBloodSugarCardInner = ({
  data,
  className,
  isLoading,
  onClick,
}: HealthBloodSugarCardProps) => {
  const { t } = useTranslation()

  // Placeholder data - smooth wave pattern with values around 7.4
  const placeholderData = [
    { x: 0, value: 5.2 },
    { x: 1, value: 4.8 },
    { x: 2, value: 8.5 },
    { x: 3, value: 9.2 },
    { x: 4, value: 7.8 },
    { x: 5, value: 6.5 },
    { x: 6, value: 5.8 },
    { x: 7, value: 4.2 },
    { x: 8, value: 3.8 },
    { x: 9, value: 5.5 },
    { x: 10, value: 6.8 },
    { x: 11, value: 8.2 },
    { x: 12, value: 9.5 },
    { x: 13, value: 8.8 },
    { x: 14, value: 7.2 },
  ]

  const chartData = useMemo(
    () => data?.chartData ?? placeholderData,
    [data?.chartData]
  )

  const poctValue = data?.poctValue ?? 7.4
  const unit = data?.unit ?? 'mmol/L'
  const periodDescription = data?.periodDescription ?? '12 weeks'

  // Log missing data
  if (!data) {
    console.log('⚠️ HealthBloodSugarCard: No data provided, using dummy data')
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5" style={{ color: BS_COLOR }} />
          <h3 className="text-base font-semibold text-slate-800">
            {t('vitals.bloodSugar', 'Blood Sugar')}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>

      {/* Summary Box */}
      <div className="bg-slate-50 rounded-xl p-4 mb-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          {t('healthy.bsDescription', 'Your average systolic blood pressure over the past {{period}} was ', { period: periodDescription })}
          <span style={{ color: '#F97316', fontWeight: 600 }}>136 mmHg</span>
          {t('healthy.bsDescriptionCont', ', and your average diastolic blood pressure was ')}
          <span style={{ color: '#F97316', fontWeight: 600 }}>86 mmHg</span>.
        </p>
      </div>

      {/* Chart Area with Reference Line */}
      <div className="relative h-52">
        {/* Area Chart */}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="bloodSugarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CBD5E1" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#CBD5E1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[2, 12]} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#CBD5E1"
              strokeWidth={2}
              fill="url(#bloodSugarGradient)"
              dot={{ fill: '#CBD5E1', stroke: '#CBD5E1', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 5, fill: BS_COLOR }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Custom Reference Line with Badge */}
        <div 
          className="absolute left-0 right-0 flex items-center"
          style={{ top: '46%' }}
        >
          {/* Left Arrow */}
          <div 
            className="w-0 h-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: `8px solid ${BS_COLOR}`,
            }}
          />
          {/* Dashed Line */}
          <div 
            className="flex-1 border-t-2 border-dashed"
            style={{ borderColor: BS_COLOR }}
          />
          {/* Center Badge */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-white text-sm font-semibold whitespace-nowrap z-10"
            style={{ backgroundColor: BS_COLOR }}
          >
            POCT: {poctValue} {unit}
          </div>
          {/* Right Arrow */}
          <div 
            className="w-0 h-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: `8px solid ${BS_COLOR}`,
            }}
          />
        </div>
      </div>
    </Card>
  )
}

export const HealthBloodSugarCard = memo(HealthBloodSugarCardInner)
