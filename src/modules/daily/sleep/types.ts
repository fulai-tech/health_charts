/**
 * Sleep Daily Types
 */

/** Sleep structure chart data */
export interface SleepChartSegment {
    stage: string
    start: string
    end: string
}

/** Sleep structure analysis item */
export interface SleepStructureItem {
    type: string
    label: string
    percent: number
    duration: string
    status: string
}

/** Quality indicator */
export interface QualityIndicator {
    value: string | number | null
    reference: string
    label: string
    unit?: string
}

/** API response */
export interface SleepDailyApiResponse {
    code: number
    msg: string
    data: {
        sleep_score: {
            score: number | null
            level: string | null
            level_label: string | null
            percentile: number | null
            message: string | null
        }
        ai_analysis: string[]
        structure_chart: {
            total_duration: {
                formatted: string
                total_minutes: number
            }
            deep_duration: {
                formatted: string
                total_minutes: number
            }
            chart: SleepChartSegment[]
        }
        structure_analysis: SleepStructureItem[]
        quality_indicators: {
            bed_time: QualityIndicator
            sleep_time: QualityIndicator
            wake_time: QualityIndicator
            get_up_time: QualityIndicator
            sleep_latency: QualityIndicator
            sleep_efficiency: QualityIndicator
        }
        ai_insights: string[]
        suggestions: Array<{
            icon: string
            title: string
            description: string
        }>
    }
}

/** Domain model */
export interface SleepDailyData {
    score: number | null
    level: string | null
    levelLabel: string | null
    percentile: number | null
    percentileMessage: string | null
    aiTags: string[]
    structureChart: {
        totalDuration: string
        totalMinutes: number
        deepDuration: string
        deepMinutes: number
        segments: SleepChartSegment[]
    }
    structureAnalysis: SleepStructureItem[]
    qualityIndicators: {
        bedTime: QualityIndicator
        sleepTime: QualityIndicator
        wakeTime: QualityIndicator
        getUpTime: QualityIndicator
        sleepLatency: QualityIndicator
        sleepEfficiency: QualityIndicator
    }
    aiInsights: string[]
    suggestions: Array<{
        icon: string
        title: string
        description: string
    }>
}
