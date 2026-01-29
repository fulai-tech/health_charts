/**
 * WRExerciseCard - 周报运动模块卡片
 * 显示运动完成率、主要运动类型和效率评估
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
} from 'recharts'
import { UI_STYLES, UI_COLORS } from '@/config/theme'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { useHideTooltipOnScroll } from '@/hooks/useHideTooltipOnScroll'
import type { ExerciseAPI } from '../types'

// 运动主题色
const EXERCISE_COLOR = '#22C55E' // 绿色

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
  const animationProps = useChartAnimation()
  const chartContainerRef = useHideTooltipOnScroll<HTMLDivElement>()

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
            style={{ backgroundColor: `${EXERCISE_COLOR}20` }}
          >
            <svg className="w-6 h-6" style={{ color: EXERCISE_COLOR }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            backgroundColor: `${EXERCISE_COLOR}20`,
            color: EXERCISE_COLOR,
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
                style={{ backgroundColor: `${EXERCISE_COLOR}20` }}
                title={type.label}
              >
                <span style={{ color: EXERCISE_COLOR }}>
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
              className={`flex items-center text-xs ${
                exercise.efficiency.change.direction === 'down' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {exercise.efficiency.change.direction === 'down' ? '↓' : '↑'}
              {exercise.efficiency.change.value}
            </span>
          </div>
        </div>
      </div>

      {/* 柱状图 */}
      <div ref={chartContainerRef} className="h-36 -mx-2 mb-4" data-swipe-ignore>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={exercise.chart_data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
            />
            <Bar
              dataKey="completion_rate"
              fill={EXERCISE_COLOR}
              barSize={12}
              radius={[3, 3, 0, 0]}
              {...animationProps}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 运动 AI 洞察（内嵌在卡片底部） */}
      {exercise.ai_insight && (
        <div
          className="flex gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: UI_COLORS.background.gray }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
            style={{ backgroundColor: EXERCISE_COLOR }}
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
