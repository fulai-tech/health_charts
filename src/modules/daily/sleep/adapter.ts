/**
 * Sleep Daily Adapter
 */

import type { SleepDailyApiResponse, SleepDailyData } from './types'

export function adaptSleepDailyData(response: SleepDailyApiResponse): SleepDailyData {
    const { data } = response

    return {
        score: data.sleep_score.score,
        level: data.sleep_score.level,
        levelLabel: data.sleep_score.level_label,
        percentile: data.sleep_score.percentile,
        percentileMessage: data.sleep_score.message,
        aiTags: data.ai_analysis || [],
        structureChart: {
            totalDuration: data.structure_chart.total_duration?.formatted ?? '--',
            totalMinutes: data.structure_chart.total_duration?.total_minutes ?? 0,
            deepDuration: data.structure_chart.deep_duration?.formatted ?? '--',
            deepMinutes: data.structure_chart.deep_duration?.total_minutes ?? 0,
            segments: data.structure_chart.chart || [],
        },
        structureAnalysis: data.structure_analysis || [],
        qualityIndicators: {
            bedTime: data.quality_indicators.bed_time,
            sleepTime: data.quality_indicators.sleep_time,
            wakeTime: data.quality_indicators.wake_time,
            getUpTime: data.quality_indicators.get_up_time,
            sleepLatency: data.quality_indicators.sleep_latency,
            sleepEfficiency: data.quality_indicators.sleep_efficiency,
        },
        aiInsights: data.ai_insights || [],
        suggestions: (data.suggestions || []).map((s, i) => ({
            icon: `/images/daily_report/${i + 1}.webp`,
            title: s.title || '',
            description: s.description || '',
        })),
    }
}

export function generateSleepDemoData(): SleepDailyData {
    return {
        score: 88,
        level: 'fair',
        levelLabel: 'Fair',
        percentile: 85,
        percentileMessage: 'Your rating is lower than 85% of users',
        aiTags: ['Excellent deep sleep', 'Time to bed late', 'Normal fragmented sleep'],
        structureChart: {
            totalDuration: '7h 11min',
            totalMinutes: 431,
            deepDuration: '4h 8min',
            deepMinutes: 248,
            segments: [
                { stage: 'light', start: '23:30', end: '00:30' },
                { stage: 'deep', start: '00:30', end: '02:00' },
                { stage: 'light', start: '02:00', end: '03:00' },
                { stage: 'rem', start: '03:00', end: '04:00' },
                { stage: 'deep', start: '04:00', end: '05:30' },
                { stage: 'light', start: '05:30', end: '06:30' },
                { stage: 'awake', start: '06:30', end: '06:45' },
                { stage: 'light', start: '06:45', end: '07:30' },
            ],
        },
        structureAnalysis: [
            { type: 'awake', label: 'Awake', percent: 4, duration: '2 times', status: 'Good' },
            { type: 'rem', label: 'REM', percent: 19, duration: '0 times', status: 'Good' },
            { type: 'light', label: 'Light sleep', percent: 62, duration: '0 times', status: 'Good' },
            { type: 'deep', label: 'Deep sleep', percent: 4, duration: '0 times', status: 'Good' },
        ],
        qualityIndicators: {
            bedTime: { value: '20:55', reference: '22:00', label: 'Bed rest time' },
            sleepTime: { value: '23:42', reference: '23:00', label: 'Time to fall asleep' },
            wakeTime: { value: '07:15', reference: '7:00', label: 'Post-awake time' },
            getUpTime: { value: '09:03', reference: '8:00', label: 'Wake-up time' },
            sleepLatency: { value: '45', reference: '<30min', label: 'Falling asleep takes time', unit: 'min' },
            sleepEfficiency: { value: '85', reference: '>85%', label: 'Sleep efficiency', unit: '%' },
        },
        aiInsights: [
            'The average blood oxygen saturation this week was 94.0%, the same as last week.',
            'Your blood oxygen level remained at a high level (98%) from Tuesday to Thursday this week.',
        ],
        suggestions: [
            {
                icon: '/images/daily_report/1.webp',
                title: 'Soaking feet before bed',
                description: 'Relieve current anxiety and lower heart rate.',
            },
            {
                icon: '/images/daily_report/2.webp',
                title: "Today's nap suggestion",
                description: 'Relieve current anxiety and lower heart rate.',
            },
        ],
    }
}
