/**
 * Healthy Daily Adapter
 * Transform API response to domain model
 */

import type { HealthyDailyApiResponse, HealthyDailyData } from './types'

/**
 * Adapt API response to domain model
 */
export function adaptHealthyDailyData(response: HealthyDailyApiResponse): HealthyDailyData {
    const { data } = response

    return {
        score: data.health_score.score,
        level: data.health_score.level,
        percentile: data.health_score.percentile,
        percentileMessage: data.health_score.message,
        aiTags: data.ai_analysis || [],
        indicators: {
            bloodPressure: {
                latest: data.indicators.blood_pressure.latest,
                avg: data.indicators.blood_pressure.avg,
                max: data.indicators.blood_pressure.max,
                min: data.indicators.blood_pressure.min,
                reference: data.indicators.blood_pressure.reference,
                status: data.indicators.blood_pressure.status,
                chart: data.indicators.blood_pressure.chart || [],
            },
            heartRate: {
                latest: data.indicators.heart_rate.latest,
                avg: data.indicators.heart_rate.avg,
                max: data.indicators.heart_rate.max,
                min: data.indicators.heart_rate.min,
                reference: data.indicators.heart_rate.reference,
                status: data.indicators.heart_rate.status,
                chart: data.indicators.heart_rate.chart || [],
            },
            bloodGlucose: {
                latest: data.indicators.blood_glucose.latest,
                avg: data.indicators.blood_glucose.avg,
                max: data.indicators.blood_glucose.max,
                min: data.indicators.blood_glucose.min,
                reference: data.indicators.blood_glucose.reference,
                status: data.indicators.blood_glucose.status,
                chart: data.indicators.blood_glucose.chart || [],
            },
            bloodOxygen: {
                latest: data.indicators.blood_oxygen.latest,
                avg: data.indicators.blood_oxygen.avg,
                max: data.indicators.blood_oxygen.max,
                min: data.indicators.blood_oxygen.min,
                reference: data.indicators.blood_oxygen.reference,
                status: data.indicators.blood_oxygen.status,
                chart: data.indicators.blood_oxygen.chart || [],
            },
        },
        aiInsights: data.ai_insights || [],
        suggestions: (data.suggestions || []).map((s, i) => ({
            icon: `/images/daily_report/${i + 1}.webp`,
            title: s.title || '',
            description: s.description || '',
        })),
    }
}

/**
 * Generate demo data for when API returns null values
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
                avg: { systolic: 126, diastolic: 76 },
                max: { systolic: 140, diastolic: 98 },
                min: { systolic: 118, diastolic: 70 },
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
                avg: 73,
                max: 111,
                min: 63,
                reference: '60-100',
                status: 'normal',
                chart: [
                    { time: '01:00', value: 84 },
                    { time: '08:00', value: 72 },
                    { time: '12:00', value: 88 },
                    { time: '18:00', value: 75 },
                ],
            },
            bloodGlucose: {
                latest: 8.5,
                avg: 5.4,
                max: 4.6,
                min: 7.8,
                reference: '3.9-6.1',
                status: 'high',
                chart: [
                    { time: '08:00', value: 5.2 },
                    { time: '12:00', value: 7.8 },
                    { time: '18:00', value: 6.1 },
                ],
            },
            bloodOxygen: {
                latest: 94,
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
