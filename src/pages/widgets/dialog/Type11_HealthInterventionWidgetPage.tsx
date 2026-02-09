import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react-lite'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer } from '@/components/common/WidgetEntranceContainer'
import { EmbeddedContainer } from '@/components/common/EmbeddedContainer'
import { Zap, Play } from 'lucide-react'
import { widgetBGColor } from '@/config/theme'

// ============================================
// 类型定义
// ============================================

/**
 * 健康干预视频卡片数据类型
 * 
 * JSON 数据格式规范（必须是 JSON 对象，不支持数组）：
 * {
 *   "title": "冥想与调息",                    // 视频标题
 *   "videoUrl": "https://cdn.example.com/meditation-3min.mp4",  // 视频地址
 *   "videoPoster": "https://cdn.example.com/meditation-thumb.jpg", // 视频封面（可选）
 *   "durationMinutes": 3,                    // 视频时长（分钟）
 *   "reasoning": "鉴于目前收缩压偏高，建议立即放下工作，闭上眼睛，静坐3分钟。" // 干预原因说明
 * }
 */
interface HealthInterventionData {
  title: string
  videoUrl: string
  videoPoster?: string
  durationMinutes: number
  reasoning: string
}

// ============================================
// 配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'health-intervention',
  pageName: '健康干预卡片',
  type: 11, // 健康干预视频卡片类型标识
} as const

/** 开发环境自动触发延迟 (ms) */
const DELAY_START = 200
/** 收到 page-global-animate 后延迟触发动画 (ms) */
const DELAY_ANIMATE_START = 300

const DEFAULT_DATA: HealthInterventionData = {
  title: 'Meditation and Breath Regulation',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  videoPoster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
  durationMinutes: 3,
  reasoning: 'Given the currently high systolic blood pressure, it is recommended to immediately put down your work, close your eyes, and sit quietly for 3 minutes.',
}

// ============================================
// 工具函数
// ============================================

/**
 * 解析原生数据
 * 
 * 期望的数据格式：JSON 对象（不支持数组）
 */
function parseInterventionData(raw: unknown): HealthInterventionData | null {
  // 如果是字符串，先尝试 JSON 解析
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('[HealthInterventionWidget] JSON 解析失败:', raw)
      return null
    }
  }

  // 验证数据格式：必须是 JSON 对象，不支持数组
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('[HealthInterventionWidget] 数据格式错误，期望 JSON 对象:', data)
    return null
  }
  
  const obj = data as Record<string, unknown>
  
  if (typeof obj.title !== 'string' || typeof obj.videoUrl !== 'string') {
    console.warn('[HealthInterventionWidget] 缺少必需字段 title 或 videoUrl:', data)
    return null
  }
  
  return {
    title: obj.title,
    videoUrl: obj.videoUrl,
    videoPoster: typeof obj.videoPoster === 'string' ? obj.videoPoster : undefined,
    durationMinutes: typeof obj.durationMinutes === 'number' ? obj.durationMinutes : 3,
    reasoning: typeof obj.reasoning === 'string' ? obj.reasoning : '',
  }
}

// ============================================
// 主组件
// ============================================

/**
 * 健康干预视频 Widget 页面 (Type 11)
 * 
 * 路由: /widget/type-11
 * 
 * 通信方式：
 * - Android -> JS: NativeBridge.receiveData(jsonString)
 * - JS -> Android: window.android.onJsMessage(jsonString)
 */
export const Type11_HealthInterventionWidgetPage = observer(function Type11_HealthInterventionWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<HealthInterventionData>(DEFAULT_DATA)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generatedPoster, setGeneratedPoster] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)

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
      console.log('[HealthInterventionWidget] 收到原生数据')
      const parsed = parseInterventionData(rawData)
      if (parsed) {
        setData(parsed)
        setGeneratedPoster('') // 重置自动生成的封面
        console.log('[HealthInterventionWidget] 渲染完成')
      } else {
        console.warn('[HealthInterventionWidget] 数据解析失败，使用默认数据')
      }
    })
  }, [onData])

  // 处理播放按钮点击
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
    // 通知 Android 用户点击了开始播放按钮
    send('click-widget-video-start', { pageId: PAGE_CONFIG.pageId, videoUrl: data.videoUrl })
  }, [isPlaying, send, data.videoUrl])

  // 处理视频点击播放
  const handleVideoClick = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
    send('videoClick', { pageId: PAGE_CONFIG.pageId, videoUrl: data.videoUrl })
  }, [isPlaying, send, data.videoUrl])

  // 视频播放状态监听
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      send('videoEnded', { pageId: PAGE_CONFIG.pageId })
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [send])

  // 禁止全屏
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const preventFullscreen = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    video.addEventListener('webkitfullscreenchange', preventFullscreen)
    video.addEventListener('fullscreenchange', preventFullscreen)

    return () => {
      video.removeEventListener('webkitfullscreenchange', preventFullscreen)
      video.removeEventListener('fullscreenchange', preventFullscreen)
    }
  }, [])

  // 自动提取视频第一帧作为封面（当没有 poster 时）
  useEffect(() => {
    const video = videoRef.current
    if (!video || data.videoPoster) return // 如果已有 poster，不需要提取

    const extractFirstFrame = () => {
      try {
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.warn('[HealthInterventionWidget] 视频尺寸无效，跳过截图')
          return
        }

        // 创建 canvas 截取视频第一帧
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const posterUrl = canvas.toDataURL('image/jpeg', 0.85)
          setGeneratedPoster(posterUrl)
          console.log('[HealthInterventionWidget] 已自动提取视频第一帧作为封面')
        }
      } catch (error) {
        console.warn('[HealthInterventionWidget] 提取视频第一帧失败:', error)
      }
    }

    // 监听 loadeddata 事件（视频数据加载完成）
    const handleLoadedData = () => {
      video.currentTime = 0.1 // 稍微往前一点，避免全黑帧
      
      // 等待 seeked 事件，确保帧已加载
      const handleSeeked = () => {
        extractFirstFrame()
        video.removeEventListener('seeked', handleSeeked)
      }
      video.addEventListener('seeked', handleSeeked)
    }

    video.addEventListener('loadeddata', handleLoadedData)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
    }
  }, [data.videoUrl, data.videoPoster])

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <EmbeddedContainer maxWidth="md" fullHeight={false}>
        {/* 健康干预卡片 - 带入场动画 */}
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="spring">
          <div
            className="relative overflow-hidden rounded-[32px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
            style={{
              padding: '24px',
            }}
          >
            {/* 顶部紧急提示徽章 - 纯文本，无背景 */}
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4" style={{ color: '#FF7F27' }} />
              <span className="text-sm font-medium" style={{ color: '#FF7F27' }}>
                {t('widgets.type11.urgencyBadge')}
              </span>
            </div>

            {/* 主标题行 + 开始按钮 */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold truncate mr-3" style={{ color: '#1A1A1A' }}>
                {data.title}
              </h2>

              {/* 开始按钮 */}
              <button
                onClick={handlePlayClick}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                style={{
                  backgroundColor: '#FF7F27',
                  boxShadow: '0 2px 8px rgba(255, 127, 39, 0.3)',
                }}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t('widgets.type11.startButton')}</span>
              </button>
            </div>

            {/* 视频区域 */}
            <div
              className="relative mb-4 overflow-hidden rounded-[20px] cursor-pointer group"
              onClick={handleVideoClick}
              style={{ backgroundColor: '#F5F5F5' }}
            >
              <video
                ref={videoRef}
                src={data.videoUrl}
                poster={data.videoPoster || generatedPoster}
                className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                playsInline
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                preload="metadata"
                crossOrigin="anonymous"
              />

              {/* 时长徽章 - 更明亮的橙色 */}
              <div
                className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-1"
                style={{ backgroundColor: 'rgba(255, 140, 0, 0.95)' }}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{data.durationMinutes} {t('widgets.type11.minutes')}</span>
              </div>

              {/* 播放遮罩 - 仅在未播放且悬停时显示中心按钮 */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/10 transition-all duration-300 group-hover:bg-black/25">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                      <Play className="w-8 h-8 fill-current ml-1" style={{ color: '#FF7F27' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 干预原因说明 */}
            <div
              className="p-4 rounded-[16px]"
              style={{
                backgroundColor: '#F0F0F0',
                lineHeight: '1.5',
              }}
            >
              <p className="text-sm" style={{ color: '#666666' }}>
                {data.reasoning}
              </p>
            </div>
          </div>
        </WidgetEntranceContainer>

        {/* 调试信息（仅开发环境） */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'} | 
            播放状态: {isPlaying ? '▶️' : '⏸️'}
          </div>
        )}
      </EmbeddedContainer>
    </WidgetLayout>
  )
})
