/**
 * Healthy Daily Types
 * API response and domain model types for healthy daily report
 */

// ============================================
// API Response Types (Backend Structure)
// ============================================

/** Change indicator from API */
export interface ApiChangeIndicator {
    value: number | null
    trend: 'up' | 'down' | null
}

/** Chart axis range from API */
export interface ApiAxisRange {
    start?: string
    end?: string
    min?: number
    max?: number
}

/** Blood pressure chart point from API */
export interface ApiBPChartPoint {
    time: string
    systolic: number
    diastolic: number
}

/** Single value chart point from API (heart rate has avg/max/min) */
export interface ApiHRChartPoint {
    time: string
    avg: number
    max: number
    min: number
}

/** Simple chart point from API (glucose, oxygen) */
export interface ApiSimpleChartPoint {
    time: string
    avg: number
}

/** Blood pressure indicator from API */
export interface ApiBPIndicator {
    title: string
    unit: string
    reference: {
        systolic: { min: number; max: number }
        diastolic: { min: number; max: number }
    }
    latest: {
        value: string
        systolic: number
        diastolic: number
        change: ApiChangeIndicator
    } | null
    today_avg: {
        value: string
        systolic: number
        diastolic: number
    } | null
    chart: {
        data: ApiBPChartPoint[]
        x_axis_range: ApiAxisRange
        y_axis_range: ApiAxisRange
    }
}

/** Heart rate indicator from API */
export interface ApiHRIndicator {
    title: string
    unit: string
    reference: { min: number; max: number }
    latest: {
        value: number
        change: ApiChangeIndicator
    } | null
    avg: number | null
    max: number | null
    min: number | null
    chart: {
        data: ApiHRChartPoint[]
        x_axis_range: ApiAxisRange
        y_axis_range: ApiAxisRange
    }
}

/** Blood glucose indicator from API */
export interface ApiGlucoseIndicator {
    title: string
    unit: string
    reference: { min: number; max: number }
    status_label: string | null
    latest: {
        value: number
        change: ApiChangeIndicator
    } | null
    avg: number | null
    max: number | null
    min: number | null
    chart: {
        data: ApiSimpleChartPoint[]
        x_axis_range: ApiAxisRange
        y_axis_range: ApiAxisRange
    }
}

/** Blood oxygen indicator from API */
export interface ApiOxygenIndicator {
    title: string
    unit: string
    reference: { min: number; max: number }
    latest: {
        value: number
        change: ApiChangeIndicator
    } | null
    avg: number | null
    max: number | null
    min: number | null
    chart: {
        data: ApiSimpleChartPoint[]
        x_axis_range: ApiAxisRange
        y_axis_range: ApiAxisRange
    }
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
            blood_pressure: ApiBPIndicator
            heart_rate: ApiHRIndicator
            blood_glucose: ApiGlucoseIndicator
            blood_oxygen: ApiOxygenIndicator
        }
        ai_insights: string[]
        suggestions: Array<{
            icon?: string
            title: string
            description: string
        }>
    } | null
}

// ============================================
// Domain Model Types (Frontend Structure)
// ============================================

/** Chart data point for indicator (unified format for components) */
export interface IndicatorChartPoint {
    time: string
    value?: number
    avg?: number
    max?: number
    min?: number
    systolic?: number
    diastolic?: number
}

/** Change indicator for display */
export interface ChangeIndicator {
    value: number | null
    trend: 'up' | 'down' | null
}

/** Blood pressure indicator data */
export interface BPIndicatorData {
    latest: { systolic: number; diastolic: number } | null
    change: ChangeIndicator
    avg: { systolic: number; diastolic: number } | null
    /** BP doesn't have max/min in new API */
    reference: { systolic: string; diastolic: string }
    status: string | null
    chart: IndicatorChartPoint[]
    yAxisRange?: { min: number; max: number }
}

/** Single value indicator data (heart rate) */
export interface HRIndicatorData {
    latest: number | null
    change: ChangeIndicator
    avg: number | null
    max: number | null
    min: number | null
    reference: string
    status: string | null
    /** Heart rate chart has avg/max/min per point for range display */
    chart: IndicatorChartPoint[]
    yAxisRange?: { min: number; max: number }
}

/** Single value indicator data (glucose, oxygen) */
export interface SingleIndicatorData {
    latest: number | null
    change: ChangeIndicator
    avg: number | null
    max: number | null
    min: number | null
    reference: string
    status: string | null
    chart: IndicatorChartPoint[]
    yAxisRange?: { min: number; max: number }
}

/** Domain model for healthy daily */
export interface HealthyDailyData {
    score: number | null
    level: string | null
    percentile: number | null
    percentileMessage: string | null
    aiTags: string[]
    indicators: {
        bloodPressure: BPIndicatorData
        heartRate: HRIndicatorData
        bloodGlucose: SingleIndicatorData
        bloodOxygen: SingleIndicatorData
    }
    aiInsights: string[]
    suggestions: Array<{
        icon: string
        title: string
        description: string
    }>
}

/** Loading state placeholder - used to prevent layout shift during loading */
export type HealthyDailyPlaceholder = HealthyDailyData

/** Data state for distinguishing loading vs empty vs error */
export interface HealthyDataState {
    /** The actual data (null if loading or error) */
    data: HealthyDailyData | null
    /** True if this is the initial load (first time fetching) */
    isInitialLoad: boolean
    /** True if currently fetching data */
    isLoading: boolean
    /** True if data fetch failed */
    isError: boolean
    /** Error message if isError is true */
    errorMessage: string | null
}
