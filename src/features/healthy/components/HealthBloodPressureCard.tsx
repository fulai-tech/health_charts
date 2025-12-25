/**
 * Health Blood Pressure Card
 * 
 * Displays blood pressure summary with SBP/DBP values and paired bar chart.
 * Shows average readings with custom reference lines and floating badges.
 * 
 * @example
 * ```tsx
 * <HealthBloodPressureCard
 *   data={bloodPressureData}
 *   onClick={() => navigate('/details/blood-pressure')}
 *   isLoading={false}
 * />
 * ```
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts'
import { Heart, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import type { BloodPressureCardData } from '../types'

// Theme colors
const SBP_COLOR = '#F97316' // Orange-500
const DBP_COLOR = '#4ADE80' // Green-400
const BAR_COLOR = '#E2E8F0' // Slate-200

export interface HealthBloodPressureCardProps {
  /** Blood pressure data to display */
  data?: BloodPressureCardData
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Click handler for navigation */
  onClick?: () => void
}

const HealthBloodPressureCardInner = ({
  data,
  className,
  isLoading,
  onClick,
}: HealthBloodPressureCardProps) => {
  const { t } = useTranslation()
  const themeColor = SBP_COLOR

  // Placeholder data - 14 data points for paired bars
  const placeholderData = Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    systolic: 100 + Math.random() * 60,
    diastolic: 60 + Math.random() * 40,
  }))

  const chartData = useMemo(
    () => data?.chartData ?? placeholderData,
    [data?.chartData]
  )

  const avgSystolic = data?.avgSystolic ?? 136
  const avgDiastolic = data?.avgDiastolic ?? 86
  const periodDescription = data?.periodDescription ?? '12 weeks'

  // Log missing data
  if (!data) {
    console.log('⚠️ HealthBloodPressureCard: No data provided, using dummy data')
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
          <Heart className="w-5 h-5" style={{ color: themeColor }} />
          <h3 className="text-base font-semibold text-slate-800">
            {t('vitals.bloodPressure', 'Blood pressure')}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>

      {/* Summary Box */}
      <div className="bg-slate-50 rounded-xl p-4 mb-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          {t('healthy.bpDescription', 'Your average systolic blood pressure over the past {{period}} was ', { period: periodDescription })}
          <span style={{ color: SBP_COLOR, fontWeight: 600 }}>{avgSystolic} mmHg</span>
          {t('healthy.bpDescriptionCont', ', and your average diastolic blood pressure was ')}
          <span style={{ color: SBP_COLOR, fontWeight: 600 }}>{avgDiastolic} mmHg</span>.
        </p>
      </div>

      {/* Chart Area with Custom Reference Lines */}
      <div className="relative h-56">
        {/* Bar Chart - Two bars per group */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            barGap={2}
            barCategoryGap="30%"
          >
            <XAxis dataKey="day" hide />
            <YAxis domain={[40, 180]} hide />
            
            {/* Systolic Bar (taller) */}
            <Bar
              dataKey="systolic"
              radius={[4, 4, 4, 4]}
              maxBarSize={16}
            >
              {chartData.map((_, index) => (
                <Cell key={`systolic-${index}`} fill={BAR_COLOR} />
              ))}
            </Bar>
            
            {/* Diastolic Bar (shorter) */}
            <Bar
              dataKey="diastolic"
              radius={[4, 4, 4, 4]}
              maxBarSize={16}
            >
              {chartData.map((_, index) => (
                <Cell key={`diastolic-${index}`} fill={BAR_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Custom SBP Reference Line with Badge */}
        <div 
          className="absolute left-0 right-0 flex items-center"
          style={{ top: '35%' }}
        >
          {/* Left Arrow */}
          <div 
            className="w-0 h-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: `8px solid ${SBP_COLOR}`,
            }}
          />
          {/* Dashed Line */}
          <div 
            className="flex-1 border-t-2 border-dashed"
            style={{ borderColor: SBP_COLOR }}
          />
          {/* Center Badge */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-white text-sm font-semibold whitespace-nowrap z-10"
            style={{ backgroundColor: SBP_COLOR }}
          >
            SBP: {avgSystolic}mmHg
          </div>
          {/* Right Arrow */}
          <div 
            className="w-0 h-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: `8px solid ${SBP_COLOR}`,
            }}
          />
        </div>

        {/* Custom DBP Reference Line with Badge */}
        <div 
          className="absolute left-0 right-0 flex items-center"
          style={{ top: '65%' }}
        >
          {/* Left Arrow */}
          <div 
            className="w-0 h-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: `8px solid ${DBP_COLOR}`,
            }}
          />
          {/* Dashed Line */}
          <div 
            className="flex-1 border-t-2 border-dashed"
            style={{ borderColor: DBP_COLOR }}
          />
          {/* Center Badge */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-white text-sm font-semibold whitespace-nowrap z-10"
            style={{ backgroundColor: DBP_COLOR }}
          >
            DBP: {avgDiastolic}mmHg
          </div>
          {/* Right Arrow */}
          <div 
            className="w-0 h-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: `8px solid ${DBP_COLOR}`,
            }}
          />
        </div>
      </div>
    </Card>
  )
}

export const HealthBloodPressureCard = memo(HealthBloodPressureCardInner)
