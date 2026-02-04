import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Moon, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import type { SleepDomainModel } from '../types'
import { memo, useMemo } from 'react'
import { StackedBarChart, type BarLayer } from '@/components/charts/StackedBarChart'

interface SleepTrendyReportCardProps {
    data?: SleepDomainModel
    className?: string
    isLoading?: boolean
}

interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{
        dataKey: string
        value: number
        name: string
        fill: string
    }>
    label?: string
}

const CustomTooltip = memo(({ active, payload, label }: CustomTooltipProps) => {
    const { t } = useTranslation()
    if (!active || !payload || payload.length === 0) return null

    const deep = payload.find(p => p.dataKey === 'deep')
    const light = payload.find(p => p.dataKey === 'light')
    const rem = payload.find(p => p.dataKey === 'rem')
    const awake = payload.find(p => p.dataKey === 'awake')

    const formatMinutes = (mins: number) => {
        const hours = Math.floor(mins / 60)
        const minutes = mins % 60
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    }

    return (
        <div className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
            <p className="font-medium mb-1">{label}</p>
            {deep && (
                <p style={{ color: deep.fill }}>{t('page.sleep.deepSleep')}: {formatMinutes(deep.value)}</p>
            )}
            {light && (
                <p style={{ color: light.fill }}>{t('page.sleep.lightSleep')}: {formatMinutes(light.value)}</p>
            )}
            {rem && (
                <p style={{ color: rem.fill }}>{t('page.sleep.remSleep')}: {formatMinutes(rem.value)}</p>
            )}
            {awake && (
                <p style={{ color: awake.fill }}>{t('page.sleep.awake')}: {formatMinutes(awake.value)}</p>
            )}
        </div>
    )
})

const SLEEP_THEME_COLOR = '#A78BFA'

const SleepTrendyReportCardInner = ({ data, className, isLoading }: SleepTrendyReportCardProps) => {
    const { t } = useTranslation()

    // Default colors matching design
    const stageColors = data?.stageColors || {
        deep: '#A27EFD',
        light: '#D9CBFE',
        rem: '#ECE5FE',
        awake: '#F9933B',
    }

    // Placeholder data when no real data - shows demo values for past days, 0 for future days
    const currentWeekdayIndex = (() => {
        const today = new Date()
        const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ...
        return dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to 0 = Monday, 6 = Sunday
    })()

    const placeholderValues = [
        { deep: 60, light: 180, rem: 90, awake: 10 },
        { deep: 50, light: 190, rem: 100, awake: 15 },
        { deep: 70, light: 170, rem: 80, awake: 10 },
        { deep: 55, light: 185, rem: 95, awake: 12 },
        { deep: 65, light: 175, rem: 85, awake: 8 },
        { deep: 80, light: 160, rem: 110, awake: 20 },
        { deep: 60, light: 180, rem: 90, awake: 10 },
    ]

    const placeholderChartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, index) => ({
        name,
        // Show demo values for days up to today; future days show 0
        deep: index <= currentWeekdayIndex ? placeholderValues[index].deep : 0,
        light: index <= currentWeekdayIndex ? placeholderValues[index].light : 0,
        rem: index <= currentWeekdayIndex ? placeholderValues[index].rem : 0,
        awake: index <= currentWeekdayIndex ? placeholderValues[index].awake : 0,
    }))

    const chartData = useMemo(
        () => data?.chartData?.map((point) => ({
            name: t(point.weekdayKey),
            deep: point.deep,
            light: point.light,
            rem: point.rem,
            awake: point.awake,
            total: point.total,
        })) ?? placeholderChartData,
        [data, t, placeholderChartData]
    )

    const maxMinutes = useMemo(
        () => Math.max(...chartData.map(d => (d.deep || 0) + (d.light || 0) + (d.rem || 0) + (d.awake || 0))),
        [chartData]
    )
    const maxHours = Math.ceil(maxMinutes / 60) + 1

    // Configure layers for StackedBarChart
    const chartLayers: BarLayer[] = [
        { dataKey: 'deep', color: stageColors.deep, label: t('page.sleep.deepSleep') },
        { dataKey: 'light', color: stageColors.light, label: t('page.sleep.lightSleep') },
        { dataKey: 'rem', color: stageColors.rem, label: t('page.sleep.remSleep') },
        { dataKey: 'awake', color: stageColors.awake, label: t('page.sleep.awake') },
    ]

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
                    <Moon className="w-5 h-5" style={{ color: SLEEP_THEME_COLOR }} />
                    <h3 className="text-base font-semibold text-slate-800">
                        {t('page.sleep.trendyReport')}
                    </h3>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{t('common.loading')}</span>
                    </div>
                )}
            </div>

            {/* Gray box container for stats - matching design mockup */}
            <div className="bg-gray-100 rounded-xl p-4 mb-4">
                {/* Week's average sleep label */}
                <p className="text-sm text-slate-500 mb-2">
                    {t('page.sleep.weeksAverageSleep')}
                </p>

                {/* Main value with trend indicator */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold" style={{ color: '#FB923D' }}>
                            {data?.summary?.avgHours ?? '--'}
                        </span>
                        <span className="text-base text-slate-600">{t('units.hour', 'hours')}</span>
                        <span className="text-3xl font-bold ml-1" style={{ color: '#FB923D' }}>
                            {data?.summary?.avgMinutes ?? '--'}
                        </span>
                        <span className="text-base text-slate-600">{t('units.minute', 'minutes')}</span>
                    </div>

                    {/* Trend indicator with arrow */}
                    <div className="flex items-center gap-1">
                        {data?.summary?.trend === 'down' && (
                            <TrendingDown className="w-5 h-5 text-cyan-500" />
                        )}
                        {data?.summary?.trend === 'up' && (
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                        )}
                        <span className="text-lg font-semibold text-cyan-500">
                            {data?.summary?.durationChange ?? '--'}
                        </span>
                    </div>
                </div>

                {/* Last week comparison */}
                <p className="text-sm text-slate-500 mb-4">
                    {t('time.lastWeek')}: {data?.summary?.lastWeekDurationText ?? '-- hours -- minutes'}
                </p>

                {/* Highest and Lowest sections */}
                <div className="flex gap-6">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">
                            {t('page.sleep.highest')}({data?.summary?.highestDay ?? '--'})
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold" style={{ color: '#FB923D' }}>
                                {data?.summary?.highestHours ?? '--'}
                            </span>
                            <span className="text-sm text-slate-600">{t('units.hour', 'hours')}</span>
                            <span className="text-2xl font-bold ml-1" style={{ color: '#FB923D' }}>
                                {data?.summary?.highestMinutes ?? '--'}
                            </span>
                            <span className="text-sm text-slate-600">{t('units.minute', 'minutes')}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 mb-1">
                            {t('page.sleep.lowest')}({data?.summary?.lowestDay ?? '--'})
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold" style={{ color: '#FB923D' }}>
                                {data?.summary?.lowestHours ?? '--'}
                            </span>
                            <span className="text-sm text-slate-600">{t('units.hour', 'hours')}</span>
                            <span className="text-2xl font-bold ml-1" style={{ color: '#FB923D' }}>
                                {data?.summary?.lowestMinutes ?? '--'}
                            </span>
                            <span className="text-sm text-slate-600">{t('units.minute', 'minutes')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <StackedBarChart
                data={chartData}
                layers={chartLayers}
                xAxisKey="name"
                yAxisDomain={[0, maxHours * 60]}
                yAxisFormatter={(value) => `${Math.round(value / 60)}h`}
                legendShape="circle"
                renderTooltip={(props) => <CustomTooltip {...props} />}
                stackId="sleep"
                height={224}
            />
        </Card>
    )
}

export const SleepTrendyReportCard = memo(SleepTrendyReportCardInner)
