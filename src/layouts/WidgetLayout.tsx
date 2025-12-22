import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WidgetLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * WidgetLayout - Transparent layout for iframe embedding
 * Used for routes like /widget/blood-pressure/trend
 * No padding, transparent background, centers content
 */
export function WidgetLayout({ children, className }: WidgetLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-transparent flex items-center justify-center',
        className
      )}
    >
      {children}
    </div>
  )
}

