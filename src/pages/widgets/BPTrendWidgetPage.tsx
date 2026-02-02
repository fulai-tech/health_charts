import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { BPTrendyReportCard, type BPDomainModel } from '@/modules/features/blood-pressure'
import { parseUrlJsonData } from '@/lib/utils'

/**
 * Blood Pressure Trend Widget Page
 * Route: /widget/blood-pressure/trend
 * 
 * Accepts data via URL parameter:
 * - data: JSON string containing BPDomainModel
 * 
 * @see src/pages/widget/README.md for JSON format documentation
 */
export function BPTrendWidgetPage() {
  const data = parseUrlJsonData<BPDomainModel>('data')

  return (
    <WidgetLayout>
      <div className="w-full max-w-md p-2">
        <BPTrendyReportCard data={data || undefined} />
      </div>
    </WidgetLayout>
  )
}

