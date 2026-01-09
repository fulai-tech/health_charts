import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import { Loader2 } from 'lucide-react'

/**
 * Hook to manage carousel state externally
 * Useful when indicators need to be rendered outside the carousel
 */
export function useCarouselState(itemCount: number) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Reset index when item count changes
    useEffect(() => {
        if (currentIndex >= itemCount && itemCount > 0) {
            setCurrentIndex(itemCount - 1)
        }
    }, [itemCount, currentIndex])

    const goToSlide = useCallback((index: number) => {
        if (index >= 0 && index < itemCount) {
            setCurrentIndex(index)
        }
    }, [itemCount])

    const goToNext = useCallback(() => {
        if (currentIndex < itemCount - 1) {
            setCurrentIndex(prev => prev + 1)
        }
    }, [currentIndex, itemCount])

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }, [currentIndex])

    return useMemo(() => ({
        currentIndex,
        setCurrentIndex: goToSlide,
        goToNext,
        goToPrev,
        isFirst: currentIndex === 0,
        isLast: currentIndex === itemCount - 1,
        total: itemCount
    }), [currentIndex, goToSlide, goToNext, goToPrev, itemCount])
}

// Indicator colors
const INDICATOR_ACTIVE_COLOR = '#FB923D'
const INDICATOR_INACTIVE_COLOR = '#D1D5DB'

export interface CarouselIndicatorProps {
    total: number
    current: number
    onSelect?: (index: number) => void
    activeColor?: string
    inactiveColor?: string
    className?: string
}

/**
 * Carousel Indicator component - can be used standalone or within SwipeableCarousel
 */
export const CarouselIndicator = ({
    total,
    current,
    onSelect,
    activeColor = INDICATOR_ACTIVE_COLOR,
    inactiveColor = INDICATOR_INACTIVE_COLOR,
    className = ''
}: CarouselIndicatorProps) => {
    if (total <= 1) return null

    return (
        <div className={`flex justify-center items-center gap-2 ${className}`}>
            {Array.from({ length: total }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onSelect?.(index)}
                    className="transition-all duration-300"
                    style={{
                        width: index === current ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: index === current ? activeColor : inactiveColor,
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
    )
}

export interface SwipeableCarouselProps {
    items: any[]
    renderItem: (item: any, index: number) => ReactNode
    className?: string
    isLoading?: boolean
    header?: ReactNode
    emptyMessage?: string
    indicatorActiveColor?: string
    indicatorInactiveColor?: string
    /** Hide indicators (useful when using external CarouselIndicator) */
    hideIndicators?: boolean
    /** Controlled mode: current index */
    currentIndex?: number
    /** Controlled mode: callback when index changes */
    onIndexChange?: (index: number) => void
    /** Whether to wrap content in a Card component */
    wrapInCard?: boolean
}

export const SwipeableCarousel = ({
    items,
    renderItem,
    className,
    isLoading,
    header,
    emptyMessage = 'No data available',
    indicatorActiveColor,
    indicatorInactiveColor,
    hideIndicators = false,
    currentIndex: controlledIndex,
    onIndexChange,
    wrapInCard = true
}: SwipeableCarouselProps) => {
    // Support both controlled and uncontrolled modes
    const [internalIndex, setInternalIndex] = useState(0)
    const isControlled = controlledIndex !== undefined
    const currentIndex = isControlled ? controlledIndex : internalIndex
    
    const setCurrentIndex = useCallback((indexOrUpdater: number | ((prev: number) => number)) => {
        const newIndex = typeof indexOrUpdater === 'function' 
            ? indexOrUpdater(currentIndex) 
            : indexOrUpdater
        
        if (!isControlled) {
            setInternalIndex(newIndex)
        }
        onIndexChange?.(newIndex)
    }, [currentIndex, isControlled, onIndexChange])

    const containerRef = useRef<HTMLDivElement>(null)

    // Touch state
    const touchStartX = useRef<number>(0)
    const touchStartY = useRef<number>(0)
    const touchEndX = useRef<number>(0)
    const isSwiping = useRef<boolean>(false)
    const [translateX, setTranslateX] = useState(0)

    // Reset index when items change (only in uncontrolled mode)
    useEffect(() => {
        if (!isControlled) {
            setInternalIndex(0)
        }
    }, [items.length, isControlled])

    // Handle touch start
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
        isSwiping.current = false
        setTranslateX(0)
    }, [])

    // Handle touch move
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const currentX = e.touches[0].clientX
        const currentY = e.touches[0].clientY
        const diffX = currentX - touchStartX.current
        const diffY = currentY - touchStartY.current

        // Check if horizontal swipe is dominant
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
            isSwiping.current = true
            // e.preventDefault() // React synthetic events shouldn't prevent default in passive listeners normally, but sometimes needed. 
            // Removing preventDefault here to match best practices, or specific handling might be needed if scrolling issues occur.

            // Calculate resistance at edges
            let newTranslate = diffX
            if ((currentIndex === 0 && diffX > 0) ||
                (currentIndex === items.length - 1 && diffX < 0)) {
                newTranslate = diffX * 0.3 // Add resistance
            }
            setTranslateX(newTranslate)
        }

        touchEndX.current = currentX
    }, [currentIndex, items.length])

    // Handle touch end
    const handleTouchEnd = useCallback(() => {
        const diff = touchEndX.current - touchStartX.current
        const threshold = 50 // Minimum swipe distance

        if (isSwiping.current) {
            if (diff > threshold && currentIndex > 0) {
                // Swipe right - go to previous
                setCurrentIndex(prev => prev - 1)
            } else if (diff < -threshold && currentIndex < items.length - 1) {
                // Swipe left - go to next
                setCurrentIndex(prev => prev + 1)
            }
        }

        // Reset
        setTranslateX(0)
        isSwiping.current = false
        touchStartX.current = 0
        touchEndX.current = 0
    }, [currentIndex, items.length])

    // Handle indicator click
    const handleIndicatorSelect = useCallback((index: number) => {
        setCurrentIndex(index)
    }, [])

    const baseTranslate = -currentIndex * 100

    const content = (
        <>
            {/* Loading overlay */}
            <div
                className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                style={{ backgroundColor: UI_STYLES.loadingOverlay }}
            >
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>

            {/* Header */}
            {header && <div className="mb-4">{header}</div>}

            {/* Carousel Container */}
            {items.length > 0 ? (
                <>
                    <div
                        ref={containerRef}
                        className="relative overflow-hidden touch-pan-y"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{ touchAction: 'pan-y pinch-zoom' }}
                        data-swipe-ignore
                    >
                        <div
                            className="flex"
                            style={{
                                transform: `translateX(calc(${baseTranslate}% + ${translateX}px))`,
                                transition: translateX === 0 ? 'transform 0.3s ease-out' : 'none',
                            }}
                        >
                            {items.map((item, index) => (
                                <div key={index} className="w-full flex-shrink-0 px-0">
                                    {renderItem(item, index)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Indicator Dots - only render if not hidden */}
                    {!hideIndicators && (
                        <CarouselIndicator
                            total={items.length}
                            current={currentIndex}
                            onSelect={handleIndicatorSelect}
                            activeColor={indicatorActiveColor}
                            inactiveColor={indicatorInactiveColor}
                            className="mt-4"
                        />
                    )}
                </>
            ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                    {emptyMessage}
                </div>
            )}
        </>
    )

    if (wrapInCard) {
        return (
            <Card className={`${className} relative overflow-hidden`}>
                {content}
            </Card>
        )
    }

    return (
        <div className={`${className} relative overflow-hidden`}>
            {content}
        </div>
    )
}
