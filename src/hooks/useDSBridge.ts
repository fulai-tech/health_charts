import { useEffect, useCallback, useState, useRef } from 'react'
import dsBridge from 'dsbridge'

interface UseDSBridgeOptions {
  /** 页面标识（用于原生区分页面） */
  pageId: string
  /** 页面名称 */
  pageName?: string
  /** 是否开启调试日志 */
  debug?: boolean
}

/**
 * DSBridge 通信层 Hook
 * 
 * 纯通信模块，与业务逻辑完全解耦。
 * 只负责：建立连接、发送消息、注册方法、调用原生方法。
 * 不负责：数据解析、状态管理、业务逻辑。
 * 
 * @example
 * ```tsx
 * // 1. 初始化通信层
 * const { register, send, callNative, isReady } = useDSBridge({
 *   pageId: 'music',
 *   debug: true,
 * })
 * 
 * // 2. 业务层注册自己的数据处理方法
 * useEffect(() => {
 *   register('setData', (jsonData) => {
 *     // 业务层自己解析和处理数据
 *     const parsed = JSON.parse(jsonData)
 *     setCards(parsed.items)
 *     return { success: true }
 *   })
 * }, [register])
 * 
 * // 3. 发送事件到原生
 * send('cardClick', { index: 0 })
 * 
 * // 4. 调用原生方法获取数据
 * const userData = await callNativeAsync('getUserInfo')
 * ```
 */
export function useDSBridge(options: UseDSBridgeOptions) {
  const { pageId, pageName, debug = false } = options
  const [isReady, setIsReady] = useState(false)
  const registeredMethods = useRef<Set<string>>(new Set())

  // 日志工具
  const log = useCallback((level: 'INFO' | 'WARN' | 'ERROR', ...args: unknown[]) => {
    if (!debug) return
    const prefix = `[DSBridge][${pageId}][${level}]`
    console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](prefix, ...args)
  }, [debug, pageId])

  // 初始化：通知原生页面已就绪
  useEffect(() => {
    log('INFO', '通信层初始化')
    setIsReady(true)
    
    // 通知原生页面就绪
    if (dsBridge.hasNativeMethod('native.onPageReady')) {
      dsBridge.call('native.onPageReady', { pageId, pageName, timestamp: Date.now() })
      log('INFO', '已通知原生页面就绪')
    }
    
    return () => {
      log('INFO', '通信层销毁')
    }
  }, [pageId, pageName, log])

  /**
   * 注册同步方法供原生调用
   * 原生调用方式: dsBridge.callHandler('methodName', jsonString, callback)
   * 
   * @param name - 方法名
   * @param handler - 处理函数，接收原生传来的原始数据，返回值会传回原生
   */
  const register = useCallback(<T = unknown, R = unknown>(
    name: string, 
    handler: (data: T) => R
  ) => {
    if (registeredMethods.current.has(name)) {
      log('WARN', `方法 ${name} 已注册，将被覆盖`)
    }
    registeredMethods.current.add(name)
    log('INFO', `注册方法: ${name}`)
    dsBridge.register(name, handler)
  }, [log])

  /**
   * 注册异步方法供原生调用
   * 
   * @param name - 方法名
   * @param handler - 异步处理函数
   */
  const registerAsync = useCallback(<T = unknown, R = unknown>(
    name: string, 
    handler: (data: T, callback: (result: R) => void) => void
  ) => {
    if (registeredMethods.current.has(name)) {
      log('WARN', `异步方法 ${name} 已注册，将被覆盖`)
    }
    registeredMethods.current.add(name)
    log('INFO', `注册异步方法: ${name}`)
    dsBridge.registerAsyn(name, handler)
  }, [log])

  /**
   * 调用原生同步方法
   */
  const callNative = useCallback(<T = unknown, R = unknown>(method: string, args?: T): R | undefined => {
    log('INFO', `调用原生方法: ${method}`, args)
    if (!dsBridge.hasNativeMethod(method)) {
      log('WARN', `原生方法 ${method} 不存在`)
      return undefined
    }
    return dsBridge.call<T, R>(method, args)
  }, [log])

  /**
   * 调用原生异步方法
   */
  const callNativeAsync = useCallback(<T = unknown, R = unknown>(method: string, args?: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      log('INFO', `调用原生异步方法: ${method}`, args)
      if (!dsBridge.hasNativeMethod(method, 'asyn')) {
        const error = `原生异步方法 ${method} 不存在`
        log('WARN', error)
        reject(new Error(error))
        return
      }
      dsBridge.call<T, R>(method, args, (result) => {
        log('INFO', `原生方法 ${method} 返回:`, result)
        resolve(result)
      })
    })
  }, [log])

  /**
   * 发送事件到原生（封装的便捷方法）
   * 原生需要实现 native.onJsMessage 方法来接收
   */
  const send = useCallback(<T = unknown>(event: string, data?: T) => {
    const message = { event, data, pageId, timestamp: Date.now() }
    log('INFO', `发送事件: ${event}`, data)
    
    if (dsBridge.hasNativeMethod('native.onJsMessage')) {
      dsBridge.call('native.onJsMessage', message)
    } else {
      log('WARN', '原生方法 native.onJsMessage 不存在，事件未发送')
    }
  }, [log, pageId])

  /**
   * 检查原生方法是否存在
   */
  const hasNativeMethod = useCallback((method: string, type?: 'all' | 'asyn' | 'syn') => {
    return dsBridge.hasNativeMethod(method, type)
  }, [])

  return {
    /** 通信层是否就绪 */
    isReady,
    /** 注册同步方法供原生调用 */
    register,
    /** 注册异步方法供原生调用 */
    registerAsync,
    /** 调用原生同步方法 */
    callNative,
    /** 调用原生异步方法 */
    callNativeAsync,
    /** 发送事件到原生 */
    send,
    /** 检查原生方法是否存在 */
    hasNativeMethod,
    /** 直接访问 dsBridge 实例（高级用法） */
    bridge: dsBridge,
  }
}

export type { UseDSBridgeOptions }
