import { WidgetLayout } from '@/layouts/WidgetLayout'
import { GlucoseTrendyReportCard, type GlucoseDomainModel } from '@/features/glucose'
import { parseUrlJsonData } from '@/lib/utils'

/**
 * Glucose Trend Widget Page
 * Route: /widget/glucose/trend
 * 
 * Accepts data via URL parameter:
 * - data: JSON string containing GlucoseDomainModel
 * 
 * @see src/pages/widget/README.md for JSON format documentation
 */
export function GlucoseTrendWidgetPage() {
  const data = parseUrlJsonData<GlucoseDomainModel>('data')

  return (
    <WidgetLayout>
      <div className="w-full max-w-md p-2">
        <GlucoseTrendyReportCard data={data || undefined} />
      </div>
    </WidgetLayout>
  )
}

