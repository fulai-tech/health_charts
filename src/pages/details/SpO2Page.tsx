import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { SpO2TrendWidget, SpO2SummaryCard } from '@/features/spo2'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

/**
 * SpO2 Details Page
 * Route: /details/spo2
 */
export function SpO2Page() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Summary Card */}
        <SpO2SummaryCard />

        {/* Trend Chart */}
        <SpO2TrendWidget height={240} />

        {/* Weekly Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('page.spo2.weeklyComparison')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <InsightItem
                labelKey="common.average"
                value="97"
                unit={t('units.percent')}
                change="+0.5"
                isPositive={true}
              />
              <InsightItem
                labelKey="common.min"
                value="95"
                unit={t('units.percent')}
                change="+1"
                isPositive={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Health Tips */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-500 text-sm">💡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 mb-1">
                  {t('vitals.spo2')}
                </p>
                <p className="text-sm text-slate-500">
                  正常血氧饱和度应保持在 95% 以上。若低于 90%，建议及时就医检查。保持良好的呼吸习惯和适当运动有助于维持血氧水平。
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

