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
import { widgetBGColor } from '@/config/theme'

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

/** 按钮状态类型 */
type ButtonState = 'idle' | 'loading' | 'done'

interface PlanItemCardProps {
  item: ImprovementPlanItem
  onAdd: (item: ImprovementPlanItem) => void
  t: (key: string) => string
}

function PlanItemCard({ item, onAdd, t }: PlanItemCardProps) {
  const iconSrc = ICON_MAP[item.type] || ICON_MAP.other
  const [buttonState, setButtonState] = useState<ButtonState>('idle')
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 触发小型 confetti 动画
  const triggerConfetti = useCallback(() => {
    if (!buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    // 计算按钮中心点相对于视口的位置（0-1 比例）
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight

    // 使用 requestAnimationFrame 确保在渲染帧中执行
    requestAnimationFrame(() => {
      // 小型彩色庆祝动画
      confetti({
        particleCount: 12,
        spread: 40,
        origin: { x, y },
        startVelocity: 12,
        gravity: 0.6,
        scalar: 0.5,
        ticks: 60,
        colors: ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3', '#54a0ff'], // 彩色
        disableForReducedMotion: false,
        zIndex: 9999,
      })
    })
  }, [])

  // 处理按钮点击
  const handleClick = useCallback(() => {
    if (buttonState !== 'idle') return
    
    setButtonState('loading')
    
    // 1.5秒后切换到完成态
    setTimeout(() => {
      setButtonState('done')
      triggerConfetti()
      onAdd(item)
    }, 1500)
  }, [buttonState, item, onAdd, triggerConfetti])

  // 如果 item 已经是 isAdded 状态，直接显示 Added
  const isAdded = item.isAdded || buttonState === 'done'

  return (
    <div className="flex items-center gap-3 py-3">
      {/* 图标 */}
      <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center">
        <img
          src={iconSrc}
          alt={item.type}
          className="w-full h-full object-contain"
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

      {/* 按钮：支持 idle/loading/done 三种状态，固定宽高适配中英文 */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={isAdded || buttonState === 'loading'}
        className={`
          text-xs rounded-full flex-shrink-0 flex items-center justify-center
          min-w-[60px] h-7 px-3
          bg-slate-100 text-slate-600
          transition-colors duration-200
          ${isAdded
            ? 'cursor-default'
            : buttonState === 'loading'
              ? 'cursor-wait'
              : 'hover:bg-slate-200 cursor-pointer'
          }
        `}
      >
        {buttonState === 'loading' ? (
          /* 加载转圈动画 */
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
        ) : isAdded ? (
          t('widgets.type9.added')
        ) : (
          t('widgets.type9.add')
        )}
      </button>
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
      <div className="w-full max-w-md p-4">
        {/* 改善计划卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
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

        {/* 调试信息（仅开发环境） */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'}
          </div>
        )}
      </div>
    </WidgetLayout>
  )
}
