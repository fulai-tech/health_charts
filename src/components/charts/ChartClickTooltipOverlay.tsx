/**
 * ChartClickTooltipOverlay
 *
 * 可复用的「仅点击触发 tooltip」遮罩层：拦截 hover/滑动，点击时派发 mousemove 让 Recharts 显示 tooltip，
 * 点击图表外派发 mouseleave 关闭 tooltip。与 Recharts 的 ResponsiveContainer + Tooltip 配合使用。
 *
 * 使用方式：在图表容器（含 ResponsiveContainer）的同一层、用 relative 包一层，内部放本组件并传入该容器的 ref。
 *
 * @example
 * ```tsx
 * const chartContainerRef = useHideTooltipOnScroll<HTMLDivElement>()
 * return (
 *   <div ref={chartContainerRef} className="relative ...">
 *     <ResponsiveContainer>...</ResponsiveContainer>
 *     <ChartClickTooltipOverlay containerRef={chartContainerRef} />
 *   </div>
 * )
 * ```
 */

import { memo, useEffect } from 'react'

export interface ChartClickTooltipOverlayProps {
  /** 图表容器 ref（与包裹 ResponsiveContainer 的 div 一致） */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** 可选 className 追加到遮罩 div */
  className?: string
}

const ChartClickTooltipOverlayInner = ({
  containerRef,
  className = '',
}: ChartClickTooltipOverlayProps) => {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const wrapper = containerRef.current?.querySelector('.recharts-wrapper')
      if (
        wrapper &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        wrapper.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false, view: window }))
        wrapper.dispatchEvent(
          new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body, view: window })
        )
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [containerRef])

  return (
    <div
      className={`absolute inset-0 cursor-pointer ${className}`.trim()}
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        const wrapper = containerRef.current?.querySelector('.recharts-wrapper')
        if (wrapper) {
          wrapper.dispatchEvent(
            new MouseEvent('mousemove', {
              clientX: e.clientX,
              clientY: e.clientY,
              bubbles: true,
              cancelable: true,
              view: window,
            })
          )
        }
      }}
      aria-hidden
    />
  )
}

ChartClickTooltipOverlayInner.displayName = 'ChartClickTooltipOverlay'
export const ChartClickTooltipOverlay = memo(ChartClickTooltipOverlayInner)
