/**
 * StatBox - Unified stats container component
 * 
 * A consistent gray background box for displaying stats in indicator cards.
 */

import { memo, type ReactNode } from 'react'

export interface StatBoxProps {
    children: ReactNode
    className?: string
}

/**
 * Unified stats container with consistent styling
 * - Background: #F8F8F8
 * - Rounded corners: xl (12px)
 * - Margin: mb-4 (no horizontal margin, flush to parent)
 * - Padding: py-3, px-4
 */
export const StatBox = memo(({ children, className = '' }: StatBoxProps) => (
    <div
        className={`rounded-xl py-3 mb-4 ${className}`}
        style={{ backgroundColor: '#F8F8F8' }}
    >
        {children}
    </div>
))

StatBox.displayName = 'StatBox'

