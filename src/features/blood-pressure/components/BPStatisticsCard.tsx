import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Info, Activity, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { VITAL_COLORS, UI_STYLES, STATUS_COLORS } from '@/config/theme'
import type { BPDomainModel } from '../types'
import { memo, useMemo } from 'react'
import { getOptimizedAnimationDuration } from '@/lib/utils'

interface BPStatisticsCardProps {
  data?: BPDomainModel
  className?: string
  isLoading?: boolean
}

const STAT_LABELS: Record<string, string> = {
  normal: 'status.normal',
  high_normal: 'status.normalHighValue',
  low_bp: 'status.tooLow',
  high_bp: 'status.tooHigh',
}

const STAT_ORDER = ['normal', 'high_normal', 'low_bp', 'high_bp']

/**
 * BP Statistics Card
 */
const BPStatisticsCardInner = ({ data, className, isLoading }: BPStatisticsCardProps) => {
  const { t } = useTranslation()
  const themeColor = VITAL_COLORS.bp

  const distribution = data?.summary?.distribution ?? []
  const totalCount = data?.summary?.totalCount ?? 0

  const orderedDistribution = useMemo(
    () => STAT_ORDER.map((type) => {
      const found = distribution.find((d) => d.type === type)
      return {
        type,
        label: t(STAT_LABELS[type]),
        count: found?.count || 0,
        percent: found?.percent || 0,
        color: STATUS_COLORS.bp[type as keyof typeof STATUS_COLORS.bp] || '#94A3B8',
      }
    }),
    [distribution, t]
  )

  const normalCount = useMemo(
    () =>
      orderedDistribution
        .filter((d) => d.type === 'normal' || d.type === 'high_normal')
        .reduce((sum, d) => sum + d.count, 0),
    [orderedDistribution]
  )

  const pieData = useMemo(
    () =>
      orderedDistribution.map((d) => ({
        name: d.label,
        value: d.percent > 0 ? d.percent : 0.1,
        color: d.color,
      })),
    [orderedDistribution]
  )

  const animationDuration = getOptimizedAnimationDuration(800)

  return (
    <Card className={`${className} relative overflow-hidden`}>
      {/* Loading overlay */}
      <div 
        className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 ease-in-out ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: UI_STYLES.loadingOverlay }}
      >
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.bloodPressure.bpStatistics')}
        </h3>
        <Info className="w-4 h-4 text-slate-400" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold" style={{ color: themeColor }}>
                {normalCount}
              </span>
              <span className="text-base text-slate-400">/ {totalCount} {t('common.times')}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {t('page.bloodPressure.normalResults')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {orderedDistribution.map((item) => (
              <div key={item.type} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span
                  className="text-base font-semibold ml-[18px]"
                  style={{ color: item.color }}
                >
                  {item.count} {item.count === 1 ? t('common.time') : t('common.times')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-40 h-40 relative flex-shrink-0 ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
                animationDuration={animationDuration}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold" style={{ color: themeColor }}>
              {t('common.good')}
            </span>
            <span className="text-xs text-slate-400">{t('common.inAverage')}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export const BPStatisticsCard = memo(BPStatisticsCardInner)
