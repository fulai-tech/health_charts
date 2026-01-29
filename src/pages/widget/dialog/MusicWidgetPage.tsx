import { useState, useCallback, useMemo, useEffect } from 'react'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
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
}

function MusicCard({ item, index, defaultItem, onCardClick }: MusicCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const imageUrl = item.imageUrl || item.imageBase64 || defaultItem.imageUrl
  // 截断文本，防止过长溢出
  const rawText = item.text || item.description || defaultItem.text || ''
  const text = truncateText(rawText, 80)
  const title = truncateText(item.title || defaultItem.title || '', 12)

  return (
    <div
      className="group relative overflow-hidden bg-white/60 backdrop-blur-sm flex-shrink-0 w-[calc(50%-0.5rem)] min-w-[calc(50%-0.5rem)] md:w-[calc(50%-1rem)] md:min-w-[calc(50%-1rem)] snap-start cursor-pointer rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1"
      style={{ aspectRatio: '4/5' }}
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
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl h-full w-full">
        {/* 图片骨架屏 */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        
        {/* 卡片图片 - 竖长型，高度大于宽度 */}
        <img
          src={imageUrl}
          alt={title}
          className={`w-full h-full object-cover block transition-all duration-700 ease-out ${
            isHovered ? 'scale-110 brightness-75' : 'scale-100 brightness-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* 渐变遮罩层 */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-80'
        }`} />
        
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
          {/* 音乐类型标签 */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 transition-all duration-300 ${
            isHovered ? 'bg-white/30 scale-105' : ''
          }`}>
            <Music className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-medium text-white">{title}</span>
          </div>
        </div>
        
        {/* 底部内容区 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
          {/* 装饰图标 */}
          <div className={`flex items-center gap-2 mb-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <Headphones className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-orange-300 font-medium">推荐收听</span>
            <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
          </div>
          
          {/* 描述文字 - 限制最多3行 */}
          <p className={`text-sm md:text-[0.9375rem] font-medium leading-relaxed text-white transition-all duration-300 break-words whitespace-normal line-clamp-3 ${
            isHovered ? 'translate-y-0' : 'translate-y-1'
          }`}>
            {text}
          </p>
          
          {/* 底部装饰线 */}
          <div className={`mt-3 h-1 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 transition-all duration-500 ${
            isHovered ? 'w-full opacity-100' : 'w-0 opacity-0'
          }`} />
        </div>
        
        {/* 边框光效 */}
        <div className={`absolute inset-0 rounded-2xl md:rounded-3xl ring-2 transition-all duration-300 pointer-events-none ${
          isHovered ? 'ring-orange-400/50 ring-offset-2 ring-offset-transparent' : 'ring-transparent'
        }`} />
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
export function MusicWidgetPage() {
  const [data, setData] = useState<MusicNativeData>(DEFAULT_DATA)

  // ============================================
  // 通信层：初始化 NativeBridge（原生 JS 方式）
  // ============================================
  const { onData, send, isReady } = useNativeBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
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
      <div className="w-full max-w-full md:max-w-[720px] p-4 sm:p-5 md:p-6">
        {/* 标题区域 */}
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                Music Recommendations
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">为你精选的放松音乐</p>
            </div>
          </div>
          
          {/* 查看更多按钮 */}
          <button 
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white hover:border-orange-300 hover:text-orange-600 transition-all duration-300 shadow-sm hover:shadow-md"
            onClick={() => send('viewAll', { pageId: PAGE_CONFIG.pageId })}
          >
            <span>查看更多</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* 音乐卡片网格 - 两个并排，超过两个时横向滚动 */}
        {displayCards.length > 0 ? (
          <div className="flex gap-2 md:gap-4 w-full overflow-x-auto py-4 px-3 snap-x snap-mandatory scrollbar-hide touch-pan-x -mx-1">
            {displayCards.map((card, index) => (
              <MusicCard
                key={card.songId || card.order || index}
                item={card}
                index={index}
                defaultItem={defaultCards[index] || defaultCards[0]}
                onCardClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
            暂无音乐推荐
          </div>
        )}

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
