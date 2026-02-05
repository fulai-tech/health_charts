import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react-lite'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer } from '@/components/common/WidgetEntranceContainer'
import { globalStore } from '@/stores/globalStore'
import { Moon } from 'lucide-react'
import { VITAL_COLORS, UI_COLORS, widgetBGColor } from '@/config/theme'

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
  return (
    <span
      className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/15 backdrop-blur-sm border border-white/20 text-white max-w-[180px] truncate"
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
    devAutoTriggerDelay: 300,
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
    send('cardClick', { pageId: PAGE_CONFIG.pageId, data })
  }, [send, data])

  // 格式化时长
  const totalDuration = formatDuration(data.totalSleepMinutes)
  const deepDuration = formatDuration(data.deepSleepMinutes)

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <div className="w-full max-w-md p-4">
        {/* 睡眠评分卡片 - 带入场动画 */}
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="spring">
          <div
            className="relative overflow-hidden rounded-3xl bg-white cursor-pointer select-none transition-transform duration-200 active:scale-[0.98] active:opacity-90 shadow-sm"
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
              <div className="physics-light-group rounded-t-3xl">
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
      </div>
    </WidgetLayout>
  )
})
