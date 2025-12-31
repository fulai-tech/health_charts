import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_STYLES } from '@/config/theme'
import { fetchNutritionData } from '../api'
import { adaptNutritionData } from '../adapter'
import type { NutritionDomainModel } from '../types'
import { NutritionWeeklyGaugeCard } from '../components/NutritionWeeklyGaugeCard'
import { NutritionTrendsCard } from '../components/NutritionTrendsCard'
import { NutritionAnalysisCard } from '../components/NutritionAnalysisCard'
import { MicroElementStructureCard } from '../components/MicroElementStructureCard'
import { MicroElementStatusCard } from '../components/MicroElementStatusCard'
import { ComplicatedRecipesCard } from '../components/ComplicatedRecipesCard'

export const NutritionPage = () => {
    const { t } = useTranslation()
    const [data, setData] = useState<NutritionDomainModel | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const rawData = await fetchNutritionData()
                const adaptedData = adaptNutritionData(rawData)
                setData(adaptedData)
            } catch (error) {
                console.error('Failed to load nutrition data', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F1EFEE]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F1EFEE] py-6 px-4 flex justify-center">
            <div className={`w-full ${UI_STYLES.pageMaxWidth} space-y-4`}>
                {/* Header - Custom for daily/details pages usually */}
                <div className="flex items-center justify-center relative mb-4">
                    <h1 className="text-lg font-bold text-slate-800">Nutrition</h1>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        {/* Avatar or other top-right action */}
                        <div className="w-8 h-8 rounded-full bg-slate-200 border border-white"></div>
                    </div>
                </div>

                <NutritionWeeklyGaugeCard data={data?.weeklyManagement} />
                <NutritionTrendsCard data={data?.metabolismTrend} />
                <NutritionAnalysisCard data={data?.analysis} />
                <MicroElementStructureCard data={data?.nutrientStructure} />
                <MicroElementStatusCard data={data?.microElements} />
                <ComplicatedRecipesCard data={data?.recipes} />

                <div className="h-6"></div> {/* Bottom spacer */}
            </div>
        </div>
    )
}
