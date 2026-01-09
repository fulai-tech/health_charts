import { Card } from '@/components/ui/card'
import type { DietaryComponentData } from '../types'
import { Salad } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { UI_COLORS } from '@/config/theme'

interface DietaryComponentsCardProps {
    data?: DietaryComponentData[]
    summary?: string | null
    className?: string
}

export const DietaryComponentsCard = ({ data, summary, className }: DietaryComponentsCardProps) => {
    const { t } = useTranslation()

    if (!data || data.length === 0) return null

    // Use backend summary if available, otherwise use default translation
    const displaySummary = summary || t('nutrition.dietaryComponentsSummary', 'Monitor your dietary fiber and purine intake for better digestive health.')

    return (
        <Card className={`${className} p-5`}>
            <div className="flex items-center gap-2 mb-4">
                <Salad className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-slate-800">{t('nutrition.otherDietaryIngredients', 'Other dietary ingredients')}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {data.map((item, index) => {
                    // Status color logic
                    const statusColor = item.status === 'normal' 
                        ? 'bg-green-100 text-green-600' 
                        : (item.status === 'low' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600')
                    const statusLabel = item.status === 'normal' 
                        ? t('nutrition.goal', 'Goal') 
                        : (item.status === 'low' ? t('nutrition.insufficient', 'Insufficient') : t('nutrition.excess', 'Excess'))
                    const barColor = item.status === 'normal' 
                        ? '#86EFAC' 
                        : (item.status === 'low' ? '#93C5FD' : '#FB923D')

                    // Calculate progress bar width based on percentage
                    const percentage = Math.min(100, (item.value / item.target) * 100)

                    return (
                        <div key={index} className="p-3 rounded-xl border border-slate-100" style={{ backgroundColor: UI_COLORS.background.gray }}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${statusColor}`}>
                                    {statusLabel}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-xl font-bold text-slate-800">{item.value}</span>
                                <span className="text-xs text-slate-400">{item.unit}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-1.5 bg-slate-200 rounded-full w-full overflow-hidden">
                                <div
                                    className="absolute h-full rounded-full"
                                    style={{ width: `${percentage}%`, backgroundColor: barColor }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                <span>{t('nutrition.target', 'Target')}: {item.target} {item.unit}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-slate-600 leading-relaxed">
                {displaySummary}
            </div>
        </Card>
    )
}

