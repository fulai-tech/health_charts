import { useTranslation } from 'react-i18next'
import { TrendingUp, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES } from '@/config/theme'
import type { BPDomainModel } from '../types'
import { memo, useMemo } from 'react'
import { TrendLineChart } from '@/components/charts/TrendLineChart'

interface BPTrendyReportCardProps {
  data?: BPDomainModel
  className?: string
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number
    name: string
  }>
  label?: string
}

const CustomTooltip = memo(({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null

  const systolicItem = payload.find(p => p.dataKey === 'systolic' && p.name === 'systolic')
  const diastolicItem = payload.find(p => p.dataKey === 'diastolic' && p.name === 'diastolic')

  return (
    <div className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
      <p className="font-medium mb-1">{label}</p>
      {systolicItem && (
        <p className="text-orange-300">SBP: {systolicItem.value}</p>
      )}
      {diastolicItem && (
        <p className="text-emerald-300">DBP: {diastolicItem.value}</p>
      )}
    </div>
  )
})

const BPTrendyReportCardInner = ({ data, className, isLoading }: BPTrendyReportCardProps) => {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.bp

  // Placeholder data when no real data
  const placeholderChartData = [
    { name: 'Mon', systolic: 120, diastolic: 80 },
    { name: 'Tues', systolic: 118, diastolic: 78 },
    { name: 'Wed', systolic: 122, diastolic: 82 },
    { name: 'Thu', systolic: 119, diastolic: 79 },
    { name: 'Fri', systolic: 121, diastolic: 81 },
    { name: 'Sat', systolic: 117, diastolic: 77 },
    { name: 'Sun', systolic: 120, diastolic: 80 },
  ]

  const chartData = useMemo(
    () => data?.chartData?.map((point, index) => ({
      name: ['Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7],
      systolic: point.systolic,
      diastolic: point.diastolic,
    })) ?? placeholderChartData,
    [data?.chartData]
  )

  return (
    <Card className={`${className} relative`}>
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        style={{ backgroundColor: UI_STYLES.loadingOverlay }}
      >
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: themeColor }} />
          <h3 className="text-base font-semibold text-slate-800">
            {t('page.bloodPressure.trendyReport')}
          </h3>
        </div>
        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{t('common.loading')}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 p-3 rounded-xl bg-orange-50">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold" style={{ color: themeColor }}>
              {data?.summary?.avgSystolic ?? '--'}
            </span>
            <span className="text-sm text-slate-500">{t('units.mmHg')}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('page.bloodPressure.weeksAverageSBP')}
          </p>
        </div>
        <div className="flex-1 p-3 rounded-xl bg-orange-50">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold" style={{ color: themeColor }}>
              {data?.summary?.avgDiastolic ?? '--'}
            </span>
            <span className="text-sm text-slate-500">{t('units.mmHg')}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('page.bloodPressure.weeksAverageDBP')}
          </p>
        </div>
      </div>

      <TrendLineChart
        data={chartData}
        lines={[
          {
            dataKey: 'systolic',
            color: themeColor,
            label: t('vitals.sbp'),
            showArea: true,
            gradientId: 'sbpGradient',
            legendShape: 'circle',
          },
          {
            dataKey: 'diastolic',
            color: '#10B981',
            label: t('vitals.dbp'),
            showArea: true,
            gradientId: 'dbpGradient',
            legendShape: 'circle',
          },
        ]}
        xAxisKey="name"
        yAxisDomain={[50, 150]}
        renderTooltip={(props) => <CustomTooltip {...props} />}
        height={224}
      />
    </Card>
  )
}

export const BPTrendyReportCard = memo(BPTrendyReportCardInner)
