import { useRef, useCallback } from 'react'
import type { TouchEvent, RefObject } from 'react'

// ============================================
// Configuration - Easy to modify
// ============================================

/** Minimum horizontal distance (px) required to trigger a swipe */
const SWIPE_THRESHOLD = 50

/** 
 * Ratio threshold: horizontal distance must be greater than vertical distance 
 * multiplied by this value to be considered a horizontal swipe 
 */
const HORIZONTAL_RATIO = 1.2

/**
 * Data attribute name to mark elements that should ignore page-level swipe.
 * Add `data-swipe-ignore` to any element (e.g., carousel, chart) to prevent
 * page-level navigation when swiping within that element.
 */
const SWIPE_IGNORE_ATTR = 'data-swipe-ignore'

/**
 * Check if the touch target or any of its ancestors has the swipe-ignore attribute.
 * This prevents page-level swipe when user is interacting with nested swipeable components.
 */
function shouldIgnoreSwipe(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false
  
  // Check if target or any ancestor has the swipe-ignore attribute
  return target.closest(`[${SWIPE_IGNORE_ATTR}]`) !== null
}

// ============================================
// Types
// ============================================

export interface UseSwipeNavigationOptions {
  /** Callback when user swipes left (→ navigate to next week) */
  onSwipeLeft?: () => void
  /** Callback when user swipes right (→ navigate to previous week) */
  onSwipeRight?: () => void
  /** Whether left swipe is allowed (default: true) */
  canSwipeLeft?: boolean
  /** Whether right swipe is allowed (default: true) */
  canSwipeRight?: boolean
}

export interface UseSwipeNavigationReturn {
  /** Ref to attach to the swipeable container element */
  containerRef: RefObject<HTMLDivElement | null>
  /** Touch event handlers to spread on the container */
  swipeHandlers: {
    onTouchStart: (e: TouchEvent<HTMLDivElement>) => void
    onTouchMove: (e: TouchEvent<HTMLDivElement>) => void
    onTouchEnd: () => void
  }
}

/**
 * useSwipeNavigation - Touch swipe detection for page-level navigation
 * 
 * Detects horizontal swipe gestures and triggers navigation callbacks.
 * Only works on touch devices (mobile/tablet).
 * 
 * @param options - Swipe configuration and callbacks
 * @returns containerRef and swipeHandlers to attach to the page container
 * 
 * @example
 * const { containerRef, swipeHandlers } = useSwipeNavigation({
 *   onSwipeLeft: goToNextWeek,
 *   onSwipeRight: goToPreviousWeek,
 *   canSwipeLeft: canGoNext,
 *   canSwipeRight: true,
 * })
 * 
 * return (
 *   <div ref={containerRef} {...swipeHandlers}>
 *     {content}
 *   </div>
 * )
 */
export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft = true,
  canSwipeRight = true,
}: UseSwipeNavigationOptions = {}): UseSwipeNavigationReturn {
  const containerRef = useRef<HTMLDivElement>(null)

  // Touch state refs (using refs to avoid re-renders)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const touchEndY = useRef<number>(0)
  const isSwiping = useRef<boolean>(false)
  const isIgnored = useRef<boolean>(false)

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    // Check if touch started within an ignored area (carousel, chart, etc.)
    isIgnored.current = shouldIgnoreSwipe(e.target)
    if (isIgnored.current) return

    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    touchEndX.current = touch.clientX
    touchEndY.current = touch.clientY
    isSwiping.current = false
  }, [])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    // Skip if this touch sequence is ignored
    if (isIgnored.current) return

    const touch = e.touches[0]
    touchEndX.current = touch.clientX
    touchEndY.current = touch.clientY

    const diffX = Math.abs(touch.clientX - touchStartX.current)
    const diffY = Math.abs(touch.clientY - touchStartY.current)

    // Mark as swiping if horizontal movement is dominant
    if (diffX > diffY * HORIZONTAL_RATIO && diffX > 10) {
      isSwiping.current = true
    }
  }, [])

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    // Skip if this touch sequence is ignored
    if (isIgnored.current) {
      isIgnored.current = false
      return
    }

    if (!isSwiping.current) return

    const diffX = touchEndX.current - touchStartX.current
    const diffY = Math.abs(touchEndY.current - touchStartY.current)
    const absDiffX = Math.abs(diffX)

    // Only trigger if:
    // 1. Horizontal distance exceeds threshold
    // 2. Horizontal movement is dominant
    if (absDiffX >= SWIPE_THRESHOLD && absDiffX > diffY * HORIZONTAL_RATIO) {
      if (diffX > 0 && canSwipeRight) {
        // Swipe right → go to previous week
        onSwipeRight?.()
      } else if (diffX < 0 && canSwipeLeft) {
        // Swipe left → go to next week
        onSwipeLeft?.()
      }
    }

    // Reset state
    isSwiping.current = false
    touchStartX.current = 0
    touchStartY.current = 0
    touchEndX.current = 0
    touchEndY.current = 0
  }, [onSwipeLeft, onSwipeRight, canSwipeLeft, canSwipeRight])

  return {
    containerRef,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

