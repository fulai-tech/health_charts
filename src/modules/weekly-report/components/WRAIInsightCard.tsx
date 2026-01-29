/**
 * WRAIInsightCard - 周报AI分析卡片
 * 显示AI健康洞察建议
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES } from '@/config/theme'

// 主题色配置
const THEME = {
  background: '#FFF7ED', // 浅橙色背景
  badge: '#F97316', // 橙色徽章
  iconBg: 'rgba(249, 115, 22, 0.1)',
}

interface WRAIInsightCardProps {
  insight: string
  title?: string
  className?: string
}

const WRAIInsightCardInner = ({
  insight,
  title,
  className = '',
}: WRAIInsightCardProps) => {
  const { t } = useTranslation()
  const displayTitle = title ?? t('weeklyReport.aiInsight.default')
  if (!insight) return null

  return (
    <div
      className={`${className}`}
      style={{
        backgroundColor: THEME.background,
        borderRadius: UI_STYLES.cardBorderRadius,
        paddingLeft: UI_STYLES.cardPaddingX,
        paddingRight: UI_STYLES.cardPaddingX,
        paddingTop: '20px',
        paddingBottom: '20px',
      }}
    >
      {/* 标题徽章 */}
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium mb-4"
        style={{ backgroundColor: THEME.badge }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <span>{displayTitle}</span>
      </div>

      {/* 洞察内容 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
      </div>
    </div>
  )
}

export const WRAIInsightCard = memo(WRAIInsightCardInner)
