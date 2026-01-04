import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { WeeklyOverviewCard } from '@/components/common/WeeklyOverviewCard'
import { VITAL_COLORS } from '@/config/theme'
import type { NutritionDomainModel } from '../types'

interface NutritionWeeklyOverviewCardProps {
    data?: NutritionDomainModel
    className?: string
    isLoading?: boolean
}

/**
 * Nutrition Weekly Overview Card
 */
export function NutritionWeeklyOverviewCard({ data, className, isLoading }: NutritionWeeklyOverviewCardProps) {
    const { t } = useTranslation()
    const themeColor = VITAL_COLORS.nutrition

    const weeklySummary = data?.weeklySummary

    // Default overview text if not provided
    const overviewText =
        weeklySummary?.overview ||
        t('page.nutrition.defaultOverview', {
            defaultValue:
                'Your nutritional intake is generally balanced. Total calorie intake fluctuates slightly but remains within the target range.',
        })

    // Default highlights text if not provided
    const highlightsText =
        weeklySummary?.highlights ||
        t('page.nutrition.defaultHighlights', {
            defaultValue:
                'The analysis shows that your protein intake has been consistent, but there was a slight excess in fat consumption over the weekend. We recommend increasing vegetable intake to balance the micronutrients.',
        })

    return (
        <WeeklyOverviewCard
            titleKey="page.nutrition.weeklyOverview" // Ensure this key exists or fallback
            Icon={FileText}
            overallText={overviewText}
            highlightText={highlightsText}
            highlightLabelKey="page.nutrition.anomalyAlert" // Needs to be added to translations or reused
            highlightColor="#FBBF24"
            suggestions={weeklySummary?.suggestions}
            themeColor={themeColor}
            className={className}
            isLoading={isLoading}
        />
    )
}
