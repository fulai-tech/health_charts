import { useTranslation } from 'react-i18next'
import { FileBarChart } from 'lucide-react'
import { DataAnalysisCard } from '@/components/common/DataAnalysisCard'
import type { SleepDomainModel } from '../types'
import { memo } from 'react'

interface SleepDataAnalysisCardProps {
    data?: SleepDomainModel
    className?: string
    isLoading?: boolean
}

const SLEEP_THEME_COLOR = '#A78BFA'

const SleepDataAnalysisCardInner = ({
    data,
    className,
    isLoading,
}: SleepDataAnalysisCardProps) => {
    const { t } = useTranslation()

    const dataAnalysis = data?.weeklySummary?.dataAnalysis ?? []

    // Default analysis if no data
    const defaultAnalysis = [
        t('page.sleep.defaultAnalysis1', {
            defaultValue: 'The average blood oxygen saturation this week was 97%, the same as last week.'
        }),
        t('page.sleep.defaultAnalysis2', {
            defaultValue: 'Your blood oxygen level remained at a high level (98%) from Tuesday to Thursday this week.'
        }),
        t('page.sleep.defaultAnalysis3', {
            defaultValue: 'On Friday, a blood oxygen level of 94% was recorded, slightly below the lower limit of the normal range.'
        }),
    ]

    const analysisItems = dataAnalysis.length > 0 ? dataAnalysis : defaultAnalysis

    return (
        <DataAnalysisCard
            titleKey="page.sleep.dataAnalysis"
            Icon={FileBarChart}
            items={analysisItems}
            themeColor={SLEEP_THEME_COLOR}
            className={className}
            isLoading={isLoading}
        />
    )
}

export const SleepDataAnalysisCard = memo(SleepDataAnalysisCardInner)
