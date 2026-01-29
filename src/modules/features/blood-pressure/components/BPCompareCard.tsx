import { useTranslation } from 'react-i18next'
import { ArrowUp, ArrowDown, BarChart3, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES } from '@/config/theme'
import type { BPDomainModel } from '../types'
import { memo, useMemo } from 'react'

interface BPCompareCardProps {
  data?: BPDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * BP Compare Card
 */
const BPCompareCardInner = ({ data, className, isLoading }: BPCompareCardProps) => {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.bp

  // Default values when data is not available
  const comparison = data?.comparison ?? { current: { systolic: 0, diastolic: 0 }, previous: { systolic: 0, diastolic: 0 }, insight: null }
  const summary = data?.summary ?? { systolicChange: 0, diastolicChange: 0, systolicTrend: 'stable', diastolicTrend: 'stable' } as any

  const getTrendIcon = useMemo(() => {
    return (trend: string) => {
      if (trend === 'up') {
        return <ArrowUp className="w-4 h-4" />
      }
      if (trend === 'down') {
        return <ArrowDown className="w-4 h-4" />
      }
      return null
    }
  }, [])

  const insightText = useMemo(
    () =>
      comparison.insight ||
      t('page.bloodPressure.defaultInsight', {
        defaultValue: 'Your blood pressure is generally within the ideal range. Although your systolic blood pressure has risen slightly compared to last week, it remains within the normal fluctuation range.'
      }),
    [comparison.insight, t]
  )

  return (
    <Card className={`${className} relative overflow-hidden`}>
      {/* Loading overlay */}
      <div 
        className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: UI_STYLES.loadingOverlay }}
      >
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.bloodPressure.compareWithLastWeek')}
        </h3>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 p-3 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500 mb-1">
            {t('page.bloodPressure.averageSBP')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: themeColor }}>
              {data ? comparison.current.systolic : '--'}
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
            {t('time.lastWeek')}: {data ? comparison.previous.systolic : '--'}{t('units.mmHg')}
          </p>
        </div>

        <div className="flex-1 p-3 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500 mb-1">
            {t('page.bloodPressure.averageDBP')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: themeColor }}>
              {data ? comparison.current.diastolic : '--'}
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
            {t('time.lastWeek')}: {data ? comparison.previous.diastolic : '--'}{t('units.mmHg')}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-sky-50">
        <p className="text-sm text-slate-700 leading-relaxed">
          {insightText}
        </p>
      </div>
    </Card>
  )
}

export const BPCompareCard = memo(BPCompareCardInner)
