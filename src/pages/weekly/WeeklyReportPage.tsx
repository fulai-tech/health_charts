import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryParams } from '@/hooks/useUrlParams'
import { weeklyReportBGColor, weeklyReportGradientTop } from '@/config/theme'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWeeklyReportData, getDefaultWeeklyReportData, normalizeWeeklyReportData } from '@/modules/weekly-report'
import {
  WROverallScoreCard,
  WRVitalSignsTrendCard,
  WRSleepCard,
  WREmotionCard,
  WRMedicationCard,
  WRNutritionCard,
  WRExerciseCard,
  WRCorrelationCard,
  WRSuggestionCard,
} from '@/modules/weekly-report/components'

// ================== 核心视觉与动画配置 ==================

/** * 1. 动画持续时间 (Duration)
 * 控制光流下的速度。数值越大，流动越慢。
 * 建议范围: 1s (轻快) - 2.5s (优雅沉稳)
 */
const FLOW_DURATION = '1.5s'

/** * 2. 动画速度曲线 (Timing Function)
 * 控制光流动的“节奏感”或“加速度”。
 * * 推荐选项:
 * - 'cubic-bezier(0.25, 0.46, 0.45, 0.94)': [默认] 类似水流/光晕，中间快，收尾平滑缓慢
 * - 'ease-out': 也就是一开始快，越往下越慢
 * - 'linear': 绝对匀速（通常比较生硬，不推荐）
 * - 'ease-in-out': 两头慢中间快
 */
const FLOW_TIMING_FUNCTION = 'ease-out'

/** 页面基础背景色（灰色） */
const BASE_GRAY = '#F3F1EF'

// ======================================================

// 定义动画关键帧：背景位置从底部(100%)移动到顶部(0%)
const ANIMATION_STYLES = `
  @keyframes lightPropagate {
    0% {
      background-position: 0% 100%;
    }
    100% {
      background-position: 0% 0%;
    }
  }
`

const PAGE_THEME = {
  bottomBg: BASE_GRAY,
  fullPageGradient: `linear-gradient(180deg, ${weeklyReportGradientTop} 0%, ${weeklyReportBGColor} 100%)`,
}

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
  const params = useQueryParams()
  const reportId = params.rid ?? undefined
  const { data, isLoading, error } = useWeeklyReportData(reportId)
  const { send } = useNativeBridge({
    pageId: 'weekly-report',
    pageName: 'WeeklyReport',
    debug: import.meta.env.DEV,
  })

  if (error) {
    return <ErrorState message={(error as Error).message || t('weeklyReport.requestFailed')} />
  }

  if (!isLoading && (!data || !data.report_exists)) {
    return <NoReportState />
  }

  const displayData = normalizeWeeklyReportData(data ?? getDefaultWeeklyReportData())
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
  } = displayData

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAGE_THEME.bottomBg }}>
      {/* 注入 CSS 动画样式 */}
      <style>{ANIMATION_STYLES}</style>

      {/* 顶部渐变区域：光传播动效 */}
      <div
        className="relative"
        style={{
          // 背景构建：0-50%是最终色(橘->灰)，50-100%是初始色(纯灰)
          backgroundImage: `linear-gradient(180deg, 
            ${weeklyReportGradientTop} 0%, 
            ${BASE_GRAY} 50%, 
            ${BASE_GRAY} 100%
          )`,
          backgroundSize: '100% 200%', 
          paddingBottom: '16px',
          // === 这里使用了顶部的配置常量 ===
          animation: `lightPropagate ${FLOW_DURATION} ${FLOW_TIMING_FUNCTION} forwards`,
        }}
      >
        {/* 页面头部 */}
        <header className="pt-12 pb-8 relative z-[1]">
          <div className="max-w-xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-slate-900">
              {t('weeklyReport.pageTitle')}
            </h1>
            <p className="text-sm text-orange-600 mt-1 font-normal">
              {t('weeklyReport.pageSubtitle')}
            </p>
          </div>
        </header>

        {/* 第一个卡片 */}
        <div className="max-w-xl mx-auto px-4 -mt-4 relative z-[1]">
          <WROverallScoreCard overall={overall} weekRange={week_range} />
        </div>
      </div>

      {/* 主要内容区域 */}
      <main className="max-w-xl mx-auto px-4 pb-8 space-y-4">
        <WRVitalSignsTrendCard vitalSigns={vital_signs} />
        <WRSleepCard sleep={sleep} />
        <WREmotionCard emotion={emotion} />
        <WRMedicationCard medication={medication} />
        <WRNutritionCard nutrition={nutrition} />
        <WRExerciseCard exercise={exercise} />
        <WRCorrelationCard correlations={correlation} />
        <WRSuggestionCard
          suggestions={improvement_suggestions}
          onViewDetails={(suggestion) => {
            send('click-weekly-suggestion', { suggestionId: suggestion.suggestion_id })
          }}
        />
      </main>
    </div>
  )
}

export const WeeklyReportPage = memo(WeeklyReportPageInner)
export default WeeklyReportPage