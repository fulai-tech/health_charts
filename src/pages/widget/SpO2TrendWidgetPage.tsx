import { WidgetLayout } from '@/layouts/WidgetLayout'
import { SpO2TrendyReportCard, type SpO2DomainModel } from '@/features/spo2'
import { parseUrlJsonData } from '@/lib/utils'

/**
 * SpO2 Trend Widget Page
 * Route: /widget/spo2/trend
 * 
 * Accepts data via URL parameter:
 * - data: JSON string containing SpO2DomainModel
 * 
 * @see src/pages/widget/README.md for JSON format documentation
 */
export function SpO2TrendWidgetPage() {
  const data = parseUrlJsonData<SpO2DomainModel>('data')

  return (
    <WidgetLayout>
      <div className="w-full max-w-md p-2">
        <SpO2TrendyReportCard data={data || undefined} />
      </div>
    </WidgetLayout>
  )
}

