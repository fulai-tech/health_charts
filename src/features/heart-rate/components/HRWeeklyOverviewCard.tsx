import { useTranslation } from 'react-i18next'
import { FileText, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES } from '@/config/theme'
import type { HRDomainModel } from '../types'

interface HRWeeklyOverviewCardProps {
  data?: HRDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * HR Weekly Overview Card
 */
export function HRWeeklyOverviewCard({ data, className, isLoading }: HRWeeklyOverviewCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.heartRate

  const weeklySummary = data?.weeklySummary

  const overviewText = weeklySummary?.overview ||
    t('page.heartRate.defaultOverview', {
      defaultValue: 'Your heart rate is generally within the normal range this week. Keep up with your regular exercise routine!'
    })

  const highlightsText = weeklySummary?.highlights ||
    t('page.heartRate.defaultHighlights', {
      defaultValue: 'The trend chart shows some fluctuations in your heart rate during the week. This is normal and can be influenced by physical activity, stress levels, and sleep quality.'
    })

  return (
    <Card className={`${className} relative overflow-hidden`}>
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        style={{ backgroundColor: UI_STYLES.loadingOverlay }}
      >
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.heartRate.weeklyOverview')}
        </h3>
      </div>

      {/* Overall Situation */}
      <div className="mb-5">
        <span
          className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium mb-2"
          style={{ backgroundColor: '#4ADE80' }}
        >
          {t('page.heartRate.overallSituation')}
        </span>
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: '#F8F9FA',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
          }}
        >
          <p className="text-sm text-slate-600 leading-relaxed">
            {overviewText}
          </p>
        </div>
      </div>

      {/* Anomaly Alert */}
      <div className="mb-5">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-medium mb-2">
          {t('page.heartRate.anomalyAlert')}
        </span>
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: '#F8F9FA',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
          }}
        >
          <p className="text-sm text-slate-600 leading-relaxed">
            {highlightsText}
          </p>
        </div>
      </div>

      {/* Suggestions */}
      {weeklySummary?.suggestions && weeklySummary.suggestions.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <ul className="space-y-2">
            {weeklySummary.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <span style={{ color: themeColor }}>•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
