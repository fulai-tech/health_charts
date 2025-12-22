import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { SpO2DomainModel } from '../types'

interface SpO2WeeklyOverviewCardProps {
  data: SpO2DomainModel
  className?: string
}

/**
 * SpO2 Weekly Overview Card
 */
export function SpO2WeeklyOverviewCard({ data, className }: SpO2WeeklyOverviewCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.spo2

  const { weeklySummary } = data

  // Default overview text if not provided
  const overviewText =
    weeklySummary.overview ||
    t('page.spo2.defaultOverview', {
      defaultValue:
        'Your blood pressure is generally within the ideal range. Although your systolic blood pressure has risen slightly compared to last week, it remains within the normal fluctuation range.',
    })

  // Default highlights text if not provided
  const highlightsText =
    weeklySummary.highlights ||
    t('page.spo2.defaultHighlights', {
      defaultValue:
        'The trend chart shows that your blood pressure rose significantly during the week (Wednesday and Thursday), with a peak systolic pressure approaching 150 mmHg. Meanwhile, the statistics show that your blood pressure measurements fluctuated considerably across different levels. We will continue to monitor your condition and help you identify any possible causes for the elevated blood pressure.',
    })

  return (
    <Card className={className}>
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
        <p className="text-sm text-slate-600 leading-relaxed">{overviewText}</p>
      </div>

      {/* Anomaly Alert */}
      <div className="mb-5">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-medium mb-2">
          {t('page.spo2.anomalyAlert')}
        </span>
        <p className="text-sm text-slate-600 leading-relaxed">{highlightsText}</p>
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
          {t('page.spo2.disclaimer')}
        </p>
      </div>
    </Card>
  )
}

