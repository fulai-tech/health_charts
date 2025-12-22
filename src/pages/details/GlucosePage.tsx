import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { GlucoseTrendWidget, GlucoseSummaryCard } from '@/features/glucose'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

/**
 * Blood Glucose Details Page
 * Route: /details/glucose
 */
export function GlucosePage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Summary Card */}
        <GlucoseSummaryCard />

        {/* Trend Chart */}
        <GlucoseTrendWidget height={240} />

        {/* Weekly Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('page.glucose.weeklyComparison')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <InsightItem
                labelKey="page.glucose.fastingLevel"
                value="5.2"
                unit={t('units.mmolL')}
                change="-0.3"
                isPositive={true}
              />
              <InsightItem
                labelKey="page.glucose.postMealLevel"
                value="7.8"
                unit={t('units.mmolL')}
                change="-0.5"
                isPositive={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Health Tips */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-500 text-sm">💡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 mb-1">
                  {t('vitals.glucose')}
                </p>
                <p className="text-sm text-slate-500">
                  空腹血糖正常范围为 3.9-6.1 mmol/L，餐后两小时血糖应低于 7.8 mmol/L。保持规律饮食和适当运动有助于血糖控制。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

interface InsightItemProps {
  labelKey: string
  value: string
  unit: string
  change: string
  isPositive: boolean
}

function InsightItem({
  labelKey,
  value,
  unit,
  change,
  isPositive,
}: InsightItemProps) {
  const { t } = useTranslation()

  return (
    <div className="p-3 rounded-xl bg-slate-50">
      <p className="text-xs text-slate-500 mb-1">{t(labelKey)}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-semibold text-slate-800">{value}</span>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      <div
        className={`text-xs mt-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}
      >
        {change} vs 上周
      </div>
    </div>
  )
}

