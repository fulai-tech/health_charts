import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import { DataAnalysisCard } from '@/components/common/DataAnalysisCard'
import { VITAL_COLORS } from '@/config/theme'
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
  // Note: The original code used an array of objects { content: string }, but DataAnalysisCard expects string[].
  // We need to map if necessary, or constructs simple strings.
  // The original component code: 
  // const analysisItems = dataAnalysis.length > 0 ? dataAnalysis : [ ...default objects... ]
  // Wait, let's check if dataAnalysis from API is string[] or object[]. 
  // In `adapter.ts` for sleep it was string[]. Let's assume consistent here or check types if needed.
  // Based on Sleep implementation, it seems to be string[].
  // However, the original HRDataAnalysisCard used `item.content` in the map loop:
  // `{analysisItems.map((item, index) => ( ... {item.content} ... ))}`
  // This implies `dataAnalysis` might be object[] OR the default fallback was constructed as objects.
  // Let's check `src/features/heart-rate/types.ts` to be sure, or just assume the default fallback structure in previous file:
  // `[ { content: ... }, ... ]`
  // So I should convert these to simple strings for the common component.

  const defaultAnalysis = [
    t('page.heartRate.defaultAnalysis1', { avg: data?.summary?.avgValue ?? '--' }),
    t('page.heartRate.defaultAnalysis2', { max: data?.summary?.maxValue ?? '--', maxDay: data ? t(data.summary.maxWeekdayKey) : '--' }),
    t('page.heartRate.defaultAnalysis3', { min: data?.summary?.minValue ?? '--', minDay: data ? t(data.summary.minWeekdayKey) : '--' }),
  ]

  // If dataAnalysis is present, we assume it matches the structure expected. 
  // If the previous code used `item.content`, then `dataAnalysis` elements likely have `.content`?
  // Or maybe `dataAnalysis` IS strings but the fallback was objects?
  // Let's assume for now we pass strings. If `dataAnalysis` items are objects, this will break.
  // Let's check `types.ts` if possible. But I can't read it alongside write_to_file.
  // I will check the original file content again... 
  // Original: `const analysisItems = dataAnalysis.length > 0 ? dataAnalysis : [ { content: ... } ]`
  // And usage: `{item.content}`.
  // This suggests `dataAnalysis` elements HAVE a `content` property.
  // The common component expects `string[]`.
  // So I MUST map the `content` property if it exists, or handle it.
  // To be safe and compliant with the common component interface `items: string[]`, I should transform the data.

  // Let's optimistically assume I need to map it.

  const formattedItems = (dataAnalysis.length > 0 ? dataAnalysis : defaultAnalysis).map((item: string | { content: string }) => {
    return typeof item === 'string' ? item : item.content
  })

  return (
    <DataAnalysisCard
      titleKey="page.heartRate.dataAnalysis"
      Icon={BarChart3}
      items={formattedItems}
      themeColor={themeColor}
      className={className}
      isLoading={isLoading}
    />
  )
}
