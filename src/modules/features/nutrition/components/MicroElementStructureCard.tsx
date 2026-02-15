import { Card } from '@/components/ui/card'
import type { NutrientStructureData } from '../types'
import { PieChart as PieChartIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { VITAL_COLORS, UI_COLORS } from '@/config/theme'

interface MicroElementStructureCardProps {
    data?: NutrientStructureData[]
    summary?: string | null
    className?: string
}

// Determine status based on current vs total
function getStatus(current: number, total: number): 'goal' | 'exceed' | 'insufficient' {
    const percentage = (current / total) * 100
    if (percentage >= 90 && percentage <= 110) return 'goal'
    if (percentage > 110) return 'exceed'
    return 'insufficient'
}

// Get status badge color and text
function getStatusBadge(status: 'goal' | 'exceed' | 'insufficient', t: (key: string, fallback?: string) => string) {
    switch (status) {
        case 'goal':
            return {
                bg: 'bg-green-100',
                text: 'text-green-600',
                label: t('nutrition.goal', 'Goal')
            }
        case 'exceed':
            return {
                bg: 'bg-orange-100',
                text: 'text-orange-600',
                label: t('nutrition.exceed', 'Exceed')
            }
        case 'insufficient':
            return {
                bg: 'bg-blue-100',
                text: 'text-blue-600',
                label: t('nutrition.insufficient', 'Insufficient')
            }
    }
}

export const MicroElementStructureCard = ({ data, summary, className }: MicroElementStructureCardProps) => {
    const { t } = useTranslation()

    if (!data) return null

    // Use backend summary if available, otherwise use default translation
    const displaySummary = summary || t('nutrition.balancedIntakeSummary', 'Your macronutrient balance is generally good. Protein intake hits the target, while fat intake is slightly high. We recommend maintaining current protein levels while reducing fat consumption.')

    return (
        <Card className={`${className} p-5`}>
            <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-slate-800">{t('nutrition.macronutrientStructure', 'Macronutrient structure')}</h3>
            </div>

            <div className="flex flex-col gap-4">
                {data.map((item, index) => {
                    const status = getStatus(item.current, item.total)
                    const badge = getStatusBadge(status, (key, fallback) => t(key, fallback ?? key))

                    return (
                        <div key={index} className="rounded-xl p-4 relative" style={{ backgroundColor: UI_COLORS.background.gray }}>
                            {/* Status Badge - positioned at top right */}
                            <span className={`absolute top-4 right-4 text-xs font-medium px-3 py-1 rounded-md ${badge.bg} ${badge.text}`}>
                                {badge.label}
                            </span>

                            {/* Top row: Name */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                            </div>

                            {/* Middle row: Large number and Target */}
                            <div className="flex justify-between items-baseline mb-3">
                                <div>
                                    <span className="text-3xl font-bold" style={{ color: VITAL_COLORS.nutrition }}>
                                        {item.current}
                                    </span>
                                    <span className="text-sm text-slate-500 ml-1">{item.unit}</span>
                                </div>
                                <span className="text-sm text-slate-400">
                                    {t('nutrition.target', 'Target')}: {item.total} {item.unit}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(100, (item.current / item.total) * 100)}%`,
                                        backgroundColor: item.color
                                    }}
                                />
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
