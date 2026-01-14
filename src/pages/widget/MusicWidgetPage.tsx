import { useState, useCallback, useMemo, useEffect } from 'react'
import { WidgetLayout } from '@/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { Music, Play, Headphones, Sparkles } from 'lucide-react'

// ============================================
// 业务层类型定义
// ============================================

/**
 * 音乐卡片数据类型
 */
interface MusicCardItem {
  id?: number
  imageUrl?: string
  imageBase64?: string
  title?: string
  text?: string
  description?: string
}

/**
 * 原生传入的数据结构（业务层自己定义，通信层不关心）
 * 支持多种格式：数组 / { items: [] } / { data: [] }
 */
type MusicNativeData = MusicCardItem[] | { items: MusicCardItem[] } | { data: MusicCardItem[] }

// ============================================
// 业务层配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'music',
  pageName: '音乐推荐',
} as const

const DEFAULT_CARDS: MusicCardItem[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    title: '轻音乐',
    text: '[轻音乐] (放松、舒缓、减压、治愈)',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    title: '禅音疗法',
    text: '禅音疗法 | 冥想、失眠缓解、放松、专注工作 - 纯音乐',
  },
]

// ============================================
// 业务层数据解析（每个 Widget 自己实现）
// ============================================

/**
 * 解析原生传来的 JSON 数据
 * 这是业务层的职责，通信层只负责传递原始数据
 */
function parseMusicData(raw: unknown): MusicCardItem[] {
  // 如果是字符串，先尝试 JSON 解析
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('[MusicWidgetPage] JSON 解析失败:', raw)
      return []
    }
  }

  // 支持多种数据格式
  if (Array.isArray(data)) {
    return data as MusicCardItem[]
  }
  if (data && typeof data === 'object') {
    if ('items' in data && Array.isArray((data as { items: unknown }).items)) {
      return (data as { items: MusicCardItem[] }).items
    }
    if ('data' in data && Array.isArray((data as { data: unknown }).data)) {
      return (data as { data: MusicCardItem[] }).data
    }
  }
  
  console.warn('[MusicWidgetPage] 未知的数据格式:', data)
  return []
}

/**
 * 音乐卡片组件
 */
interface MusicCardProps {
  item: MusicCardItem
  index: number
  defaultItem: MusicCardItem
  onCardClick: (index: number) => void
}

function MusicCard({ item, index, defaultItem, onCardClick }: MusicCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const imageUrl = item.imageUrl || item.imageBase64 || defaultItem.imageUrl
  const text = item.text || item.description || defaultItem.text
  const title = item.title || defaultItem.title || ''

  return (
    <div
      className="group relative overflow-hidden bg-white/60 backdrop-blur-sm flex-shrink-0 w-[280px] min-w-[280px] md:w-[320px] md:min-w-[320px] lg:w-[360px] lg:min-w-[360px] snap-start cursor-pointer rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1"
      onClick={() => onCardClick(index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCardClick(index)
        }
      }}
    >
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl">
        {/* 图片骨架屏 */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        
        {/* 卡片图片 */}
        <img
          src={imageUrl}
          alt={title}
          className={`w-full h-[200px] md:h-[220px] object-cover block transition-all duration-700 ease-out ${
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
          
          {/* 播放按钮 */}
          <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 transition-all duration-300 ${
            isHovered ? 'bg-orange-500 border-orange-400 scale-110 rotate-0' : 'rotate-[-10deg]'
          }`}>
            <Play className={`w-4 h-4 text-white transition-transform duration-300 ${
              isHovered ? 'scale-110 translate-x-0.5' : ''
            }`} fill={isHovered ? 'white' : 'none'} />
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
          
          {/* 描述文字 */}
          <p className={`text-sm md:text-[0.9375rem] font-medium leading-relaxed text-white transition-all duration-300 ${
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
  const [cards, setCards] = useState<MusicCardItem[]>(DEFAULT_CARDS)

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
      const items = parseMusicData(rawData)
      
      if (items.length > 0) {
        setCards(items)
        console.log('[MusicWidgetPage] 渲染完成，共', items.length, '张卡片')
      } else {
        console.warn('[MusicWidgetPage] 解析后数据为空，使用默认数据')
      }
    })
  }, [onData])

  // ============================================
  // 业务层：事件处理
  // ============================================
  const handleCardClick = useCallback((index: number) => {
    console.log('[MusicWidgetPage] 卡片点击:', index)
    // 通过通信层发送事件到原生
    send('cardClick', {
      cardIndex: index,
      card: cards[index],
    })
  }, [send, cards])

  // 渲染的卡片数据
  const displayCards = useMemo(() => {
    return cards.length > 0 ? cards : DEFAULT_CARDS
  }, [cards])

  return (
    <WidgetLayout className="bg-gradient-to-br from-[#F8F6F5] via-[#F1EFEE] to-[#E8E4E1]">
      <div className="w-full max-w-full md:max-w-[720px] mx-auto p-4 sm:p-5 md:p-6">
        {/* 标题区域 */}
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            {/* 装饰图标 */}
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg shadow-orange-200/50">
              <Headphones className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
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

        {/* 音乐卡片网格 - 横向滚动（WebView 优化） */}
        <div 
          className="flex gap-4 sm:gap-5 md:gap-6 w-full overflow-x-auto py-2 px-1 snap-x snap-mandatory touch-pan-x -mx-1"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {displayCards.map((card, index) => (
            <MusicCard
              key={card.id || index}
              item={card}
              index={index}
              defaultItem={DEFAULT_CARDS[index] || DEFAULT_CARDS[0]}
              onCardClick={handleCardClick}
            />
          ))}
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
