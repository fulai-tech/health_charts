import { WidgetLayout } from '@/layouts/WidgetLayout'
import { HRTrendWidget } from '@/features/heart-rate'

/**
 * Heart Rate Trend Widget Page
 * Route: /widget/heart-rate/trend
 */
export function HRTrendWidgetPage() {
  return (
    <WidgetLayout>
      <div className="w-full max-w-md p-4">
        <HRTrendWidget showCard={false} height={200} />
      </div>
    </WidgetLayout>
  )
}

