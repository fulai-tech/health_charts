import { useTranslation } from 'react-i18next'
import { BarChart3, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES } from '@/config/theme'
import type { HRDomainModel } from '../types'

interface HRDataAnalysisCardProps {
  data?: HRDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * HR Data Analysis Card
 */
export function HRDataAnalysisCard({ data, className, isLoading }: HRDataAnalysisCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.heartRate

  const dataAnalysis = data?.weeklySummary?.dataAnalysis ?? []

  // If no analysis data, show default messages
  const analysisItems = dataAnalysis.length > 0
    ? dataAnalysis
    : [
        { content: t('page.heartRate.defaultAnalysis1', { avg: data?.summary?.avgValue ?? '--' }) },
        { content: t('page.heartRate.defaultAnalysis2', { max: data?.summary?.maxValue ?? '--', maxDay: data ? t(data.summary.maxWeekdayKey) : '--' }) },
        { content: t('page.heartRate.defaultAnalysis3', { min: data?.summary?.minValue ?? '--', minDay: data ? t(data.summary.minWeekdayKey) : '--' }) },
      ]

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
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.heartRate.dataAnalysis')}
        </h3>
      </div>

      {/* Analysis Items */}
      <ul className="space-y-3">
        {analysisItems.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: '#F8F8F8' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
              style={{ backgroundColor: themeColor }}
            />
            <p className="text-sm text-slate-600 leading-relaxed">
              {item.content}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
