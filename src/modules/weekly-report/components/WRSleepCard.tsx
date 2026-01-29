/**
 * WRSleepCard - 周报睡眠模块卡片
 * 显示睡眠时长统计和睡眠结构堆叠柱状图（复用 StackedBarChart）
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES, UI_COLORS, SLEEP_COLORS, VITAL_COLORS } from '@/config/theme'
import { StackedBarChart, type BarLayer } from '@/components/charts/StackedBarChart'
import type { SleepAPI } from '../types'

interface WRSleepCardProps {
  sleep: SleepAPI
  className?: string
}

/** 自定义 Tooltip */
const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null

  const data = payload[0]?.payload
  if (!data || data.total === null) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xs text-slate-400 mt-1">{t('weeklyReport.noData')}</p>
      </div>
    )
  }

  const sleepLegends = [
    { key: 'deep', label: t('weeklyReport.sleepDeep'), color: SLEEP_COLORS.deep },
    { key: 'light', label: t('weeklyReport.sleepLight'), color: SLEEP_COLORS.light },
    { key: 'rem', label: t('weeklyReport.sleepRem'), color: SLEEP_COLORS.rem },
    { key: 'awake', label: t('weeklyReport.awake'), color: SLEEP_COLORS.awake },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-[120px]">
      <p className="text-xs font-medium text-slate-600 mb-2">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mb-2">{data.totalText}</p>
      <div className="space-y-1">
        {sleepLegends.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-600">{item.label}</span>
            </div>
            <span className="text-xs text-slate-800">{data[`${item.key}Text`] || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const WRSleepCardInner = ({
  sleep,
  className = '',
}: WRSleepCardProps) => {
  const { t } = useTranslation()

  if (!sleep.has_data) {
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
        <h3 className="text-base font-semibold text-slate-800">{t('weeklyReport.sleep')}</h3>
        <p className="text-sm text-slate-500 mt-4">{t('weeklyReport.noSleepData')}</p>
      </div>
    )
  }

  // 转换图表数据
  const chartData = sleep.trend_chart.map((item) => {
    const stages = item.stages || []
    const deepStage = stages.find(s => s.type === 'deep')
    const lightStage = stages.find(s => s.type === 'light')
    const remStage = stages.find(s => s.type === 'rem')
    const awakeStage = stages.find(s => s.type === 'awake')

    return {
      label: item.label,
      total: item.total,
      totalText: item.total_text,
      deep: deepStage?.value || 0,
      deepText: deepStage?.text,
      light: lightStage?.value || 0,
      lightText: lightStage?.text,
      rem: remStage?.value || 0,
      remText: remStage?.text,
      awake: awakeStage?.value || 0,
      awakeText: awakeStage?.text,
    }
  })

  // 图例配置（与 StackedBarChart layers 顺序一致：自下而上 deep → light → rem → awake）
  const legends = [
    { key: 'deep', label: t('weeklyReport.sleepDeep'), color: SLEEP_COLORS.deep },
    { key: 'light', label: t('weeklyReport.sleepLight'), color: SLEEP_COLORS.light },
    { key: 'rem', label: t('weeklyReport.sleepRem'), color: SLEEP_COLORS.rem },
    { key: 'awake', label: t('weeklyReport.awake'), color: SLEEP_COLORS.awake },
  ]

  const layers: BarLayer[] = legends.map((l) => ({
    dataKey: l.key,
    color: l.color,
    label: l.label,
  }))

  const sleepColor = VITAL_COLORS.sleep

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
      {/* 标题：左侧大图标 + 副标题与时长，右侧质量徽章 */}
      <div
        className="flex items-center justify-between pb-4 mb-4"
        style={{ borderBottom: `2px solid ${UI_COLORS.background.gray}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: SLEEP_COLORS.rem }}
          >
            <svg className="w-6 h-6" style={{ color: sleepColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('weeklyReport.avgSleepTracking')}</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{sleep.avg_duration.display}</p>
          </div>
        </div>
        <span
          className="text-xs font-medium px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: '#F5EFFF',
            color: '#A27EFF',
          }}
        >
          {sleep.status.label}
        </span>
      </div>

      {/* Sleep Duration Trend 标题 + 图例 */}
      <p className="text-sm font-medium text-slate-700 mb-2">{t('weeklyReport.sleepDurationTrend')}</p>
      <div className="flex items-center gap-4 mb-2">
        {legends.map((legend) => (
          <div key={legend.key} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: legend.color }}
            />
            <span className="text-xs text-slate-500">{legend.label}</span>
          </div>
        ))}
      </div>

      {/* 堆叠柱状图（复用 StackedBarChart，仅点击弹出 tooltip） */}
      <StackedBarChart
        data={chartData}
        layers={layers}
        xAxisKey="label"
        renderTooltip={(props) => <CustomTooltip {...props} />}
        yAxisFormatter={(v) => `${Math.floor(Number(v) / 60)}h`}
        showLegend={false}
        height={250}
        barSize={12}
        showRoundedTop
        className="-mx-2 mb-4"
        stackId="sleep"
      />

      {/* Avg Sleep Stages 横向进度条 + 图例（灰色背景盒子） */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ backgroundColor: UI_COLORS.background.gray }}
      >
        <p className="text-sm font-medium text-slate-700 mb-2">{t('weeklyReport.avgSleepStages')}</p>
        <div className="rounded-xl overflow-hidden mb-4" style={{ backgroundColor: '#f1f5f9' }}>
          <div className="flex h-3 rounded-full overflow-hidden">
            {sleep.sleep_structure.stages.map((stage) => (
              <div
                key={stage.type}
                className="flex items-center justify-center min-w-0 transition-all"
                style={{
                  width: `${stage.percent ?? 0}%`,
                  backgroundColor: SLEEP_COLORS[stage.type as keyof typeof SLEEP_COLORS],
                }}
                title={`${stage.label} ${stage.percent ?? 0}%`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {sleep.sleep_structure.stages.map((stage) => (
            <div key={stage.type} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: SLEEP_COLORS[stage.type as keyof typeof SLEEP_COLORS] }}
              />
              <span className="text-xs text-slate-600">{stage.label} {stage.percent ?? 0}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 睡眠 AI 洞察（内嵌在卡片底部） */}
      {sleep.ai_insight && (
        <div
          className="flex gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: UI_COLORS.background.gray }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
            style={{ backgroundColor: sleepColor }}
          >
            AI
          </div>
          <p className="text-sm text-slate-700 leading-relaxed flex-1 min-w-0">{sleep.ai_insight}</p>
        </div>
      )}
    </div>
  )
}

export const WRSleepCard = memo(WRSleepCardInner)
