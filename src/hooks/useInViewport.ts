/**
 * useInViewport: IntersectionObserver-based visibility for lazy loading.
 *
 * @example
 * const { ref, isInViewport, hasBeenInViewport } = useInViewport({ threshold: 0.1, rootMargin: '50px' })
 * return <div ref={ref}>{hasBeenInViewport && <Chart />}</div>
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import { parseUnitInterval } from '@/hooks/core'

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

const DEFAULT_THRESHOLD = 0.1
const DEFAULT_ROOT_MARGIN = '50px'

function normalizeInViewportOptions(options: UseInViewportOptions = {}): Required<Pick<UseInViewportOptions, 'threshold' | 'rootMargin' | 'triggerOnce'>> & Pick<UseInViewportOptions, 'root'> {
  const thresholdResult = parseUnitInterval(options.threshold)
  const threshold = thresholdResult.ok ? thresholdResult.value : DEFAULT_THRESHOLD
  const rootMargin = typeof options.rootMargin === 'string' && options.rootMargin.trim() !== ''
    ? options.rootMargin.trim()
    : DEFAULT_ROOT_MARGIN
  const root = options.root ?? null
  const triggerOnce = options.triggerOnce !== false
  return { threshold, rootMargin, root, triggerOnce }
}

/**
 * Hook to detect if element is in viewport
 */
export function useInViewport(options: UseInViewportOptions = {}): UseInViewportResult {
  const { threshold, rootMargin, root, triggerOnce } = useMemo(
    () => normalizeInViewportOptions(options),
    [options?.threshold, options?.rootMargin, options?.root, options?.triggerOnce]
  )

  const ref = useRef<HTMLDivElement>(null)
  const [isInViewport, setIsInViewport] = useState(false)
  const [hasBeenInViewport, setHasBeenInViewport] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (triggerOnce && hasBeenInViewport) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting
          setIsInViewport(inView)

          if (inView && !hasBeenInViewport) {
            setHasBeenInViewport(true)
          }

          if (triggerOnce && inView) {
            observer.disconnect()
          }
        })
      },
      { threshold, rootMargin, root }
    )

    observer.observe(element)

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
