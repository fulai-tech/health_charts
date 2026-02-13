/**
 * SuggestionsList
 * 
 * Displays personalized suggestions with icons and Add buttons.
 * Each suggestion can trigger an action when Add is clicked.
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES } from '@/config/theme'

export interface Suggestion {
    /** Icon image path (relative to public) */
    icon: string
    /** Suggestion title */
    title: string
    /** Suggestion description */
    description: string
}

export interface SuggestionsListProps {
    /** List of suggestions */
    suggestions: Suggestion[]
    /** Callback when Add button is clicked */
    onAdd?: (index: number) => void
    /** Additional class names */
    className?: string
}

const SuggestionsListInner = ({
    suggestions,
    onAdd,
    className = '',
}: SuggestionsListProps) => {
    const { t } = useTranslation()

    // 当后端返回空数组时，使用 i18n 假数据
    const displaySuggestions: Suggestion[] = 
        !suggestions || suggestions.length === 0
            ? [
                  {
                      icon: '/images/daily_report/1.webp', // 使用与 demo 模式相同的图标
                      title: t('daily.defaultSuggestions.soakingFeet.title', 'Soaking feet before bed'),
                      description: t('daily.defaultSuggestions.soakingFeet.description', 'Relieve current anxiety and lower heart rate.'),
                  },
                  {
                      icon: '/images/daily_report/2.webp', // 使用与 demo 模式相同的图标
                      title: t('daily.defaultSuggestions.napSuggestion.title', "Today's nap suggestion"),
                      description: t('daily.defaultSuggestions.napSuggestion.description', 'Relieve current anxiety and lower heart rate.'),
                  },
              ]
            : suggestions

    const handleAdd = (index: number) => {
        if (onAdd) {
            onAdd(index)
        } else {
            // Default: show alert
            alert(`Added suggestion: ${displaySuggestions[index].title}`)
        }
    }

    return (
        <div className={`${className}`}>
            {/* Header */}
            <h3 className="text-base font-semibold text-slate-800 mb-4">
                {t('daily.personalizedSuggestions', 'Personalized suggestions')}
            </h3>

            {/* Suggestion items */}
            <div className="space-y-3">
                {displaySuggestions.map((suggestion, index) => (
                    <div
                        key={index}
                        className="bg-white py-5 shadow-sm border border-slate-100 flex items-center gap-4"
                        style={{
                            borderRadius: 24,
                            paddingLeft: UI_STYLES.cardPaddingX,
                            paddingRight: UI_STYLES.cardPaddingX,
                        }}
                    >
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                                src={suggestion.icon}
                                alt=""
                                className="w-9 h-9 object-cover"
                                onError={(e) => {
                                    // Fallback icon if image fails to load
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-800 truncate">
                                {suggestion.title}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                                {suggestion.description}
                            </p>
                        </div>

                        {/* Add button */}
                        <button
                            onClick={() => handleAdd(index)}
                            className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors flex-shrink-0"
                        >
                            {t('common.add', 'Add')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const SuggestionsList = memo(SuggestionsListInner)
