import { useTranslation } from 'react-i18next'
import { FileQuestion } from 'lucide-react'
import { memo, type ReactNode } from 'react'

interface EmptyStateProps {
    /** Custom message key (i18n), defaults to 'common.insufficientData' */
    messageKey?: string
    /** Custom icon component */
    icon?: ReactNode
    /** Minimum height to maintain card layout stability */
    minHeight?: number
    /** Additional class name */
    className?: string
}

/**
 * Empty State Component
 * Displays a centered message with icon when no data is available.
 * Used to replace dummy data fallbacks with user-friendly empty state messages.
 */
const EmptyStateInner = ({
    messageKey = 'common.insufficientData',
    icon,
    minHeight = 120,
    className = '',
}: EmptyStateProps) => {
    const { t } = useTranslation()

    return (
        <div
            className={`flex flex-col items-center justify-center text-slate-400 ${className}`}
            style={{ minHeight }}
        >
            {icon || <FileQuestion className="w-10 h-10 mb-2 text-slate-300" />}
            <p className="text-sm text-center">{t(messageKey)}</p>
        </div>
    )
}

export const EmptyState = memo(EmptyStateInner)
