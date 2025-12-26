/**
 * useInViewport Hook
 * 
 * Detects whether an element is visible in the viewport using IntersectionObserver.
 * Optimized for lazy loading charts to improve performance.
 * 
 * @example
 * ```tsx
 * const { ref, isInViewport, hasBeenInViewport } = useInViewport({
 *   threshold: 0.1,
 *   rootMargin: '50px'
 * })
 * 
 * return (
 *   <div ref={ref}>
 *     {hasBeenInViewport && <Chart />}
 *   </div>
 * )
 * ```
 */

import { useEffect, useRef, useState } from 'react'

export interface UseInViewportOptions {
    /** Threshold for intersection (0-1), default 0.1 means 10% visible */
    threshold?: number
    /** Root margin for early/late triggering, e.g. '50px' loads 50px before visible */
    rootMargin?: string
    /** Root element for intersection, default is viewport */
    root?: Element | null
    /** Whether to trigger only once, default true for lazy loading */
    triggerOnce?: boolean
}

export interface UseInViewportResult {
    /** Ref to attach to the target element */
    ref: React.RefObject<HTMLDivElement | null>
    /** Whether element is currently in viewport */
    isInViewport: boolean
    /** Whether element has ever been in viewport (persists after leaving) */
    hasBeenInViewport: boolean
}

/**
 * Hook to detect if element is in viewport
 */
export function useInViewport(options: UseInViewportOptions = {}): UseInViewportResult {
    const {
        threshold = 0.1,
        rootMargin = '50px',
        root = null,
        triggerOnce = true,
    } = options

    const ref = useRef<HTMLDivElement>(null)
    const [isInViewport, setIsInViewport] = useState(false)
    const [hasBeenInViewport, setHasBeenInViewport] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        // If already triggered and triggerOnce is true, skip observer
        if (triggerOnce && hasBeenInViewport) return

        // Create intersection observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const inView = entry.isIntersecting
                    setIsInViewport(inView)

                    // Mark as having been in viewport
                    if (inView && !hasBeenInViewport) {
                        setHasBeenInViewport(true)
                    }

                    // If triggerOnce and now in view, disconnect observer
                    if (triggerOnce && inView) {
                        observer.disconnect()
                    }
                })
            },
            {
                threshold,
                rootMargin,
                root,
            }
        )

        observer.observe(element)

        // Cleanup
        return () => {
            observer.disconnect()
        }
    }, [threshold, rootMargin, root, triggerOnce, hasBeenInViewport])

    return {
        ref,
        isInViewport,
        hasBeenInViewport,
    }
}
