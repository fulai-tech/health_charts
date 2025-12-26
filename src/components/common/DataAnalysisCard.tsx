import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import { Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { memo } from 'react'

export interface DataAnalysisCardProps {
    titleKey?: string
    Icon: LucideIcon
    items: string[]
    themeColor: string
    className?: string
    isLoading?: boolean
}

const DataAnalysisCardInner = ({
    titleKey = 'dataAnalysis',
    Icon,
    items,
    themeColor,
    className,
    isLoading,
}: DataAnalysisCardProps) => {
    const { t } = useTranslation()

    // Determine title - if titleKey contains dots it's a full key, otherwise look under 'common' or feature based namespace passed by parent
    // However, to keep it simple and flexible, let's assume the parent passes a fully qualified translation key or we default to a check.
    // Actually, looking at usages, 'dataAnalysis' is usually under 'page.feature.dataAnalysis'.
    // Let's rely on the parent passing the translated title or we handle the key resolution.
    // A better pattern for a common component is to accept the translated title string directly?
    // User requested "transmission of parameters to control the summary text", implying we pass the data.
    // Let's pass the Translation Key for the title to be flexible, or just the Title string.
    // Let's try to match the existing usage: parent components use `t('page.heartRate.dataAnalysis')`.
    // So let's accept `title` as a string.

    return (
        <Card className={`${className} relative overflow-hidden`}>
            {/* Loading overlay */}
            <div
                className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                style={{ backgroundColor: UI_STYLES.loadingOverlay }}
            >
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5" style={{ color: themeColor }} />
                <h3 className="text-base font-semibold text-slate-800">
                    {t(titleKey)}
                </h3>
            </div>

            {/* Analysis Items */}
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 rounded-xl px-4 py-3"
                        style={{ backgroundColor: '#F8F8F8' }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: themeColor }}
                        />
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {item}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export const DataAnalysisCard = memo(DataAnalysisCardInner)
