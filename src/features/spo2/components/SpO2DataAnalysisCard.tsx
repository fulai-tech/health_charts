import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { SpO2DomainModel } from '../types'

interface SpO2DataAnalysisCardProps {
  data: SpO2DomainModel
  className?: string
}

/**
 * SpO2 Data Analysis Card
 */
export function SpO2DataAnalysisCard({ data, className }: SpO2DataAnalysisCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.spo2

  const { dataAnalysis } = data.weeklySummary

  // If no analysis data, show default messages
  const analysisItems = dataAnalysis.length > 0
    ? dataAnalysis
    : [
        { content: t('page.spo2.defaultAnalysis1', { avg: data.summary.avgValue }) },
        { content: t('page.spo2.defaultAnalysis2', { max: data.summary.maxValue, maxDay: t(data.summary.maxWeekdayKey) }) },
        { content: t('page.spo2.defaultAnalysis3', { min: data.summary.minValue, minDay: t(data.summary.minWeekdayKey) }) },
      ]

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.spo2.dataAnalysis')}
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

