import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import type { MetabolismTrendData } from '../types'
import { TrendingUp } from 'lucide-react'

interface NutritionTrendsCardProps {
    data?: MetabolismTrendData[]
    className?: string
}

export const NutritionTrendsCard = ({ data, className }: NutritionTrendsCardProps) => {
    if (!data) return null

    return (
        <Card className={`${className} p-5`}>
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-slate-800">Basal metabolism trend</h3>
                <span className="ml-auto flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-full shadow-sm">
                    Avg 2100 kcal
                </span>
            </div>

            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={12}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis
                            dataKey="date"
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
                        <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.value > entry.target ? '#FB923D' : (entry.value < entry.target * 0.8 ? '#93C5FD' : '#86EFAC')}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-300"></span>
                    <span className="text-xs text-slate-500">Meet</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                    <span className="text-xs text-slate-500">Insufficient</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    <span className="text-xs text-slate-500">Excess</span>
                </div>
            </div>
        </Card>
    )
}
