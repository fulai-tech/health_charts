import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { HRDomainModel } from '../types'

interface HRWeeklyOverviewCardProps {
  data: HRDomainModel
  className?: string
}

/**
 * HR Weekly Overview Card
 */
export function HRWeeklyOverviewCard({ data, className }: HRWeeklyOverviewCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.heartRate

  const { weeklySummary } = data

  const overviewText = weeklySummary.overview || 
    t('page.heartRate.defaultOverview', {
      defaultValue: 'Your heart rate is generally within the normal range this week. Keep up with your regular exercise routine!'
    })

  const highlightsText = weeklySummary.highlights ||
    t('page.heartRate.defaultHighlights', {
      defaultValue: 'The trend chart shows some fluctuations in your heart rate during the week. This is normal and can be influenced by physical activity, stress levels, and sleep quality.'
    })

  return (
    <Card className={className}>
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
        <p className="text-sm text-slate-600 leading-relaxed">
          {overviewText}
        </p>
      </div>

      {/* Anomaly Alert */}
      <div className="mb-5">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-medium mb-2">
          {t('page.heartRate.anomalyAlert')}
        </span>
        <p className="text-sm text-slate-600 leading-relaxed">
          {highlightsText}
        </p>
      </div>

      {/* Suggestions */}
      {weeklySummary.suggestions && weeklySummary.suggestions.length > 0 && (
        <div className="mb-5 pt-4 border-t border-slate-100">
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

      {/* Medical Disclaimer */}
      <div className="pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 leading-relaxed">
          {t('page.heartRate.disclaimer')}
        </p>
      </div>
    </Card>
  )
}
