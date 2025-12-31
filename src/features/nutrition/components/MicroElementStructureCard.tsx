import { Card } from '@/components/ui/card'
import type { NutrientStructureData } from '../types'
import { PieChart as PieChartIcon } from 'lucide-react'

interface MicroElementStructureCardProps {
    data?: NutrientStructureData[]
    className?: string
}

export const MicroElementStructureCard = ({ data, className }: MicroElementStructureCardProps) => {
    if (!data) return null

    return (
        <Card className={`${className} p-5`}>
            <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-slate-800">Micro-element structure</h3>
            </div>

            <div className="flex flex-col gap-4">
                {data.map((item, index) => (
                    <div key={index}>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                            <div>
                                <span className="text-lg font-bold text-slate-800" style={{ color: item.color }}>{item.current}</span>
                                <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                                <span className="text-xs text-slate-400 ml-2">Target: {item.total}</span>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(100, (item.current / item.total) * 100)}%`,
                                    backgroundColor: item.color
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-slate-600 leading-relaxed">
                Your intake of carbohydrates, protein, and fat is relatively balanced. Keep focusing on Vitamin intake.
            </div>
        </Card>
    )
}
