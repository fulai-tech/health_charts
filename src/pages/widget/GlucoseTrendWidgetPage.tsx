import { WidgetLayout } from '@/layouts/WidgetLayout'
import { GlucoseTrendWidget } from '@/features/glucose'

/**
 * Glucose Trend Widget Page
 * Route: /widget/glucose/trend
 */
export function GlucoseTrendWidgetPage() {
  return (
    <WidgetLayout>
      <div className="w-full max-w-md p-4">
        <GlucoseTrendWidget showCard={false} height={200} />
      </div>
    </WidgetLayout>
  )
}

