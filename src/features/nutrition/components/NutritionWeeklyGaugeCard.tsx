import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { WeeklyManagementData } from '../types'
import { TrendingUp, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { UI_COLORS } from '@/config/theme'

interface NutritionWeeklyGaugeCardProps {
    data?: WeeklyManagementData
    className?: string
}

export const NutritionWeeklyGaugeCard = ({ data, className }: NutritionWeeklyGaugeCardProps) => {
    const { t } = useTranslation()

    if (!data) return null

    // Gauge Configuration
    const gaugeData = [
        { name: 'Low', value: 30, color: '#93C5FD' },      // Blue-300
        { name: 'Normal', value: 25, color: '#86EFAC' },   // Green-300
        { name: 'Excess', value: 45, color: '#FB923D' },   // Orange-400
    ]

    // Calculate rotation for needle
    // We assume the gauge max value corresponds to roughly 2.2x or 2.5x the target 
    const MAX_VAL = 4500
    const clampedValue = Math.min(MAX_VAL, Math.max(0, data.currentCal))
    const percent = clampedValue / MAX_VAL

    return (
        <Card className={`${className} p-5 bg-white rounded-[24px]`}>
            <div className="flex flex-col w-full">
                {/* Header Section */}
                <div className="flex items-center gap-2 mb-4 w-full">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <h3 className="text-base font-semibold text-slate-800">{t('nutrition.weeklyAverageReport', 'Weekly average report')}</h3>
                </div>

                {/* Chart Area Section */}
                <div className="relative w-full h-[220px] mb-4 rounded-xl overflow-hidden" style={{ backgroundColor: UI_COLORS.background.gray }}>
                    {/* Title - Top Left */}
                    <div className="absolute top-3 left-4 text-[12px] text-slate-400 z-10">
                        {t('nutrition.weeklyIntakeReport', 'Weekly intake report')}
                    </div>

                    {/* Status Indicator - Top Right */}
                    {data.status === 'alert' && (
                        <div className="absolute top-3 right-4 flex items-center gap-1 text-orange-500 text-xs z-10">
                            <AlertCircle className="w-3 h-3" />
                            {t('nutrition.excessiveIntake', 'Excessive intake')}
                        </div>
                    )}
                    
                    <div className="w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={gaugeData}
                                    cx="50%"
                                    cy="88%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={125}
                                    outerRadius={145}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={8}
                                >
                                    {gaugeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Needle Layer */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {/* The rotation container positioned at Pie center (50%, 88%) */}
                        <div
                            className="absolute left-1/2 top-[83%] w-0 h-0"
                        >
                            {/* Connecting Stick and Head */}
                            <div
                                className="absolute left-0 top-0 w-0 h-0 flex items-center justify-start transition-transform duration-1000 ease-out"
                                style={{
                                    transform: `rotate(${-180 + (percent * 180)}deg)`
                                }}
                            >
                                {/* Needle Body */}
                                <div className="relative flex items-center" style={{ transformOrigin: 'left center' }}>
                                    {/* Pivot Center Point */}
                                    <div className="absolute -left-[10px] -top-[10px] w-[20px] h-[20px] bg-[#FB923D] rounded-full z-20 border-[3px] border-white box-border shadow-sm"></div>

                                    {/* Stick Connector (Golden ratio: shorter) */}
                                    <div className="absolute left-[0px] top-[-3px] h-[6px] w-[36px] bg-[#FB923D] rounded-l-none"></div>

                                    {/* Needle Head (Golden ratio: longer) */}
                                    <div className="absolute left-[36px] top-[-7px] h-[14px] w-[58px] bg-[#FB923D] rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Labels */}
                    {/* Adjusted Font Size and Spacing */}
                    <div className="absolute top-[75px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-0">
                        <div className="text-[30px] font-bold text-[#FB923D] leading-none tracking-tight">
                            {data.currentCal}
                        </div>
                        {/* Reduced spacing here */}
                        <div className="text-[14px] text-slate-400 font-medium mt-0.5">
                            {t('nutrition.kcal', 'kcal')}
                        </div>
                        {/* Reduced spacing here */}
                        <div className="text-[11px] text-slate-400 mt-1 opacity-90">
                            {t('nutrition.target', 'Target')}: {data.targetCal} {t('nutrition.kcal', 'kcal')}
                        </div>
                    </div>
                </div>

                {/* Bottom Stats Grid Section */}
                <div className="w-full grid grid-cols-2 gap-3">
                    <div className="rounded-[16px] py-4 px-4 flex flex-col items-center justify-center" style={{ backgroundColor: UI_COLORS.background.gray }}>
                        <span className="text-[12px] text-slate-400 mb-1">{t('nutrition.calorieIntake', 'Calorie intake')}</span>
                        <span className="text-[20px] font-bold text-orange-500 whitespace-nowrap">
                            {data.remainingCal > 0 ? `+${data.remainingCal}` : data.remainingCal}
                            <span className="text-[12px] font-normal text-slate-500 ml-1">{t('nutrition.kcal', 'kcal')}</span>
                        </span>
                    </div>
                    <div className="rounded-[16px] py-4 px-4 flex flex-col items-center justify-center" style={{ backgroundColor: UI_COLORS.background.gray }}>
                        <span className="text-[12px] text-slate-400 mb-1">{t('nutrition.averageConsumption', 'Average consumption')}</span>
                        <span className="text-[20px] font-bold text-[#FB923D] whitespace-nowrap">
                            --- <span className="text-[12px] font-normal text-slate-500 ml-1">{t('nutrition.kcal', 'kcal')}</span>
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    )
}
