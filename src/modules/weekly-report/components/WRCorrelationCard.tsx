/**
 * WRCorrelationCard - 周报健康关联分析卡片
 * 显示各健康指标之间的关联分析，每条关联为独立卡片；AI 分析样式与 WRExerciseCard 一致
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { UI_STYLES, UI_COLORS } from '@/config/theme'
import type { CorrelationAPI } from '../types'

// 主题色配置
const THEME = {
  positive: '#10B981', // 绿色 - 正向影响
  negative: '#EF4444', // 红色 - 负向影响
  improving: '#22C55E', // 改善趋势
  stable: '#6B7280', // 稳定
  declining: '#EF4444', // 下降趋势
}

// 关联分析 AI 徽章背景色（浅橙，与 WRExerciseCard 的 AI 徽章风格一致）
const CORRELATION_AI_BG = '#FB923C'

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
    <div className={`space-y-4 ${className}`}>
      {/* 区块标题 */}
      <h3 className="text-base font-semibold text-slate-800">{t('weeklyReport.correlationAnalysis')}</h3>

      {/* 每条关联为独立卡片 */}
      {correlations.map((correlation, index) => (
        <div
          key={index}
          className="bg-white"
          style={{
            borderRadius: UI_STYLES.cardBorderRadius,
            paddingLeft: UI_STYLES.cardPaddingX,
            paddingRight: UI_STYLES.cardPaddingX,
            paddingTop: '20px',
            paddingBottom: '20px',
          }}
        >
          {/* 卡片内标题 */}
          <h4 className="text-sm font-medium text-slate-800 mb-3">{correlation.title}</h4>

          {/* 影响因素和健康结果（箭头竖直居中） */}
          <div className="flex items-center gap-4 mb-3">
            {/* 影响因素（每项为灰色气泡盒） */}
            <div className="flex-1 space-y-2">
              <p className="text-xs text-slate-500 mb-2">{t('weeklyReport.influencingFactors')}</p>
              {correlation.influencing_factors.map((factor, fIndex) => (
                <div
                  key={fIndex}
                  className="flex items-start gap-2 p-3 rounded-xl"
                  style={{ backgroundColor: UI_COLORS.background.gray }}
                >
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{
                      backgroundColor: factor.impact === 'positive' ? THEME.positive : THEME.negative,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{factor.factor}</p>
                    <p className="text-xs text-slate-500">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 箭头（竖直居中） */}
            <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 self-center">
              <ArrowRight className="w-5 h-5 text-orange-500" fill="currentColor" strokeWidth={0} />
            </div>

            {/* 健康结果（每项为灰色气泡盒） */}
            <div className="flex-1 space-y-2">
              <p className="text-xs text-slate-500 mb-2">{t('weeklyReport.healthOutcome')}</p>
              {correlation.health_outcomes.map((outcome, oIndex) => (
                <div
                  key={oIndex}
                  className="flex items-start gap-2 p-3 rounded-xl"
                  style={{ backgroundColor: UI_COLORS.background.gray }}
                >
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{outcome.outcome}</p>
                    <p className="text-xs text-slate-500">{outcome.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI 分析（样式与 WRExerciseCard 一致：灰底圆角块 + 左侧 AI 徽章） */}
          <div
            className="flex gap-3 p-4 rounded-2xl"
            style={{ backgroundColor: UI_COLORS.background.gray }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
              style={{ backgroundColor: CORRELATION_AI_BG }}
            >
              AI
            </div>
            <p className="text-sm text-slate-700 leading-relaxed flex-1 min-w-0">{correlation.ai_insight}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export const WRCorrelationCard = memo(WRCorrelationCardInner)
