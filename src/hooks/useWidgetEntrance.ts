/**
 * useWidgetEntrance - Widget 页面入场动画控制 Hook
 * 
 * 功能：
 * 1. 页面加载完成后发送 `page-global-ready` 事件通知 Android
 * 2. 监听 Android 通过 `NativeBridge.receiveData({ event: 'page-global-animate' })` 发送的信号
 * 3. 收到信号后触发入场动画
 * 4. 开发环境下自动触发（不等待 Android）
 * 
 * 使用流程：
 * ```
 * H5 加载完成 → 发送 page-global-ready → Android 处理 → NativeBridge.receiveData({ event: 'page-global-animate' }) → H5 播放动画
 * ```
 * 
 * Android 端调用示例：
 * ```kotlin
 * // 触发入场动画
 * webView.evaluateJavascript(
 *   "NativeBridge.receiveData('{\"event\":\"page-global-animate\"}')",
 *   null
 * )
 * ```
 * 
 * @example
 * ```tsx
 * function MyWidgetPage() {
 *   const { canAnimate, isReady, triggerAnimate } = useWidgetEntrance({
 *     pageId: 'my-widget',
 *   })
 * 
 *   return (
 *     <WidgetEntranceContainer animate={canAnimate}>
 *       <MyContent />
 *     </WidgetEntranceContainer>
 *   )
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react'

/** 扩展 Window 类型 */
declare global {
  interface Window {
    /** Android 注入的对象 */
    android?: {
      onJsMessage: (payload: string) => void
    }
  }
}

interface UseWidgetEntranceOptions {
  /** 页面标识 */
  pageId: string
  /** 开发环境自动触发延迟（毫秒），默认 300ms */
  devAutoTriggerDelay?: number
  /** 收到 page-global-animate 后延迟多久触发动画（毫秒），默认 0 */
  animateDelay?: number
  /** 是否在开发环境禁用自动触发，默认 false */
  disableDevAutoTrigger?: boolean
  /** 是否开启调试日志 */
  debug?: boolean
}

interface UseWidgetEntranceReturn {
  /** 是否可以开始动画（收到 Android 信号后为 true） */
  canAnimate: boolean
  /** 桥接是否就绪 */
  isReady: boolean
  /** 动画 key，用于 WidgetEntranceContainer 强制重新挂载 */
  animationKey: number
  /** 手动触发动画（用于测试或特殊场景） */
  triggerAnimate: () => void
  /** 重置动画状态（用于调试，允许重新播放入场动画） */
  resetAnimate: () => void
  /** 重新播放动画（重置 + 触发，用于调试） */
  replayAnimate: () => void
}

export function useWidgetEntrance(options: UseWidgetEntranceOptions): UseWidgetEntranceReturn {
  const {
    pageId,
    devAutoTriggerDelay = 300,
    animateDelay = 0,
    disableDevAutoTrigger = false,
    debug = import.meta.env.DEV,
  } = options

  const [canAnimate, setCanAnimate] = useState(false)
  const [isReady, setIsReady] = useState(false)
  // animationKey 用于强制 WidgetEntranceContainer 重新挂载，确保动画能重新播放
  const [animationKey, setAnimationKey] = useState(0)
  const hasTriggeredRef = useRef(false)
  const autoTriggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animateDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 日志工具
  const log = useCallback(
    (level: 'INFO' | 'WARN', ...args: unknown[]) => {
      if (!debug) return
      const prefix = `[WidgetEntrance][${pageId}][${level}]`
      console[level === 'WARN' ? 'warn' : 'log'](prefix, ...args)
    },
    [debug, pageId]
  )

  // 触发动画
  const triggerAnimate = useCallback(() => {
    if (hasTriggeredRef.current) {
      log('WARN', '动画已触发，忽略重复调用（如需重新播放请使用 replayAnimate）')
      return
    }
    hasTriggeredRef.current = true
    setCanAnimate(true)
    log('INFO', '入场动画已触发')
  }, [log])

  // 重置动画状态（用于调试）
  const resetAnimate = useCallback(() => {
    hasTriggeredRef.current = false
    setCanAnimate(false)
    log('INFO', '动画状态已重置')
  }, [log])

  // 重新播放动画（用于调试）
  const replayAnimate = useCallback(() => {
    // 递增 animationKey 强制 WidgetEntranceContainer 重新挂载
    setAnimationKey(prev => prev + 1)
    hasTriggeredRef.current = false
    setCanAnimate(false)
    // 使用 requestAnimationFrame 确保状态更新后再触发
    requestAnimationFrame(() => {
      hasTriggeredRef.current = true
      setCanAnimate(true)
      log('INFO', '入场动画已重新播放')
    })
  }, [log])

  // 发送消息到 Android
  const sendToAndroid = useCallback(
    (event: string, data?: unknown) => {
      const payload = JSON.stringify({
        event,
        data: data ?? {},
        pageId,
        timestamp: Date.now(),
      })

      if (window.android?.onJsMessage) {
        window.android.onJsMessage(payload)
        log('INFO', `发送事件: ${event}`)
      } else {
        log('WARN', 'android.onJsMessage 不存在（开发环境正常）')
      }
    },
    [pageId, log]
  )

  // 初始化
  useEffect(() => {
    log('INFO', '初始化入场动画控制')

    // 监听 NativeBridge.receiveData 派发的 widget-entrance-animate 事件
    // Android 调用: NativeBridge.receiveData('{"event":"page-global-animate"}')
    // useNativeBridge 会检测到 page-global-animate 并派发 widget-entrance-animate 自定义事件
    const handleAnimateEvent = (event: CustomEvent) => {
      if (event.detail?.event === 'page-global-animate') {
        log('INFO', '收到 page-global-animate 事件（通过 NativeBridge）')
        // 清除自动触发定时器
        if (autoTriggerTimerRef.current) {
          clearTimeout(autoTriggerTimerRef.current)
          autoTriggerTimerRef.current = null
        }
        
        // 延迟触发动画
        const doTrigger = () => {
          // 如果已经触发过，使用 replayAnimate 重新播放（用于调试场景）
          if (hasTriggeredRef.current) {
            replayAnimate()
          } else {
            triggerAnimate()
          }
        }
        
        if (animateDelay > 0) {
          log('INFO', `延迟 ${animateDelay}ms 后触发动画`)
          animateDelayTimerRef.current = setTimeout(doTrigger, animateDelay)
        } else {
          doTrigger()
        }
      }
    }

    window.addEventListener('widget-entrance-animate', handleAnimateEvent as EventListener)

    setIsReady(true)

    // 发送 page-global-ready 事件
    sendToAndroid('page-global-ready', {
      pageId,
      timestamp: Date.now(),
    })
    log('INFO', '已发送 page-global-ready 事件')

    // 开发环境自动触发
    if (import.meta.env.DEV && !disableDevAutoTrigger) {
      autoTriggerTimerRef.current = setTimeout(() => {
        if (!hasTriggeredRef.current) {
          log('INFO', `开发环境：${devAutoTriggerDelay}ms 内未收到 Android 信号，自动触发动画`)
          triggerAnimate()
        }
      }, devAutoTriggerDelay)
    }

    return () => {
      if (autoTriggerTimerRef.current) {
        clearTimeout(autoTriggerTimerRef.current)
      }
      if (animateDelayTimerRef.current) {
        clearTimeout(animateDelayTimerRef.current)
      }
      window.removeEventListener('widget-entrance-animate', handleAnimateEvent as EventListener)
      log('INFO', '入场动画控制已销毁')
    }
  }, [pageId, devAutoTriggerDelay, animateDelay, disableDevAutoTrigger, log, sendToAndroid, triggerAnimate, replayAnimate])

  return {
    canAnimate,
    isReady,
    animationKey,
    triggerAnimate,
    resetAnimate,
    replayAnimate,
  }
}

export type { UseWidgetEntranceOptions, UseWidgetEntranceReturn }
