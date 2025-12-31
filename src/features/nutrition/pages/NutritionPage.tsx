import { useEffect, useState, useMemo } from 'react'
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
import { DateRangePicker } from '@/components/business/DateRangePicker'
import { useUrlConfig } from '@/hooks/useUrlParams'

/**
 * Format Date for display (YYYY/MM/DD)
 */
function formatDateForDisplay(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}/${m}/${d}`
}

export const NutritionPage = () => {
    const { t } = useTranslation()
    const { theme } = useUrlConfig()
    const [data, setData] = useState<NutritionDomainModel | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Date range state
    const [dateRange, setDateRange] = useState(() => {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 6)
        return { start, end }
    })

    // Display formatted dates
    const displayDateRange = useMemo(() => ({
        start: formatDateForDisplay(dateRange.start),
        end: formatDateForDisplay(dateRange.end),
    }), [dateRange])

    // Mock Date Navigation
    const handlePrevious = () => {
        setDateRange((prev) => {
            const newStart = new Date(prev.start)
            const newEnd = new Date(prev.end)
            newStart.setDate(newStart.getDate() - 7)
            newEnd.setDate(newEnd.getDate() - 7)
            return { start: newStart, end: newEnd }
        })
    }

    const handleNext = () => {
        const today = new Date()
        if (dateRange.end >= today) return

        setDateRange((prev) => {
            const newStart = new Date(prev.start)
            const newEnd = new Date(prev.end)
            newStart.setDate(newStart.getDate() + 7)
            newEnd.setDate(newEnd.getDate() + 7)

            if (newEnd > today) {
                const end = new Date()
                const start = new Date()
                start.setDate(end.getDate() - 6)
                return { start, end }
            }
            return { start: newStart, end: newEnd }
        })
    }

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                // In a real app, pass dateRange to fetch
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
    }, [dateRange]) // Reload when date changes

    return (
        <div className="min-h-screen bg-[#F1EFEE] pb-20"> {/* pb-20 for bottom spacer */}
            <div className="sticky top-0 z-20 py-3 px-4 bg-[#F1EFEE]">
                <div className="flex justify-center">
                    <DateRangePicker
                        startDate={displayDateRange.start}
                        endDate={displayDateRange.end}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        disableNext={dateRange.end >= new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                </div>
            </div>

            <div className="flex justify-center px-4">
                <div className={`w-full ${UI_STYLES.pageMaxWidth} space-y-4`}>
                    <NutritionWeeklyGaugeCard data={data?.weeklyManagement} />
                    <NutritionTrendsCard data={data?.metabolismTrend} />
                    <NutritionAnalysisCard data={data?.analysis} />
                    <MicroElementStructureCard data={data?.nutrientStructure} />
                    <MicroElementStatusCard data={data?.microElements} />
                    <ComplicatedRecipesCard data={data?.recipes} />
                </div>
            </div>
        </div>
    )
}
