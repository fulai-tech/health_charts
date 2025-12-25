/**
 * Health Blood Oxygen Card
 * 
 * Displays SpO2 summary with average percentage and bar chart.
 * Shows readings over a specified period with navigation arrow.
 * 
 * @example
 * ```tsx
 * <HealthBloodOxygenCard
 *   data={bloodOxygenData}
 *   onClick={() => navigate('/details/spo2')}
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
import { ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES } from '@/config/theme'
import type { BloodOxygenCardData } from '../types'

/** SpO2 Icon */
const SpO2Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="#A78BFA" strokeWidth="2" fill="none" />
    <text x="12" y="15" textAnchor="middle" fill="#A78BFA" fontSize="8" fontWeight="600">O₂</text>
  </svg>
)

export interface HealthBloodOxygenCardProps {
  /** Blood oxygen data to display */
  data?: BloodOxygenCardData
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Click handler for navigation */
  onClick?: () => void
}

const HealthBloodOxygenCardInner = ({
  data,
  className,
  isLoading,
  onClick,
}: HealthBloodOxygenCardProps) => {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.spo2

  // Placeholder data
  const placeholderData = Array.from({ length: 20 }, (_, i) => ({
    day: `D${i + 1}`,
    value: 94 + Math.random() * 4,
  }))

  const chartData = useMemo(
    () => data?.chartData ?? placeholderData,
    [data?.chartData]
  )

  const avgSpO2 = data?.avgSpO2 ?? 94.9
  const referenceLine = data?.referenceLine ?? 95
  const periodDescription = data?.periodDescription ?? '12 weeks'

  // Log missing data
  if (!data) {
    console.log('⚠️ HealthBloodOxygenCard: No data provided, using dummy data')
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
          <SpO2Icon />
          <h3 className="text-base font-semibold text-slate-800">
            {t('vitals.bloodOxygen', 'Blood Oxygen')}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        {t('healthy.spo2Description', 'Your average systolic blood pressure over the past {{period}} was ', { period: periodDescription })}
        <span style={{ color: themeColor, fontWeight: 600 }}>136 mmHg</span>
        {t('healthy.spo2DescriptionCont', ', and your average diastolic blood pressure was ')}
        <span style={{ color: themeColor, fontWeight: 600 }}>86 mmHg</span>.
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
              <YAxis hide domain={[90, 100]} />
              <Bar
                dataKey="value"
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="#D1D5DB"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* CSS Reference Line with Arrows */}
          <div 
            className="absolute left-0 right-0 flex items-center pointer-events-none"
            style={{ top: 'calc(10px + 112px * 0.5)' }}
          >
            {/* Left Arrow */}
            <div 
              style={{
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: '6px solid #A78BFA',
                marginLeft: '4px',
              }}
            />
            {/* Dashed Line */}
            <div 
              className="flex-1 mx-0"
              style={{
                height: '1px',
                backgroundImage: 'linear-gradient(to right, #A78BFA 50%, transparent 50%)',
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
                borderLeft: '6px solid #A78BFA',
                marginRight: '4px',
              }}
            />
          </div>

          {/* Value Label - Positioned on Reference Line */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{ top: 'calc(10px + 112px * 0.5 - 14px)' }}
          >
            <div
              className="px-4 py-1.5 rounded-full text-white text-sm font-medium whitespace-nowrap"
              style={{ backgroundColor: '#A78BFA' }}
            >
              SpO2: {avgSpO2}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export const HealthBloodOxygenCard = memo(HealthBloodOxygenCardInner)
