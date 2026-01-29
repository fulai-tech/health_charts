/**
 * Emotion Daily Adapter
 * Transform API response to domain model
 */

import type { EmotionDailyApiResponse, EmotionDailyData } from './types'

/**
 * Adapt API response to domain model
 */
export function adaptEmotionDailyData(response: EmotionDailyApiResponse): EmotionDailyData {
    const { data } = response

    return {
        score: data.emotion_score.score,
        level: data.emotion_score.level,
        levelLabel: data.emotion_score.level_label,
        percentile: data.emotion_score.percentile,
        percentileMessage: data.emotion_score.message,
        aiTags: data.ai_analysis || [],
        chart: data.chart || [],
        distribution: {
            mainEmotion: data.emotion_distribution?.main_emotion || '',
            mainEmotionLabel: data.emotion_distribution?.main_emotion_label || '',
            items: data.emotion_distribution?.distribution || [],
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
export function generateEmotionDemoData(): EmotionDailyData {
    return {
        score: 88,
        level: 'good',
        levelLabel: 'Good',
        percentile: 95,
        percentileMessage: 'Exceeding 95% people with same age!',
        aiTags: ['Strong self-regulation', 'Large mood swings', 'Afternoon Anxiety'],
        chart: [
            { hour: '08:00', label: '8点-9点', positive: 60, neutral: 30, negative: 10 },
            { hour: '10:00', label: '10点-11点', positive: 50, neutral: 40, negative: 10 },
            { hour: '12:00', label: '12点-13点', positive: 40, neutral: 60, negative: 0 },
            { hour: '14:00', label: '14点-15点', positive: 30, neutral: 50, negative: 20 },
            { hour: '16:00', label: '16点-17点', positive: 20, neutral: 65, negative: 15 },
            { hour: '18:00', label: '18点-19点', positive: 35, neutral: 50, negative: 15 },
            { hour: '20:00', label: '20点-21点', positive: 45, neutral: 45, negative: 10 },
            { hour: '22:00', label: '22点-23点', positive: 55, neutral: 40, negative: 5 },
        ],
        distribution: {
            mainEmotion: 'HAPPY',
            mainEmotionLabel: 'Happy',
            items: [
                { type: 'HAPPY', label: 'Happy', count: 42, percent: 42 },
                { type: 'CALM', label: 'Calm', count: 30, percent: 30 },
                { type: 'SURPRISED', label: 'Surprise', count: 10, percent: 10 },
                { type: 'SAD', label: 'Sad', count: 8, percent: 8 },
                { type: 'ANGRY', label: 'Angry', count: 5, percent: 5 },
                { type: 'FEARFUL', label: 'Fear', count: 2, percent: 2 },
                { type: 'DISGUSTED', label: 'Hate', count: 3, percent: 3 },
            ],
        },
        aiInsights: [
            'The average blood oxygen saturation this week was 94.9%, the same as last week.',
            'Your blood oxygen level remained at a high level (98%) from Tuesday to Thursday this week.',
        ],
        suggestions: [
            {
                icon: '/images/daily_report/1.webp',
                title: '4-6-4 breathing method',
                description: 'Relieve current anxiety and lower heart rate.',
            },
        ],
    }
}
