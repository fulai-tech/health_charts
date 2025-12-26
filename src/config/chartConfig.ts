/**
 * Chart Performance Configuration
 * 
 * Optimized animation settings for Recharts to improve performance
 * on low-end devices and WebView environments.
 */

/**
 * Animation configuration for low-end devices
 * - Shorter duration for faster rendering
 * - Simpler easing function
 */
export const LOW_END_ANIMATION_CONFIG = {
    animationDuration: 400,
    animationEasing: 'ease-out' as const,
    isAnimationActive: true,
}

/**
 * Animation configuration for standard devices
 * - Standard duration for smooth animations
 * - More sophisticated easing
 */
export const STANDARD_ANIMATION_CONFIG = {
    animationDuration: 800,
    animationEasing: 'ease-in-out' as const,
    isAnimationActive: true,
}

/**
 * Detect if device is low-end based on hardware concurrency
 * This is a heuristic - devices with <= 4 cores are considered low-end
 */
export function isLowEndDevice(): boolean {
    // Check if running in browser
    if (typeof navigator === 'undefined') return false

    // Use hardware concurrency as a proxy for device performance
    const cores = navigator.hardwareConcurrency || 4

    // Also check if running in WebView (common for mobile apps)
    const isWebView = /WebView|wv/.test(navigator.userAgent)

    return cores <= 4 || isWebView
}

/**
 * Get optimal animation configuration based on device capabilities
 */
export function getChartAnimationConfig() {
    return isLowEndDevice() ? LOW_END_ANIMATION_CONFIG : STANDARD_ANIMATION_CONFIG
}

/**
 * Shared chart configuration for consistent styling
 */
export const CHART_CONFIG = {
    /** Default margin for charts */
    defaultMargin: { top: 5, right: 15, left: 0, bottom: 5 },

    /** Grid line styling */
    gridStyle: {
        strokeDasharray: '4 4',
        stroke: '#E5E7EB',
    },

    /** Axis styling */
    axisStyle: {
        fontSize: 12,
        fill: '#94a3b8',
    },

    /** Animation config (dynamic based on device) */
    animation: getChartAnimationConfig(),
}
