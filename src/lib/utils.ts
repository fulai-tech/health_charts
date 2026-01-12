import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CHART_CONFIG } from '@/config/chartConfig'

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles conditional classes and resolves Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get optimized animation duration based on device/environment
 * Uses CHART_CONFIG which respects the WEBVIEW_MODE toggle in chartConfig.ts
 * 
 * @param _defaultDuration - Ignored, uses CHART_CONFIG.animation.animationDuration instead
 * @returns Optimized animation duration from CHART_CONFIG
 */
export function getOptimizedAnimationDuration(_defaultDuration?: number): number {
  return CHART_CONFIG.animation.animationDuration
}

/**
 * Get full animation config for Recharts components
 * Uses CHART_CONFIG which respects the WEBVIEW_MODE toggle
 * 
 * @example
 * ```tsx
 * <Bar {...getChartAnimationProps()} />
 * ```
 */
export function getChartAnimationProps() {
  return CHART_CONFIG.animation
}

/**
 * Parse JSON data from URL query parameter
 * Used for widget pages to accept data via URL parameters
 * 
 * @param paramName - The query parameter name (default: 'data')
 * @returns Parsed JSON object or null if not found/invalid
 * 
 * @example
 * // URL: /widget/heart-rate/trend?data={"chartData":[...]}
 * const data = parseUrlJsonData('data')
 */
export function parseUrlJsonData<T = unknown>(paramName: string = 'data'): T | null {
  if (typeof window === 'undefined') {
    return null
  }

  const urlParams = new URLSearchParams(window.location.search)
  const jsonString = urlParams.get(paramName)

  if (!jsonString) {
    return null
  }

  try {
    return JSON.parse(decodeURIComponent(jsonString)) as T
  } catch (error) {
    console.error(`[parseUrlJsonData] Failed to parse JSON from parameter "${paramName}":`, error)
    return null
  }
}

