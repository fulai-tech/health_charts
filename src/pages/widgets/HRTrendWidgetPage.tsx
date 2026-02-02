import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { HRTrendyReportCard, type HRDomainModel } from '@/modules/features/heart-rate'
import { parseUrlJsonData } from '@/lib/utils'

/**
 * Heart Rate Trend Widget Page
 * Route: /widget/heart-rate/trend
 * 
 * Accepts data via URL parameter:
 * - data: JSON string containing HRDomainModel
 * 
 * @see src/pages/widget/README.md for JSON format documentation
 */
export function HRTrendWidgetPage() {
  const data = parseUrlJsonData<HRDomainModel>('data')

  return (
    <WidgetLayout>
      <div className="w-full max-w-md p-2">
        <HRTrendyReportCard data={data || undefined} />
      </div>
    </WidgetLayout>
  )
}

