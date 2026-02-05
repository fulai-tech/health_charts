/**
 * PPG 信号采集展示 Widget 页面（type-10）
 * 路由: /widget/type-10
 *
 * 功能：
 * - 显示 PPG 信号波形动画（Canvas 绘制）
 * - 网格背景向左滚动
 * - 右侧发光点随信号上下波动
 * - Android 通过 page-widget-ppg-start 控制测量开始
 * - Android 通过 page-widget-ppg-stop 控制测量结束
 * - 30s 倒计时显示，每次重新开始都会重置
 * - Start 按钮仅在测试环境显示（IS_TEST_ENV = true）
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { widgetBGColor } from '@/config/theme'
import { IS_TEST_ENV } from '@/config/config'

// ============================================
// 类型定义
// ============================================

type MeasureStatus = 'idle' | 'measuring' | 'completed'

interface _PPGData {
  values: number[]
}

// ============================================
// 配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'widget-ppg',
  pageName: 'PPG信号采集',
  type: 10,
} as const

/** PPG 信号颜色配置 */
const PPG_COLORS = {
  /** 信号线颜色 - 粉红色 */
  line: 'rgba(248, 113, 113, 1)',
  /** 信号填充渐变起始色 */
  fillStart: 'rgba(248, 113, 113, 0.3)',
  /** 信号填充渐变结束色 */
  fillEnd: 'rgba(248, 113, 113, 0.05)',
  /** 网格线颜色 */
  grid: 'rgba(200, 200, 200, 0.3)',
  /** 发光点颜色 */
  glowPoint: 'rgba(255, 255, 255, 1)',
  /** 发光点光晕颜色 */
  glowHalo: 'rgba(248, 113, 113, 0.6)',
  /** 进度环颜色 */
  progressRing: 'rgb(251, 146, 61)',
  /** 进度环背景色 */
  progressBg: 'rgba(251, 146, 61, 0.2)',
} as const

/** 动画配置 */
const ANIMATION_CONFIG = {
  /** 数据更新间隔 (ms) */
  dataInterval: 10,
  /** 网格滚动速度 (px/frame) */
  gridSpeed: 1,
  /** 网格间距 (px) */
  gridSpacing: 30,
  /** 最大测量时间 (s) */
  maxDuration: 30,
  /** 循环周期 (s) */
  loopDuration: 10,
  /** 目标帧率 (fps) - 低端设备优化 */
  targetFPS: 60,
} as const

// ============================================
// 模拟 PPG 数据
// ============================================

/** 真实 PPG 数据样本（用于模拟） */
const SAMPLE_PPG_DATA: number[][] = [
  [-108, -106, -89, -52, 0, 53, 96, 113, 101, 62, 11, -37, -74, -93, -95, -89, -77, -67, -56, -49, -42, -38, -39, -46, -56, -67, -76, -85, -91, -95, -96, -96, -94, -90, -87, -83, -82, -82, -81, -79, -78, -76, -76, -77, -81, -84, -87, -88, -87, -85, -83, -83, -83, -83, -82, -83, -82, -82, -84, -88, -96, -103, -103, -90],
  [-59, -14, 39, 87, 117, 120, 93, 47, -3, -47, -75, -85, -82, -73, -64, -58, -56, -52, -50, -49, -50, -54, -61, -71, -82, -89, -93, -94, -93, -91, -88, -86, -83, -81, -78, -77, -76, -76, -76, -75, -74, -74, -74, -75, -76, -80, -83, -86, -88, -89, -90, -90, -89, -87, -85, -86, -90, -97, -100, -92, -69, -25, 27, 80],
  [104, 112, 92, 51, 0, -45, -78, -94, -95, -87, -76, -66, -57, -50, -46, -44, -46, -52, -60, -69, -76, -84, -88, -90, -91, -90, -89, -88, -87, -85, -83, -80, -76, -74, -71, -72, -74, -77, -81, -84, -86, -87, -86, -85, -84, -83, -82, -83, -87, -94, -101, -103, -92, -66, -21, 31, 81, 114, 119, 95, 49, -6, -55, -89],
]

/**
 * 生成平滑循环的模拟 PPG 数据
 * 10s 循环，确保首尾衔接平滑
 */
function generateSimulatedPPGData(): number[] {
  const result: number[] = []
  const totalPoints = ANIMATION_CONFIG.loopDuration * 1000 / ANIMATION_CONFIG.dataInterval // 10s / 10ms = 1000 points

  // 将样本数据展开并重复填充
  const flatSamples = SAMPLE_PPG_DATA.flat()
  const sampleLength = flatSamples.length

  for (let i = 0; i < totalPoints; i++) {
    const sampleIndex = i % sampleLength
    result.push(flatSamples[sampleIndex])
  }

  // 平滑首尾衔接：对最后 20 个点进行插值过渡
  const transitionLength = 20
  const startValue = result[0]
  const endValue = result[result.length - transitionLength]

  for (let i = 0; i < transitionLength; i++) {
    const t = i / transitionLength
    const targetIndex = result.length - transitionLength + i
    result[targetIndex] = Math.round(endValue * (1 - t) + startValue * t)
  }

  return result
}

// ============================================
// Canvas 绘制 Hook（性能优化版）
// ============================================

interface UsePPGCanvasOptions {
  isRunning: boolean
  ppgData: number[]
}

/**
 * 环形缓冲区 - 避免 shift() 的 O(n) 开销
 */
class RingBuffer {
  private buffer: number[]
  private head = 0
  private tail = 0
  private _length = 0
  private capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
    this.buffer = new Array(capacity)
  }

  push(value: number) {
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) % this.capacity
    if (this._length < this.capacity) {
      this._length++
    } else {
      this.head = (this.head + 1) % this.capacity
    }
  }

  get(index: number): number {
    return this.buffer[(this.head + index) % this.capacity]
  }

  get length(): number {
    return this._length
  }

  clear() {
    this.head = 0
    this.tail = 0
    this._length = 0
  }
}

function usePPGCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UsePPGCanvasOptions
) {
  const { isRunning, ppgData } = options
  const animationRef = useRef<number>(0)
  const gridOffsetRef = useRef(0)
  const dataIndexRef = useRef(0)
  const displayDataRef = useRef<RingBuffer | null>(null)
  const lastUpdateRef = useRef(0)
  const lastFrameRef = useRef(0)

  // 缓存渐变对象
  const gradientsRef = useRef<{
    fill: CanvasGradient | null
    glow: CanvasGradient | null
  }>({ fill: null, glow: null })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // 设置 canvas 尺寸
    const dpr = Math.min(window.devicePixelRatio || 1, 2) // 限制最大 DPR 为 2
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const centerY = height / 2
    const amplitude = height / 3
    const maxValue = 130
    const maxDisplayPoints = Math.floor(width / 2)

    // 帧率控制
    const frameInterval = 1000 / ANIMATION_CONFIG.targetFPS

    // 初始化环形缓冲区
    if (!displayDataRef.current) {
      displayDataRef.current = new RingBuffer(maxDisplayPoints)
    }

    // 预创建渐变（只创建一次）
    const fillGradient = ctx.createLinearGradient(0, 0, 0, height)
    fillGradient.addColorStop(0, PPG_COLORS.fillStart)
    fillGradient.addColorStop(1, PPG_COLORS.fillEnd)
    gradientsRef.current.fill = fillGradient

    /** 绘制网格背景 */
    function drawGrid(offset: number) {
      if (!ctx) return
      ctx.strokeStyle = PPG_COLORS.grid
      ctx.lineWidth = 1

      const spacing = ANIMATION_CONFIG.gridSpacing
      const adjustedOffset = offset % spacing

      // 使用 Path2D 批量绘制（减少 draw call）
      ctx.beginPath()

      // 垂直线
      for (let x = -adjustedOffset; x < width + spacing; x += spacing) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }

      // 水平线
      for (let y = 0; y < height; y += spacing) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }

      ctx.stroke()
    }

    /** 绘制 PPG 波形（优化版：单次遍历） */
    function drawWaveform(ringBuffer: RingBuffer) {
      if (!ctx || ringBuffer.length < 2) return

      const dataLength = ringBuffer.length

      // 构建路径（单次遍历）
      ctx.beginPath()

      let lastX = 0
      let lastY = centerY

      for (let i = 0; i < dataLength; i++) {
        const value = ringBuffer.get(i)
        const x = (i / dataLength) * width
        const normalizedValue = value / maxValue
        const y = centerY - normalizedValue * amplitude

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        lastX = x
        const _lastY = y
      }

      // 绘制描边
      ctx.strokeStyle = PPG_COLORS.line
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.stroke()

      // 绘制填充（复用路径）
      ctx.lineTo(lastX, centerY)
      ctx.lineTo(0, centerY)
      ctx.closePath()
      ctx.fillStyle = gradientsRef.current.fill!
      ctx.fill()

      // 绘制发光点
      if (dataLength > 0) {
        const lastValue = ringBuffer.get(dataLength - 1)
        const pointX = width - 10
        const normalizedValue = lastValue / maxValue
        const pointY = centerY - normalizedValue * amplitude

        // 简化的发光效果（减少渐变创建）
        ctx.beginPath()
        ctx.arc(pointX, pointY, 12, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(248, 113, 113, 0.3)'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(pointX, pointY, 6, 0, Math.PI * 2)
        ctx.fillStyle = PPG_COLORS.glowPoint
        ctx.fill()
        ctx.strokeStyle = PPG_COLORS.line
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    /** 动画循环（帧率控制） */
    function animate(timestamp: number) {
      if (!ctx) return

      // 帧率控制
      const elapsed = timestamp - lastFrameRef.current
      if (elapsed < frameInterval) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastFrameRef.current = timestamp - (elapsed % frameInterval)

      // 清空画布（使用背景色填充代替 clearRect，避免透明合成）
      ctx.fillStyle = '#F8FAFC' // slate-50
      ctx.fillRect(0, 0, width, height)

      // 绘制网格
      gridOffsetRef.current += ANIMATION_CONFIG.gridSpeed * (elapsed / frameInterval)
      drawGrid(gridOffsetRef.current)

      const ringBuffer = displayDataRef.current
      if (isRunning && ppgData.length > 0 && ringBuffer) {
        // 更新数据
        const dataElapsed = timestamp - lastUpdateRef.current
        const pointsToAdd = Math.floor(dataElapsed / ANIMATION_CONFIG.dataInterval)

        if (pointsToAdd > 0) {
          for (let i = 0; i < pointsToAdd; i++) {
            const newValue = ppgData[dataIndexRef.current % ppgData.length]
            ringBuffer.push(newValue)
            dataIndexRef.current++
          }
          lastUpdateRef.current = timestamp
        }
      }

      // 绘制波形
      if (ringBuffer && ringBuffer.length > 0) {
        drawWaveform(ringBuffer)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // 启动动画
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [canvasRef, isRunning, ppgData])

  // 重置显示数据
  const reset = useCallback(() => {
    dataIndexRef.current = 0
    displayDataRef.current?.clear()
    lastUpdateRef.current = 0
    lastFrameRef.current = 0
  }, [])

  return { reset }
}

// ============================================
// 进度环组件
// ============================================

interface ProgressRingProps {
  progress: number // 0-1
  remainingTime: number // 剩余秒数
  size?: number
}

function ProgressRing({ progress, remainingTime, size = 40 }: ProgressRingProps) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={PPG_COLORS.progressBg}
          strokeWidth={strokeWidth}
        />
        {/* 进度圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={PPG_COLORS.progressRing}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <span className="text-sm text-slate-600 font-medium">{remainingTime}s</span>
    </div>
  )
}

// ============================================
// 主组件
// ============================================

/**
 * PPG 信号采集展示 Widget 页面 (Type 10)
 *
 * 路由: /widget/type-10
 *
 * 通信方式：
 * - Android -> JS: NativeBridge.receiveData(jsonString)
 * - JS -> Android: window.android.onJsMessage(jsonString)
 *
 * 事件：
 * - page-widget-ppg-start: Android 发送的开始信号（Android -> JS）
 * - page-widget-ppg-stop: Android 发送的结束信号（Android -> JS）
 */
export function Type10_PPGSignalWidgetPage() {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [status, setStatus] = useState<MeasureStatus>('idle')
  const [remainingTime, setRemainingTime] = useState<number>(ANIMATION_CONFIG.maxDuration)
  const [ppgData] = useState<number[]>(() => generateSimulatedPPGData())

  const timerRef = useRef<number>(0)

  // 初始化原生桥接
  const { onData, send, isReady } = useNativeBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
  })

  // Canvas 绑定
  const { reset: resetCanvas } = usePPGCanvas(canvasRef, {
    isRunning: status === 'measuring',
    ppgData,
  })

  // 计算进度
  const progress = (ANIMATION_CONFIG.maxDuration - remainingTime) / ANIMATION_CONFIG.maxDuration

  // 停止测量（需在 useEffect / handleStart 之前声明，避免 “accessed before declaration”）
  const handleStop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = 0
    }
    setStatus('completed')
    console.log('[PPGSignalWidget] 测量结束')
  }, [])

  // 注册数据接收回调
  useEffect(() => {
    onData((rawData) => {
      console.log('[PPGSignalWidget] 收到原生数据:', rawData)

      // 检查事件类型
      if (typeof rawData === 'object' && rawData !== null) {
        const data = rawData as Record<string, unknown>

        // Android 发送开始信号
        if (data.event === 'page-widget-ppg-start') {
          console.log('[PPGSignalWidget] 收到 Android 开始信号')
          handleStart()
          return
        }

        // Android 发送结束信号
        if (data.event === 'page-widget-ppg-stop') {
          console.log('[PPGSignalWidget] 收到 Android 结束信号')
          handleStop()
          return
        }

        // 处理 PPG 数据
        if (Array.isArray(data.values)) {
          // 未来可以在这里处理真实的 PPG 数据
          console.log('[PPGSignalWidget] 收到 PPG 数据:', data.values.length, '个点')
        }
      }
    })
  }, [onData, handleStop])

  // 开始测量
  const handleStart = useCallback(() => {
    if (status === 'measuring') return

    // 注意：不再发送 click-widget-ppg-start 事件
    // Android 通过发送 page-widget-ppg-start 来控制开始

    // 重置状态
    setStatus('measuring')
    setRemainingTime(ANIMATION_CONFIG.maxDuration)
    resetCanvas()

    // 启动倒计时
    timerRef.current = window.setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          handleStop()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    console.log('[PPGSignalWidget] 开始测量')
  }, [status, resetCanvas, handleStop])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // 重新开始
  const handleRestart = useCallback(() => {
    setStatus('idle')
    setRemainingTime(ANIMATION_CONFIG.maxDuration)
    resetCanvas()
  }, [resetCanvas])

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <div className="w-full max-w-md p-4">
        {/* PPG 信号卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-red-500">
                {t('widgets.type10.title')}
              </h3>
            </div>

            {/* Start 按钮（仅测试环境显示） */}
            {status === 'idle' && IS_TEST_ENV && (
              <button
                onClick={handleStart}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-full transition-colors"
              >
                {t('widgets.type10.start')}
              </button>
            )}

            {/* 测量完成后的重新开始按钮 */}
            {status === 'completed' && (
              <button
                onClick={handleRestart}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-full transition-colors"
              >
                {t('widgets.type10.restart')}
              </button>
            )}
          </div>

          {/* Canvas 波形区域 */}
          <div className="relative w-full h-40 bg-slate-50 rounded-2xl overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ display: 'block' }}
            />

            {/* 空闲状态提示 */}
            {status === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80">
                <p className="text-sm text-slate-400">
                  {IS_TEST_ENV
                    ? t('widgets.type10.idleHint')
                    : t('widgets.type10.placeFinger')}
                </p>
              </div>
            )}
          </div>

          {/* 底部状态栏 */}
          <div className="flex items-center justify-between mt-4">
            {/* 进度环和倒计时 */}
            {status === 'measuring' ? (
              <ProgressRing progress={progress} remainingTime={remainingTime} />
            ) : (
              <div className="w-10" /> // 占位
            )}

            {/* 状态文字 */}
            <p className="text-sm text-slate-500">
              {status === 'idle' && t('widgets.type10.statusIdle')}
              {status === 'measuring' && t('widgets.type10.statusMeasuring')}
              {status === 'completed' && t('widgets.type10.statusCompleted')}
            </p>
          </div>
        </div>

        {/* 调试信息（仅开发环境） */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'}
          </div>
        )}
      </div>
    </WidgetLayout>
  )
}
