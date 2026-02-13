import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react-lite'
import { motion } from 'framer-motion'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer, useWidgetAnimation } from '@/components/common/WidgetEntranceContainer'
import { EmbeddedContainer } from '@/components/common/EmbeddedContainer'
import { globalStore } from '@/stores/globalStore'
import { TrendingDown, TrendingUp, ArrowRight, Moon, Zap, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { widgetBGColor, VITAL_COLORS } from '@/config/theme'

// ============================================
// 类型定义
// ============================================

/**
 * 对比项数据类型
 */
interface CompareItemData {
  title: string
  value: string
  barPercent: number
  standardPercent: number
  status: 'low' | 'high' | 'normal'
  statusText: string
}

/**
 * 深睡疲劳对比卡片数据类型
 * 
 * JSON 数据格式规范（必须是 JSON 对象，不支持数组）：
 * {
 *   "theme": "sleep",                 // 主题: "sleep" | "BP"（可选，默认为 "sleep"）
 *   "left": {
 *     "title": "Deep sleep",           // 标题
 *     "value": "45min",                // 数值显示
 *     "barPercent": 45,                // 柱状图高度百分比 (0-100)
 *     "standardPercent": 40,           // 标准线位置百分比 (从底部计算)
 *     "status": "low",                 // 状态: "low" | "high" | "normal"
 *     "statusText": "Low"              // 状态文字
 *   },
 *   "right": {
 *     "title": "Morning fatigue",
 *     "value": "",
 *     "barPercent": 75,
 *     "standardPercent": 55,
 *     "status": "high",
 *     "statusText": "Rise"
 *   }
 * }
 */
type ThemeType = 'sleep' | 'BP'

interface SleepFatigueComparisonData {
  theme?: ThemeType
  left: CompareItemData
  right: CompareItemData
}

// ============================================
// 配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'sleep-fatigue-comparison',
  pageName: '深睡疲劳对比卡片',
  type: 2, // 深睡疲劳对比卡片类型标识
} as const

/** 开发环境自动触发延迟 (ms) */
const DELAY_START = 200
/** 收到 page-global-animate 后延迟触发动画 (ms) */
const DELAY_ANIMATE_START = 200

const DEFAULT_DATA: SleepFatigueComparisonData = {
  theme: 'sleep',
  left: {
    title: 'Deep sleep',
    value: '45min',
    barPercent: 45,
    standardPercent: 40,
    status: 'low',
    statusText: 'Low',
  },
  right: {
    title: 'Morning fatigue',
    value: '70min',
    barPercent: 75,
    standardPercent: 55,
    status: 'high',
    statusText: 'Rise',
  },
}

// ============================================
// 工具函数
// ============================================

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 2) + '...'
}

function parseComparisonData(raw: unknown): SleepFatigueComparisonData | null {
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const obj = data as Record<string, unknown>
  if (!obj.left || !obj.right) return null
  const theme = obj.theme === 'BP' ? 'BP' : 'sleep'
  return {
    theme,
    left: (obj.left as CompareItemData) || DEFAULT_DATA.left,
    right: (obj.right as CompareItemData) || DEFAULT_DATA.right,
  }
}

// ============================================
// 对比项组件 - 静态版 (默认)
// ============================================

interface CompareItemProps {
  data: CompareItemData
  theme: ThemeType
  position: 'left' | 'right'
  standardLabel: string
}

function CompareItemStatic({ data, theme, position, standardLabel }: CompareItemProps) {
  const isLow = data.status === 'low'
  const isHigh = data.status === 'high'
  let barColorStyle: string
  if (theme === 'sleep') {
    barColorStyle = position === 'left' ? '#B8DBFF' : '#FF9192'
  } else {
    barColorStyle = position === 'left' ? VITAL_COLORS.bp : '#FF9192'
  }
  const statusColor = isLow ? 'text-blue-500' : isHigh ? 'text-red-500' : 'text-slate-500'
  const arrowColor = isLow ? 'text-blue-500' : isHigh ? 'text-red-500' : 'text-slate-400'
  const safeBarPercent = clampPercent(data.barPercent)
  const safeStandardPercent = clampPercent(data.standardPercent)
  const displayTitle = truncateText(data.title, 16)
  const displayValue = truncateText(data.value, 10)
  const displayStatusText = truncateText(data.statusText, 8)

  return (
    <div className="flex-1 flex flex-col items-center max-w-[140px] min-w-0">
      <span className="text-sm font-medium text-slate-700 mb-3 text-center truncate max-w-full">{displayTitle}</span>
      <div className="w-full aspect-square bg-slate-50 rounded-xl relative flex items-end justify-center p-3 overflow-hidden">
        <div className="absolute left-2 right-2 h-px bg-slate-300" style={{ bottom: `${safeStandardPercent}%` }} />
        <span className="absolute right-2 text-[10px] text-slate-400 -translate-y-1/2" style={{ bottom: `${safeStandardPercent}%` }}>{standardLabel}</span>
        <div className="w-3/5 rounded-t-lg transition-all duration-500" style={{ height: `${safeBarPercent}%`, backgroundColor: barColorStyle }} />
      </div>
      <div className="flex items-center justify-center gap-1 mt-3 min-w-0 max-w-full">
        {data.value && data.value.trim() && <span className="text-sm font-medium text-slate-700 truncate">{displayValue}</span>}
        {isLow ? <ChevronDown className={`w-4 h-4 flex-shrink-0 ${arrowColor}`} /> : isHigh ? <ChevronUp className={`w-4 h-4 flex-shrink-0 ${arrowColor}`} /> : null}
        <span className={`text-sm font-medium truncate ${statusColor}`}>{displayStatusText}</span>
      </div>
    </div>
  )
}

// ============================================
// 对比项组件 - 动效版 (开发者模式)
// ============================================

interface CompareItemAnimatedProps {
  data: CompareItemData
  position: 'left' | 'right'
  standardLabel: string
  delay?: number
}

/** 获取主题配色 - 使用基础 CSS 颜色（兼容 X5 内核） */
function getThemeColors(position: 'left' | 'right') {
  return position === 'left' 
    ? { barColor: '#a5b4fc', text: 'text-indigo-500', bg: 'bg-indigo-50' }  // indigo-300
    : { barColor: '#fda4af', text: 'text-rose-500', bg: 'bg-rose-50' }      // rose-300
}

function CompareItemAnimated({ data, position, standardLabel, delay = 0 }: CompareItemAnimatedProps) {
  // 使用 Context 获取 canAnimate 状态，确保动画与外层容器同步
  const { canAnimate, animationKey } = useWidgetAnimation()
  
  const isLow = data.status === 'low'
  const colors = getThemeColors(position)
  
  const safeBarPercent = clampPercent(data.barPercent)
  const safeStandardPercent = clampPercent(data.standardPercent)
  const displayTitle = truncateText(data.title, 16)
  const displayValue = truncateText(data.value, 10)
  const displayStatusText = truncateText(data.statusText, 8)

  const Icon = position === 'left' ? Moon : Zap
  const TrendIcon = isLow ? TrendingDown : TrendingUp
  const trendColor = isLow ? 'text-indigo-500' : 'text-rose-500'
  const trendBg = isLow ? 'bg-indigo-50' : 'bg-rose-50'

  return (
    <div className="flex-1 flex flex-col items-center min-w-0 group cursor-pointer">
      {/* 标题 - 带淡入动效 */}
      <motion.div 
        key={`title-${animationKey}`}
        initial={{ opacity: 0, y: 5 }}
        animate={canAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
        transition={{ delay: delay + 0.5, duration: 0.4 }}
        className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-1.5"
      >
        <Icon size={14} className="text-slate-400" />
        <span className="truncate">{displayTitle}</span>
      </motion.div>
      
      {/* 图表区域 - 去容器化，直接留白 */}
      <div className="w-full h-36 relative flex items-end justify-center">
        {/* 标准线 - 虚线 */}
        <motion.div 
          key={`line-${animationKey}`}
          className="absolute left-0 right-0 flex items-center"
          style={{ bottom: `${safeStandardPercent}%` }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={canAnimate ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ delay: delay + 0.3, duration: 0.5 }}
        >
          <div className="flex-1 border-t border-dashed border-slate-300" />
          <span className="text-[9px] text-slate-400 font-mono tracking-wider ml-1">
            {standardLabel}
          </span>
        </motion.div>
        
        {/* 柱状图 - Spring 物理弹出 */}
        <motion.div
          key={`bar-${animationKey}`}
          initial={{ height: 0, opacity: 0 }}
          animate={canAnimate ? { height: `${safeBarPercent}%`, opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15, 
            delay: delay 
          }}
          className="w-16 rounded-t-2xl relative z-10 transition-all duration-300 group-hover:w-[4.5rem] group-hover:brightness-105"
          style={{ backgroundColor: colors.barColor }}
        >
          {/* 顶部高光 (Rim Light) */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40 rounded-full" />
          {/* 左侧高光 */}
          <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white/20 to-transparent rounded-tl-2xl" />
        </motion.div>
      </div>
      
      {/* 数值和状态 */}
      <motion.div 
        key={`stats-${animationKey}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={canAnimate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: delay + 0.3, duration: 0.3 }}
        className="flex flex-col items-center mt-4 gap-1.5"
      >
        {data.value && data.value.trim() && (
          <span className="text-xl font-bold text-slate-800 tabular-nums tracking-tight">
            {displayValue}
          </span>
        )}
        <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trendBg}`}>
          <TrendIcon size={12} className={trendColor} />
          <span className={trendColor}>{displayStatusText}</span>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * 深睡疲劳对比 Widget 页面 (Type 2)
 * 路由: /widget/type-2
 * 
 * 支持两种渲染模式：
 * - 开发者模式 (isTestEnv=true): Framer Motion 高级动效版
 * - 默认模式: 静态版
 */
export const Type2_ComparisonWidgetPage = observer(function Type2_ComparisonWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<SleepFatigueComparisonData>(DEFAULT_DATA)
  const { onData, send, isReady } = useNativeBridge({ 
    pageId: PAGE_CONFIG.pageId, 
    pageName: PAGE_CONFIG.pageName, 
    debug: import.meta.env.DEV 
  })

  // 入场动画控制
  const { canAnimate, animationKey } = useWidgetEntrance({
    pageId: PAGE_CONFIG.pageId,
    devAutoTriggerDelay: DELAY_START,
    animateDelay: DELAY_ANIMATE_START,
  })

  // 从 MobX store 获取开发者模式状态
  const isDevMode = globalStore.isTestEnv

  useEffect(() => {
    onData((rawData) => {
      const parsed = parseComparisonData(rawData)
      if (parsed) setData(parsed)
    })
  }, [onData])

  const handleCardClick = useCallback(() => {
    send('cardClick', { pageId: PAGE_CONFIG.pageId, data })
  }, [send, data])

  const standardLabel = t('widgets.type2.standard')

  // 开发者模式：高级动效版
  if (isDevMode) {
    return (
      <WidgetLayout align="left" className="p-0" style={{ backgroundColor: 'transparent' }}>
        <EmbeddedContainer maxWidth="md" fullHeight={false}>
          <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="scale">
            {/* 卡片容器 - 弥散阴影，高级质感 */}
            <div
              className="relative overflow-hidden rounded-3xl bg-transparent p-6 cursor-pointer select-none transition-all duration-200 active:scale-[0.98] active:opacity-90"
              onClick={handleCardClick}
            >
            {/* 对比图表区域 */}
            <div className="relative flex items-end justify-between gap-2 px-2">
              {/* 左侧图表: 深睡 */}
              <CompareItemAnimated 
                data={data.left} 
                position="left" 
                standardLabel={standardLabel}
                delay={0.1}
              />

              {/* 中间连接符: 动态箭头 (Flow Effect) */}
              <div className="h-28 flex flex-col items-center justify-center pb-6 opacity-50">
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <ArrowRight className="text-slate-300" size={22} />
                </motion.div>
              </div>

              {/* 右侧图表: 疲劳 */}
              <CompareItemAnimated 
                data={data.right} 
                position="right" 
                standardLabel={standardLabel}
                delay={0.3}
              />
            </div>
            </div>
          </WidgetEntranceContainer>

          {/* 调试信息 */}
          {import.meta.env.DEV && (
            <div className="mt-4 text-xs text-gray-400 text-center">
              {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'} | 动效模式: ✨
            </div>
          )}
        </EmbeddedContainer>
      </WidgetLayout>
    )
  }

  // 默认模式：静态版
  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: 'transparent' }}>
      <EmbeddedContainer maxWidth="md" fullHeight={false}>
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="slideUp">
          <div
            className="relative overflow-hidden rounded-2xl bg-transparent p-5 cursor-pointer select-none
                       transition-all duration-200 active:scale-[0.98] active:opacity-90"
            onClick={handleCardClick}
          >
          <div className="relative flex items-center justify-start gap-4">
            <CompareItemStatic 
              data={data.left} 
              theme={data.theme || 'sleep'} 
              position="left" 
              standardLabel={standardLabel} 
            />
            <div className="flex items-center justify-center w-8 flex-shrink-0">
              <ChevronRight className="w-6 h-6 text-orange-500" />
            </div>
            <CompareItemStatic 
              data={data.right} 
              theme={data.theme || 'sleep'} 
              position="right" 
              standardLabel={standardLabel} 
            />
          </div>
          </div>
        </WidgetEntranceContainer>
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'}
          </div>
        )}
      </EmbeddedContainer>
    </WidgetLayout>
  )
})
