import { useTranslation } from 'react-i18next'
import { ArrowUp, ArrowDown, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { BPDomainModel } from '../types'

interface BPCompareCardProps {
  data: BPDomainModel
  className?: string
}

/**
 * BP Compare Card
 */
export function BPCompareCard({ data, className }: BPCompareCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.bp

  const { comparison, summary } = data

  const getTrendIcon = (trend: string) => {
    // Priority: use trend direction from API
    if (trend === 'up') {
      return <ArrowUp className="w-4 h-4" />
    }
    if (trend === 'down') {
      return <ArrowDown className="w-4 h-4" />
    }
    return null
  }

  const insightText = comparison.insight || 
    t('page.bloodPressure.defaultInsight', {
      defaultValue: 'Your blood pressure is generally within the ideal range. Although your systolic blood pressure has risen slightly compared to last week, it remains within the normal fluctuation range.'
    })

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.bloodPressure.compareWithLastWeek')}
        </h3>
      </div>

      {/* Comparison boxes */}
      <div className="flex gap-3 mb-4">
        {/* Systolic */}
        <div className="flex-1 p-3 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500 mb-1">
            {t('page.bloodPressure.averageSBP')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: themeColor }}>
              {comparison.current.systolic}
            </span>
            <span className="text-sm text-slate-400">{t('units.mmHg')}</span>
            {summary.systolicChange !== 0 && (
              <div
                className="flex items-center gap-0.5 text-sm font-medium"
                style={{ color: themeColor }}
              >
                {getTrendIcon(summary.systolicTrend)}
                {Math.abs(summary.systolicChange)}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('time.lastWeek')}: {comparison.previous.systolic}{t('units.mmHg')}
          </p>
        </div>

        {/* Diastolic */}
        <div className="flex-1 p-3 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500 mb-1">
            {t('page.bloodPressure.averageDBP')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: themeColor }}>
              {comparison.current.diastolic}
            </span>
            <span className="text-sm text-slate-400">{t('units.mmHg')}</span>
            {summary.diastolicChange !== 0 && (
              <div
                className="flex items-center gap-0.5 text-sm font-medium"
                style={{ color: themeColor }}
              >
                {getTrendIcon(summary.diastolicTrend)}
                {Math.abs(summary.diastolicChange)}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('time.lastWeek')}: {comparison.previous.diastolic}{t('units.mmHg')}
          </p>
        </div>
      </div>

      {/* Insight */}
      <div className="p-4 rounded-2xl bg-sky-50">
        <p className="text-sm text-slate-700 leading-relaxed">
          {insightText}
        </p>
      </div>
    </Card>
  )
}
