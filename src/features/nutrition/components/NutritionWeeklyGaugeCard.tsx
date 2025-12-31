import { Card } from '@/components/ui/card'
import { StatisticsPieChart } from '@/components/charts/StatisticsPieChart'
import type { WeeklyManagementData } from '../types'
import { Monitor } from 'lucide-react'

interface NutritionWeeklyGaugeCardProps {
    data?: WeeklyManagementData
    className?: string
}

export const NutritionWeeklyGaugeCard = ({ data, className }: NutritionWeeklyGaugeCardProps) => {
    if (!data) return null

    // Chart data: Value part and Remaining part
    // We want a gauge from 180 (left) to 0 (right).
    // Total is targetCal.
    const chartData = [
        { name: 'Current', value: data.currentCal, color: data.status === 'alert' ? '#EF4444' : (data.status === 'warning' ? '#EAB308' : '#BAD59E') }, // Greenish for good
        { name: 'Remaining', value: Math.max(0, data.targetCal - data.currentCal), color: '#F3F4F6' },
    ]

    // If current exceeds target, we just show full colorful bar or maybe capped at target visually with a text warning?
    // For a gauge, usually if current > target, it fills up.
    // Recharts Pie normalization: if we want a gauge that represents percentage against a max.
    // Actually, let's normalize to 100 for percentage display if needed, or just use raw values.
    // If use raw values, Recharts sums them up.
    // Ideally:
    // Part 1: Current value
    // Part 2: Max - Current value (empty part)

    // However if Current > Max, Part 2 is 0.
    // Let's use a simple percentage based Approach for stability.
    const percentage = Math.min(100, Math.max(0, (data.currentCal / data.targetCal) * 100))
    // Color logic for gauge:
    // 0-33: Blue/Green? 
    // Design shows: Greenish to Orange gradient look, or distinct sections?
    // Screenshot shows a gauge with 3 colors: Blue, Green, Orange segments likely representing range?
    // OR it represents the progress.
    // Screenshot: "2350 kcal left" in center.
    // Let's stick to a simple progress gauge for now.

    const gaugeData = [
        { name: 'Progress', value: percentage, color: '#F97316' }, // Orange primary
        { name: 'Remaining', value: 100 - percentage, color: '#E5E7EB' }, // Gray background
    ]

    return (
        <Card className={`${className} p-5 relative overflow-hidden`}>
            <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-slate-800">Weekly management</h3>
                {/* Weekly range or date could go here */}
            </div>

            <div className="h-48 relative">
                <StatisticsPieChart
                    data={gaugeData}
                    innerRadius="75%"
                    outerRadius="100%"
                    startAngle={180}
                    endAngle={0}
                    className="h-full"
                    useCornerRadius={true}
                >
                    <div className="flex flex-col items-center justify-center mt-8">
                        {/* Center content pushed down for gauge */}
                        <span className="text-3xl font-bold text-orange-500">{data.remainingCal}</span>
                        <span className="text-xs text-slate-400">kcal left</span>
                    </div>
                </StatisticsPieChart>
            </div>

            <div className="flex justify-between items-center mt-2 px-4">
                <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-400">Consumed</span>
                    <span className="text-lg font-bold text-orange-400">+{data.currentCal} <span className="text-xs font-normal">kcal</span></span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-400">Target daily</span>
                    <span className="text-lg font-bold text-slate-700">---- <span className="text-xs font-normal">kcal</span></span>
                </div>
            </div>
        </Card>
    )
}
