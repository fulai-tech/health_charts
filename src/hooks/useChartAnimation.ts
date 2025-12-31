
import { useState, useEffect } from 'react'
import { getChartAnimationProps } from '@/lib/utils'

/**
 * Hook to manage chart animations
 * Disables animation on initial mount to prevent lag
 * Enables animation after delay for smooth data transitions
 */
export const useChartAnimation = (delay = 100) => {
    const [isAnimationActive, setIsAnimationActive] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAnimationActive(true)
        }, delay)

        return () => clearTimeout(timer)
    }, [delay])

    const baseProps = getChartAnimationProps()

    return {
        ...baseProps,
        // Override isAnimationActive from config based on local state
        // Only if config allows animation globally (webview mode logic in utils)
        isAnimationActive: baseProps.isAnimationActive && isAnimationActive
    }
}
