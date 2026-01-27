import { useState, useCallback, useEffect } from 'react'
import { WidgetLayout } from '@/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { VITAL_COLORS } from '@/config/theme'

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

/**
 * 数值边界限制
 * 确保百分比值在 0-100 范围内
 */
function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}

/**
 * 截断文本，避免溢出
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 2) + '...'
}

/**
 * 解析原生数据
 * 
 * 期望的数据格式：JSON 对象（不支持数组）
 */
function parseComparisonData(raw: unknown): SleepFatigueComparisonData | null {
  // 如果是字符串，先尝试 JSON 解析
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('[SleepFatigueComparisonWidget] JSON 解析失败:', raw)
      return null
    }
  }

  // 验证数据格式：必须是 JSON 对象，不支持数组
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('[SleepFatigueComparisonWidget] 数据格式错误，期望 JSON 对象:', data)
    return null
  }
  
  const obj = data as Record<string, unknown>
  
  if (!obj.left || !obj.right) {
    console.warn('[SleepFatigueComparisonWidget] 缺少必需字段 left 或 right:', data)
    return null
  }
  
  // 验证 theme 参数
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
}

function CompareItem({ data, theme, position }: CompareItemProps) {
  const isLow = data.status === 'low'
  const isHigh = data.status === 'high'
  
  // 根据主题和位置确定柱状图颜色
  let barColorStyle: string
  if (theme === 'sleep') {
    // sleep 主题：第1个柱子 #B8DBFF (蓝色)，第2个柱子 #FF9192 (红色)
    barColorStyle = position === 'left' ? '#B8DBFF' : '#FF9192'
  } else {
    // BP 主题：第1个柱子是 VITAL_COLORS.bp (橘色)，第2个柱子是 #FF9192 (红色)
    barColorStyle = position === 'left' ? VITAL_COLORS.bp : '#FF9192'
  }
  
  // 状态颜色配置（保持原有逻辑）
  const statusColor = isLow ? 'text-blue-500' : isHigh ? 'text-red-500' : 'text-slate-500'
  const arrowColor = isLow ? 'text-blue-500' : isHigh ? 'text-red-500' : 'text-slate-400'
  
  // 限制百分比在 0-100 范围内，防止柱子溢出
  const safeBarPercent = clampPercent(data.barPercent)
  const safeStandardPercent = clampPercent(data.standardPercent)
  
  // 截断文本，防止溢出
  const displayTitle = truncateText(data.title, 16)
  const displayValue = truncateText(data.value, 10)
  const displayStatusText = truncateText(data.statusText, 8)
  
  return (
    <div className="flex-1 flex flex-col items-center max-w-[140px] min-w-0">
      {/* 标题 */}
      <span className="text-sm font-medium text-slate-700 mb-3 text-center truncate max-w-full">
        {displayTitle}
      </span>
      
      {/* 图表容器 */}
      <div className="w-full aspect-square bg-slate-50 rounded-xl relative flex items-end justify-center p-3 overflow-hidden">
        {/* 标准线 - 使用安全的百分比值 */}
        <div
          className="absolute left-2 right-2 h-px bg-slate-300"
          style={{ bottom: `${safeStandardPercent}%` }}
        />
        <span
          className="absolute right-2 text-[10px] text-slate-400 -translate-y-1/2"
          style={{ bottom: `${safeStandardPercent}%` }}
        >
          Standard
        </span>
        
        {/* 柱状图 - 使用安全的百分比值 */}
        <div
          className="w-3/5 rounded-t-lg transition-all duration-500"
          style={{ 
            height: `${safeBarPercent}%`,
            backgroundColor: barColorStyle
          }}
        />
      </div>
      
      {/* 底部指标 */}
      <div className="flex items-center justify-center gap-1 mt-3 min-w-0 max-w-full">
        {data.value && data.value.trim() && (
          <span className="text-sm font-medium text-slate-700 truncate">{displayValue}</span>
        )}
        {isLow ? (
          <ChevronDown className={`w-4 h-4 flex-shrink-0 ${arrowColor}`} />
        ) : isHigh ? (
          <ChevronUp className={`w-4 h-4 flex-shrink-0 ${arrowColor}`} />
        ) : null}
        <span className={`text-sm font-medium truncate ${statusColor}`}>{displayStatusText}</span>
      </div>
    </div>
  )
}

// ============================================
// 主组件
// ============================================

/**
 * 深睡疲劳对比 Widget 页面
 * 
 * 路由: /widget/sleep-fatigue-comparison
 * 
 * 通信方式：
 * - Android -> JS: NativeBridge.receiveData(jsonString)
 * - JS -> Android: window.android.onJsMessage(jsonString)
 */
export function SleepFatigueComparisonWidgetPage() {
  const [data, setData] = useState<SleepFatigueComparisonData>(DEFAULT_DATA)

  // 初始化原生桥接
  const { onData, send, isReady } = useNativeBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
  })

  // 注册数据接收回调
  useEffect(() => {
    onData((rawData) => {
      console.log('[SleepFatigueComparisonWidget] 收到原生数据')
      const parsed = parseComparisonData(rawData)
      if (parsed) {
        setData(parsed)
        console.log('[SleepFatigueComparisonWidget] 渲染完成')
      } else {
        console.warn('[SleepFatigueComparisonWidget] 数据解析失败，使用默认数据')
      }
    })
  }, [onData])

  // 处理卡片点击
  const handleCardClick = useCallback(() => {
    send('cardClick', { pageId: PAGE_CONFIG.pageId, data })
  }, [send, data])

  return (
    <WidgetLayout className="bg-[#F5F5F5] p-0">
      <div className="w-full max-w-lg mx-auto p-4">
        {/* 对比卡片 */}
        <div
          className="relative overflow-hidden rounded-2xl bg-white p-5 cursor-pointer select-none shadow-sm transition-all duration-200 active:scale-[0.98] active:opacity-90"
          onClick={handleCardClick}
        >

          {/* 对比区域 */}
          <div className="relative flex items-center justify-center gap-4">
            {/* 左侧 */}
            <CompareItem data={data.left} theme={data.theme || 'sleep'} position="left" />
            
            {/* 箭头连接符 */}
            <div className="flex items-center justify-center w-8 flex-shrink-0">
              <ChevronRight className="w-6 h-6 text-orange-500" />
            </div>
            
            {/* 右侧 */}
            <CompareItem data={data.right} theme={data.theme || 'sleep'} position="right" />
          </div>
        </div>

        {/* 调试信息（仅开发环境） */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            NativeBridge Ready: {isReady ? '✅' : '⏳'}
          </div>
        )}
      </div>
    </WidgetLayout>
  )
}
