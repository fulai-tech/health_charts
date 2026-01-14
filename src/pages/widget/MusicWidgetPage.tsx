import { useState, useCallback, useMemo, useEffect } from 'react'
import { WidgetLayout } from '@/layouts/WidgetLayout'
import { useDSBridge } from '@/hooks/useDSBridge'

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
 * 音符图标组件
 */
function NoteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
    </svg>
  )
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
  const imageUrl = item.imageUrl || item.imageBase64 || defaultItem.imageUrl
  const text = item.text || item.description || defaultItem.text
  const title = item.title || defaultItem.title || ''

  return (
    <div
      className="relative overflow-hidden bg-transparent flex-shrink-0 w-[280px] min-w-[280px] md:w-[320px] md:min-w-[320px] lg:w-[360px] lg:min-w-[360px] snap-start cursor-pointer"
      onClick={() => onCardClick(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCardClick(index)
        }
      }}
    >
      <div className="relative">
        {/* 卡片图片 */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-[210px] md:h-[240px] object-cover block rounded-xl md:rounded-2xl"
          loading="lazy"
        />
        
        {/* 音符图标 */}
        <NoteIcon className="absolute top-3 right-3 md:top-4 md:right-4 w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-lg z-10" />
        
        {/* 文字覆盖层 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-5 text-white rounded-b-xl md:rounded-b-2xl">
          <p className="text-sm md:text-[0.9375rem] font-medium leading-7 m-0">
            {text}
          </p>
        </div>
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
 * - 通信层 (useDSBridge): 只负责收发数据，不解析不处理
 * - 业务层 (本组件): 负责注册处理方法、解析数据、渲染 UI
 * 
 * 原生调用方式:
 * - Android: dsBridge.callHandler("setData", jsonString, callback)
 * - iOS: [bridge callHandler:@"setData" data:jsonString callback:callback]
 */
export function MusicWidgetPage() {
  const [cards, setCards] = useState<MusicCardItem[]>(DEFAULT_CARDS)

  // ============================================
  // 通信层：初始化 DSBridge
  // ============================================
  const { register, send, isReady } = useDSBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
  })

  // ============================================
  // 业务层：注册数据接收方法
  // ============================================
  useEffect(() => {
    // 注册 setData 方法供原生调用
    // 原生只需要调用: dsBridge.callHandler("setData", jsonData)
    register<unknown, { success: boolean; count: number }>('setData', (rawData) => {
      console.log('[MusicWidgetPage] 收到原生数据')
      
      // 业务层自己解析数据
      const items = parseMusicData(rawData)
      
      if (items.length > 0) {
        setCards(items)
        console.log('[MusicWidgetPage] 渲染完成，共', items.length, '张卡片')
        return { success: true, count: items.length }
      }
      
      console.warn('[MusicWidgetPage] 解析后数据为空，使用默认数据')
      return { success: false, count: 0 }
    })

    // 也可以注册其他方法供原生调用
    register('getPageInfo', () => ({
      pageId: PAGE_CONFIG.pageId,
      pageName: PAGE_CONFIG.pageName,
      cardCount: cards.length,
    }))
  }, [register, cards.length])

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
    <WidgetLayout className="bg-[#F1EFEE]">
      <div className="w-full max-w-full md:max-w-[672px] mx-auto p-4 sm:p-5 md:p-6">
        {/* 音乐推荐标题 */}
        <h2 className="text-xl md:text-[1.375rem] font-semibold text-gray-800 mb-4 md:mb-5 leading-tight">
          Music Recommendations
        </h2>

        {/* 音乐卡片网格 - 横向滚动 */}
        <div className="flex gap-3 sm:gap-4 md:gap-5 w-full overflow-x-auto py-1 px-1 sm:px-2 md:px-3 snap-x snap-mandatory scrollbar-hide touch-pan-x">
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
          <div className="mt-4 text-xs text-gray-400">
            DSBridge Ready: {isReady ? '✅' : '⏳'}
          </div>
        )}
      </div>
    </WidgetLayout>
  )
}
