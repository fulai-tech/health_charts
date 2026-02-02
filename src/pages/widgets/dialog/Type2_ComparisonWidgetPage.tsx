import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { VITAL_COLORS, widgetBGColor } from '@/config/theme'

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
// 对比项组件
// ============================================

interface CompareItemProps {
  data: CompareItemData
  theme: ThemeType
  position: 'left' | 'right'
  standardLabel: string
}

function CompareItem({ data, theme, position, standardLabel }: CompareItemProps) {
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

/**
 * 深睡疲劳对比 Widget 页面 (Type 2)
 * 路由: /widget/type-2
 */
export function Type2_ComparisonWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<SleepFatigueComparisonData>(DEFAULT_DATA)
  const { onData, send, isReady } = useNativeBridge({ pageId: PAGE_CONFIG.pageId, pageName: PAGE_CONFIG.pageName, debug: import.meta.env.DEV })
  useEffect(() => {
    onData((rawData) => {
      const parsed = parseComparisonData(rawData)
      if (parsed) setData(parsed)
    })
  }, [onData])
  const handleCardClick = useCallback(() => send('cardClick', { pageId: PAGE_CONFIG.pageId, data }), [send, data])
  const standardLabel = t('widgets.type2.standard')

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <div className="w-full max-w-lg p-4">
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 cursor-pointer select-none shadow-sm transition-all duration-200 active:scale-[0.98] active:opacity-90" onClick={handleCardClick}>
          <div className="relative flex items-center justify-center gap-4">
            <CompareItem data={data.left} theme={data.theme || 'sleep'} position="left" standardLabel={standardLabel} />
            <div className="flex items-center justify-center w-8 flex-shrink-0">
              <ChevronRight className="w-6 h-6 text-orange-500" />
            </div>
            <CompareItem data={data.right} theme={data.theme || 'sleep'} position="right" standardLabel={standardLabel} />
          </div>
        </div>
        {import.meta.env.DEV && <div className="mt-4 text-xs text-gray-400 text-center">{t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'}</div>}
      </div>
    </WidgetLayout>
  )
}
