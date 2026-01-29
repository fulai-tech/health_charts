/**
 * Emotion Daily Types
 * API response and domain model types for emotion daily report
 */

/** Chart data point for emotion proportions */
export interface EmotionChartPoint {
    hour: string
    label: string
    positive: number
    neutral: number
    negative: number
    [key: string]: string | number | undefined
}

/** Emotion distribution item */
export interface EmotionDistributionItem {
    type: string
    label: string
    count: number
    percent: number
}

/** API response for emotion daily */
export interface EmotionDailyApiResponse {
    code: number
    msg: string
    data: {
        emotion_score: {
            score: number | null
            level: string | null
            level_label: string | null
            percentile: number | null
            message: string | null
        }
        ai_analysis: string[]
        chart: EmotionChartPoint[]
        emotion_distribution: {
            main_emotion: string
            main_emotion_label: string
            distribution: EmotionDistributionItem[]
        }
        ai_insights: string[]
        suggestions: Array<{
            icon: string
            title: string
            description: string
        }>
    }
}

/** Domain model for emotion daily */
export interface EmotionDailyData {
    score: number | null
    level: string | null
    levelLabel: string | null
    percentile: number | null
    percentileMessage: string | null
    aiTags: string[]
    chart: EmotionChartPoint[]
    distribution: {
        mainEmotion: string
        mainEmotionLabel: string
        items: EmotionDistributionItem[]
    }
    aiInsights: string[]
    suggestions: Array<{
        icon: string
        title: string
        description: string
    }>
}
