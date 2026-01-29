/**
 * WRNutritionCard - 周报营养模块卡片
 * 显示日均热量、餐食分布和每日热量柱状图
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts'
import { UI_STYLES, UI_COLORS } from '@/config/theme'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { useHideTooltipOnScroll } from '@/hooks/useHideTooltipOnScroll'
import type { NutritionAPI } from '../types'
import { getNutritionStatusColor } from '../adapter'

const NUTRITION_COLOR = '#10B981' // 营养卡片主题色（达标绿）

// 营养状态颜色
const NUTRITION_STATUS_COLORS = {
  on_target: '#10B981', // 绿色 - 达标
  over: '#EF4444', // 红色 - 超标
  under: '#F59E0B', // 橙色 - 不足
}

interface WRNutritionCardProps {
  nutrition: NutritionAPI
  className?: string
}

/** 自定义Tooltip */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  const data = payload[0]?.payload
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-[100px]">
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{data.calories} kcal</p>
      <p
        className="text-xs mt-1"
        style={{ color: getNutritionStatusColor(data.status) }}
      >
        {data.statusLabel}
      </p>
    </div>
  )
}

const WRNutritionCardInner = ({
  nutrition,
  className = '',
}: WRNutritionCardProps) => {
  const { t } = useTranslation()
  const animationProps = useChartAnimation()
  const chartContainerRef = useHideTooltipOnScroll<HTMLDivElement>()

  if (!nutrition.has_data) {
    return (
      <div
        className={`bg-white ${className}`}
        style={{
          borderRadius: UI_STYLES.cardBorderRadius,
          paddingLeft: UI_STYLES.cardPaddingX,
          paddingRight: UI_STYLES.cardPaddingX,
          paddingTop: '20px',
          paddingBottom: '20px',
        }}
      >
        <h3 className="text-base font-semibold text-slate-800">{t('weeklyReport.nutritionIntake')}</h3>
        <p className="text-sm text-slate-500 mt-4">{t('weeklyReport.noNutritionData')}</p>
      </div>
    )
  }

  // 转换图表数据
  const chartData = nutrition.chart_data.map((item) => ({
    label: item.label,
    calories: item.calories,
    status: item.status,
    statusLabel: item.status_label,
  }))

  // 目标热量线（假设为3000 kcal）
  const targetCalories = 3000

  // 图例
  const legends = [
    { status: 'on_target', label: t('weeklyReport.onTarget'), color: NUTRITION_STATUS_COLORS.on_target },
    { status: 'over', label: t('weeklyReport.over'), color: NUTRITION_STATUS_COLORS.over },
    { status: 'under', label: t('weeklyReport.under'), color: NUTRITION_STATUS_COLORS.under },
  ]

  return (
    <div
      className={`bg-white ${className}`}
      style={{
        borderRadius: UI_STYLES.cardBorderRadius,
        paddingLeft: UI_STYLES.cardPaddingX,
        paddingRight: UI_STYLES.cardPaddingX,
        paddingTop: '20px',
        paddingBottom: '20px',
      }}
    >
      {/* 标题：左侧大图标 + 副标题与日均热量，右侧达标徽章 */}
      <div
        className="flex items-center justify-between pb-4 mb-4"
        style={{ borderBottom: `1px solid ${UI_COLORS.background.gray}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }}
          >
            <svg className="w-6 h-6" style={{ color: NUTRITION_COLOR }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('weeklyReport.dailyCalories')}</p>
            <p className="text-base font-normal text-slate-800 mt-0.5">{nutrition.avg_daily_calories.value} kcal</p>
          </div>
        </div>
        <span
          className="text-xs font-medium px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: NUTRITION_COLOR,
          }}
        >
          {t('weeklyReport.onTargetPercent', { percent: nutrition.compliance_rate })}
        </span>
      </div>

      {/* Calorie Intake 标题 + 图例 + 柱状图 */}
      <p className="text-sm font-medium text-slate-700 mb-2">{t('weeklyReport.calorieIntake')}</p>
      <div className="flex items-center gap-4 mb-2">
        {legends.map((legend) => (
          <div key={legend.status} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: legend.color }}
            />
            <span className="text-xs text-slate-500">{legend.label}</span>
          </div>
        ))}
      </div>
      <div ref={chartContainerRef} className="h-44 -mx-2 mb-4" data-swipe-ignore>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
            />
            <ReferenceLine
              y={targetCalories}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Bar dataKey="calories" barSize={12} radius={[3, 3, 0, 0]} {...animationProps}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getNutritionStatusColor(entry.status)}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 餐食平均热量（灰色盒子） */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ backgroundColor: UI_COLORS.background.gray }}
      >
        <div className="grid grid-cols-3 gap-3">
          {nutrition.meal_avg.map((meal) => (
            <div key={meal.type} className="text-center p-2 rounded-xl bg-white/80">
              <p className="text-xs text-slate-500 mb-1">
                {meal.type === 'breakfast' ? t('weeklyReport.breakfast') : meal.type === 'lunch' ? t('weeklyReport.lunch') : t('weeklyReport.dinner')}
              </p>
              <p className="text-sm font-semibold" style={{ color: NUTRITION_COLOR }}>{meal.avg_calories} kcal</p>
            </div>
          ))}
        </div>
      </div>

      {/* 营养 AI 洞察（内嵌在卡片底部） */}
      {nutrition.ai_insight && (
        <div
          className="flex gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: UI_COLORS.background.gray }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
            style={{ backgroundColor: NUTRITION_COLOR }}
          >
            AI
          </div>
          <p className="text-sm text-slate-700 leading-relaxed flex-1 min-w-0">{nutrition.ai_insight}</p>
        </div>
      )}
    </div>
  )
}

export const WRNutritionCard = memo(WRNutritionCardInner)
