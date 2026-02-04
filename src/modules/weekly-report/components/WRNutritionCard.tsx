/**
 * WRNutritionCard - 周报营养模块卡片
 * 显示日均热量、餐食分布和每日热量柱状图（复用 StackedBarChart，与 SleepTrendyReportCard 一致）
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES, UI_COLORS } from '@/config/theme'
import { StackedBarChart, type BarLayer } from '@/components/charts/StackedBarChart'
import type { NutritionAPI } from '../types'

// 营养卡片主题色（设计稿）
const NUTRITION_BG = '#EFFBF0' // 浅绿背景
const NUTRITION_TEXT = '#8DC77A' // 深绿文字/图标

// 柱状图三色：on_target 绿色、over 稍淡红、under 淡蓝
const NUTRITION_STATUS_COLORS: Record<string, string> = {
  on_target: '#8DC77A', // 绿色 - 达标
  over: '#ff6262', // 稍淡的红色 - 超标
  under: '#B8DBFF', // 淡蓝色 - 不足
}

interface WRNutritionCardProps {
  nutrition: NutritionAPI
  className?: string
}

/** 营养 Tooltip 数据 */
interface NutritionTooltipPayload {
  calories?: number
  status?: string
  statusLabel?: string
}

/** 自定义Tooltip */
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload?: NutritionTooltipPayload }>; label?: string }) => {
  if (!active || !payload?.length) return null

  const data = payload[0]?.payload
  if (!data || data.calories === undefined || data.status === undefined) return null
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-[100px]">
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{data.calories} kcal</p>
      <p className="text-xs mt-1" style={{ color: NUTRITION_STATUS_COLORS[data.status ?? ''] ?? '#64748b' }}>
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

  // 目标热量线（假设为3000 kcal）
  const targetCalories = 3000

  // 转换为堆叠柱状图数据（与 SleepTrendyReportCard 一致：按状态拆成三层）
  const chartData = nutrition.chart_data.map((item) => ({
    label: item.label,
    calories: item.calories,
    status: item.status,
    statusLabel: item.status_label,
    on_target: item.status === 'on_target' ? item.calories : 0,
    over: item.status === 'over' ? item.calories : 0,
    under: item.status === 'under' ? item.calories : 0,
  }))

  const maxCalories = Math.max(...chartData.map((d) => d.calories), targetCalories)
  const yAxisMax = Math.ceil((maxCalories * 1.15) / 500) * 500

  const chartLayers: BarLayer[] = [
    { dataKey: 'on_target', color: NUTRITION_STATUS_COLORS.on_target, label: t('weeklyReport.onTarget') },
    { dataKey: 'over', color: NUTRITION_STATUS_COLORS.over, label: t('weeklyReport.over') },
    { dataKey: 'under', color: NUTRITION_STATUS_COLORS.under, label: t('weeklyReport.under') },
  ]

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
            style={{ backgroundColor: NUTRITION_BG }}
          >
            <svg className="w-6 h-6" style={{ color: NUTRITION_TEXT }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v20M8 12h8" />
              <path d="M16 2v6c0 1.1.9 2 2 2h2v12h2V10h2c1.1 0 2-.9 2-2V2h-8z" />
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
            backgroundColor: NUTRITION_BG,
            color: NUTRITION_TEXT,
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
      <StackedBarChart
        data={chartData}
        layers={chartLayers}
        xAxisKey="label"
        yAxisDomain={[0, yAxisMax]}
        yAxisFormatter={(v) => `${v / 1000}k`}
        legendShape="circle"
        renderTooltip={(props) => <CustomTooltip {...props} />}
        showLegend={false}
        height={200}
        barSize={12}
        showRoundedTop
        className="-mx-2 mb-4"
        stackId="nutrition"
        referenceLines={[
          { y: targetCalories, stroke: '#F59E0B', strokeDasharray: '4 4' },
        ]}
      />

      {/* 餐食平均热量（灰色盒子） */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ backgroundColor: UI_COLORS.background.gray }}
      >
        <div className="grid grid-cols-3 gap-3">
          {nutrition.meal_avg.map((meal) => (
            <div key={meal.type} className="text-left p-3 rounded-xl bg-white/80">
              <p className="text-sm font-semibold text-slate-800 mb-1">
                {meal.type === 'breakfast' ? t('weeklyReport.breakfast') : meal.type === 'lunch' ? t('weeklyReport.lunch') : t('weeklyReport.dinner')}
              </p>
              <p className="text-base font-semibold">
                <span style={{ color: NUTRITION_TEXT }}>{meal.avg_calories}</span>
                <span className="text-slate-600 ml-1">kcal</span>
              </p>
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
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{ backgroundColor: NUTRITION_BG, color: NUTRITION_TEXT }}
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
