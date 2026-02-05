
import { DataAnalysisCard } from '@/components/common/DataAnalysisCard'
import type { NutritionAnalysisData } from '../types'
import { FileText } from 'lucide-react'
import { VITAL_COLORS } from '@/config/theme'
import { useTranslation } from 'react-i18next'

interface NutritionDataAnalysisCardProps {
    data?: NutritionAnalysisData
    className?: string
    isLoading?: boolean
}

export const NutritionDataAnalysisCard = ({ data, className, isLoading }: NutritionDataAnalysisCardProps) => {
    const { t: _t } = useTranslation()
    const themeColor = VITAL_COLORS.nutrition || '#FB923D'

    return (
        <DataAnalysisCard
            titleKey="nutrition.dataAnalysis"
            Icon={FileText}
            items={data?.details || []}
            themeColor={themeColor}
            className={className}
            isLoading={isLoading}
        />
    )
}
