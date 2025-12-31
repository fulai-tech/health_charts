// @ts-nocheck
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { SLEEP_COLORS } from '@/config/theme'

// =======================
// 类型定义
// =======================
export interface SleepSegment {
  stage: string
  start: string
  end: string
}

export interface SleepStructureChartProps {
  data: SleepSegment[]
  height?: number
  colors?: Record<string, string>
  className?: string
}

// =======================
// 常量与配置
// =======================
const FALLBACK_COLORS: Record<string, string> = {
  deep: '#6366f1',
  light: '#a5b4fc',
  rem: '#e0e7ff',
  awake: '#f97316',
}

const LAYOUT = {
  paddingTop: 20,
  paddingBottom: 30,
  paddingLeft: 60,
  paddingRight: 20,
  blockHeight: 40,      // 色块的高度
  baseRadius: 12,
  lineWidth: 6,
  bufferLong: 5,
  bufferShort: 1,
}

const STAGES = [
  { key: 'awake', label: 'Awake', order: 0 },
  { key: 'rem', label: 'REM', order: 1 },
  { key: 'light', label: 'Light', order: 2 },
  { key: 'deep', label: 'Deep', order: 3 },
]

// =======================
// 辅助函数
// =======================
const timeToTimestamp = (time: string, baseDate: Date = new Date('2024-01-01')): number => {
  const [h, m] = time.split(':').map(Number)
  const date = new Date(baseDate)
  date.setHours(h, m, 0, 0)
  if (h < 12) date.setDate(date.getDate() + 1)
  return date.getTime()
}

const calculateSmartRadii = (
  currentOrder: number,
  prevOrder: number | null,
  nextOrder: number | null,
  prevConnected: boolean,
  nextConnected: boolean
) => {
  const r = LAYOUT.baseRadius
  const radii = { tl: r, tr: r, br: r, bl: r }

  if (prevConnected && prevOrder !== null) {
    if (prevOrder < currentOrder) radii.tl = 0
    else if (prevOrder > currentOrder) radii.bl = 0
  }
  if (nextConnected && nextOrder !== null) {
    if (nextOrder < currentOrder) radii.tr = 0
    else if (nextOrder > currentOrder) radii.br = 0
  }
  return radii
}

// =======================
// 主组件
// =======================
export const SleepStructureChart: React.FC<SleepStructureChartProps> = ({
  data,
  height = 320,
  colors = SLEEP_COLORS || FALLBACK_COLORS,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    visible: boolean
    segment: SleepSegment | null
    duration: number
  }>({
    x: 0,
    y: 0,
    visible: false,
    segment: null,
    duration: 0
  })
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // 1. 数据预处理
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []

    const baseDate = new Date('2024-01-01')
    const sorted = [...data].sort((a, b) =>
      timeToTimestamp(a.start, baseDate) - timeToTimestamp(b.start, baseDate)
    )

    return sorted.map((segment, index) => {
      const startTime = timeToTimestamp(segment.start, baseDate)
      const endTime = timeToTimestamp(segment.end, baseDate)
      const stageInfo = STAGES.find(s => s.key === segment.stage)!

      const prevSeg = index > 0 ? sorted[index - 1] : null
      const nextSeg = index < sorted.length - 1 ? sorted[index + 1] : null
      const prevStage = prevSeg ? STAGES.find(s => s.key === prevSeg.stage) : null
      const nextStage = nextSeg ? STAGES.find(s => s.key === nextSeg.stage) : null

      const prevConnected = Boolean(prevSeg && prevStage && prevSeg.stage !== segment.stage && timeToTimestamp(prevSeg.end, baseDate) === startTime)
      const nextConnected = Boolean(nextSeg && nextStage && nextSeg.stage !== segment.stage && timeToTimestamp(nextSeg.start, baseDate) === endTime)

      const radii = calculateSmartRadii(stageInfo.order, prevStage?.order ?? null, nextStage?.order ?? null, prevConnected, nextConnected)

      return {
        ...segment,
        startTime,
        endTime,
        duration: Math.round((endTime - startTime) / 1000 / 60),
        stageInfo,
        prevStageInfo: prevStage,
        prevConnected,
        nextConnected,
        radii,
      }
    })
  }, [data])

  // 2. 核心绘制逻辑
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !processedData.length) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const { width, height: cssHeight } = canvasSize

    canvas.width = width * dpr
    canvas.height = cssHeight * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, cssHeight)

    // --- 绘图区域参数计算 ---
    const drawWidth = width - LAYOUT.paddingLeft - LAYOUT.paddingRight

    const minTime = processedData[0].startTime
    const maxTime = processedData[processedData.length - 1].endTime
    const totalTime = maxTime - minTime

    const getX = (t: number) => LAYOUT.paddingLeft + ((t - minTime) / totalTime) * drawWidth

    const availableHeight = cssHeight - LAYOUT.paddingTop - LAYOUT.paddingBottom
    const rowHeight = availableHeight / STAGES.length
    const getYCenter = (order: number) => LAYOUT.paddingTop + (order * rowHeight) + (rowHeight / 2)

    // --- Step A: 背景网格和文字 (共享边界线方案) ---
    ctx.font = '12px sans-serif'
    ctx.textBaseline = 'middle'

    // 1. 先画所有的水平虚线 (共 N+1 条)
    // 这样每个区间就被两条线完美包围,且相邻区间共享中间那条线
    ctx.beginPath()
    ctx.strokeStyle = '#e2e8f0'
    ctx.setLineDash([4, 4])
    ctx.lineWidth = 1

    // 从 0 循环到 STAGES.length,画出每一行的边界
    for (let i = 0; i <= STAGES.length; i++) {
      // 计算边界线的 Y 坐标
      // 0 是第一行的顶线,1 是第一行的底线/第二行的顶线...
      const yLine = LAYOUT.paddingTop + (i * rowHeight)

      ctx.moveTo(LAYOUT.paddingLeft, yLine)
      ctx.lineTo(width - LAYOUT.paddingRight, yLine)
    }
    ctx.stroke()
    ctx.setLineDash([]) // 重置虚线设置

    // 2. 再画文字 (保持在行中间)
    STAGES.forEach((stage) => {
      const yCenter = getYCenter(stage.order)

      ctx.fillStyle = '#64748b'
      ctx.textAlign = 'right'
      ctx.fillText(stage.label, LAYOUT.paddingLeft - 15, yCenter)
    })

    // --- Step B: 连接线 (Silk Gradient) ---
    processedData.forEach((item) => {
      if (item.prevConnected && item.prevStageInfo) {
        const boundaryX = getX(item.startTime)
        const currY = getYCenter(item.stageInfo.order)
        const prevY = getYCenter(item.prevStageInfo.order)

        const currColor = colors[item.stage] || colors.light
        const prevColor = colors[item.prevStageInfo.key] || colors.light

        const totalDist = Math.abs(currY - prevY)
        const halfBlock = LAYOUT.blockHeight / 2

        if (totalDist > 1) {
          const isAdjacent = Math.abs(item.stageInfo.order - item.prevStageInfo.order) === 1
          const bufferSize = isAdjacent ? LAYOUT.bufferShort : LAYOUT.bufferLong
          let solidPixels = halfBlock + bufferSize
          if (solidPixels * 2 > totalDist) solidPixels = totalDist * 0.45

          const isGoingDown = currY > prevY
          const topY = Math.min(prevY, currY)
          const bottomY = Math.max(prevY, currY)
          const topColor = isGoingDown ? prevColor : currColor
          const bottomColor = isGoingDown ? currColor : prevColor

          const grad = ctx.createLinearGradient(0, topY, 0, bottomY)
          const stop1 = solidPixels / totalDist
          const stop2 = 1 - stop1

          grad.addColorStop(0, topColor)
          grad.addColorStop(stop1, topColor)
          grad.addColorStop(stop2, bottomColor)
          grad.addColorStop(1, bottomColor)

          ctx.fillStyle = grad
          ctx.fillRect(
            boundaryX - LAYOUT.lineWidth / 2,
            topY,
            LAYOUT.lineWidth,
            bottomY - topY
          )
        }
      }
    })

    // --- Step C: 色块 ---
    // 逻辑不变，因为色块是基于 yCenter 居中绘制的。
    // 只要 LAYOUT.trackHeight >= LAYOUT.blockHeight，色块就会自然地显示在两条平行线中间。
    processedData.forEach((item) => {
      const xStart = getX(item.startTime)
      const xEnd = getX(item.endTime)
      const yCenter = getYCenter(item.stageInfo.order)
      const blockW = Math.max(xEnd - xStart, 1)

      let drawX = xStart
      let drawW = blockW
      const overlap = LAYOUT.lineWidth / 2

      if (item.prevConnected && (item.radii.tl === 0 || item.radii.bl === 0)) {
        drawX -= overlap
        drawW += overlap
      }
      if (item.nextConnected && (item.radii.tr === 0 || item.radii.br === 0)) {
        drawW += overlap
      }

      const rectY = yCenter - LAYOUT.blockHeight / 2

      ctx.fillStyle = colors[item.stage] || colors.light
      ctx.beginPath()

      const { tl, tr, br, bl } = item.radii
      const x = drawX, y = rectY, w = drawW, h = LAYOUT.blockHeight

      ctx.moveTo(x + tl, y)
      ctx.lineTo(x + w - tr, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + tr)
      ctx.lineTo(x + w, y + h - br)
      ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h)
      ctx.lineTo(x + bl, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - bl)
      ctx.lineTo(x, y + tl)
      ctx.quadraticCurveTo(x, y, x + tl, y)

      ctx.closePath()
      ctx.fill()
    })

    // --- Step D: X 轴刻度 ---
    const startHour = new Date(minTime).getHours()
    const endHour = new Date(maxTime).getHours() + (new Date(maxTime).getDate() !== new Date(minTime).getDate() ? 24 : 0)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px sans-serif'

    for (let h = startHour; h <= endHour; h++) {
      const date = new Date(minTime)
      date.setHours(h, 0, 0, 0)
      if (date.getTime() < minTime) date.setDate(date.getDate() + 1)

      const tickX = getX(date.getTime())
      if (tickX >= LAYOUT.paddingLeft && tickX <= width - LAYOUT.paddingRight) {
        const label = `${h % 24}`.padStart(2, '0') + ':00'
        ctx.fillText(label, tickX, cssHeight - 10)

        ctx.beginPath()
        ctx.moveTo(tickX, cssHeight - 25)
        ctx.lineTo(tickX, cssHeight - 20)
        ctx.stroke()
      }
    }

  }, [canvasSize, colors, processedData])

  // 3. Resize Observer
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setCanvasSize({ width, height })
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // 4. Trigger Draw
  useEffect(() => {
    draw()
  }, [draw])

  // 5. Interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const mouseX = e.clientX - rect.left

    const { width } = canvasSize
    const drawWidth = width - LAYOUT.paddingLeft - LAYOUT.paddingRight
    if (drawWidth <= 0 || !processedData.length) return

    if (mouseX < LAYOUT.paddingLeft || mouseX > width - LAYOUT.paddingRight) {
      setTooltip(prev => ({ ...prev, visible: false }))
      return
    }

    const minTime = processedData[0].startTime
    const totalTime = processedData[processedData.length - 1].endTime - minTime

    const ratio = (mouseX - LAYOUT.paddingLeft) / drawWidth
    const hoverTime = minTime + ratio * totalTime

    const found = processedData.find(item => hoverTime >= item.startTime && hoverTime <= item.endTime)

    if (found) {
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        visible: true,
        segment: found,
        duration: found.duration
      })
    } else {
      setTooltip(prev => ({ ...prev, visible: false }))
    }
  }

  const handleMouseLeave = () => setTooltip(prev => ({ ...prev, visible: false }))

  return (
    <div ref={containerRef} className={`relative w-full transform-gpu will-change-transform ${className}`} style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {typeof document !== 'undefined' && createPortal(
        (() => {
          const { x, y, visible, segment, duration } = tooltip
          // If no segment has ever been hovered, don't render anything
          if (!segment) return null

          const winW = typeof window !== 'undefined' ? window.innerWidth : 1000
          const winH = typeof window !== 'undefined' ? window.innerHeight : 800

          const isRight = x > winW / 2
          const isBottom = y > winH / 2

          const xOffset = isRight ? -15 : 15
          const yOffset = isBottom ? -15 : 15
          const xPercent = isRight ? '-100%' : '0%'
          const yPercent = isBottom ? '-100%' : '0%'

          return (
            <div
              className={`fixed z-50 pointer-events-none bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl rounded-lg p-3 text-sm transition-all duration-200 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              style={{
                left: 0,
                top: 0,
                transform: `translate3d(${x}px, ${y}px, 0) translate(${xOffset}px, ${yOffset}px) translate(${xPercent}, ${yPercent})`,
              }}
            >
              <div className="font-semibold text-slate-800 mb-1">
                {STAGES.find(s => s.key === segment.stage)?.label}
              </div>
              <div className="text-slate-500 text-xs tabular-nums">
                {segment.start} - {segment.end}
              </div>
              <div className="text-slate-500 text-xs mt-1">
                Duration: {duration} min
              </div>
              <div
                className="absolute left-0 top-3 w-1 h-4 rounded-r"
                style={{ backgroundColor: colors[segment.stage] }}
              />
            </div>
          )
        })(),
        document.body
      )}
    </div >
  )
}

export default SleepStructureChart