/**
 * WRSuggestionCard - 周报改善建议卡片
 * 按设计稿：标签(胶囊) → 标题 → 描述 → 分隔线 → 周期·难度 | 查看详情
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES } from '@/config/theme'
import type { ImprovementSuggestionAPI } from '../types'

interface WRSuggestionCardProps {
  suggestions: ImprovementSuggestionAPI[]
  className?: string
  /** 点击「查看详情」时回调（用于原生桥接跳转对应界面） */
  onViewDetails?: (suggestion: ImprovementSuggestionAPI, index: number) => void
}

const WRSuggestionCardInner = ({
  suggestions,
  className = '',
  onViewDetails,
}: WRSuggestionCardProps) => {
  const { t } = useTranslation()
  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {/* 区块标题 */}
      <h3 className="text-base font-semibold text-slate-800 mb-4">
        {t('weeklyReport.improvementSuggestions')}
      </h3>

      {/* 建议列表：每项为独立白卡，按设计稿布局 */}
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.suggestion_id}
            className="bg-white"
            style={{
              borderRadius: UI_STYLES.cardBorderRadius,
              padding: '20px 25px',
            }}
          >
            {/* 标签：胶囊形、橙色 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestion.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 标题 */}
            <h4 className="text-base font-bold text-slate-900 mb-2">
              {suggestion.title}
            </h4>

            {/* 描述 */}
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              {suggestion.description}
            </p>

            {/* 分隔线 */}
            <hr className="border-0 border-t border-slate-200 mb-4" />

            {/* 底部：周期·难度 | 查看详情 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {suggestion.duration.text} · {suggestion.difficulty.text}
              </span>
              <button
                type="button"
                className="text-sm font-medium text-orange-600 hover:text-orange-700 focus:outline-none focus:underline"
                onClick={() => onViewDetails?.(suggestion, index)}
              >
                {t('weeklyReport.viewDetails')} &gt;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const WRSuggestionCard = memo(WRSuggestionCardInner)
