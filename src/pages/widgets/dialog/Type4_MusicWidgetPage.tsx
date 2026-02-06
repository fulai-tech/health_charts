import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer } from '@/components/common/WidgetEntranceContainer'
import { EmbeddedContainer } from '@/components/common/EmbeddedContainer'
import { Music, Headphones, Sparkles } from 'lucide-react'
import { widgetBGColor } from '@/config/theme'

// ============================================
// 业务层类型定义
// ============================================

/**
 * 音乐卡片数据类型
 * 
 * JSON 数据格式规范（最外层必须是 JSON 对象，不支持数组）：
 * {
 *   "items": [
 *     {
 *       "order": 1,                    // 卡片顺序（1=第一个，2=第二个...）
 *       "songId": "song_001",          // 歌曲唯一标识
 *       "imageUrl": "https://...",     // 封面图片URL
 *       "imageBase64": "data:...",     // 或 Base64 图片
 *       "title": "轻音乐",              // 标题
 *       "text": "放松、舒缓..."         // 描述文字
 *     },
 *     {
 *       "order": 2,
 *       "songId": "song_002",
 *       ...
 *     }
 *   ]
 * }
 */
interface MusicCardItem {
  order: number           // 卡片顺序（1=第一个，2=第二个...）
  songId?: string         // 歌曲唯一标识
  imageUrl?: string
  imageBase64?: string
  title?: string
  text?: string
  description?: string
}

/**
 * 原生传入的数据结构
 * 必须是 JSON 对象格式：{ items: MusicCardItem[] }
 */
interface MusicNativeData {
  items: MusicCardItem[]
}

// ============================================
// 业务层配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'music',
  pageName: '音乐推荐',
  type: 4, // 音乐推荐卡片类型标识
} as const

/** 开发环境自动触发延迟 (ms) */
const DELAY_START = 200
/** 收到 page-global-animate 后延迟触发动画 (ms) */
const DELAY_ANIMATE_START = 200

const DEFAULT_DATA: MusicNativeData = {
  items: [
    {
      order: 1,
      songId: 'song_001',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      title: '轻音乐',
      text: '[轻音乐] (放松、舒缓、减压、治愈)',
    },
    {
      order: 2,
      songId: 'song_002',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      title: '禅音疗法',
      text: '禅音疗法 | 冥想、失眠缓解、放松、专注工作 - 纯音乐',
    },
  ],
}

// ============================================
// 业务层数据解析（每个 Widget 自己实现）
// ============================================

/**
 * 解析原生传来的 JSON 数据
 * 这是业务层的职责，通信层只负责传递原始数据
 * 
 * 期望的数据格式：
 * {
 *   "items": [
 *     { "order": 1, "songId": "...", ... },
 *     { "order": 2, "songId": "...", ... }
 *   ]
 * }
 */
function parseMusicData(raw: unknown): MusicNativeData | null {
  // 如果是字符串，先尝试 JSON 解析
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('[MusicWidgetPage] JSON 解析失败:', raw)
      return null
    }
  }

  // 验证数据格式：最外层必须是 JSON 对象，不支持数组
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('[MusicWidgetPage] 数据格式错误，期望 JSON 对象（最外层）:', data)
    return null
  }

  // 验证 items 字段：必须是数组
  if (!('items' in data)) {
    console.warn('[MusicWidgetPage] 缺少必需字段 items:', data)
    return null
  }

  const items = (data as { items: unknown }).items
  if (!Array.isArray(items)) {
    console.warn('[MusicWidgetPage] items 必须是数组:', data)
    return null
  }

  return data as MusicNativeData
}

/**
 * 将 items 数组按 order 排序
 * 限制最多显示 10 个卡片，防止性能问题
 */
function getOrderedCards(data: MusicNativeData): MusicCardItem[] {
  if (!data.items || !Array.isArray(data.items)) {
    return []
  }
  return [...data.items].sort((a, b) => a.order - b.order).slice(0, 10)
}

/**
 * 截断文本，避免溢出
 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * 音乐卡片组件
 */
interface MusicCardProps {
  item: MusicCardItem
  index: number
  defaultItem: MusicCardItem
  onCardClick: () => void
  recommendListenLabel: string
  /** 是否启用最小宽度（用于横向滚动场景） */
  enableMinWidth?: boolean
}

function MusicCard({ item, index: _index, defaultItem, onCardClick, recommendListenLabel, enableMinWidth = false }: MusicCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const imageUrl = item.imageUrl || item.imageBase64 || defaultItem.imageUrl
  // 截断文本，防止过长溢出
  const rawText = item.text || item.description || defaultItem.text || ''
  const text = truncateText(rawText, 80)
  const title = truncateText(item.title || defaultItem.title || '', 12)

  return (
    <div
      className={`group relative overflow-hidden flex-shrink-0 w-[calc(50%-6px)] snap-start cursor-pointer rounded-2xl ${
        enableMinWidth ? 'min-w-[calc(50%-6px)]' : ''
      }`}
      style={{ 
        aspectRatio: '3/4',
        backgroundColor: 'rgba(255,255,255,0.6)',
      }}
      onClick={onCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCardClick()
        }
      }}
    >
      <div className="relative overflow-hidden rounded-2xl h-full w-full">
        {/* 图片骨架屏 */}
        {!imageLoaded && (
          <div 
            className="absolute inset-0" 
            style={{ background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)' }} 
          />
        )}
        
        {/* 卡片图片 */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover block"
          style={{
            opacity: imageLoaded ? 1 : 0,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            filter: isHovered ? 'brightness(0.75)' : 'brightness(1)',
            transition: 'transform 0.5s ease-out, filter 0.3s ease-out, opacity 0.3s ease-out',
          }}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* 渐变遮罩层 */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
            opacity: isHovered ? 1 : 0.8,
            transition: 'opacity 0.3s ease-out',
          }}
        />
        
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
          {/* 音乐类型标签 */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: isHovered ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'background-color 0.3s ease-out',
            }}
          >
            <Music className="w-3 h-3 text-white" />
            <span className="text-xs font-medium text-white">{title}</span>
          </div>
        </div>
        
        {/* 底部内容区 */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {/* 装饰图标 */}
          <div 
            className="flex items-center gap-1.5 mb-1.5"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
            }}
          >
            <Headphones className="w-3.5 h-3.5" style={{ color: '#fb923c' }} />
            <span className="text-[11px] font-medium" style={{ color: '#fdba74' }}>{recommendListenLabel}</span>
            <Sparkles className="w-3 h-3" style={{ color: '#facc15' }} />
          </div>
          
          {/* 描述文字 - 限制最多2行 */}
          <p 
            className="text-sm font-medium leading-snug text-white break-words whitespace-normal line-clamp-2"
            style={{
              transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
              transition: 'transform 0.3s ease-out',
            }}
          >
            {text}
          </p>
          
          {/* 底部装饰线 */}
          <div 
            className="mt-2 h-0.5 rounded-full"
            style={{
              background: 'linear-gradient(to right, #fb923c, #ec4899, #a855f7)',
              width: isHovered ? '100%' : '0%',
              opacity: isHovered ? 1 : 0,
              transition: 'width 0.4s ease-out, opacity 0.3s ease-out',
            }}
          />
        </div>
        
        {/* 边框光效 */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: isHovered ? '0 0 0 2px rgba(251,146,60,0.5)' : '0 0 0 0px transparent',
            transition: 'box-shadow 0.3s ease-out',
          }}
        />
      </div>
    </div>
  )
}

/**
 * 音乐推荐 Widget 页面
 * 
 * 路由: /widget/music
 * 
 * 架构说明：
 * - 通信层 (useNativeBridge): 使用原生 JS 方式，window.NativeBridge + window.android
 * - 业务层 (本组件): 负责注册处理回调、解析数据、渲染 UI
 * 
 * 通信方式（与原 music.html 完全一致）:
 * - Android -> JS: webView.evaluateJavascript("NativeBridge.receiveData('...')", null)
 * - JS -> Android: window.android.onJsMessage(jsonString)
 */
export function Type4_MusicWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<MusicNativeData>(DEFAULT_DATA)

  // ============================================
  // 通信层：初始化 NativeBridge（原生 JS 方式）
  // ============================================
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

  // ============================================
  // 业务层：注册数据接收回调
  // ============================================
  useEffect(() => {
    // 注册数据接收回调
    // Android 调用 NativeBridge.receiveData(jsonData) 时触发
    onData((rawData) => {
      console.log('[MusicWidgetPage] 收到原生数据')
      
      // 业务层自己解析数据
      const parsed = parseMusicData(rawData)
      
      if (parsed && parsed.items.length > 0) {
        setData(parsed)
        console.log('[MusicWidgetPage] 渲染完成，共', parsed.items.length, '张卡片')
      } else {
        console.warn('[MusicWidgetPage] 解析后数据为空，使用默认数据')
      }
    })
  }, [onData])

  // ============================================
  // 业务层：事件处理
  // ============================================
  const handleCardClick = useCallback((card: MusicCardItem) => {
    console.log('[MusicWidgetPage] 卡片点击:', card.order, card.songId)
    // 通过通信层发送事件到原生
    send('cardClick', {
      order: card.order,
      songId: card.songId,
      card,
    })
  }, [send])

  // 渲染的卡片数据（按 order 排序）
  const displayCards = useMemo(() => {
    return getOrderedCards(data)
  }, [data])

  // 获取默认卡片数据（用于 fallback）
  const defaultCards = useMemo(() => getOrderedCards(DEFAULT_DATA), [])

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <EmbeddedContainer maxWidth="md" fullHeight={false} paddingTop="sm" paddingLeft="sm" paddingRight="sm">
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="slideUp" stagger staggerDelay={0.12}>
          {/* 标题区域 */}
          <div className="mb-3">
            <h2 className="text-base font-semibold text-gray-800 leading-tight">
              {t('widgets.type4.title')}
            </h2>
            <p className="text-xs text-gray-500">{t('widgets.type4.subtitle')}</p>
          </div>

          {/* 音乐卡片网格 - 两个并排，超过两个时横向滚动 */}
          {displayCards.length > 0 ? (
            <div 
              className={`flex gap-3 w-full ${
                displayCards.length > 2 
                  ? 'overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x' 
                  : 'overflow-hidden'
              }`}
            >
              {displayCards.map((card, index) => (
                <MusicCard
                  key={card.songId || card.order || index}
                  item={card}
                  index={index}
                  defaultItem={defaultCards[index] || defaultCards[0]}
                  onCardClick={() => handleCardClick(card)}
                  recommendListenLabel={t('widgets.type4.recommendListen')}
                  enableMinWidth={displayCards.length > 2}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
              {t('widgets.type4.noMusic')}
            </div>
          )}
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
