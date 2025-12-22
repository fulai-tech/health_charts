import { useTranslation } from 'react-i18next'
import { ArrowUp, ArrowDown, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { GlucoseDomainModel } from '../types'

interface GlucoseCompareCardProps {
  data: GlucoseDomainModel
  className?: string
}

/**
 * Glucose Compare Card
 */
export function GlucoseCompareCard({ data, className }: GlucoseCompareCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.glucose

  const { comparison, summary } = data

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return <ArrowUp className="w-4 h-4" />
    }
    if (trend === 'down') {
      return <ArrowDown className="w-4 h-4" />
    }
    return null
  }

  // For glucose, lower is generally better
  const getTrendColor = (trend: string) => {
    if (trend === 'up') return '#EF4444' // Red for increase (bad)
    if (trend === 'down') return '#10B981' // Green for decrease (good)
    return themeColor
  }

  const insightText = comparison.insight || 
    t('page.glucose.defaultInsight', {
      defaultValue: 'Your blood glucose is generally within the normal range. Keep maintaining a balanced diet and regular exercise habits for stable blood sugar levels.'
    })

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.glucose.compareWithLastWeek')}
        </h3>
      </div>

      {/* Comparison boxes */}
      <div className="flex gap-3 mb-4">
        {/* Average Glucose */}
        <div className="flex-1 p-3 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500 mb-1">
            {t('page.glucose.averageGlucose')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: themeColor }}>
              {comparison.current.average.toFixed(1)}
            </span>
            <span className="text-sm text-slate-400">{t('units.mmolL')}</span>
            {summary.changeValue !== 0 && (
              <div
                className="flex items-center gap-0.5 text-sm font-medium"
                style={{ color: getTrendColor(summary.trend) }}
              >
                {getTrendIcon(summary.trend)}
                {Math.abs(summary.changeValue).toFixed(1)}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('time.lastWeek')}: {data.summary.previousAvg.toFixed(1)}{t('units.mmolL')}
          </p>
        </div>

        {/* Fasting Glucose */}
        {summary.avgFasting && (
          <div className="flex-1 p-3 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-500 mb-1">
              {t('page.glucose.fastingLevel')}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: themeColor }}>
                {summary.avgFasting.toFixed(1)}
              </span>
              <span className="text-sm text-slate-400">{t('units.mmolL')}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t('page.glucose.fastingNormal')}: 3.9-6.1
            </p>
          </div>
        )}

        {/* Post-meal Glucose if no fasting */}
        {!summary.avgFasting && summary.avgPostMeal && (
          <div className="flex-1 p-3 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-500 mb-1">
              {t('page.glucose.postMealLevel')}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: themeColor }}>
                {summary.avgPostMeal.toFixed(1)}
              </span>
              <span className="text-sm text-slate-400">{t('units.mmolL')}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t('page.glucose.postMealNormal')}: &lt;7.8
            </p>
          </div>
        )}
      </div>

      {/* Insight */}
      <div className="p-4 rounded-2xl bg-amber-50">
        <p className="text-sm text-slate-700 leading-relaxed">
          {insightText}
        </p>
      </div>
    </Card>
  )
}
