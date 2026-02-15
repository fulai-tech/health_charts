/**
 * 定制改善计划 Widget 页面（type-9）
 * 路由: /widget/type-9
 *
 * 功能：
 * - 显示个性化改善建议列表（如运动、睡眠等）
 * - 点击 Add 按钮时通过 NativeBridge 发送事件给 Android
 * - 支持 Selected 按钮显示已选中的项目
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer } from '@/components/common/WidgetEntranceContainer'
import { EmbeddedContainer } from '@/components/common/EmbeddedContainer'
import { widgetBGColor } from '@/config/theme'
import { AnimatedImage } from '@/components/common/AnimatedImage'

// ============================================
// 类型定义
// ============================================

/** 改善计划项目类型 */
type PlanItemType = 'exercise' | 'sleep' | 'nutrition' | 'other'

/** 改善计划项目 */
interface ImprovementPlanItem {
  id: string
  type: PlanItemType
  title: string
  description: string
  isAdded: boolean
}

/** 组件数据 */
interface ImprovementPlanData {
  title?: string
  items: ImprovementPlanItem[]
}

// ============================================
// 配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'improvement-plan',
  pageName: '定制改善计划',
  type: 9,
} as const

/** 开发环境自动触发延迟 (ms) */
const DELAY_START = 200
/** 收到 page-global-animate 后延迟触发动画 (ms) */
const DELAY_ANIMATE_START = 200

/** 图标路径映射 */
const ICON_MAP: Record<PlanItemType, string> = {
  exercise: '/images/daily_report/4.webp',
  sleep: '/images/daily_report/2.webp',
  nutrition: '/images/daily_report/3.webp',
  other: '/images/daily_report/1.webp',
}

/** 默认数据 */
const DEFAULT_DATA: ImprovementPlanData = {
  title: 'Customized improvement plan',
  items: [
    {
      id: 'exercise-1',
      type: 'exercise',
      title: 'Neck and shoulder exercises',
      description: 'Supplement with appropriate...',
      isAdded: false,
    },
    {
      id: 'sleep-1',
      type: 'sleep',
      title: 'Mindfulness Breathing Practice',
      description: 'Supplement with appropriate amo...',
      isAdded: false,
    },
  ],
}

// ============================================
// 工具函数
// ============================================

/**
 * 解析原生数据
 */
function parseImprovementPlanData(raw: unknown): ImprovementPlanData | null {
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('[ImprovementPlanWidget] JSON 解析失败:', raw)
      return null
    }
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('[ImprovementPlanWidget] 数据格式错误，期望 JSON 对象:', data)
    return null
  }

  const obj = data as Record<string, unknown>

  if (!Array.isArray(obj.items)) {
    console.warn('[ImprovementPlanWidget] 缺少必需字段 items:', data)
    return null
  }

  return {
    title: (obj.title as string) || DEFAULT_DATA.title,
    items: obj.items.map((item: Record<string, unknown>) => ({
      id: String(item.id ?? ''),
      type: (item.type as PlanItemType) || 'other',
      title: String(item.title ?? ''),
      description: String(item.description ?? ''),
      isAdded: Boolean(item.isAdded),
    })),
  }
}

// ============================================
// 子组件
// ============================================

/** 按钮状态类型：idle -> loading -> cancel (2s倒计时) -> done */
type ButtonState = 'idle' | 'loading' | 'cancel' | 'done'

interface PlanItemCardProps {
  item: ImprovementPlanItem
  onAdd: (item: ImprovementPlanItem) => void
  t: (key: string) => string
}

/** 动画阶段类型 */
type AnimationPhase = 'idle' | 'exit' | 'enter'

/** 各状态对应的按钮宽度(px) */
const BUTTON_WIDTHS: Record<ButtonState, number> = {
  idle: 60,     // Add
  loading: 60,  // spinner
  cancel: 76,   // Cancel + 导火索边框
  done: 68,     // Added
}

/** 导火索边框组件 - 边框从满圈顺时针逐渐缩短消失 */
function FuseBorder({ 
  duration = 1200, 
  width = 76, 
  height = 32 
}: { 
  duration?: number
  width?: number
  height?: number 
}) {
  const [offset, setOffset] = useState(0)
  
  // 计算圆角矩形周长 (pill shape: 两个半圆 + 两条直线)
  const radius = height / 2
  const straightPart = (width - height) * 2  // 上下两条直线
  const curvedPart = Math.PI * height         // 左右两个半圆 = 一个完整圆
  const perimeter = straightPart + curvedPart
  
  // SVG 需要留出 stroke 宽度的空间
  const strokeWidth = 2
  const svgWidth = width + strokeWidth * 2
  const svgHeight = height + strokeWidth * 2
  
  // 组件挂载后开始动画（顺时针消失用负值）
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setOffset(-perimeter)
    })
    return () => cancelAnimationFrame(raf)
  }, [perimeter])
  
  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        width: svgWidth,
        height: svgHeight,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'drop-shadow(0 0 2px #f97316)',
      }}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      <rect
        x={strokeWidth}
        y={strokeWidth}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill="none"
        stroke="#f97316"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={perimeter}
        strokeDashoffset={offset}
        style={{
          transition: `stroke-dashoffset ${duration}ms linear`,
        }}
      />
    </svg>
  )
}

function PlanItemCard({ item, onAdd, t }: PlanItemCardProps) {
  const iconSrc = ICON_MAP[item.type] || ICON_MAP.other
  const [buttonState, setButtonState] = useState<ButtonState>('idle')
  /** 动画阶段：exit=缩小退出，enter=放大进入 */
  const [animPhase, setAnimPhase] = useState<AnimationPhase>('idle')
  /** 实际显示的内容状态（延迟更新，等待退出动画完成） */
  const [displayState, setDisplayState] = useState<ButtonState>('idle')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // 根据 buttonState 计算目标宽度（避免在 effect 中同步 setState）
  const targetWidth = BUTTON_WIDTHS[buttonState]

  // 触发小型 confetti 动画
  const triggerConfetti = useCallback(() => {
    if (!buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight

    requestAnimationFrame(() => {
      confetti({
        particleCount: 12,
        spread: 40,
        origin: { x, y },
        startVelocity: 12,
        gravity: 0.6,
        scalar: 0.5,
        ticks: 60,
        colors: ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3', '#54a0ff'],
        disableForReducedMotion: false,
        zIndex: 9999,
      })
    })
  }, [])

  // 状态变化时触发动画序列
  useEffect(() => {
    if (buttonState === displayState) return
    
    let cancelled = false
    
    // 开始退出动画（异步调度以避免 effect 内同步 setState）
    const startTimer = setTimeout(() => {
      if (cancelled) return
      setAnimPhase('exit')
    }, 0)
    
    // 退出动画完成后切换内容并开始进入动画
    const exitTimer = setTimeout(() => {
      if (cancelled) return
      setDisplayState(buttonState)
      setAnimPhase('enter')
      
      // 进入动画完成后恢复 idle
      const enterTimer = setTimeout(() => {
        if (cancelled) return
        setAnimPhase('idle')
      }, 150)
      
      cleanupTimers.push(enterTimer)
    }, 150)
    
    const cleanupTimers: ReturnType<typeof setTimeout>[] = []
    
    return () => {
      cancelled = true
      clearTimeout(startTimer)
      clearTimeout(exitTimer)
      cleanupTimers.forEach(clearTimeout)
    }
  }, [buttonState, displayState])

  // Cancel 状态 1.2 秒后自动完成
  useEffect(() => {
    if (buttonState === 'cancel') {
      cancelTimerRef.current = setTimeout(() => {
        setButtonState('done')
        triggerConfetti()
        onAdd(item)
      }, 1200)
    }
    
    return () => {
      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current)
        cancelTimerRef.current = null
      }
    }
  }, [buttonState, item, onAdd, triggerConfetti])

  // 处理按钮点击
  const handleClick = useCallback(() => {
    // Cancel 状态点击：取消操作回到 idle
    if (buttonState === 'cancel') {
      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current)
        cancelTimerRef.current = null
      }
      setButtonState('idle')
      return
    }
    
    // idle 状态点击：开始 loading
    if (buttonState !== 'idle') return
    
    setButtonState('loading')
    
    // 1秒后进入 cancel 倒计时状态
    setTimeout(() => {
      setButtonState('cancel')
    }, 1000)
  }, [buttonState])

  // 如果 item 已经是 isAdded 状态，直接显示 Added
  const isAdded = item.isAdded || buttonState === 'done'

  // 根据动画阶段获取动画类名
  const getAnimClass = () => {
    if (animPhase === 'exit') return 'animate-scale-out'
    if (animPhase === 'enter') return 'animate-scale-in'
    return ''
  }

  // 获取按钮样式（cursor 等）
  const getButtonCursor = () => {
    if (isAdded) return 'cursor-default'
    if (buttonState === 'loading') return 'cursor-wait'
    if (buttonState === 'cancel') return 'cursor-pointer'
    return 'hover:bg-slate-200 cursor-pointer'
  }

  // 渲染按钮内容
  const renderButtonContent = () => {
    const showAdded = item.isAdded || displayState === 'done'
    
    if (displayState === 'loading') {
      return (
        <svg
          className="w-3.5 h-3.5 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )
    }
    
    if (displayState === 'cancel') {
      return t('widgets.type9.cancel')
    }
    
    return showAdded ? t('widgets.type9.added') : t('widgets.type9.add')
  }

  return (
    <div className="flex items-center gap-3 px-2 py-4">
      {/* 图标 - 使用 AnimatedImage 优化加载体验 */}
      <div className="w-9 h-9 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center">
        <AnimatedImage
          src={iconSrc}
          alt={item.type}
          className="w-full h-full object-contain"
          placeholderClassName="bg-orange-50"
          duration={0.35}
        />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-slate-800 truncate">
          {item.title}
        </h4>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {item.description}
        </p>
      </div>

      {/* 按钮容器：固定位置，内部按钮居中变宽 */}
      <div className="flex-shrink-0 flex items-center justify-center" style={{ width: BUTTON_WIDTHS.cancel }}>
        <button
          ref={buttonRef}
          onClick={handleClick}
          disabled={isAdded || buttonState === 'loading'}
          style={{ width: targetWidth }}
          className={`
            relative text-xs rounded-full h-8 flex items-center justify-center
            transition-all duration-300 ease-out
            ${displayState === 'cancel' 
              ? 'bg-orange-50 text-orange-600' 
              : 'bg-slate-100 text-slate-600'
            }
            ${getButtonCursor()}
          `}
        >
          {/* Cancel 状态的导火索边框 */}
          {displayState === 'cancel' && (
            <FuseBorder 
              duration={1200} 
              width={BUTTON_WIDTHS.cancel} 
              height={32} 
            />
          )}
          
          {/* 动画容器 */}
          <span className={`relative z-10 inline-flex items-center justify-center ${getAnimClass()}`}>
            {renderButtonContent()}
          </span>
        </button>
      </div>
    </div>
  )
}

// ============================================
// 主组件
// ============================================

/**
 * 定制改善计划 Widget 页面 (Type 9)
 *
 * 路由: /widget/type-9
 *
 * 通信方式：
 * - Android -> JS: NativeBridge.receiveData(jsonString)
 * - JS -> Android: window.android.onJsMessage(jsonString)
 *
 * 事件：
 * - click-widget-plan-add: 点击添加按钮（携带 itemId/itemType/itemTitle）
 * - click-widget-plan-select: 点击「已选择」按钮（不传 data）
 */
export function Type9_ImprovementPlanWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<ImprovementPlanData>(DEFAULT_DATA)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  /** 是否已点击过「完成选择」按钮，点击后显示「已选择」 */
  const [hasSubmittedSelection, setHasSubmittedSelection] = useState(false)

  // 初始化原生桥接
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

  // 注册数据接收回调
  useEffect(() => {
    onData((rawData) => {
      console.log('[ImprovementPlanWidget] 收到原生数据')
      const parsed = parseImprovementPlanData(rawData)
      if (parsed) {
        setData(parsed)
        const addedIds = new Set(
          parsed.items.filter(item => item.isAdded).map(item => item.id)
        )
        setSelectedItems(addedIds)
        setHasSubmittedSelection(false)
        console.log('[ImprovementPlanWidget] 渲染完成')
      } else {
        console.warn('[ImprovementPlanWidget] 数据解析失败，使用默认数据')
      }
    })
  }, [onData])

  // 处理添加点击（变更选中后重置「已选择」状态，允许再次完成选择）
  const handleAdd = useCallback((item: ImprovementPlanItem) => {
    send('click-widget-plan-add', {
      itemId: item.id,
      itemType: item.type,
      itemTitle: item.title,
    })
    setSelectedItems(prev => new Set([...prev, item.id]))
    setHasSubmittedSelection(false)
  }, [send])

  // 点击「完成选择」：发送点击事件（不传 data），并进入「已选择」状态
  const handleCompleteSelectionClick = useCallback(() => {
    send('click-widget-plan-select')
    setHasSubmittedSelection(true)
  }, [send])

  // 合并原始 isAdded 状态和本地选中状态
  const displayItems = data.items.map(item => ({
    ...item,
    isAdded: item.isAdded || selectedItems.has(item.id),
  }))

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <EmbeddedContainer maxWidth="md" fullHeight={false}>
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="spring">
          {/* 改善计划卡片 */}
          <div className="bg-white rounded-3xl p-5">
          {/* 标题 */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-orange-500">
              {t('widgets.type9.title')}
            </h3>
          </div>

          {/* 项目列表 */}
          <div className="divide-y divide-slate-100">
            {displayItems.map((item) => (
              <PlanItemCard
                key={item.id}
                item={item}
                onAdd={handleAdd}
                t={t}
              />
            ))}
          </div>

          {/* 底部按钮：未点击时橘色「完成选择」可点击，点击后灰色「已选择」 */}
          <button
            onClick={hasSubmittedSelection ? undefined : handleCompleteSelectionClick}
            className={`w-full mt-4 py-3 rounded-full text-sm font-medium transition-colors ${
              hasSubmittedSelection
                ? 'bg-slate-200 text-slate-500 cursor-default'
                : 'bg-orange-100 text-orange-600 hover:bg-orange-200 cursor-pointer'
            }`}
          >
            {hasSubmittedSelection ? t('widgets.type9.selected') : t('widgets.type9.completeSelection')}
          </button>
          </div>
        </WidgetEntranceContainer>

        {/* 调试信息（仅开发环境） */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'}
          </div>
        )}
      </EmbeddedContainer>
    </WidgetLayout>
  )
}
