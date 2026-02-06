/**
 * 每周健康分数 Widget 页面（type-7）
 * 路由: /widget/type-7
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer } from '@/components/common/WidgetEntranceContainer'
import { EmbeddedContainer } from '@/components/common/EmbeddedContainer'
import { BarChart3, Moon, Activity, Utensils, Sparkles, Target, Heart, Leaf } from 'lucide-react'
import {
  VITAL_COLORS,
  VITAL_COLORS_ALPHA,
  HEALTH_COLORS,
  HEALTHY_COLORS,
  widgetBGColor,
} from '@/config/theme'

interface WeeklyHealthScoreMetric {
  type: 'sleep' | 'exercise' | 'dietary'
  label: string
  value: number | string
  unit?: string
}

interface WeeklyHealthScoreData {
  weeklyScore: number
  maxScore?: number
  weekNumber: number
  /** 一句评价语，由 Android 提供，如「表现极佳，保持这个节奏」 */
  evaluationText?: string
  /** 第一个标签完整文案，由 Android 提供，如「分数达标5天」 */
  daysToTargetText?: string
  /** 第二个标签完整文案，由 Android 提供，如「较上周提升12分」 */
  pointsHigherThanLastWeekText?: string
  metrics: [WeeklyHealthScoreMetric, WeeklyHealthScoreMetric, WeeklyHealthScoreMetric]
}

const PAGE_CONFIG = { pageId: 'weekly-health-score', pageName: '每周健康分数卡片', type: 7 } as const

/** 开发环境自动触发延迟 (ms) */
const DELAY_START = 200
/** 收到 page-global-animate 后延迟触发动画 (ms) */
const DELAY_ANIMATE_START = 200

const DEFAULT_DATA: WeeklyHealthScoreData = {
  weeklyScore: 92,
  maxScore: 100,
  weekNumber: 42,
  evaluationText: '表现极佳，保持这个节奏',
  daysToTargetText: '5 days to reach target',
  pointsHigherThanLastWeekText: '12 points higher than last week',
  metrics: [
    { type: 'sleep', label: 'Sleep duration', value: 324, unit: 'min' },
    { type: 'exercise', label: 'Exercise', value: 3, unit: 'times' },
    { type: 'dietary', label: 'Dietary', value: 'Goal', unit: '' },
  ],
}

type DisplaySegment = { text: string; isValue: boolean }

function getMetricDisplay(
  type: 'sleep' | 'exercise' | 'dietary',
  value: number | string,
  unit?: string,
  t?: (key: string) => string
): { main: string; suffix: string; segments?: DisplaySegment[] } {
  const minLabel = t ? t('widgets.type7.min') : 'min'
  const hLabel = t ? t('widgets.type7.h') : 'h'
  const timesLabel = t ? ` ${t('widgets.type7.times')}` : ' times'
  const goalLabel = t ? t('widgets.type7.goal') : 'Goal'
  if (type === 'sleep' && typeof value === 'number') {
    const clamped = Math.max(0, Math.min(5999, Math.round(value)))
    const hours = Math.floor(clamped / 60)
    const minutes = clamped % 60
    // 使用紧凑格式防止溢出：5小时24分
    if (hours === 0) return { main: '', suffix: '', segments: [{ text: String(minutes), isValue: true }, { text: minLabel, isValue: false }] }
    if (minutes === 0) return { main: '', suffix: '', segments: [{ text: String(hours), isValue: true }, { text: hLabel, isValue: false }] }
    return {
      main: '',
      suffix: '',
      segments: [
        { text: String(hours), isValue: true },
        { text: hLabel, isValue: false },
        { text: String(minutes), isValue: true },
        { text: minLabel, isValue: false },
      ],
    }
  }
  if (type === 'exercise' && typeof value === 'number') return { main: String(value), suffix: timesLabel, segments: undefined }
  if (type === 'dietary') return { main: typeof value === 'string' && value !== 'Goal' ? value : goalLabel, suffix: '', segments: undefined }
  return { main: String(value), suffix: unit ? ` ${unit}` : '', segments: undefined }
}

function getMetricStyle(type: 'sleep' | 'exercise' | 'dietary') {
  switch (type) {
    case 'sleep': return { bg: VITAL_COLORS_ALPHA.sleep, iconColor: VITAL_COLORS.sleep }
    case 'exercise': return { bg: VITAL_COLORS_ALPHA.spo2, iconColor: VITAL_COLORS.spo2 }
    case 'dietary': return { bg: HEALTHY_COLORS.alpha, iconColor: HEALTHY_COLORS.primary }
    default: return { bg: 'rgb(248, 248, 248)', iconColor: 'rgb(31, 41, 55)' }
  }
}

/** 获取卡片背面的提示内容 */
function getBackContent(type: 'sleep' | 'exercise' | 'dietary', t: (key: string) => string) {
  switch (type) {
    case 'sleep':
      return {
        icon: Moon,
        title: t('widgets.type7.backTips.sleep.title'),
        tip: t('widgets.type7.backTips.sleep.tip'),
      }
    case 'exercise':
      return {
        icon: Target,
        title: t('widgets.type7.backTips.exercise.title'),
        tip: t('widgets.type7.backTips.exercise.tip'),
      }
    case 'dietary':
      return {
        icon: Leaf,
        title: t('widgets.type7.backTips.dietary.title'),
        tip: t('widgets.type7.backTips.dietary.tip'),
      }
  }
}

function parseWeeklyHealthScoreData(raw: unknown): WeeklyHealthScoreData | null {
  let data = raw
  if (typeof raw === 'string') {
    try { data = JSON.parse(raw) } catch { return null }
  }
  const obj = data as Record<string, unknown>
  const card = (obj.weekly_health_score_card ?? obj) as Record<string, unknown>
  if (typeof card.weeklyScore !== 'number' || typeof card.weekNumber !== 'number' || !Array.isArray(card.metrics) || card.metrics.length < 3) return null
  const m0 = card.metrics[0] as Record<string, unknown>
  const m1 = card.metrics[1] as Record<string, unknown>
  const m2 = card.metrics[2] as Record<string, unknown>
  return {
    weeklyScore: card.weeklyScore as number,
    maxScore: (card.maxScore as number) ?? 100,
    weekNumber: card.weekNumber as number,
    evaluationText: (card.evaluationText ?? card.evaluation_text) as string | undefined,
    daysToTargetText: (card.daysToTargetText ?? card.days_to_target_text) as string | undefined,
    pointsHigherThanLastWeekText: (card.pointsHigherThanLastWeekText ?? card.points_higher_than_last_week_text) as string | undefined,
    metrics: [
      { type: 'sleep', label: (m0.label as string) ?? 'Sleep duration', value: (m0.value as number) ?? 0, unit: (m0.unit as string) ?? 'min' },
      { type: 'exercise', label: (m1.label as string) ?? 'Exercise', value: (m1.value as number) ?? 0, unit: (m1.unit as string) ?? 'times' },
      { type: 'dietary', label: (m2.label as string) ?? 'Dietary', value: (m2.value as string | number) ?? 'Goal', unit: (m2.unit as string) ?? '' },
    ],
  }
}

// ============================================
// 可翻转的 Metric 卡片
// ============================================

/** 获取指标的 i18n 翻译标签 */
function getMetricLabel(type: 'sleep' | 'exercise' | 'dietary', t: (key: string) => string): string {
  switch (type) {
    case 'sleep': return t('widgets.type7.sleepDuration')
    case 'exercise': return t('widgets.type7.exercise')
    case 'dietary': return t('widgets.type7.dietary')
    default: return ''
  }
}

interface FlipMetricCardProps {
  type: 'sleep' | 'exercise' | 'dietary'
  value: number | string
  unit?: string
  t: (key: string) => string
}

function FlipMetricCard({ type, value, unit, t }: FlipMetricCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const style = getMetricStyle(type)
  const { main, suffix, segments } = getMetricDisplay(type, value, unit, t)
  const Icon = type === 'sleep' ? Moon : type === 'exercise' ? Activity : Utensils
  const backContent = getBackContent(type, t)
  const BackIcon = backContent.icon
  // 使用 i18n 翻译的标签而不是数据中的 label
  const translatedLabel = getMetricLabel(type, t)

  return (
    <div 
      className="relative cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* 正面 - 用于撑起高度 */}
        <div 
          className="rounded-2xl p-4 flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: style.bg, backfaceVisibility: 'hidden' }}
        >
          <div className="flex justify-center mb-2">
            <Icon className="w-6 h-6" style={{ color: style.iconColor }} />
          </div>
          <div className="text-sm font-medium text-slate-600 mb-1 w-full text-center">{translatedLabel}</div>
          <div className="text-base font-semibold text-slate-800 w-full text-center">
            {segments ? (
              segments.map((seg, i) => <span key={i}>{seg.text}</span>)
            ) : (
              <>{main}{suffix}</>
            )}
          </div>
        </div>

        {/* 背面 - 绝对定位覆盖 */}
        <div 
          className="absolute inset-0 rounded-2xl p-2 flex flex-col items-center justify-center text-center gap-1"
          style={{ 
            backgroundColor: style.bg, 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <BackIcon className="w-5 h-5 flex-shrink-0" style={{ color: style.iconColor }} />
          <div className="text-[13px] text-slate-600 leading-snug whitespace-pre-line">{backContent.tip}</div>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// 可翻转的主评分卡片
// ============================================

interface FlipScoreCardProps {
  data: WeeklyHealthScoreData
  t: (key: string, options?: Record<string, unknown>) => string
  onSummaryClick: () => void
}

function FlipScoreCard({ data, t, onSummaryClick }: FlipScoreCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const maxScore = data.maxScore ?? 100

  const handleClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮，不翻转卡片
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    setIsFlipped(!isFlipped)
  }

  return (
    <div 
      className="relative cursor-pointer select-none mb-3"
      style={{ perspective: '1000px' }}
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* 正面 - 评分内容（撑起高度） */}
        <div 
          className="rounded-2xl p-4 text-white"
          style={{ backgroundColor: HEALTH_COLORS.weeklyScoreHeader, backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">{t('widgets.type7.weeklyHealthScore')}</span>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: HEALTH_COLORS.weeklyScoreButtonBg, color: HEALTH_COLORS.weeklyScoreButtonText }}
              onClick={onSummaryClick}
            >
              {t('widgets.type7.weekSummary', { week: data.weekNumber })}
            </button>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-bold">{data.weeklyScore}</span>
            <span className="text-lg opacity-90">/ {maxScore}</span>
          </div>
          {data.evaluationText != null && data.evaluationText !== '' && (
            <div className="text-sm opacity-95 mb-3">{data.evaluationText}</div>
          )}
          <div className="flex flex-wrap gap-2">
            {data.daysToTargetText != null && data.daysToTargetText !== '' && (
              <span className="px-2.5 py-1 rounded-lg text-sm" style={{ backgroundColor: HEALTH_COLORS.weeklyScoreButtonBg }}>
                {data.daysToTargetText}
              </span>
            )}
            {data.pointsHigherThanLastWeekText != null && data.pointsHigherThanLastWeekText !== '' && (
              <span className="px-2.5 py-1 rounded-lg text-sm" style={{ backgroundColor: HEALTH_COLORS.weeklyScoreButtonBg }}>
                {data.pointsHigherThanLastWeekText}
              </span>
            )}
          </div>
        </div>

        {/* 背面 - 健康小贴士（绝对定位覆盖） */}
        <div 
          className="absolute inset-0 rounded-2xl p-5 text-white flex flex-col items-center justify-center"
          style={{ 
            backgroundColor: HEALTH_COLORS.weeklyScoreHeader, 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Sparkles className="w-8 h-8 mb-3" />
          <p className="text-base font-medium text-center leading-relaxed mb-3">
            {t('widgets.type7.backTips.main.tip1')}
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: HEALTH_COLORS.weeklyScoreButtonBg }}>
            <Heart className="w-4 h-4 text-red-300" />
            <span className="text-sm">{t('widgets.type7.backTips.main.tip2')}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// 主组件
// ============================================

export function Type7_WeeklyHealthScoreWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<WeeklyHealthScoreData>(DEFAULT_DATA)
  const { onData, send, isReady } = useNativeBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
  })

  // 入场动画控制
  const { canAnimate, animationKey } = useWidgetEntrance({
    pageId: PAGE_CONFIG.pageId,
    devAutoTriggerDelay: DELAY_START,
    animateDelay: DELAY_ANIMATE_START,
  })

  useEffect(() => {
    onData((rawData) => {
      const parsed = parseWeeklyHealthScoreData(rawData)
      if (parsed) setData(parsed)
    })
  }, [onData])

  const handleSummaryClick = () => {
    send('summaryClick', { pageId: PAGE_CONFIG.pageId, weekNumber: data.weekNumber })
  }

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <EmbeddedContainer maxWidth="md" fullHeight={false} paddingTop="sm" paddingLeft="sm" paddingRight="sm">
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="spring" stagger staggerDelay={0.1}>
          {/* 主评分卡片 - 可翻转 */}
          <FlipScoreCard data={data} t={t} onSummaryClick={handleSummaryClick} />
          
          {/* 指标卡片网格 - 可翻转 */}
          <div className="grid grid-cols-3 gap-3">
            {data.metrics.map((m) => (
              <FlipMetricCard key={m.type} type={m.type} value={m.value} unit={m.unit} t={t} />
            ))}
          </div>
        </WidgetEntranceContainer>
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">{t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'}</div>
        )}
      </EmbeddedContainer>
    </WidgetLayout>
  )
}
