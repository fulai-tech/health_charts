
import { TargetBarChartCard } from '@/components/common/TargetBarChartCard'
import type { MetabolismTrendData } from '../types'
import { TrendingUp } from 'lucide-react'
import { VITAL_COLORS } from '@/config/theme'
import { useTranslation } from 'react-i18next'

interface NutritionStatisticsCardProps {
    data?: MetabolismTrendData[]
    className?: string
    isLoading?: boolean
}

export const NutritionStatisticsCard = ({ data, className, isLoading }: NutritionStatisticsCardProps) => {
    const { t } = useTranslation()
    const themeColor = VITAL_COLORS.nutrition || '#FB923D' // Fallback if not defined, though likely is. Assuming 'nutrition' key or closest. 
    // actually, let's use the explicit color from original file or Theme. 
    // Original used orange-500 (#F97316) for icon, #FB923D for excess.
    // Let's assume themeColor is Orange.

    const formattedData = data?.map(item => ({
        label: item.date, // Assuming date is a displayable string like "Mon" or "10-24"
        value: item.value,
        target: item.target
    })) || []

    // Calculate Average
    // original: Avg 2100 kcal (Hardcoded in original file?)
    // Original: <span>{t('nutrition.avg', 'Avg')} 2100 {t('nutrition.kcal', 'kcal')}</span>
    // I should calculate it from data if possible, or pass it. 
    // The props only have `data`. So I will calculate avg from data values.
    const avgValue = data && data.length > 0
        ? Math.round(data.reduce((acc, cur) => acc + cur.value, 0) / data.length)
        : 0

    return (
        <TargetBarChartCard
            title={t('nutrition.ingestTargetStatistics', 'Ingest target statistics')}
            icon={TrendingUp}
            themeColor={themeColor}
            data={formattedData}
            unit={t('nutrition.kcal', 'kcal')}
            avgValue={avgValue}
            className={className}
            isLoading={isLoading}
        />
    )
}
