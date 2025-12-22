import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { GlucoseDomainModel } from '../types'

interface GlucoseWeeklyOverviewCardProps {
  data: GlucoseDomainModel
  className?: string
}

/**
 * Glucose Weekly Overview Card
 */
export function GlucoseWeeklyOverviewCard({
  data,
  className,
}: GlucoseWeeklyOverviewCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.glucose

  const { weeklySummary } = data

  const overviewText = weeklySummary.overview || 
    t('page.glucose.defaultOverview', {
      defaultValue: 'Your blood glucose levels are generally within the normal range this week. Keep up the good work with your diet and exercise habits!'
    })

  const highlightsText = weeklySummary.highlights ||
    t('page.glucose.defaultHighlights', {
      defaultValue: 'The trend chart shows some fluctuations in your blood glucose levels during the week. Pay attention to your diet, especially after meals, to maintain stable blood sugar levels.'
    })

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.glucose.weeklyOverview')}
        </h3>
      </div>

      {/* Overall Situation */}
      <div className="mb-5">
        <span 
          className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium mb-2"
          style={{ backgroundColor: '#4ADE80' }}
        >
          {t('page.glucose.overallSituation')}
        </span>
        <p className="text-sm text-slate-600 leading-relaxed">
          {overviewText}
        </p>
      </div>

      {/* Needs Attention */}
      <div className="mb-5">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-medium mb-2">
          {t('page.glucose.needsAttention')}
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
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
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
          {t('page.glucose.disclaimer')}
        </p>
      </div>
    </Card>
  )
}
