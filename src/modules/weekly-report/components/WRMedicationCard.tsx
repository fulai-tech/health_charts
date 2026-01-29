/**
 * WRMedicationCard - 周报用药模块卡片
 * 显示用药依从性和服药状态日历
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES, UI_COLORS } from '@/config/theme'
import type { MedicationAPI } from '../types'
import { getMedicationStatusColor } from '../adapter'

const MED_COLOR = '#10B981' // 用药主题色（依从绿）

interface WRMedicationCardProps {
  medication: MedicationAPI
  className?: string
}

const WRMedicationCardInner = ({
  medication,
  className = '',
}: WRMedicationCardProps) => {
  const { t } = useTranslation()
  if (!medication.has_data) {
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
        <h3 className="text-base font-semibold text-slate-800">{t('weeklyReport.medication')}</h3>
        <p className="text-sm text-slate-500 mt-4">{t('weeklyReport.noMedicationData')}</p>
      </div>
    )
  }

  // 图例配置
  const legends = [
    { status: 'taken', label: t('weeklyReport.takenOnTime'), color: getMedicationStatusColor('taken') },
    { status: 'delayed', label: t('weeklyReport.delayed'), color: getMedicationStatusColor('delayed') },
    { status: 'missed', label: t('weeklyReport.missed'), color: getMedicationStatusColor('missed') },
  ]

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
      {/* 标题：左侧大图标 + 副标题与依从率，右侧状态徽章 */}
      <div
        className="flex items-center justify-between pb-4 mb-4"
        style={{ borderBottom: `1px solid ${UI_COLORS.background.gray}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }}
          >
            <svg className="w-6 h-6" style={{ color: MED_COLOR }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('weeklyReport.medAdherence')}</p>
            <p className="text-base font-normal text-slate-800 mt-0.5">{medication.compliance_rate}%</p>
          </div>
        </div>
        <span
          className="text-xs font-medium px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: MED_COLOR,
          }}
        >
          {medication.status.label}
        </span>
      </div>

      {/* Adherence Trend 标题 + 图例 + 七日圆圈 */}
      <p className="text-sm font-medium text-slate-700 mb-2">{t('weeklyReport.adherenceTrend')}</p>
      <div className="flex items-center gap-4 mb-4">
        {legends.map((legend) => (
          <div key={legend.status} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: legend.color }}
            />
            <span className="text-xs text-slate-500">{legend.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4">
        {medication.chart_data.map((item) => (
          <div key={item.date} className="flex flex-col items-center gap-2">
            <span className="text-xs text-slate-500">{item.label}</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: getMedicationStatusColor(item.status) }}
              title={item.status_label}
            >
              {item.status === 'taken' && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {item.status === 'delayed' && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {item.status === 'missed' && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <span className="text-[10px] text-slate-400">
              {item.detail.taken}/{item.detail.total}
            </span>
          </div>
        ))}
      </div>

      {/* 用药 AI 洞察（内嵌在卡片底部） */}
      {medication.ai_insight && (
        <div
          className="flex gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: UI_COLORS.background.gray }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
            style={{ backgroundColor: MED_COLOR }}
          >
            AI
          </div>
          <p className="text-sm text-slate-700 leading-relaxed flex-1 min-w-0">{medication.ai_insight}</p>
        </div>
      )}
    </div>
  )
}

export const WRMedicationCard = memo(WRMedicationCardInner)
