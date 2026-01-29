/**
 * Healthy Daily Adapter
 * Transform API response to domain model
 */

import type {
    HealthyDailyApiResponse,
    HealthyDailyData,
    HealthyDailyPlaceholder,
    ChangeIndicator,
} from './types'

/**
 * Format reference range as string (e.g., "60-100")
 */
function formatReferenceRange(ref: { min: number; max: number }): string {
    return `${ref.min}-${ref.max}`
}

/**
 * Parse change indicator from API
 */
function parseChangeIndicator(change: { value: number | null; trend: 'up' | 'down' | null } | undefined): ChangeIndicator {
    return {
        value: change?.value ?? null,
        trend: change?.trend ?? null,
    }
}

/**
 * Check if data is truly empty (null, undefined, or empty structures)
 */
export function isDataEmpty(data: HealthyDailyData | null): boolean {
    if (!data) return true

    // Check if all key indicators are empty
    const bp = data.indicators.bloodPressure
    const hr = data.indicators.heartRate
    const glucose = data.indicators.bloodGlucose
    const oxygen = data.indicators.bloodOxygen

    const hasAnyData =
        bp.latest !== null ||
        hr.latest !== null ||
        glucose.latest !== null ||
        oxygen.latest !== null ||
        data.score !== null

    return !hasAnyData
}

/**
 * Adapt API response to domain model
 */
export function adaptHealthyDailyData(response: HealthyDailyApiResponse): HealthyDailyData | null {
    const { data } = response

    // Handle null data from API
    if (!data) {
        return null
    }

    const bp = data.indicators.blood_pressure
    const hr = data.indicators.heart_rate
    const glucose = data.indicators.blood_glucose
    const oxygen = data.indicators.blood_oxygen

    return {
        score: data.health_score.score,
        level: data.health_score.level,
        percentile: data.health_score.percentile,
        percentileMessage: data.health_score.message,
        aiTags: data.ai_analysis || [],
        indicators: {
            bloodPressure: {
                latest: bp.latest
                    ? { systolic: bp.latest.systolic, diastolic: bp.latest.diastolic }
                    : null,
                change: parseChangeIndicator(bp.latest?.change),
                avg: bp.today_avg
                    ? { systolic: bp.today_avg.systolic, diastolic: bp.today_avg.diastolic }
                    : null,
                reference: {
                    systolic: formatReferenceRange(bp.reference.systolic),
                    diastolic: formatReferenceRange(bp.reference.diastolic),
                },
                status: null, // BP doesn't have status in new API
                chart: (bp.chart?.data || []).map((point) => ({
                    time: point.time,
                    systolic: point.systolic,
                    diastolic: point.diastolic,
                })),
                yAxisRange: bp.chart?.y_axis_range
                    ? { min: bp.chart.y_axis_range.min!, max: bp.chart.y_axis_range.max! }
                    : undefined,
            },
            heartRate: {
                latest: hr.latest?.value ?? null,
                change: parseChangeIndicator(hr.latest?.change),
                avg: hr.avg,
                max: hr.max,
                min: hr.min,
                reference: formatReferenceRange(hr.reference),
                status: null,
                chart: (hr.chart?.data || []).map((point) => ({
                    time: point.time,
                    avg: point.avg,
                    max: point.max,
                    min: point.min,
                })),
                yAxisRange: hr.chart?.y_axis_range
                    ? { min: hr.chart.y_axis_range.min!, max: hr.chart.y_axis_range.max! }
                    : undefined,
            },
            bloodGlucose: {
                latest: glucose.latest?.value ?? null,
                change: parseChangeIndicator(glucose.latest?.change),
                avg: glucose.avg,
                max: glucose.max,
                min: glucose.min,
                reference: formatReferenceRange(glucose.reference),
                status: glucose.status_label, // Map status_label to status
                chart: (glucose.chart?.data || []).map((point) => ({
                    time: point.time,
                    value: point.avg, // Use avg as value for chart
                })),
                yAxisRange: glucose.chart?.y_axis_range
                    ? { min: glucose.chart.y_axis_range.min!, max: glucose.chart.y_axis_range.max! }
                    : undefined,
            },
            bloodOxygen: {
                latest: oxygen.latest?.value ?? null,
                change: parseChangeIndicator(oxygen.latest?.change),
                avg: oxygen.avg,
                max: oxygen.max,
                min: oxygen.min,
                reference: formatReferenceRange(oxygen.reference),
                status: null,
                chart: (oxygen.chart?.data || []).map((point) => ({
                    time: point.time,
                    value: point.avg, // Use avg as value for chart
                })),
                yAxisRange: oxygen.chart?.y_axis_range
                    ? { min: oxygen.chart.y_axis_range.min!, max: oxygen.chart.y_axis_range.max! }
                    : undefined,
            },
        },
        aiInsights: data.ai_insights || [],
        suggestions: (data.suggestions || []).map((s, i) => ({
            icon: s.icon || `/images/daily_report/${i + 1}.webp`,
            title: s.title || '',
            description: s.description || '',
        })),
    }
}

/**
 * Generate placeholder data for loading state
 * This prevents layout shift while loading
 */
export function generatePlaceholderData(): HealthyDailyPlaceholder {
    const emptyChange: ChangeIndicator = { value: null, trend: null }

    return {
        score: null,
        level: null,
        percentile: null,
        percentileMessage: null,
        aiTags: [],
        indicators: {
            bloodPressure: {
                latest: null,
                change: emptyChange,
                avg: null,
                reference: { systolic: '90-129', diastolic: '60-89' },
                status: null,
                chart: [
                    { time: '00:00', systolic: 120, diastolic: 80 },
                    { time: '04:00', systolic: 118, diastolic: 78 },
                    { time: '08:00', systolic: 125, diastolic: 82 },
                    { time: '12:00', systolic: 130, diastolic: 85 },
                    { time: '16:00', systolic: 128, diastolic: 84 },
                    { time: '20:00', systolic: 122, diastolic: 80 },
                ],
            },
            heartRate: {
                latest: null,
                change: emptyChange,
                avg: null,
                max: null,
                min: null,
                reference: '60-100',
                status: null,
                chart: [
                    { time: '00:00', avg: 65, max: 70, min: 60 },
                    { time: '04:00', avg: 62, max: 68, min: 58 },
                    { time: '08:00', avg: 75, max: 85, min: 70 },
                    { time: '12:00', avg: 82, max: 90, min: 75 },
                    { time: '16:00', avg: 78, max: 88, min: 72 },
                    { time: '20:00', avg: 70, max: 78, min: 65 },
                ],
            },
            bloodGlucose: {
                latest: null,
                change: emptyChange,
                avg: null,
                max: null,
                min: null,
                reference: '3.9-6.1',
                status: null,
                chart: [
                    { time: '06:00', value: 5.2 },
                    { time: '08:00', value: 7.5 },
                    { time: '10:00', value: 6.2 },
                    { time: '12:00', value: 7.8 },
                    { time: '14:00', value: 6.5 },
                    { time: '18:00', value: 5.8 },
                ],
            },
            bloodOxygen: {
                latest: null,
                change: emptyChange,
                avg: null,
                max: null,
                min: null,
                reference: '93-100',
                status: null,
                chart: [
                    { time: '00:00', value: 97 },
                    { time: '04:00', value: 96 },
                    { time: '08:00', value: 98 },
                    { time: '12:00', value: 97 },
                    { time: '16:00', value: 98 },
                    { time: '20:00', value: 97 },
                ],
            },
        },
        aiInsights: [],
        suggestions: [],
    }
}

/**
 * Generate demo data for development/testing
 * @deprecated Use only when demo mode is explicitly enabled
 */
export function generateHealthyDemoData(): HealthyDailyData {
    return {
        score: 82,
        level: 'good',
        percentile: 99,
        percentileMessage: 'Exceeding 99% people with same age!',
        aiTags: ['Physical health', 'Needs attention', 'Maintain schedule'],
        indicators: {
            bloodPressure: {
                latest: { systolic: 136, diastolic: 95 },
                change: { value: 2, trend: 'up' },
                avg: { systolic: 126, diastolic: 76 },
                reference: { systolic: '90-129', diastolic: '60-89' },
                status: 'high_normal',
                chart: [
                    { time: '01:00', systolic: 136, diastolic: 95 },
                    { time: '08:00', systolic: 125, diastolic: 78 },
                    { time: '14:00', systolic: 130, diastolic: 82 },
                    { time: '20:00', systolic: 128, diastolic: 80 },
                ],
            },
            heartRate: {
                latest: 84,
                change: { value: 2, trend: 'up' },
                avg: 73,
                max: 111,
                min: 63,
                reference: '60-100',
                status: 'normal',
                chart: [
                    { time: '00:00', avg: 65, max: 70, min: 60 },
                    { time: '04:00', avg: 72, max: 85, min: 65 },
                    { time: '08:00', avg: 88, max: 103, min: 75 },
                    { time: '16:00', avg: 75, max: 88, min: 68 },
                ],
            },
            bloodGlucose: {
                latest: 8.5,
                change: { value: 3.1, trend: 'up' },
                avg: 5.4,
                max: 7.6,
                min: 4.6,
                reference: '3.9-6.1',
                status: '偏高',
                chart: [
                    { time: '08:00', value: 5.2 },
                    { time: '12:00', value: 7.8 },
                    { time: '18:00', value: 6.1 },
                ],
            },
            bloodOxygen: {
                latest: 94,
                change: { value: 5, trend: 'down' },
                avg: 96,
                max: 99,
                min: 96,
                reference: '93-100',
                status: 'normal',
                chart: [
                    { time: '01:00', value: 98 },
                    { time: '08:00', value: 97 },
                    { time: '14:00', value: 96 },
                    { time: '20:00', value: 97 },
                ],
            },
        },
        aiInsights: [
            'The average blood oxygen saturation this week was 94.9%, the same as last week.',
            'Your blood oxygen level remained at a high level (98%) from Tuesday to Thursday this week.',
        ],
        suggestions: [
            {
                icon: '/images/daily_report/1.webp',
                title: 'Deep breath for 5 minutes',
                description: 'Relieve current anxiety and lower heart rate.',
            },
            {
                icon: '/images/daily_report/2.webp',
                title: "Today's nap suggestion",
                description: 'Rest and recover with a short nap.',
            },
            {
                icon: '/images/daily_report/3.webp',
                title: 'Drink water',
                description: 'The recent water intake is lower than usual.',
            },
        ],
    }
}
