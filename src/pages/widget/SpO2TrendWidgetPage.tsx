import { WidgetLayout } from '@/layouts/WidgetLayout'
import { SpO2TrendWidget } from '@/features/spo2'

/**
 * SpO2 Trend Widget Page
 * Route: /widget/spo2/trend
 */
export function SpO2TrendWidgetPage() {
  return (
    <WidgetLayout>
      <div className="w-full max-w-md p-4">
        <SpO2TrendWidget showCard={false} height={200} />
      </div>
    </WidgetLayout>
  )
}

