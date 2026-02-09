import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer } from '@/components/common/WidgetEntranceContainer'
import { EmbeddedContainer } from '@/components/common/EmbeddedContainer'
import { Zap, Play, Clock } from 'lucide-react'

/** SVG fill style for solid/filled icons */
const ICON_FILL = { fill: 'currentColor' } as const
import { widgetBGColor } from '@/config/theme'

// ============================================
// 类型定义
// ============================================

/**
 * HRE 推荐内容类型
 */
type HREContentMediaType = 'video' | 'audio' | 'image_text'
type HREContentType = 'exercise' | 'food' | 'music' | 'sleep' | 'other'

/**
 * HRE 推荐项
 *
 * JSON 数据格式规范（最外层必须是 JSON 对象，不支持数组）：
 * {
 *   "hre_recommendations": [{
 *     "content_id": "697c7ee5492c5a6580b1fe85",
 *     "type": "video",
 *     "content_type": "exercise",
 *     "image_url": "https://cdn.example.com/image.jpg",
 *     "url": "https://cdn.example.com/video.mp4",  // video/audio 有; image_text 无此字段
 *     "minutes": 15,
 *     "title": "Gentle 5-Minute Move",
 *     "explanation_text": "Short description...",
 *     "detailed_text": "Long detailed description...",
 *     "has_match": true,
 *     "rank": 1,
 *     "total_count": 1
 *   }]
 * }
 *
 * 展示逻辑：
 * - has_match=true + video/audio: 图片 + 时长 + 标题 + Start + 详情
 * - has_match=true + image_text: 图片 + 标题 + Start + 详情（无时长）
 * - has_match=false: 仅文字（标题 + 简介 + 详情）
 * - 一期只取 rank=1（首个推荐）
 */
export interface HRERecommendationItem {
  content_id?: string
  type?: HREContentMediaType
  content_type?: HREContentType
  image_url?: string
  url?: string
  minutes?: number
  title: string
  explanation_text: string
  detailed_text: string
  has_match: boolean
  rank: number
  total_count: number
}

export interface HRERecommendationData {
  hre_recommendations: HRERecommendationItem[]
}

// ============================================
// 配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'hre-recommendation',
  pageName: 'HRE 推荐卡片',
  type: 12,
} as const

/** 开发环境自动触发延迟 (ms) */
const DELAY_START = 200
/** 收到 page-global-animate 后延迟触发动画 (ms) */
const DELAY_ANIMATE_START = 300

const DEFAULT_DATA: HRERecommendationData = {
  hre_recommendations: [{
    content_id: '697c7ee5492c5a6580b1fe85',
    type: 'video',
    content_type: 'exercise',
    image_url: 'https://cdn.fulai.tech/comm/image/1769750270125_456l864te',
    url: 'https://cdn.fulai.tech/comm/video/1769749075286_73302i411',
    minutes: 15,
    title: 'Gentle 5-Minute Move',
    explanation_text: 'Knees bent, arm swing, leg kick, waist twist, ankle rotation, stretch & breathe.',
    detailed_text: 'As someone with gout and blood sugar concerns, this easy workout is great for you! It gets your blood flowing gently—bend knees, swing arms, twist waist, and stretch with slow breaths. No heavy lifting, just simple movements to wake your body, boost energy, and help with blood sugar control. Even 5 minutes a day can make a difference!',
    has_match: true,
    rank: 1,
    total_count: 1,
  }],
}

// ============================================
// 工具函数
// ============================================

/**
 * 判断是否应显示时长徽章
 * video / audio 显示时长，image_text / 纯文本不显示
 */
function shouldShowDuration(item: HRERecommendationItem): boolean {
  if (!item.has_match) return false
  return item.type === 'video' || item.type === 'audio'
}

/**
 * 判断是否应显示图片区域
 * has_match=true 且有 image_url 时显示
 */
function shouldShowImage(item: HRERecommendationItem): boolean {
  return item.has_match && !!item.image_url
}

/**
 * 判断是否应显示 Start 按钮
 * has_match=true 时显示
 */
function shouldShowStartButton(item: HRERecommendationItem): boolean {
  return item.has_match
}

/**
 * 从推荐列表中获取 rank=1 的首个推荐
 * 一期只展示排名第一的推荐内容
 */
function getTopRecommendation(data: HRERecommendationData): HRERecommendationItem | null {
  if (!data.hre_recommendations || data.hre_recommendations.length === 0) {
    return null
  }
  // 按 rank 排序，取第一个
  const sorted = [...data.hre_recommendations].sort((a, b) => a.rank - b.rank)
  return sorted[0]
}

/**
 * 解析原生数据
 *
 * 期望的数据格式：JSON 对象（不支持数组）
 * { "hre_recommendations": [...] }
 */
export function parseHREData(raw: unknown): HRERecommendationData | null {
  // 如果是字符串，先尝试 JSON 解析
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('[HRERecommendationWidget] JSON 解析失败:', raw)
      return null
    }
  }

  // 验证数据格式：必须是 JSON 对象，不支持数组
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('[HRERecommendationWidget] 数据格式错误，期望 JSON 对象:', data)
    return null
  }

  const obj = data as Record<string, unknown>

  // 验证 hre_recommendations 字段
  if (!Array.isArray(obj.hre_recommendations)) {
    console.warn('[HRERecommendationWidget] 缺少必需字段 hre_recommendations:', data)
    return null
  }

  const recommendations = obj.hre_recommendations as Record<string, unknown>[]

  // 验证每个推荐项的必需字段
  const validItems: HRERecommendationItem[] = recommendations
    .filter((item) => {
      if (!item || typeof item !== 'object') return false
      // title 和 has_match 是必须的
      if (typeof item.title !== 'string') return false
      if (typeof item.has_match !== 'boolean') return false
      return true
    })
    .map((item) => ({
      content_id: typeof item.content_id === 'string' ? item.content_id : undefined,
      type: (['video', 'audio', 'image_text'] as const).includes(item.type as HREContentMediaType)
        ? (item.type as HREContentMediaType)
        : undefined,
      content_type: (['exercise', 'food', 'music', 'sleep', 'other'] as const).includes(item.content_type as HREContentType)
        ? (item.content_type as HREContentType)
        : undefined,
      image_url: typeof item.image_url === 'string' ? item.image_url : undefined,
      url: typeof item.url === 'string' ? item.url : undefined,
      minutes: typeof item.minutes === 'number' ? item.minutes : undefined,
      title: item.title as string,
      explanation_text: typeof item.explanation_text === 'string' ? (item.explanation_text as string) : '',
      detailed_text: typeof item.detailed_text === 'string' ? (item.detailed_text as string) : '',
      has_match: item.has_match as boolean,
      rank: typeof item.rank === 'number' ? (item.rank as number) : 999,
      total_count: typeof item.total_count === 'number' ? (item.total_count as number) : 0,
    }))

  if (validItems.length === 0) {
    console.warn('[HRERecommendationWidget] 无有效推荐项')
    return null
  }

  return { hre_recommendations: validItems }
}

// ============================================
// 主组件
// ============================================

/**
 * HRE 推荐 Widget 页面 (Type 12)
 *
 * 路由: /widget/type-12
 *
 * 通信方式：
 * - Android -> JS: NativeBridge.receiveData(jsonString)
 * - JS -> Android: window.android.onJsMessage(jsonString)
 */
export function Type12_HRERecommendationWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<HRERecommendationData>(DEFAULT_DATA)
  const [imageLoaded, setImageLoaded] = useState(false)

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
      console.log('[HRERecommendationWidget] 收到原生数据')
      const parsed = parseHREData(rawData)
      if (parsed) {
        setData(parsed)
        setImageLoaded(false) // 重置图片加载状态
        console.log('[HRERecommendationWidget] 渲染完成')
      } else {
        console.warn('[HRERecommendationWidget] 数据解析失败，使用默认数据')
      }
    })
  }, [onData])

  // 获取排名第一的推荐
  const topItem = getTopRecommendation(data)

  // 处理 Start 按钮点击
  const handleStartClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!topItem) return
    send('click-start', {
      pageId: PAGE_CONFIG.pageId,
      contentId: topItem.content_id,
      type: topItem.type,
      contentType: topItem.content_type,
      url: topItem.url,
      imageUrl: topItem.image_url,
    })
  }, [send, topItem])

  // 处理卡片点击
  const handleCardClick = useCallback(() => {
    if (!topItem) return
    send('cardClick', {
      pageId: PAGE_CONFIG.pageId,
      item: topItem,
    })
  }, [send, topItem])

  // 无推荐内容时的空状态
  if (!topItem) {
    return (
      <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
        <EmbeddedContainer maxWidth="md" fullHeight={false}>
          <div className="p-6 text-center text-sm" style={{ color: '#999999' }}>
            {t('widgets.type12.noRecommendation')}
          </div>
        </EmbeddedContainer>
      </WidgetLayout>
    )
  }

  const showDuration = shouldShowDuration(topItem)
  const showImage = shouldShowImage(topItem)
  const showStartButton = shouldShowStartButton(topItem)

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <EmbeddedContainer maxWidth="md" fullHeight={false}>
        {/* HRE 推荐卡片 - 带入场动画 */}
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="spring">
          <div
            className="relative overflow-hidden rounded-[32px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] cursor-pointer select-none transition-transform duration-200 active:scale-[0.98] active:opacity-90"
            style={{ padding: '24px' }}
            onClick={handleCardClick}
          >
            {/* 顶部紧急提示徽章 */}
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4" style={{ color: '#FF7F27', ...ICON_FILL }} />
              <span className="text-sm font-medium" style={{ color: '#FF7F27' }}>
                {t('widgets.type12.urgencyBadge')}
              </span>
            </div>

            {/* 主标题行 + Start 按钮 */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold truncate mr-3" style={{ color: '#1A1A1A' }}>
                {topItem.title}
              </h2>

              {/* Start 按钮 - 仅有匹配内容时显示 */}
              {showStartButton && (
                <button
                  onClick={handleStartClick}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                  style={{
                    backgroundColor: '#FF7F27',
                    boxShadow: '0 2px 8px rgba(255, 127, 39, 0.3)',
                  }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t('widgets.type12.startButton')}</span>
                </button>
              )}
            </div>

            {/* 图片区域 - 有匹配且有图片时显示 */}
            {showImage && (
              <div
                className="relative mb-4 overflow-hidden rounded-[20px]"
                style={{ backgroundColor: '#F5F5F5' }}
              >
                {/* 主图 + 骨架屏叠加 */}
                <div className="relative w-full aspect-video">
                  {/* 骨架屏 - 绝对定位在图片下方，图片加载后隐藏 */}
                  {!imageLoaded && (
                    <div
                      className="absolute inset-0 animate-pulse"
                      style={{ background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)' }}
                    />
                  )}
                  {/* 主图 - 始终渲染，透明度控制显隐，避免 display:none 阻止加载 */}
                  <img
                    src={topItem.image_url}
                    alt={topItem.title}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: imageLoaded ? 1 : 0 }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                  />
                </div>

                {/* 时长徽章 - video/audio 时显示 */}
                {showDuration && topItem.minutes != null && (
                  <div
                    className="absolute top-3 left-3 px-2 py-1 rounded-md text-white text-xs font-medium flex items-center gap-1"
                    style={{ backgroundColor: 'rgba(255, 140, 0, 0.95)' }}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{topItem.minutes} {t('widgets.type12.minutes')}</span>
                  </div>
                )}
              </div>
            )}

            {/* 纯文本模式（无匹配）：显示简介文字 */}
            {!topItem.has_match && topItem.explanation_text && (
              <div
                className="mb-3 p-4 rounded-[16px]"
                style={{
                  backgroundColor: '#FFF7ED',
                  lineHeight: '1.6',
                }}
              >
                <p className="text-sm" style={{ color: '#92400E', textAlign: 'justify' }}>
                  {topItem.explanation_text}
                </p>
              </div>
            )}

            {/* 详细说明区域 */}
            {topItem.detailed_text && (
              <div
                className="p-4 rounded-[16px]"
                style={{
                  backgroundColor: '#F0F0F0',
                  lineHeight: '1.6',
                }}
              >
                <p className="text-sm" style={{ color: '#666666', textAlign: 'justify' }}>
                  {topItem.detailed_text}
                </p>
              </div>
            )}
          </div>
        </WidgetEntranceContainer>

        {/* 调试信息（仅开发环境） */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'} |
            type: {topItem.type || 'text-only'} |
            match: {topItem.has_match ? '✅' : '❌'}
          </div>
        )}
      </EmbeddedContainer>
    </WidgetLayout>
  )
}
