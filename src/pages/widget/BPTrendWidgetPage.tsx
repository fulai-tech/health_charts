import { WidgetLayout } from '@/layouts/WidgetLayout'
import { BPTrendWidget } from '@/features/blood-pressure'

/**
 * Blood Pressure Trend Widget Page
 * Renders only the trend chart for iframe embedding
 * Route: /widget/blood-pressure/trend
 */
export function BPTrendWidgetPage() {
  return (
    <WidgetLayout>
      <div className="w-full max-w-md p-4">
        <BPTrendWidget showCard={false} height={200} />
      </div>
    </WidgetLayout>
  )
}

