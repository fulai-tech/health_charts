import { useTranslation } from 'react-i18next'
import { FileText, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES } from '@/config/theme'
import type { SpO2DomainModel } from '../types'

interface SpO2WeeklyOverviewCardProps {
  data?: SpO2DomainModel
  className?: string
  isLoading?: boolean
}

/**
 * SpO2 Weekly Overview Card
 */
export function SpO2WeeklyOverviewCard({ data, className, isLoading }: SpO2WeeklyOverviewCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.spo2

  const weeklySummary = data?.weeklySummary

  // Default overview text if not provided
  const overviewText =
    weeklySummary?.overview ||
    t('page.spo2.defaultOverview', {
      defaultValue:
        'Your blood pressure is generally within the ideal range. Although your systolic blood pressure has risen slightly compared to last week, it remains within the normal fluctuation range.',
    })

  // Default highlights text if not provided
  const highlightsText =
    weeklySummary?.highlights ||
    t('page.spo2.defaultHighlights', {
      defaultValue:
        'The trend chart shows that your blood pressure rose significantly during the week (Wednesday and Thursday), with a peak systolic pressure approaching 150 mmHg. Meanwhile, the statistics show that your blood pressure measurements fluctuated considerably across different levels. We will continue to monitor your condition and help you identify any possible causes for the elevated blood pressure.',
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
          {t('page.spo2.weeklyOverview')}
        </h3>
      </div>

      {/* Overall Situation */}
      <div className="mb-5">
        <span
          className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium mb-2"
          style={{ backgroundColor: '#4ADE80' }}
        >
          {t('page.spo2.overallSituation')}
        </span>
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: '#F8F9FA',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
          }}
        >
          <p className="text-sm text-slate-600 leading-relaxed">{overviewText}</p>
        </div>
      </div>

      {/* Anomaly Alert */}
      <div className="mb-5">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-medium mb-2">
          {t('page.spo2.anomalyAlert')}
        </span>
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: '#F8F9FA',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
          }}
        >
          <p className="text-sm text-slate-600 leading-relaxed">{highlightsText}</p>
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

