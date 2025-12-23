import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles conditional classes and resolves Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let isWebViewCache: boolean | null = null

export function isWebView(): boolean {
  if (isWebViewCache !== null) {
    return isWebViewCache
  }

  const userAgent = navigator.userAgent.toLowerCase()
  const isAndroid = /android/.test(userAgent)
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const isTencentX5 = /tbs|qqbrowser|mqqbrowser|micromessenger/.test(userAgent)
  const isWKWebView = /webkit/.test(userAgent) && !/safari/.test(userAgent)

  isWebViewCache = (isAndroid || isIOS) && (isTencentX5 || isWKWebView)
  return isWebViewCache
}

export function getOptimizedAnimationDuration(defaultDuration: number): number {
  return isWebView() ? Math.min(defaultDuration, 300) : defaultDuration
}

