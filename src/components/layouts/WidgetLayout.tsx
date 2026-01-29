import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WidgetLayoutProps {
  children: ReactNode
  className?: string
  /** 可选：根节点样式，用于统一背景色等 */
  style?: CSSProperties
  /** 内容对齐：默认居中，dialog 类 widget 可传 left 左对齐 */
  align?: 'center' | 'left'
}

/**
 * WidgetLayout - Transparent layout for iframe embedding
 * Used for routes like /widget/blood-pressure/trend
 * No padding, transparent background; content alignment via align prop
 */
export function WidgetLayout({ children, className, style, align = 'center' }: WidgetLayoutProps) {
  const isLeft = align === 'left'
  return (
    <div
      className={cn(
        'min-h-screen bg-transparent flex',
        isLeft ? 'items-start justify-start' : 'items-center justify-center',
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

