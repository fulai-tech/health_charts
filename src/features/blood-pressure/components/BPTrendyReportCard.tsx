import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS } from '@/config/theme'
import type { BPDomainModel } from '../types'

interface BPTrendyReportCardProps {
  data: BPDomainModel
  className?: string
}

/**
 * Custom Tooltip component
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number
    name: string
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
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
}

/**
 * BP Trendy Report Card
 */
export function BPTrendyReportCard({ data, className }: BPTrendyReportCardProps) {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.bp

  const chartData = data.chartData.map((point, index) => ({
    name: ['Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7],
    systolic: point.systolic,
    diastolic: point.diastolic,
  }))

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.bloodPressure.trendyReport')}
        </h3>
      </div>

      {/* Average Values */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 p-3 rounded-xl bg-orange-50">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold" style={{ color: themeColor }}>
              {data.summary.avgSystolic}
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
              {data.summary.avgDiastolic}
            </span>
            <span className="text-sm text-slate-500">{t('units.mmHg')}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('page.bloodPressure.weeksAverageDBP')}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColor }} />
          <span className="text-xs text-slate-500">{t('vitals.sbp')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-500">{t('vitals.dbp')}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="sbpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={themeColor} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="dbpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              domain={[60, 160]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="systolic"
              stroke="transparent"
              fill="url(#sbpGradient)"
              name="systolic-area"
            />
            <Area
              type="monotone"
              dataKey="diastolic"
              stroke="transparent"
              fill="url(#dbpGradient)"
              name="diastolic-area"
            />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke={themeColor}
              strokeWidth={2}
              dot={{ fill: themeColor, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: themeColor, strokeWidth: 2, fill: '#fff' }}
              name="systolic"
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
              name="diastolic"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
