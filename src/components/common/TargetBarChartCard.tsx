
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import { type LucideIcon, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES } from '@/config/theme'

export interface TargetBarChartItem {
    label: string
    value: number
    target: number
}

export interface TargetBarChartCardProps {
    title: string
    icon?: LucideIcon
    themeColor: string
    data: TargetBarChartItem[]
    unit?: string
    avgValue?: number
    className?: string
    isLoading?: boolean
}

export function TargetBarChartCard({
    title,
    icon: Icon,
    themeColor,
    data,
    unit = '',
    avgValue,
    className,
    isLoading
}: TargetBarChartCardProps) {
    const { t } = useTranslation()

    // Determine color based on value vs target
    const getBarColor = (val: number, target: number) => {
        if (val > target) return '#FB923D' // Excess - Orange
        if (val < target * 0.8) return '#93C5FD' // Insufficient - Blue
        return '#86EFAC' // Meet - Green
    }

    if (!data) return null

    return (
        <Card className={`${className} relative overflow-hidden p-5`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                {Icon && <Icon className="w-5 h-5" style={{ color: themeColor }} />}
                <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                {typeof avgValue === 'number' && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-full shadow-sm">
                        {t('nutrition.avg', 'Avg')} {avgValue} {unit}
                    </span>
                )}
            </div>

            {/* Legend - Moved to top, above the chart */}
            <div className="flex justify-start gap-6 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-green-300"></span>
                    <span className="text-sm text-slate-500">{t('nutrition.meet', 'Goal')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-blue-300"></span>
                    <span className="text-sm text-slate-500">{t('nutrition.insufficient', 'Insufficient')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-orange-400"></span>
                    <span className="text-sm text-slate-500">{t('nutrition.excess', 'Exceed')}</span>
                </div>
            </div>

            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={12}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94A3B8' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94A3B8' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(entry.value, entry.target)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
