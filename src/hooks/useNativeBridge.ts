import { useEffect, useCallback, useState, useRef } from 'react'

/**
 * 扩展 Window 类型，声明原生注入的接口
 * 这些是 Android 端注入的全局对象
 */
declare global {
  interface Window {
    /** Android 注入的对象，用于 JS -> Android 通信 */
    android?: {
      onJsMessage: (payload: string) => void
    }
    /** JS 暴露给 Android 的桥接对象 */
    NativeBridge?: NativeBridgeInterface
  }
}

/**
 * NativeBridge 接口定义
 */
interface NativeBridgeInterface {
  version: string
  debug: boolean
  /** Android 调用此方法传递数据给 JS */
  receiveData: (payload: string | object) => void
  /** 内部：数据接收回调 */
  _onDataReceived: ((data: unknown) => void) | null
  /** 内部：错误回调 */
  _onError: ((error: NativeBridgeError) => void) | null
}

interface NativeBridgeError {
  code: string
  message: string
  raw?: unknown
}

interface UseNativeBridgeOptions {
  /** 页面标识（用于原生区分页面） */
  pageId: string
  /** 页面名称 */
  pageName?: string
  /** 是否开启调试日志 */
  debug?: boolean
}

/**
 * NativeBridge 通信层 Hook
 * 
 * 完全模仿原生 music.html 中的 NativeBridge 实现
 * 使用 window.NativeBridge 和 window.android 进行通信
 * 
 * 通信方式：
 * - Android -> JS: window.NativeBridge.receiveData(jsonString)
 * - JS -> Android: window.android.onJsMessage(jsonString)
 * 
 * @example
 * ```tsx
 * const { onData, send, isReady } = useNativeBridge({
 *   pageId: 'music',
 *   debug: true,
 * })
 * 
 * // 注册数据接收回调
 * onData((data) => {
 *   console.log('收到数据:', data)
 *   setCards(data.items)
 * })
 * 
 * // 发送事件到原生
 * send('cardClick', { index: 0 })
 * ```
 */
export function useNativeBridge(options: UseNativeBridgeOptions) {
  const { pageId, pageName, debug = false } = options
  const [isReady, setIsReady] = useState(false)
  const dataCallbackRef = useRef<((data: unknown) => void) | null>(null)
  const errorCallbackRef = useRef<((error: NativeBridgeError) => void) | null>(null)

  // 日志工具
  const log = useCallback((level: 'INFO' | 'WARN' | 'ERROR', ...args: unknown[]) => {
    if (!debug) return
    const prefix = `[NativeBridge][${pageId}][${level}]`
    console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](prefix, ...args)
  }, [debug, pageId])

  // 初始化 NativeBridge
  useEffect(() => {
    log('INFO', '初始化通信层')

    // 创建全局 NativeBridge 对象（模仿原生实现）
    const bridge: NativeBridgeInterface = {
      version: '2.0.0',
      debug: debug,
      _onDataReceived: null,
      _onError: null,

      /**
       * Android 调用此方法传递数据
       * Android 端调用: webView.evaluateJavascript("NativeBridge.receiveData('...')", null)
       */
      receiveData: function(payload: string | object) {
        const logFn = debug 
          ? (level: string, ...args: unknown[]) => {
              const prefix = `[NativeBridge][${pageId}][${level}]`
              console.log(prefix, ...args)
            }
          : () => {}

        logFn('INFO', '收到原生数据', typeof payload === 'string' ? payload.substring(0, 100) + '...' : payload)

        let data: unknown = payload

        // 自动解析 JSON 字符串
        if (typeof payload === 'string') {
          try {
            data = JSON.parse(payload)
          } catch (e) {
            logFn('ERROR', 'JSON 解析失败', e)
            if (this._onError) {
              this._onError({
                code: 'PARSE_ERROR',
                message: e instanceof Error ? e.message : 'JSON parse failed',
                raw: payload
              })
            }
            return
          }
        }

        logFn('INFO', '解析后的数据：', data)

        // 触发业务层回调
        if (this._onDataReceived) {
          this._onDataReceived(data)
        } else {
          logFn('WARN', '未注册数据回调，数据未被处理')
        }

        // 通知原生：数据已接收
        sendToNative('dataReceived', { success: true, timestamp: Date.now() })
      }
    }

    // 发送到原生的内部函数
    function sendToNative(eventName: string, data?: unknown) {
      const payload = JSON.stringify({
        event: eventName,
        data: data,
        pageId: pageId,
        timestamp: Date.now()
      })

      // 调用原生接口 - 使用 window.android 确保不会被 minify
      if (typeof window.android !== 'undefined' && typeof window.android.onJsMessage === 'function') {
        window.android.onJsMessage(payload)
      } else if (debug) {
        console.log(`[NativeBridge][${pageId}][WARN]`, '原生接口 android.onJsMessage 不存在（开发环境正常）')
      }
    }

    // 暴露到全局 - 使用 window 对象确保属性名不会被 minify
    window.NativeBridge = bridge

    // 设置就绪状态
    setIsReady(true)

    // 通知原生页面已就绪
    sendToNative('pageReady', { 
      pageId, 
      pageName,
      timestamp: Date.now() 
    })

    log('INFO', '通信层初始化完成，已通知原生页面就绪')

    return () => {
      log('INFO', '通信层销毁')
      // 清理时不删除 NativeBridge，因为可能还有其他组件在用
    }
  }, [pageId, pageName, debug, log])

  // 同步回调引用到全局对象
  useEffect(() => {
    if (window.NativeBridge) {
      window.NativeBridge._onDataReceived = dataCallbackRef.current
      window.NativeBridge._onError = errorCallbackRef.current
    }
  })

  /**
   * 注册数据接收回调
   * Android 调用 NativeBridge.receiveData(json) 时会触发
   */
  const onData = useCallback((callback: (data: unknown) => void) => {
    dataCallbackRef.current = callback
    if (window.NativeBridge) {
      window.NativeBridge._onDataReceived = callback
    }
  }, [])

  /**
   * 注册错误回调
   */
  const onError = useCallback((callback: (error: NativeBridgeError) => void) => {
    errorCallbackRef.current = callback
    if (window.NativeBridge) {
      window.NativeBridge._onError = callback
    }
  }, [])

  /**
   * 发送事件到原生
   * 调用 android.onJsMessage(jsonString)
   */
  const send = useCallback(<T = unknown>(eventName: string, data?: T) => {
    const payload = JSON.stringify({
      event: eventName,
      data: data,
      pageId: pageId,
      timestamp: Date.now()
    })

    log('INFO', `发送事件: ${eventName}`, data)

    // 使用 window.android 确保属性名不会被 minify
    if (typeof window.android !== 'undefined' && typeof window.android.onJsMessage === 'function') {
      window.android.onJsMessage(payload)
    } else {
      log('WARN', '原生接口 android.onJsMessage 不存在')
    }
  }, [log, pageId])

  /**
   * 请求原生发送数据
   */
  const requestData = useCallback((params?: Record<string, unknown>) => {
    log('INFO', '请求原生数据', params)
    send('requestData', params || {})
  }, [log, send])

  return {
    /** 通信层是否就绪 */
    isReady,
    /** 注册数据接收回调 */
    onData,
    /** 注册错误回调 */
    onError,
    /** 发送事件到原生 */
    send,
    /** 请求原生发送数据 */
    requestData,
  }
}

export type { UseNativeBridgeOptions, NativeBridgeError }
