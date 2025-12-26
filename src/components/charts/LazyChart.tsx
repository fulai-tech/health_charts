/**
 * LazyChart Component
 * 
 * Wrapper component for Recharts that implements lazy loading based on viewport visibility.
 * Only renders the actual chart when it enters the viewport, showing a skeleton placeholder otherwise.
 * This significantly improves initial page load performance when multiple charts are present.
 * 
 * @example
 * ```tsx
 * <LazyChart height={200}>
 *   <ResponsiveContainer width="100%" height="100%">
 *     <BarChart data={data}>
 *       <Bar dataKey="value" />
 *     </BarChart>
 *   </ResponsiveContainer>
 * </LazyChart>
 * ```
 */

import { type ReactNode } from 'react'
import { useInViewport } from '@/hooks/useInViewport'

export interface LazyChartProps {
    /** Chart content to render when in viewport */
    children: ReactNode
    /** Height of the chart area (for skeleton placeholder) */
    height?: number | string
    /** Additional CSS classes */
    className?: string
    /** Custom skeleton placeholder */
    skeleton?: ReactNode
    /** Threshold for triggering load (0-1), default 0.1 */
    threshold?: number
    /** Root margin for early loading, default '100px' */
    rootMargin?: string
}

/**
 * Skeleton placeholder for chart loading
 */
const ChartSkeleton = ({ height }: { height: number | string }) => (
    <div
        className="animate-pulse bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 rounded-lg"
        style={{
            height: typeof height === 'number' ? `${height}px` : height,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
        }}
    >
        <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
    </div>
)

/**
 * LazyChart component with viewport-based loading
 */
export function LazyChart({
    children,
    height = 200,
    className = '',
    skeleton,
    threshold = 0.1,
    rootMargin = '100px',
}: LazyChartProps) {
    const { ref, hasBeenInViewport } = useInViewport({
        threshold,
        rootMargin,
        triggerOnce: true,
    })

    const heightStyle = typeof height === 'number' ? `${height}px` : height

    return (
        <div
            ref={ref}
            className={className}
            style={{ height: heightStyle, position: 'relative' }}
        >
            {hasBeenInViewport ? (
                children
            ) : (
                skeleton || <ChartSkeleton height={height} />
            )}
        </div>
    )
}
