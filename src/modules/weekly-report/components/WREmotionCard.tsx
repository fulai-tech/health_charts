/**
 * WREmotionCard - 周报情绪模块卡片
 * 显示情绪分数和情绪分布
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
import { UI_STYLES, UI_COLORS, EMOTION_COLORS } from '@/config/theme'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { useHideTooltipOnScroll } from '@/hooks/useHideTooltipOnScroll'
import type { EmotionAPI } from '../types'

// 情绪颜色配置
const EMOTION_CHART_COLORS = {
  negative: EMOTION_COLORS.negative,
  neutral: EMOTION_COLORS.neutral,
  positive: EMOTION_COLORS.positive,
}

interface WREmotionCardProps {
  emotion: EmotionAPI
  className?: string
}

/** 自定义Tooltip */
const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null

  const data = payload[0]?.payload
  if (!data || data.score === null) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xs text-slate-400 mt-1">{t('weeklyReport.noData')}</p>
      </div>
    )
  }

  const emotionLegends = [
    { key: 'positive', label: t('weeklyReport.positive'), color: EMOTION_CHART_COLORS.positive },
    { key: 'neutral', label: t('weeklyReport.neutral'), color: EMOTION_CHART_COLORS.neutral },
    { key: 'negative', label: t('weeklyReport.negative'), color: EMOTION_CHART_COLORS.negative },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-[120px]">
      <p className="text-xs font-medium text-slate-600 mb-2">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mb-2">{t('weeklyReport.emotionScore')}: {data.score}</p>
      <div className="space-y-1">
        {emotionLegends.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-600">{item.label}</span>
            </div>
            <span className="text-xs text-slate-800">{data[item.key] || 0}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const WREmotionCardInner = ({
  emotion,
  className = '',
}: WREmotionCardProps) => {
  const { t } = useTranslation()
  const animationProps = useChartAnimation()
  const chartContainerRef = useHideTooltipOnScroll<HTMLDivElement>()

  if (!emotion.has_data) {
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
        <h3 className="text-base font-semibold text-slate-800">{t('weeklyReport.emotion')}</h3>
        <p className="text-sm text-slate-500 mt-4">{t('weeklyReport.noEmotionData')}</p>
      </div>
    )
  }

  // 转换图表数据
  const chartData = emotion.trend_chart.map((item) => {
    const dist = item.distribution || []
    const negative = dist.find(d => d.type === 'negative')?.percent || 0
    const neutral = dist.find(d => d.type === 'neutral')?.percent || 0
    const positive = dist.find(d => d.type === 'positive')?.percent || 0

    return {
      label: item.label,
      score: item.score,
      negative,
      neutral,
      positive,
    }
  })

  // 平均分布（顺序与图表一致：negative, neutral, positive）
  const avgDist = emotion.avg_distribution
  const emotionColor = EMOTION_COLORS.primary
  const legends = [
    { key: 'positive', label: t('weeklyReport.positive'), color: EMOTION_CHART_COLORS.positive },
    { key: 'neutral', label: t('weeklyReport.neutral'), color: EMOTION_CHART_COLORS.neutral },
    { key: 'negative', label: t('weeklyReport.negative'), color: EMOTION_CHART_COLORS.negative },
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
      {/* 标题：左侧大图标 + 副标题与分数，右侧质量徽章 */}
      <div
        className="flex items-center justify-between pb-4 mb-4"
        style={{ borderBottom: `1px solid ${UI_COLORS.background.gray}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: EMOTION_COLORS.alpha }}
          >
            <svg className="w-6 h-6" style={{ color: emotionColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('weeklyReport.avgMoodIndex')}</p>
            <p className="text-base font-normal text-slate-800 mt-0.5">{emotion.avg_score} {t('weeklyReport.points')}</p>
          </div>
        </div>
        <span
          className="text-xs font-medium px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: 'rgba(251, 146, 61, 0.12)',
            color: emotionColor,
          }}
        >
          {emotion.status.label}
        </span>
      </div>

      {/* Mood & Volatility 标题 + 图例 + 堆叠柱状图 */}
      <p className="text-sm font-medium text-slate-700 mb-2">{t('weeklyReport.moodAndVolatility')}</p>
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
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
            />
            <Bar dataKey="negative" stackId="emotion" fill={EMOTION_CHART_COLORS.negative} barSize={12} {...animationProps} />
            <Bar dataKey="neutral" stackId="emotion" fill={EMOTION_CHART_COLORS.neutral} barSize={12} {...animationProps} />
            <Bar dataKey="positive" stackId="emotion" fill={EMOTION_CHART_COLORS.positive} barSize={12} radius={[3, 3, 0, 0]} {...animationProps} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Avg Mood Distribution 灰色盒子 */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ backgroundColor: UI_COLORS.background.gray }}
      >
        <p className="text-sm font-medium text-slate-700 mb-2">{t('weeklyReport.avgMoodDistribution')}</p>
        <div className="rounded-xl overflow-hidden mb-4" style={{ backgroundColor: '#f1f5f9' }}>
          <div className="flex h-3 rounded-full overflow-hidden">
            {avgDist.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-center min-w-0 transition-all"
                style={{
                  width: `${item.percent ?? 0}%`,
                  backgroundColor: EMOTION_CHART_COLORS[item.type as keyof typeof EMOTION_CHART_COLORS],
                }}
                title={`${item.label} ${item.percent ?? 0}%`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {avgDist.map((item) => (
            <div key={item.type} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: EMOTION_CHART_COLORS[item.type as keyof typeof EMOTION_CHART_COLORS] }}
              />
              <span className="text-xs text-slate-600">{item.label} {item.percent ?? 0}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 情绪 AI 洞察（内嵌在卡片底部） */}
      {emotion.ai_insight && (
        <div
          className="flex gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: UI_COLORS.background.gray }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
            style={{ backgroundColor: emotionColor }}
          >
            AI
          </div>
          <p className="text-sm text-slate-700 leading-relaxed flex-1 min-w-0">{emotion.ai_insight}</p>
        </div>
      )}
    </div>
  )
}

export const WREmotionCard = memo(WREmotionCardInner)
