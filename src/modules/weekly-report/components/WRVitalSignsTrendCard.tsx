/**
 * WRVitalSignsTrendCard - 生命体征趋势卡片
 * 四个独立卡片，每个显示一个生命体征的平均值、简化趋势图和状态
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { UI_STYLES, VITAL_COLORS } from '@/config/theme'
import type { VitalSignsAPI } from '../types'

// 图表颜色配置
const LINE_COLORS = {
  heartRate: VITAL_COLORS.heartRate,
  systolic: '#F97316', // 收缩压 - 橙色
  diastolic: '#22C55E', // 舒张压 - 绿色
  bloodOxygen: VITAL_COLORS.spo2,
  bloodGlucose: VITAL_COLORS.glucose,
}

interface WRVitalSignsTrendCardProps {
  vitalSigns: VitalSignsAPI
  className?: string
}

const WRVitalSignsTrendCardInner = ({
  vitalSigns,
  className = '',
}: WRVitalSignsTrendCardProps) => {
  const { t } = useTranslation()
  // 数据已由 adapter.normalizeWeeklyReportData 保证结构完整，仅做缺省时占位
  if (!vitalSigns) return null

  const hr = vitalSigns.heart_rate
  const bp = vitalSigns.blood_pressure
  const spo2 = vitalSigns.blood_oxygen
  const glu = vitalSigns.blood_glucose

  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      <VitalMiniCard
        title={t('weeklyReport.avgHR')}
        value={hr.avg}
        unit={hr.unit}
        status={hr.status.label}
        color={LINE_COLORS.heartRate}
        trendData={hr.trend_chart.map(item => ({ value: item.value ?? undefined }))}
      />
      <VitalMiniCard
        title={t('weeklyReport.avgBP')}
        value={`${bp.systolic_avg}/${bp.diastolic_avg}`}
        unit={bp.unit}
        status={bp.status.label}
        color={LINE_COLORS.systolic}
        secondaryColor={LINE_COLORS.diastolic}
        trendData={bp.trend_chart.map(item => ({
          systolic: item.value.systolic,
          diastolic: item.value.diastolic,
        }))}
        isBP
      />
      <VitalMiniCard
        title={t('weeklyReport.avgSpO2')}
        value={spo2.avg}
        unit={spo2.unit}
        status={spo2.status.label}
        color={LINE_COLORS.bloodOxygen}
        trendData={spo2.trend_chart.map(item => ({ value: item.value ?? undefined }))}
      />
      <VitalMiniCard
        title={t('weeklyReport.avgGlucose')}
        value={glu.avg}
        unit={glu.unit}
        status={glu.status.label}
        color={LINE_COLORS.bloodGlucose}
        trendData={glu.trend_chart.map(item => ({ value: item.value ?? undefined }))}
      />
    </div>
  )
}

/** 生命体征迷你卡片 */
const VitalMiniCard = memo(({
  title,
  value,
  unit,
  status,
  color,
  secondaryColor,
  trendData,
  isBP = false,
}: {
  title: string
  value: string | number
  unit: string
  status: string
  color: string
  secondaryColor?: string
  trendData: Array<{ value?: number; systolic?: number; diastolic?: number }>
  isBP?: boolean
}) => {
  // 判断状态颜色（正常为绿色，异常为粉色）
  const isNormal = status.includes('正常') || status.includes('Normal') || 
                   status.includes('平稳') || status.includes('Stable') || 
                   status.includes('理想') || status.includes('Ideal')
  const statusColor = isNormal ? '#10B981' : '#EC4899'

  return (
    <div
      className="bg-white overflow-hidden"
      style={{
        borderRadius: UI_STYLES.cardBorderRadius,
        paddingLeft: UI_STYLES.cardPaddingX,
        paddingRight: UI_STYLES.cardPaddingX,
        paddingTop: '20px',
        paddingBottom: '20px',
      }}
    >
      {/* 标题 */}
      <h4 className="text-sm font-medium text-slate-600 mb-2">{title}</h4>

      {/* 大号数值 */}
      <div className="mb-3">
        <span className="text-3xl font-bold" style={{ color: '#F97316' }}>{value}</span>
        <span className="text-sm text-slate-500 ml-1.5">{unit}</span>
      </div>

      {/* 简化趋势图：minHeight 避免切换用户时 ResponsiveContainer 计算出 width/height -1 */}
      <div className="h-16 min-h-[4rem] -mx-2 mb-3">
        <ResponsiveContainer width="100%" height="100%" minHeight={64}>
          <LineChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            {isBP ? (
              <>
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke={secondaryColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 状态标签 */}
      <div className="flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
          style={{ backgroundColor: statusColor }}
        />
        <span className="text-xs text-slate-500 leading-none">{status}</span>
      </div>
    </div>
  )
})

VitalMiniCard.displayName = 'VitalMiniCard'

export const WRVitalSignsTrendCard = memo(WRVitalSignsTrendCardInner)
