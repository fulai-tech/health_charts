/**
 * AnimatedImage - 带有淡入动画的图片组件
 * 
 * 功能：
 * - 图片加载完成前显示占位符
 * - 加载完成后平滑淡入显示
 * - 使用 Framer Motion 实现动画效果
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedImageProps {
  src: string
  alt: string
  className?: string
  /** 占位符背景色，默认为浅灰色 */
  placeholderClassName?: string
  /** 动画持续时间（秒），默认 0.3s */
  duration?: number
}

export function AnimatedImage({
  src,
  alt,
  className = '',
  placeholderClassName = 'bg-slate-100',
  duration = 0.3,
}: AnimatedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoaded(true) // 出错时也标记为"加载完成"以隐藏 placeholder
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* 占位符：加载中时显示 */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration * 0.5 }}
            className={`absolute inset-0 ${placeholderClassName} rounded-full`}
          />
        )}
      </AnimatePresence>

      {/* 图片：始终渲染但初始透明，加载完成后淡入 */}
      <motion.img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: isLoaded && !hasError ? 1 : 0,
          scale: isLoaded && !hasError ? 1 : 0.95,
        }}
        transition={{ 
          duration,
          ease: 'easeOut',
        }}
        className={className}
      />

      {/* 错误状态：显示一个默认的占位图标 */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration * 0.5 }}
          className={`absolute inset-0 ${placeholderClassName} rounded-full flex items-center justify-center`}
        >
          <svg 
            className="w-6 h-6 text-slate-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </motion.div>
      )}
    </div>
  )
}
