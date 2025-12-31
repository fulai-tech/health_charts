import { Card } from '@/components/ui/card'
import type { NutritionAnalysisData } from '../types'
import { FileText } from 'lucide-react'

interface NutritionAnalysisCardProps {
    data?: NutritionAnalysisData
    className?: string
}

export const NutritionAnalysisCard = ({ data, className }: NutritionAnalysisCardProps) => {
    if (!data) return null

    return (
        <Card className={`${className} p-5`}>
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-slate-800">Diet analysis</h3>
            </div>

            <div className="space-y-4">
                {/* Score and Summary */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-orange-800">Health Score</span>
                        <span className="text-2xl font-bold text-orange-500">{data.score}</span>
                    </div>
                    <p className="text-sm text-orange-700 leading-relaxed">
                        {data.summary}
                    </p>
                </div>

                {/* Details List */}
                <div className="space-y-2">
                    {data.details.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-300 mt-2 flex-shrink-0" />
                            <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}
