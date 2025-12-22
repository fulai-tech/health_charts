import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { HRTrendWidget, HRSummaryCard } from '@/features/heart-rate'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

/**
 * Heart Rate Details Page
 * Route: /details/heart-rate
 */
export function HeartRatePage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Summary Card */}
        <HRSummaryCard />

        {/* Trend Chart */}
        <HRTrendWidget height={240} />

        {/* Weekly Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('page.heartRate.weeklyComparison')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <InsightItem
                labelKey="page.heartRate.restingHR"
                value="65"
                unit={t('units.bpm')}
                change="-2"
                isPositive={true}
              />
              <InsightItem
                labelKey="page.heartRate.maxHR"
                value="142"
                unit={t('units.bpm')}
                change="+5"
                isPositive={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Health Tips */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 text-sm">💡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 mb-1">
                  {t('vitals.heartRate')}
                </p>
                <p className="text-sm text-slate-500">
                  正常成人静息心率为 60-100 次/分钟。规律运动可以降低静息心率，提高心脏效率。建议避免过度咖啡因摄入。
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

