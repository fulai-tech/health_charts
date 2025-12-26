import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Activity, Info, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import { getChartAnimationProps, getOptimizedAnimationDuration } from '@/lib/utils'
import { memo, useMemo } from 'react'

/** Distribution item from backend */
export interface DistributionItem {
  type: string
  label: string
  count: number
  percent: number
  color?: string
}

/** Processed item for display */
interface ProcessedDistributionItem {
  type: string
  label: string
  count: number
  percent: number
  color: string
}

/** Center content configuration */
interface CenterContent {
  /** Primary text (e.g., count or "Good") */
  primary: string | number
  /** Secondary text (e.g., "times" or "on average") */
  secondary: string
}

export interface StatisticsPieChartProps {
  /** Card title translation key */
  titleKey: string
  /** Icon component */
  Icon?: LucideIcon
  /** Theme color for the card */
  themeColor: string
  /** Distribution data */
  distribution: DistributionItem[]
  /** Total count for display */
  totalCount: number
  /** Status order for display */
  statusOrder: string[]
  /** Color mapping for each status type */
  statusColors: Record<string, string>
  /** Label translation key mapping for each status */
  statusLabels: Record<string, string>
  /** Layout variant */
  layout?: 'with-normal-count' | 'list-with-percent' | 'grid'
  /** Content to display in center of pie chart */
  centerContent?: CenterContent
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Use optimized animation duration (for better performance) */
  useOptimizedAnimation?: boolean
  /** Custom normal count text key (for 'with-normal-count' layout) */
  normalCountTextKey?: string
}

/**
 * Generic Statistics Pie Chart Component
 * 
 * Supports three layout variants:
 * 1. 'with-normal-count' - Shows large normal count with grid legend (BP, Glucose)
 * 2. 'list-with-percent' - Shows list with percentages (HR, SpO2)
 * 3. 'grid' - Simple grid layout without special normal count display
 */
const StatisticsPieChartInner = ({
  titleKey,
  Icon = Activity,
  themeColor,
  distribution,
  totalCount,
  statusOrder,
  statusColors,
  statusLabels,
  layout = 'list-with-percent',
  centerContent,
  className,
  isLoading,
  useOptimizedAnimation = false,
  normalCountTextKey,
}: StatisticsPieChartProps) => {
  const { t } = useTranslation()
  const animationProps = useOptimizedAnimation 
    ? { animationDuration: getOptimizedAnimationDuration(800) }
    : getChartAnimationProps()

  // Order and process distribution data
  const orderedDistribution: ProcessedDistributionItem[] = useMemo(
    () => statusOrder.map((type) => {
      const found = distribution.find((d) => d.type === type)
      return {
        type,
        label: t(statusLabels[type] || `status.${type}`),
        count: found?.count || 0,
        percent: found?.percent || 0,
        color: statusColors[type] || '#94A3B8',
      }
    }),
    [distribution, statusOrder, statusColors, statusLabels, t]
  )

  // Filter for display based on layout
  const displayDistribution = useMemo(
    () => layout === 'list-with-percent' 
      ? orderedDistribution.filter(d => d.count > 0 || d.type === 'normal')
      : orderedDistribution,
    [orderedDistribution, layout]
  )

  // Prepare pie chart data
  const pieData = useMemo(
    () => displayDistribution.map((d) => ({
      name: d.label,
      value: d.percent > 0 ? d.percent : 0.1,
      color: d.color,
    })),
    [displayDistribution]
  )

  // Calculate normal count for 'with-normal-count' layout
  const normalCount = useMemo(
    () => orderedDistribution
      .filter((d) => d.type === 'normal' || d.type === 'high_normal')
      .reduce((sum, d) => sum + d.count, 0),
    [orderedDistribution]
  )

  // Determine center content
  const resolvedCenterContent: CenterContent = centerContent || {
    primary: totalCount,
    secondary: layout === 'with-normal-count' ? t('common.inAverage') : t('common.times'),
  }

  // Determine pie chart size based on layout
  const pieSize = layout === 'with-normal-count' 
    ? { width: 'w-40', height: 'h-40', innerRadius: 50, outerRadius: 72 }
    : { width: 'w-32', height: 'h-32', innerRadius: 40, outerRadius: 58 }

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

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5" style={{ color: themeColor }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t(titleKey)}
        </h3>
        <Info className="w-4 h-4 text-slate-400" />
      </div>

      <div className="flex items-center justify-between">
        {/* Left: Stats Display */}
        <div className="flex-1 min-w-0">
          {layout === 'with-normal-count' && (
            <>
              {/* Normal count display */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: themeColor }}>
                    {normalCount}
                  </span>
                  <span className="text-base text-slate-400">
                    / {totalCount} {t('common.times')}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {t(normalCountTextKey || 'page.bloodPressure.normalResults')}
                </p>
              </div>

              {/* Grid legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {displayDistribution.map((item) => (
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
            </>
          )}

          {layout === 'list-with-percent' && (
            /* List with percentage */
            <div className="space-y-3">
              {displayDistribution.map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600 w-16">{item.label}</span>
                  <span
                    className="text-sm font-semibold w-12"
                    style={{ color: item.color }}
                  >
                    {item.percent}%
                  </span>
                  <span className="text-sm" style={{ color: item.color }}>
                    {item.count} {t('common.times')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {layout === 'grid' && (
            /* Simple grid */
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {displayDistribution.map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Donut Chart */}
        <div className={`${pieSize.width} ${pieSize.height} relative flex-shrink-0 ml-2`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={pieSize.innerRadius}
                outerRadius={pieSize.outerRadius}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
                {...animationProps}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              className={layout === 'with-normal-count' ? 'text-lg font-bold' : 'text-2xl font-bold'}
              style={{ color: themeColor }}
            >
              {resolvedCenterContent.primary}
            </span>
            <span className="text-xs text-slate-400">
              {resolvedCenterContent.secondary}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export const StatisticsPieChart = memo(StatisticsPieChartInner)
