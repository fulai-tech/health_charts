/**
 * Chart Performance Configuration
 * 
 * Optimized animation settings for Recharts to improve performance
 * on low-end devices and WebView environments.
 */

/**
 * ============================================================
 * 🔧 WEBVIEW MODE TOGGLE - 开发调试开关
 * ============================================================
 * 
 * 可选值:
 *   - 'true'  : 强制使用 WebView 简化动画模式（用于预览效果）
 *   - 'false' : 强制使用完整动画模式（忽略设备检测）
 *   - 'auto'  : 自动检测环境（生产环境推荐）
 * 
 * 使用方法:
 *   1. 设置为 'true' 可以在浏览器中预览 WebView 简化动画效果
 *   2. 测试完成后改回 'auto' 以恢复自动检测
 */
export const WEBVIEW_MODE: 'true' | 'false' | 'auto' = 'true'  // ⬅️ 修改这里切换模式

/**
 * Animation configuration for WebView - SIMPLIFIED (not disabled)
 * Uses shorter duration and simpler easing to reduce frame drops
 */
export const WEBVIEW_ANIMATION_CONFIG = {
    animationDuration: 300,           // 简化动画: 300ms
    animationEasing: 'linear' as const,
    isAnimationActive: true,          // 启用简化动画
    animationBegin: 0,                // 立即开始
}

/**
 * Animation configuration for low-end devices
 * - Very short duration for minimal rendering impact
 * - Simplest easing function
 */
export const LOW_END_ANIMATION_CONFIG = {
    animationDuration: 200,
    animationEasing: 'linear' as const,
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
 * Detect if running in a WebView environment
 * WebView has severe SVG animation performance issues
 */
export function detectWebView(): boolean {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent.toLowerCase()
    // Detect various WebView patterns including Android WebView, iOS WKWebView, and custom app WebViews
    return /webview|wv|\bandroid\b.*\bchrome\/[.0-9]*\s+mobile\b(?!.*edge)/i.test(ua) ||
        // Check for common WebView indicators
        /\bfb[av]\b|\binstagram\b|\btwitter\b|\bmicromessenger\b|\bweixin\b/i.test(ua) ||
        // Check if running in an iframe or embedded context that might indicate WebView
        (typeof window !== 'undefined' && window.navigator && !!(window.navigator as any).standalone)
}

/**
 * Check if WebView mode is active based on WEBVIEW_MODE toggle
 */
export function isWebView(): boolean {
    if (WEBVIEW_MODE === 'true') return true
    if (WEBVIEW_MODE === 'false') return false
    // 'auto' mode - use detection
    return detectWebView()
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

    // Consider device low-end if it has fewer cores or is a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    return cores <= 4 || isMobile
}

/**
 * Get optimal animation configuration based on device capabilities
 * Priority: WebView (simplified) > Low-end (minimal) > Standard
 */
export function getChartAnimationConfig() {
    // Check WebView mode first
    if (isWebView()) {
        console.log(`📊 Chart config: WebView mode [${WEBVIEW_MODE}] - simplified animations (300ms)`)
        return WEBVIEW_ANIMATION_CONFIG
    }
    // Low-end devices get minimal animation
    if (isLowEndDevice()) {
        console.log('📊 Chart config: Low-end device - minimal animations (200ms)')
        return LOW_END_ANIMATION_CONFIG
    }
    console.log('📊 Chart config: Standard device - full animations (800ms)')
    return STANDARD_ANIMATION_CONFIG
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

