import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react-lite'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer } from '@/components/common/WidgetEntranceContainer'
import { EmbeddedContainer } from '@/components/common/EmbeddedContainer'
import { globalStore } from '@/stores/globalStore'
import { Moon } from 'lucide-react'
import { VITAL_COLORS, UI_COLORS, widgetBGColor } from '@/config/theme'

// ============================================
// 高光动效控制 Hook
// ============================================

interface UseMetalShineOptions {
  /** 动画时长（毫秒），默认 1200ms */
  quickAnimationDuration?: number
}

/**
 * 金属高光动效控制 Hook
 * 
 * 功能：
 * - 首次加载时自动播放一次高光动效
 * - 之后不再自动播放，但点击可手动触发
 */
function useMetalShine(options: UseMetalShineOptions = {}) {
  const {
    quickAnimationDuration = 1200,
  } = options

  const lightGroupRef = useRef<HTMLDivElement>(null)
  const hasAutoPlayedRef = useRef(false)
  const isAnimatingRef = useRef(false)
  const hasPendingRef = useRef(false)
  const animationEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 清除动画结束定时器
  const clearAnimationEndTimer = useCallback(() => {
    if (animationEndTimerRef.current) {
      clearTimeout(animationEndTimerRef.current)
      animationEndTimerRef.current = null
    }
  }, [])

  // 隐藏光泽（动画结束后）
  const hideShine = useCallback(() => {
    const lightGroup = lightGroupRef.current
    if (!lightGroup) return
    
    // 隐藏整个光泽组
    lightGroup.style.opacity = '0'
    lightGroup.style.visibility = 'hidden'
    
    const animatedElements = lightGroup.querySelectorAll('.light-bloom, .light-beam-main, .light-beam-hotspot')
    animatedElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = 'none'
    })
  }, [])

  // 显示光泽（触发动画前）
  const showShine = useCallback(() => {
    const lightGroup = lightGroupRef.current
    if (!lightGroup) return
    
    lightGroup.style.opacity = '1'
    lightGroup.style.visibility = 'visible'
  }, [])

  // 执行高光动画
  const playShine = useCallback(() => {
    const lightGroup = lightGroupRef.current
    if (!lightGroup) return

    isAnimatingRef.current = true

    // 先显示光泽
    showShine()

    // 获取所有需要动画的元素
    const animatedElements = lightGroup.querySelectorAll('.light-bloom, .light-beam-main, .light-beam-hotspot')
    
    // 重置并启动动画
    animatedElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = 'none'
      void htmlEl.offsetHeight // 强制重绘
      htmlEl.style.animation = `quickLightMove ${quickAnimationDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards`
    })
    
    // 清除之前的定时器
    clearAnimationEndTimer()
    
    // 动画结束后处理
    animationEndTimerRef.current = setTimeout(() => {
      isAnimatingRef.current = false
      
      if (hasPendingRef.current) {
        // 有待触发的动画，立即播放
        hasPendingRef.current = false
        playShine()
      } else {
        // 隐藏光泽
        hideShine()
      }
    }, quickAnimationDuration)
  }, [quickAnimationDuration, clearAnimationEndTimer, showShine, hideShine])

  // 手动触发高光动效（对外接口）
  const triggerShine = useCallback(() => {
    if (isAnimatingRef.current) {
      // 动画进行中，标记待触发
      hasPendingRef.current = true
      return false
    }
    
    playShine()
    return true
  }, [playShine])

  // 首次自动播放（只自动播放一次）
  useEffect(() => {
    if (!hasAutoPlayedRef.current && lightGroupRef.current) {
      hasAutoPlayedRef.current = true
      // 延迟一点启动首次动画，让组件先渲染
      const timer = setTimeout(() => {
        playShine()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [playShine])

  // 清理
  useEffect(() => {
    return () => {
      clearAnimationEndTimer()
    }
  }, [clearAnimationEndTimer])

  return {
    lightGroupRef,
    triggerShine,
  }
}

// ============================================
// 类型定义
// ============================================

/**
 * 睡眠标签类型
 */
interface SleepTag {
  text: string
  type: 'warning' | 'good' | 'neutral'
}

/**
 * 睡眠评分卡片数据类型
 * 
 * JSON 数据格式规范（必须是 JSON 对象，不支持数组）：
 * {
 *   "score": 88,                    // 睡眠评分 (0-100)
 *   "totalSleepMinutes": 375,       // 总睡眠时长（分钟）
 *   "deepSleepMinutes": 248,        // 深睡时长（分钟）
 *   "tags": [                       // 标签数组（内部字段可以是数组）
 *     { "text": "深睡不足", "type": "warning" },
 *     { "text": "入睡困难", "type": "warning" },
 *     { "text": "呼吸良好", "type": "good" }
 *   ]
 * }
 */
interface SleepScoreData {
  score: number
  totalSleepMinutes: number
  deepSleepMinutes: number
  tags: SleepTag[]
}

// ============================================
// 配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'sleep-score',
  pageName: '睡眠评分卡片',
  type: 1, // 睡眠评分卡片类型标识
} as const

/** 开发环境自动触发延迟 (ms) */
const DELAY_START = 200
/** 收到 page-global-animate 后延迟触发动画 (ms) */
const DELAY_ANIMATE_START = 300

const DEFAULT_DATA: SleepScoreData = {
  score: 88,
  totalSleepMinutes: 375,
  deepSleepMinutes: 248,
  tags: [
    { text: 'Insufficient deep sleep', type: 'warning' },
    { text: 'Difficulty falling asleep', type: 'warning' },
    { text: 'Good breathing', type: 'good' },
  ],
}

// ============================================
// 工具函数
// ============================================

/**
 * 数值边界限制
 */
function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 分钟转小时和分钟
 * 限制最大值避免显示溢出（最多99小时59分钟）
 */
function formatDuration(totalMinutes: number): { hours: number; minutes: number } {
  // 限制分钟数在合理范围内 (0 到 5999 分钟 = 99小时59分钟)
  const clampedMinutes = clampValue(Math.round(totalMinutes), 0, 5999)
  const hours = Math.floor(clampedMinutes / 60)
  const minutes = clampedMinutes % 60
  return { hours, minutes }
}

/**
 * 限制 tags 数量，防止溢出
 */
function limitTags(tags: SleepTag[], maxCount: number = 3): SleepTag[] {
  return tags.slice(0, maxCount)
}

/**
 * 解析原生数据
 * 
 * 期望的数据格式：JSON 对象（不支持数组）
 */
function parseSleepData(raw: unknown): SleepScoreData | null {
  // 如果是字符串，先尝试 JSON 解析
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('[SleepScoreWidget] JSON 解析失败:', raw)
      return null
    }
  }

  // 验证数据格式：必须是 JSON 对象，不支持数组
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('[SleepScoreWidget] 数据格式错误，期望 JSON 对象:', data)
    return null
  }
  
  const obj = data as Record<string, unknown>
  
  if (typeof obj.score !== 'number') {
    console.warn('[SleepScoreWidget] 缺少必需字段 score:', data)
    return null
  }
  
  return {
    score: obj.score as number,
    totalSleepMinutes: (obj.totalSleepMinutes as number) || 0,
    deepSleepMinutes: (obj.deepSleepMinutes as number) || 0,
    tags: Array.isArray(obj.tags) ? obj.tags : [],
  }
}

// ============================================
// 标签组件
// ============================================

interface TagProps {
  tag: SleepTag
}

function Tag({ tag }: TagProps) {
  // 不做 JS 截断，让 CSS truncate 自然处理溢出
  // 移除 backdrop-blur-sm 以兼容旧浏览器，使用更高不透明度的背景替代
  return (
    <span
      className="px-3 py-1.5 rounded-full text-xs font-medium border text-white max-w-[180px] truncate"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
      }}
    >
      {tag.text}
    </span>
  )
}

// ============================================
// 统计项组件
// ============================================

interface StatItemProps {
  hours: number
  minutes: number
  label: string
  align?: 'left' | 'right'
}

function StatItem({ hours, minutes, label, align = 'left', t }: StatItemProps & { t: (key: string) => string }) {
  return (
    <div className={`flex flex-col gap-1 ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold" style={{ color: VITAL_COLORS.bp }}>{hours}</span>
        <span className="text-sm text-gray-700">{t('widgets.type1.hours')}</span>
        <span className="text-2xl font-semibold ml-1" style={{ color: VITAL_COLORS.bp }}>{minutes}</span>
        <span className="text-sm text-gray-700">{t('widgets.type1.minutes')}</span>
      </div>
      <span className="text-xs" style={{ color: UI_COLORS.text.secondary }}>{label}</span>
    </div>
  )
}

// ============================================
// 主组件
// ============================================

/**
 * 睡眠评分 Widget 页面 (Type 1)
 * 
 * 路由: /widget/type-1
 * 
 * 通信方式：
 * - Android -> JS: NativeBridge.receiveData(jsonString)
 * - JS -> Android: window.android.onJsMessage(jsonString)
 */
export const Type1_SleepScoreWidgetPage = observer(function Type1_SleepScoreWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<SleepScoreData>(DEFAULT_DATA)
  const isMetalEnabled = globalStore.isTestEnv

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

  // 金属高光动效控制（首次自动播放一次，之后点击触发）
  const { lightGroupRef, triggerShine } = useMetalShine({
    quickAnimationDuration: 1200,  // 动画 1.2 秒
  })

  // 注册数据接收回调
  useEffect(() => {
    onData((rawData) => {
      console.log('[SleepScoreWidget] 收到原生数据')
      const parsed = parseSleepData(rawData)
      if (parsed) {
        setData(parsed)
        console.log('[SleepScoreWidget] 渲染完成')
      } else {
        console.warn('[SleepScoreWidget] 数据解析失败，使用默认数据')
      }
    })
  }, [onData])

  // 处理卡片点击
  const handleCardClick = useCallback(() => {
    // 触发高光动效（如果启用了金属效果）
    if (isMetalEnabled) {
      triggerShine()
    }
    send('cardClick', { pageId: PAGE_CONFIG.pageId, data })
  }, [send, data, isMetalEnabled, triggerShine])

  // 格式化时长
  const totalDuration = formatDuration(data.totalSleepMinutes)
  const deepDuration = formatDuration(data.deepSleepMinutes)

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <EmbeddedContainer maxWidth="md" fullHeight={false}>
        {/* 睡眠评分卡片 - 带入场动画 */}
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="spring">
          <div
            className="relative overflow-hidden rounded-3xl bg-white cursor-pointer select-none transition-transform duration-200 active:scale-[0.98] active:opacity-90"
            onClick={handleCardClick}
          >
          {/* 顶部紫色区域 - 根据 isTestEnv 决定是否启用金属流光效果 */}
          <div
            className={`relative rounded-t-3xl p-6 pb-4 ${isMetalEnabled ? 'metal-surface' : ''}`}
            style={{
              background: VITAL_COLORS.sleep,
            }}
          >
            {/* ========== 材质层（静态金属质感）- 仅 isTestEnv 时启用 ========== */}
            {isMetalEnabled && (
              <>
                {/* 1. 噪点纹理层 - 打破塑料感，模拟金属微观凹凸 */}
                <div className="layer-grain-texture rounded-t-3xl" />
                {/* 2. 拉丝金属层 - 各向异性反射，模拟拉丝工艺 */}
                <div className="layer-brushed-metal rounded-t-3xl" />
                {/* 3. 静态高光层 - 即使没有流光也有环境反射 */}
                <div className="layer-static-sheen rounded-t-3xl" />
              </>
            )}
            
            {/* ========== 内容层 ========== */}
            {/* 顶部区域：标题、分数和标签 - z-index 确保不被光遮挡 */}
            <div className={`relative z-10 flex justify-between items-start mb-2 ${isMetalEnabled ? 'content-layer' : ''}`}>
              {/* 左侧：标题和分数 */}
              <div className="flex flex-col min-w-0">
                {/* 标题行 */}
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="w-5 h-5 text-white/90 flex-shrink-0" />
                  <span className={`text-lg font-medium text-white/95 ${isMetalEnabled ? 'metal-embossed-text' : ''}`}>{t('widgets.type1.title')}</span>
                </div>
                {/* 分数 - 限制在 0-100 范围内 */}
                <div className="flex items-baseline gap-1">
                  <span className={`text-6xl sm:text-7xl font-bold text-white leading-none tracking-tight ${isMetalEnabled ? 'metal-embossed-text' : ''}`}>
                    {clampValue(Math.round(data.score), 0, 100)}
                  </span>
                  <span className={`text-xl sm:text-2xl font-normal text-white/80 ${isMetalEnabled ? 'metal-embossed-text' : ''}`}>/100</span>
                </div>
              </div>

              {/* 右侧：标签 - 最多显示3个 */}
              <div className="flex flex-col gap-2 items-end mt-1 flex-shrink-0 max-w-[200px]">
                {limitTags(data.tags, 3).map((tag, index) => (
                  <Tag key={index} tag={tag} />
                ))}
              </div>
            </div>
            
            {/* ========== 物理流光层 - 仅 isTestEnv 时启用 ========== */}
            {isMetalEnabled && (
              <div ref={lightGroupRef} className="physics-light-group rounded-t-3xl">
                {/* Bloom 辉光 - 最底层，大范围柔和 */}
                <div className="light-bloom" />
                {/* 主光束 - 三段式能量分布 */}
                <div className="light-beam-main" />
                {/* 光核热点 - 中心最亮最锐利 */}
                <div className="light-beam-hotspot" />
              </div>
            )}
            
            {/* 环境光 - 仅 isTestEnv 时启用 */}
            {isMetalEnabled && <div className="ambient-top-light rounded-t-3xl" />}
          </div>

          {/* 底部统计区域（白色背景） */}
          <div className="relative flex items-start justify-start gap-10 p-6 pt-4 bg-white rounded-b-3xl">
            <div className="absolute top-0 left-6 right-6 h-px bg-white/15" />
            <StatItem
              hours={totalDuration.hours}
              minutes={totalDuration.minutes}
              label={t('widgets.type1.totalSleepDuration')}
              align="left"
              t={t}
            />
            <div className="flex-1 ml-8">
              <StatItem
                hours={deepDuration.hours}
                minutes={deepDuration.minutes}
                label={t('widgets.type1.deepSleepDuration')}
                align="left"
                t={t}
              />
            </div>
          </div>
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
})
