/**
 * WRCorrelationCard - 周报健康关联分析卡片
 * 显示各健康指标之间的关联分析
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES } from '@/config/theme'
import type { CorrelationAPI } from '../types'

// 主题色配置
const THEME = {
  positive: '#10B981', // 绿色 - 正向影响
  negative: '#EF4444', // 红色 - 负向影响
  improving: '#22C55E', // 改善趋势
  stable: '#6B7280', // 稳定
  declining: '#EF4444', // 下降趋势
}

interface WRCorrelationCardProps {
  correlations: CorrelationAPI[]
  className?: string
}

const WRCorrelationCardInner = ({
  correlations,
  className = '',
}: WRCorrelationCardProps) => {
  const { t } = useTranslation()
  if (!correlations || correlations.length === 0) {
    return null
  }

  return (
    <div
      className={`bg-white ${className}`}
      style={{
        borderRadius: UI_STYLES.cardBorderRadius,
        paddingLeft: UI_STYLES.cardPaddingX,
        paddingRight: UI_STYLES.cardPaddingX,
        paddingTop: '20px',
        paddingBottom: '20px',
      }}
    >
      {/* 标题 */}
      <h3 className="text-base font-semibold text-slate-800 mb-4">{t('weeklyReport.correlationAnalysis')}</h3>

      {/* 关联项列表 */}
      <div className="space-y-4">
        {correlations.map((correlation, index) => (
          <div key={index} className="p-4 bg-slate-50 rounded-xl">
            {/* 标题 */}
            <h4 className="text-sm font-medium text-slate-800 mb-3">{correlation.title}</h4>

            {/* 影响因素和健康结果 */}
            <div className="flex items-start gap-4 mb-3">
              {/* 影响因素 */}
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-2">{t('weeklyReport.influencingFactors')}</p>
                {correlation.influencing_factors.map((factor, fIndex) => (
                  <div key={fIndex} className="flex items-start gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        backgroundColor: factor.impact === 'positive' ? THEME.positive : THEME.negative,
                      }}
                    />
                    <div>
                      <p className="text-sm text-slate-700">{factor.factor}</p>
                      <p className="text-xs text-slate-500">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 箭头 */}
              <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 mt-4">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              {/* 健康结果 */}
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-2">{t('weeklyReport.healthOutcome')}</p>
                {correlation.health_outcomes.map((outcome, oIndex) => (
                  <div key={oIndex} className="flex items-start gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        backgroundColor:
                          outcome.trend === 'improving'
                            ? THEME.improving
                            : outcome.trend === 'declining'
                            ? THEME.declining
                            : THEME.stable,
                      }}
                    />
                    <div>
                      <p className="text-sm text-slate-700">{outcome.outcome}</p>
                      <p className="text-xs text-slate-500">{outcome.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI洞察 */}
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="text-xs text-slate-600 leading-relaxed">{correlation.ai_insight}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const WRCorrelationCard = memo(WRCorrelationCardInner)
