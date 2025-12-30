/**
 * Healthy Daily Types
 * API response and domain model types for healthy daily report
 */

/** Chart data point for indicator */
export interface IndicatorChartPoint {
    time: string
    value?: number
    systolic?: number
    diastolic?: number
}

/** Blood pressure indicator data */
export interface BPIndicatorData {
    latest: { systolic: number; diastolic: number } | null
    change: number | null
    avg: { systolic: number; diastolic: number } | null
    max: { systolic: number; diastolic: number } | null
    min: { systolic: number; diastolic: number } | null
    reference: { systolic: string; diastolic: string }
    status: string | null
    chart: IndicatorChartPoint[]
}

/** Single value indicator data (heart rate, glucose, oxygen) */
export interface SingleIndicatorData {
    latest: number | null
    change: number | null
    avg: number | null
    max: number | null
    min: number | null
    reference: string
    status: string | null
    chart: IndicatorChartPoint[]
}

/** API response for healthy daily */
export interface HealthyDailyApiResponse {
    code: number
    msg: string
    data: {
        health_score: {
            score: number | null
            level: string | null
            percentile: number | null
            message: string | null
        }
        ai_analysis: string[]
        indicators: {
            blood_pressure: BPIndicatorData
            heart_rate: SingleIndicatorData
            blood_glucose: SingleIndicatorData
            blood_oxygen: SingleIndicatorData
        }
        ai_insights: string[]
        suggestions: Array<{
            icon: string
            title: string
            description: string
        }>
    }
}

/** Domain model for healthy daily */
export interface HealthyDailyData {
    score: number | null
    level: string | null
    percentile: number | null
    percentileMessage: string | null
    aiTags: string[]
    indicators: {
        bloodPressure: {
            latest: { systolic: number; diastolic: number } | null
            avg: { systolic: number; diastolic: number } | null
            max: { systolic: number; diastolic: number } | null
            min: { systolic: number; diastolic: number } | null
            reference: { systolic: string; diastolic: string }
            status: string | null
            chart: IndicatorChartPoint[]
        }
        heartRate: {
            latest: number | null
            avg: number | null
            max: number | null
            min: number | null
            reference: string
            status: string | null
            chart: IndicatorChartPoint[]
        }
        bloodGlucose: {
            latest: number | null
            avg: number | null
            max: number | null
            min: number | null
            reference: string
            status: string | null
            chart: IndicatorChartPoint[]
        }
        bloodOxygen: {
            latest: number | null
            avg: number | null
            max: number | null
            min: number | null
            reference: string
            status: string | null
            chart: IndicatorChartPoint[]
        }
    }
    aiInsights: string[]
    suggestions: Array<{
        icon: string
        title: string
        description: string
    }>
}
