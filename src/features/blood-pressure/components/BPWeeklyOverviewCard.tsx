import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { BPDomainModel } from '../types'

interface BPWeeklyOverviewCardProps {
  data: BPDomainModel
  weeklySummary?: {
    overview: string | null
    highlights: string | null
    suggestions: string[]
  }
  className?: string
}

/**
 * BP Weekly Overview Card
 */
export function BPWeeklyOverviewCard({
  data: _data,
  weeklySummary,
  className,
}: BPWeeklyOverviewCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.bp

  const overviewText = weeklySummary?.overview || 
    'Your blood pressure is generally within the ideal range. Although your systolic blood pressure has risen slightly compared to last week, it remains within the normal fluctuation range.'

  const highlightsText = weeklySummary?.highlights ||
    'The trend chart shows that your blood pressure rose significantly during the week (Wednesday and Thursday), with a peak systolic pressure approaching 150 mmHg. Meanwhile, the statistics show that your blood pressure measurements fluctuated considerably across different levels. We will continue to monitor your condition and help you identify any possible causes for the elevated blood pressure.'

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.bloodPressure.weeklyOverview')}
        </h3>
      </div>

      {/* Overall Situation */}
      <div className="mb-5">
        <span 
          className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium mb-2"
          style={{ backgroundColor: themeColor }}
        >
          {t('page.bloodPressure.overallSituation')}
        </span>
        <p className="text-sm text-slate-600 leading-relaxed">
          {overviewText}
        </p>
      </div>

      {/* Needs Attention */}
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-medium mb-2">
          {t('page.bloodPressure.needsAttention')}
        </span>
        <p className="text-sm text-slate-600 leading-relaxed">
          {highlightsText}
        </p>
      </div>

      {/* Suggestions */}
      {weeklySummary?.suggestions && weeklySummary.suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <ul className="space-y-2">
            {weeklySummary.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
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
