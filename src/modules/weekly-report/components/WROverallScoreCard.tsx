/**
 * WROverallScoreCard - 周报总体评分卡片
 * 按设计稿：顶部橙色头+标题+大分数+评语左侧，右侧笑脸图标；橙色成就条；底部达标天数与较上周
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES, UI_COLORS } from '@/config/theme'
import type { OverallAPI, WeekRangeAPI } from '../types'

const THEME = {
  primary: '#F97316',
  headerBg: '#FB923C', // 顶部橙色头部背景
  primaryLight: 'rgba(249, 115, 22, 0.1)',
}

const SMILE_IMG = '/images/weekly_report/smile.png'

interface WROverallScoreCardProps {
  overall: OverallAPI
  weekRange: WeekRangeAPI
  className?: string
}

const WROverallScoreCardInner = ({
  overall,
  weekRange,
  className = '',
}: WROverallScoreCardProps) => {
  const { t } = useTranslation()
  const { score, evaluate, peer_compare, days_on_target, score_change } = overall

  return (
    <div
      className={`bg-white ${className} overflow-hidden`}
      style={{
        borderRadius: UI_STYLES.cardBorderRadius,
      }}
    >
      {/* 顶部橙色头部：左边 Week XX summary，右边日期范围，75% 透明白背景 */}
      <div
        className="flex items-center justify-between gap-4 px-6 py-4"
        style={{ backgroundColor: THEME.headerBg }}
      >
        <div
          className="px-4 py-1.5 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.14)',border:"solid 1px #ffffff" }}
        >
          {t('weeklyReport.weekSummary', { week: weekRange.week_number })}
        </div>
        <div
          className="px-4 py-1.5 rounded-full text-sm font-medium text-white "
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.14)',border:"solid 1px #ffffff" }}
        >
          {weekRange.display_range}
        </div>
      </div>

      {/* 白色主体内容 */}
      <div
        style={{
          paddingLeft: UI_STYLES.cardPaddingX,
          paddingRight: UI_STYLES.cardPaddingX,
          paddingTop: 24,
          paddingBottom: 24,
        }}
      >
          {/* 顶部：左侧标题+分数+评语，右侧笑脸图标 */}
        <div className="flex items-flex-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-800">
              {t('weeklyReport.overallScore')}
            </h3>
            <p className="text-4xl font-bold text-slate-900 mt-1 tracking-tight">{score}</p>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{evaluate}</p>
          </div>
          <div className="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
            <img
              src={SMILE_IMG}
              alt=""
              className="w-16 h-16 object-contain"
            />
            {/* 装饰星点 */}
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-amber-400" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2z"/></svg>
            </span>
            <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 text-amber-400" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2z"/></svg>
            </span>
            <span className="absolute top-1 -right-2 w-2.5 h-2.5 text-blue-400" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2z"/></svg>
            </span>
          </div>
        </div>

        {/* 中间：同龄人对比条 - 背景 FEE9D8，文字 #FB923C，半圆圆角 */}
        <div
          className="mt-5 flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ backgroundColor: '#FEE9D8', color: '#FB923C' }}
        >
          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: '#FB923C' }}>
            <svg className="w-2.5 h-2.5" style={{ color: '#FB923C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs font-medium leading-snug" style={{ color: '#FB923C' }}>{peer_compare}</p>
        </div>

        {/* 底部：达标天数、较上周 - 两个独立卡片，无分割线 */}
        <div className="mt-5 flex items-stretch gap-4">
          {/* 左侧：达标天数 */}
          <div
            className="flex-1 px-4 py-4 rounded-2xl"
            style={{ backgroundColor: UI_COLORS.background.gray }}
          >
            <p className="text-base font-semibold text-slate-900 mb-1">{t('weeklyReport.goalDays')}</p>
            <p className="text-2xl font-bold" style={{ color: THEME.primary }}>
              {days_on_target} <span className="text-base font-normal text-slate-500">{t('weeklyReport.days')}</span>
            </p>
          </div>

          {/* 右侧：较上周 */}
          <div
            className="flex-1 px-4 py-4 rounded-2xl"
            style={{ backgroundColor: UI_COLORS.background.gray }}
          >
            <p className="text-base font-semibold text-slate-900 mb-1">{t('weeklyReport.vsLastWeek')}</p>
            <div className="flex items-baseline gap-1">
              {score_change && score_change.value >= 0 && (
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: THEME.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              )}
              {score_change && score_change.value < 0 && (
                <svg className="w-5 h-5 flex-shrink-0 text-red-500 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              )}
              <span className="text-2xl font-bold" style={{ color: THEME.primary }}>
                {score_change != null ? (typeof score_change.value === 'number' ? Math.abs(score_change.value) : score_change.text) : '—'}
              </span>
              <span className="text-base font-normal text-slate-500 ml-0.5">{t('weeklyReport.points')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const WROverallScoreCard = memo(WROverallScoreCardInner)
