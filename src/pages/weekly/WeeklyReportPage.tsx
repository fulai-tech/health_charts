/**
 * WeeklyReportPage - 周报主页面
 * 展示用户的周度健康报告
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES, weeklyReportBGColor, weeklyReportGradientTop } from '@/config/theme'
import { useWeeklyReportData } from '@/modules/weekly-report'
import {
  WROverallScoreCard,
  WRVitalSignsTrendCard,
  WRAIInsightCard,
  WRSleepCard,
  WREmotionCard,
  WRMedicationCard,
  WRNutritionCard,
  WRExerciseCard,
  WRCorrelationCard,
  WRSuggestionCard,
} from '@/modules/weekly-report/components'

// 页面背景配置：顶部渐变区域（到第一个卡片底部），之后纯色背景
const PAGE_THEME = {
  // 顶部渐变：从 FFE8C7 渐变到 F3F1EF
  topGradient: `linear-gradient(180deg, ${weeklyReportGradientTop} 0%, #F3F1EF 100%)`,
  // 下方纯色背景
  bottomBg: '#F3F1EF',
  // 骨架屏/错误页使用的渐变（完整页面）
  fullPageGradient: `linear-gradient(180deg, ${weeklyReportGradientTop} 0%, ${weeklyReportBGColor} 100%)`,
}

/** 页面骨架屏 */
const PageSkeleton = () => (
  <div className="min-h-screen" style={{ background: PAGE_THEME.fullPageGradient }}>
    <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
      {/* 头部骨架 */}
      <div className="h-24 bg-slate-200 rounded-3xl animate-pulse" />
      {/* 卡片骨架 */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
      ))}
    </div>
  </div>
)

/** 错误状态 */
const ErrorState = ({ message }: { message: string }) => {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: PAGE_THEME.fullPageGradient }}>
      <div className="text-center p-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">{t('weeklyReport.loadFailed')}</h3>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  )
}

/** 无报告状态 */
const NoReportState = () => {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: PAGE_THEME.fullPageGradient }}>
      <div className="text-center p-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">{t('weeklyReport.noReport')}</h3>
        <p className="text-sm text-slate-500">{t('weeklyReport.noReportHint')}</p>
      </div>
    </div>
  )
}

const WeeklyReportPageInner = () => {
  const { t } = useTranslation()
  const { data, isLoading, error } = useWeeklyReportData()

  // 加载状态
  if (isLoading) {
    return <PageSkeleton />
  }

  // 错误状态
  if (error) {
    return <ErrorState message={(error as Error).message || t('weeklyReport.requestFailed')} />
  }

  // 无数据状态
  if (!data || !data.report_exists) {
    return <NoReportState />
  }

  const {
    week_range,
    overall,
    vital_signs,
    sleep,
    emotion,
    medication,
    nutrition,
    exercise,
    correlation,
    improvement_suggestions,
  } = data

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAGE_THEME.bottomBg }}>
      {/* 顶部渐变区域：包含 header 和第一个卡片 */}
      <div style={{ background: PAGE_THEME.topGradient, paddingBottom: '16px' }}>
        {/* 页面头部：与下方卡片同 max-width 左对齐 */}
        <header className="pt-12 pb-8">
          <div className="max-w-xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-slate-900">
              {t('weeklyReport.pageTitle')}
            </h1>
            <p className="text-sm text-orange-600 mt-1 font-normal">
              {t('weeklyReport.pageSubtitle')}
            </p>
          </div>
        </header>

        {/* 第一个卡片：总体评分 */}
        <div className="max-w-xl mx-auto px-4 -mt-4">
          <WROverallScoreCard overall={overall} weekRange={week_range} />
        </div>
      </div>

      {/* 主要内容区域：纯色背景 */}
      <main className="max-w-xl mx-auto px-4 pb-8 space-y-4">
        {/* 生命体征趋势 */}
        <WRVitalSignsTrendCard vitalSigns={vital_signs} />

        {/* 睡眠卡片（含睡眠 AI 洞察） */}
        <WRSleepCard sleep={sleep} />

        {/* 情绪卡片（含情绪 AI 洞察） */}
        <WREmotionCard emotion={emotion} />

        {/* 用药卡片（含用药 AI 洞察） */}
        <WRMedicationCard medication={medication} />

        {/* 营养卡片（含营养 AI 洞察） */}
        <WRNutritionCard nutrition={nutrition} />

        {/* 运动卡片（含运动 AI 洞察） */}
        <WRExerciseCard exercise={exercise} />

        {/* 健康关联分析 */}
        <WRCorrelationCard correlations={correlation} />

        {/* 改善建议 */}
        <WRSuggestionCard suggestions={improvement_suggestions} />
      </main>
    </div>
  )
}

export const WeeklyReportPage = memo(WeeklyReportPageInner)
export default WeeklyReportPage
