/**
 * useHideTooltipOnScroll Hook
 * 
 * A custom hook that hides Recharts tooltips when the page is scrolled.
 * This solves the common issue where tooltips remain visible during scroll
 * in WebView or mobile environments.
 * 
 * @example
 * ```tsx
 * const chartContainerRef = useHideTooltipOnScroll<HTMLDivElement>()
 * 
 * return (
 *   <div ref={chartContainerRef}>
 *     <ResponsiveContainer>
 *       <ComposedChart>
 *         <Tooltip />
 *       </ComposedChart>
 *     </ResponsiveContainer>
 *   </div>
 * )
 * ```
 */

import { useRef, useEffect, useCallback } from 'react'

/**
 * Hook to hide tooltips when page scrolls
 * Returns a ref that should be attached to the chart container element
 */
export function useHideTooltipOnScroll<T extends HTMLElement>(): React.RefObject<T | null> {
    const containerRef = useRef<T | null>(null)

    const hideTooltip = useCallback(() => {
        if (containerRef.current) {
            // Create a synthetic mouse event to move the mouse out of the chart area
            // This triggers Recharts' internal tooltip hiding logic
            const mouseOutEvent = new MouseEvent('mouseout', {
                bubbles: true,
                cancelable: true,
                view: window,
                relatedTarget: document.body, // Indicates mouse moved to body
            })

            // Create mouseleave event as well
            const mouseLeaveEvent = new MouseEvent('mouseleave', {
                bubbles: false,
                cancelable: true,
                view: window,
            })

            // Trigger on the recharts wrapper which handles the tooltip state
            const rechartsWrapper = containerRef.current.querySelector('.recharts-wrapper')
            if (rechartsWrapper) {
                rechartsWrapper.dispatchEvent(mouseOutEvent)
                rechartsWrapper.dispatchEvent(mouseLeaveEvent)
            }

            // Also trigger on the surface which handles mouse events
            const surface = containerRef.current.querySelector('.recharts-surface')
            if (surface) {
                surface.dispatchEvent(mouseOutEvent)
                surface.dispatchEvent(mouseLeaveEvent)
            }
        }
    }, [])

    useEffect(() => {
        // Use capture phase to catch scroll events from any container
        const handleScroll = () => {
            hideTooltip()
        }

        // Listen to scroll events on window with capture to catch all scroll events
        window.addEventListener('scroll', handleScroll, true)

        // Also listen to touchmove for mobile scrolling
        window.addEventListener('touchmove', handleScroll, true)

        // Listen to wheel events as a backup (some containers use this)
        window.addEventListener('wheel', handleScroll, true)

        return () => {
            window.removeEventListener('scroll', handleScroll, true)
            window.removeEventListener('touchmove', handleScroll, true)
            window.removeEventListener('wheel', handleScroll, true)
        }
    }, [hideTooltip])

    return containerRef
}

export default useHideTooltipOnScroll
