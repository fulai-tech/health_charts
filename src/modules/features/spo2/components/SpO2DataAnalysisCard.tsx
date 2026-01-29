import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import { DataAnalysisCard } from '@/components/common/DataAnalysisCard'
import { VITAL_COLORS } from '@/config/theme'
import type { SpO2DomainModel } from '../types'

interface SpO2DataAnalysisCardProps {
  data?: SpO2DomainModel
  className?: string
  isLoading?: boolean
}

/**
 * SpO2 Data Analysis Card
 */
export function SpO2DataAnalysisCard({ data, className, isLoading }: SpO2DataAnalysisCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.spo2

  const dataAnalysis = data?.weeklySummary?.dataAnalysis ?? []

  // If no analysis data, show default messages
  const defaultAnalysis = [
    t('page.spo2.defaultAnalysis1', { avg: data?.summary?.avgValue ?? '--' }),
    t('page.spo2.defaultAnalysis2', { max: data?.summary?.maxValue ?? '--', maxDay: data ? t(data.summary.maxWeekdayKey) : '--' }),
    t('page.spo2.defaultAnalysis3', { min: data?.summary?.minValue ?? '--', minDay: data ? t(data.summary.minWeekdayKey) : '--' }),
  ]

  // Similar to HR, we need to ensure items are strings. 
  // Original SpO2DataAnalysisCard used item.content, so we map.
  const formattedItems = (dataAnalysis.length > 0 ? dataAnalysis : defaultAnalysis).map((item: any) => {
    return typeof item === 'string' ? item : item.content
  })

  return (
    <DataAnalysisCard
      titleKey="page.spo2.dataAnalysis"
      Icon={BarChart3}
      items={formattedItems}
      themeColor={themeColor}
      className={className}
      isLoading={isLoading}
    />
  )
}
