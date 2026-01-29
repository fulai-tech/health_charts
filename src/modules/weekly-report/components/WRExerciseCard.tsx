/**
 * WRExerciseCard - 周报运动模块卡片
 * 显示运动完成率、主要运动类型和效率评估（柱状图复用 StackedBarChart，与 SleepTrendyReportCard 一致）
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES, UI_COLORS } from '@/config/theme'
import { StackedBarChart, type BarLayer } from '@/components/charts/StackedBarChart'
import type { ExerciseAPI } from '../types'

// 运动主题色（设计稿：蓝色主题）
const EXERCISE_BG = '#E3F1FF' // 徽章/图标圆/活动圆背景
const EXERCISE_TEXT = '#8EC5FF' // 徽章文字
const EXERCISE_ICON = '#4A90E2' // 图标等更深的蓝色
const EXERCISE_CHART = '#B8DBFF' // 柱状图、AI 图标背景（较淡蓝）

interface WRExerciseCardProps {
  exercise: ExerciseAPI
  className?: string
}

/** 自定义Tooltip */
const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null

  const data = payload[0]?.payload
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-[100px]">
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{data.completion_rate}%</p>
      <p className="text-xs text-slate-500 mt-1">{data.duration} {t('weeklyReport.minutes')}</p>
    </div>
  )
}

/** 运动类型图标 */
const ExerciseIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    meditation: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
    ),
    yoga: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    running: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  }
  return icons[type] || icons.running
}

const WRExerciseCardInner = ({
  exercise,
  className = '',
}: WRExerciseCardProps) => {
  const { t } = useTranslation()

  const chartLayers: BarLayer[] = [
    { dataKey: 'completion_rate', color: EXERCISE_CHART, label: t('weeklyReport.exerciseCompletion') },
  ]

  if (!exercise.has_data) {
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
        <h3 className="text-base font-semibold text-slate-800">{t('weeklyReport.exercise')}</h3>
        <p className="text-sm text-slate-500 mt-4">{t('weeklyReport.noExerciseData')}</p>
      </div>
    )
  }

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
      {/* 标题：左侧大图标 + 副标题与完成率，右侧状态徽章 */}
      <div
        className="flex items-center justify-between pb-4 mb-4"
        style={{ borderBottom: `1px solid ${UI_COLORS.background.gray}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: EXERCISE_BG }}
          >
            <svg className="w-6 h-6" style={{ color: EXERCISE_ICON }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('weeklyReport.exerciseCompletion')}</p>
            <p className="text-base font-normal text-slate-800 mt-0.5">{exercise.avg_completion_rate}%</p>
          </div>
        </div>
        <span
          className="text-xs font-medium px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: EXERCISE_BG,
            color: EXERCISE_TEXT,
          }}
        >
          {exercise.status.label}
        </span>
      </div>

      {/* 主要运动类型和效率评估 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: UI_COLORS.background.gray }}>
          <p className="text-xs text-slate-500 mb-2">{exercise.main_types.title}</p>
          <div className="flex items-center gap-2">
            {exercise.main_types.types.map((type) => (
              <div
                key={type.type}
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ backgroundColor: EXERCISE_BG }}
                title={type.label}
              >
                <span style={{ color: EXERCISE_ICON }}>
                  <ExerciseIcon type={type.icon} />
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: UI_COLORS.background.gray }}>
          <p className="text-xs text-slate-500 mb-2">{exercise.efficiency.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              {exercise.efficiency.effect === 'bp_ideal' ? t('weeklyReport.bpIdeal') : exercise.efficiency.effect}
            </span>
            <span
              className="flex items-center text-xs"
              style={{
                color:
                  exercise.efficiency.change.direction === 'down' ? EXERCISE_ICON : 'rgb(248, 113, 113)',
              }}
            >
              {exercise.efficiency.change.direction === 'down' ? '↓' : '↑'}
              {exercise.efficiency.change.value}
            </span>
          </div>
        </div>
      </div>

      {/* 柱状图（复用 StackedBarChart，与 SleepTrendyReportCard 一致） */}
      <StackedBarChart
        data={exercise.chart_data}
        layers={chartLayers}
        xAxisKey="label"
        yAxisDomain={[0, 100]}
        yAxisFormatter={(v) => `${v}%`}
        legendShape="circle"
        renderTooltip={(props) => <CustomTooltip {...props} />}
        showLegend={false}
        height={200}
        barSize={12}
        showRoundedTop
        className="-mx-2 mb-4"
        stackId="exercise"
      />

      {/* 运动 AI 洞察（内嵌在卡片底部） */}
      {exercise.ai_insight && (
        <div
          className="flex gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: UI_COLORS.background.gray }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
            style={{ backgroundColor: EXERCISE_CHART }}
          >
            AI
          </div>
          <p className="text-sm text-slate-700 leading-relaxed flex-1 min-w-0">{exercise.ai_insight}</p>
        </div>
      )}
    </div>
  )
}

export const WRExerciseCard = memo(WRExerciseCardInner)
