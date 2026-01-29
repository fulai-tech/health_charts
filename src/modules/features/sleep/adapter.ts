import type { SleepDetailData } from '@/services/api/types'
import type {
    SleepDomainModel,
    SleepDataPoint,
    SleepStage,
    TrendDirection,
    SleepStageStatus,
} from './types'
import { ensureFullWeekData, WEEKDAY_LABEL_MAP, getDateForWeekday, getCurrentWeekDateRange } from '@/lib/dateUtils'

/**
 * Map sleep stage types to translation keys
 */
const STAGE_LABEL_MAP: Record<string, string> = {
    deep: 'page.sleep.deepSleep',
    light: 'page.sleep.lightSleep',
    rem: 'page.sleep.remSleep',
    awake: 'page.sleep.awake',
}

/**
 * Format date to MM/DD
 */
function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}/${day}`
}

/**
 * Map API trend value to standard trend direction
 */
function mapTrend(trend: string): TrendDirection {
    switch (trend) {
        case 'up':
            return 'up'
        case 'dn':
        case 'down':
            return 'down'
        default:
            return 'stable'
    }
}

/**
 * Map API evaluation to stage status
 */
function mapEvaluation(evaluation: string): SleepStageStatus {
    switch (evaluation) {
        case 'high':
            return 'high'
        case 'low':
            return 'low'
        default:
            return 'normal'
    }
}

/**
 * Adapter function to transform API response to frontend domain model
 */
export function adaptSleepData(apiData: SleepDetailData): SleepDomainModel {
    const rawData = apiData?.trend_chart?.chart_data || []
    const { start: currentMonday } = getCurrentWeekDateRange()

    // Transform each data point
    const partialChartData: SleepDataPoint[] = rawData.map((point) => {
        const date = new Date(point.date)

        return {
            date,
            dateLabel: formatDate(point.date),
            weekdayKey: WEEKDAY_LABEL_MAP[point.label] || 'weekdays.mon',
            total: point.total || 0,
            totalText: point.total_text || '',
            deep: point.deep || 0,
            light: point.light || 0,
            rem: point.rem || 0,
            awake: point.awake || 0,
        }
    })

    // Ensure all 7 weekdays are present (fill missing days with 0 values)
    const chartData = ensureFullWeekData(partialChartData, (weekdayKey, index) => ({
        date: getDateForWeekday(currentMonday, index),
        dateLabel: '',
        weekdayKey,
        total: 0,
        totalText: '',
        deep: 0,
        light: 0,
        rem: 0,
        awake: 0,
    }))

    // Get overview data
    const overview = apiData?.overview || {}
    const change = overview.change || {}

    // Map sleep structure stages
    const sleepStructure = apiData?.sleep_structure || { has_data: false, stages: [] }
    const stages: SleepStage[] = (sleepStructure.stages || []).map((stage) => ({
        type: stage.type as 'deep' | 'light' | 'rem' | 'awake',
        labelKey: STAGE_LABEL_MAP[stage.type] || stage.label,
        percent: stage.percent || 0,
        reference: stage.reference || '',
        status: mapEvaluation(stage.evaluation),
        statusText: stage.evaluation_text || '',
        color: stage.color || '#ccc',
    }))

    // Map sleep routine
    const routine = apiData?.sleep_routine || { has_data: false } as any
    const mappedRoutine = {
        hasData: routine.has_data || false,
        avgSleepTime: {
            text: routine.avg_sleep_time?.time_text || '--:--',
            changeValue: routine.avg_sleep_time?.change?.value || 0,
            trend: mapTrend(routine.avg_sleep_time?.change?.trend || 'same'),
            changeText: routine.avg_sleep_time?.change?.text || '',
        },
        avgWakeTime: {
            text: routine.avg_wake_time?.time_text || '--:--',
            changeValue: routine.avg_wake_time?.change?.value || 0,
            trend: mapTrend(routine.avg_wake_time?.change?.trend || 'same'),
            changeText: routine.avg_wake_time?.change?.text || '',
        },
        insight: routine.insight || null,
    }

    // Use fixed stage colors matching design specification
    const stageColors = {
        deep: '#A27EFD',
        light: '#D9CBFE',
        rem: '#ECE5FE',
        awake: '#F9933B',
    }

    const result: SleepDomainModel = {
        chartData,
        yAxisRange: apiData?.trend_chart?.y_axis_range || { min: 0, max: 10 },
        stageColors,
        summary: {
            avgDuration: overview.average || 0,
            avgDurationText: overview.average_text || '--',
            avgHours: Math.floor((overview.average || 0) / 60),
            avgMinutes: (overview.average || 0) % 60,
            durationChange: change.value || 0,
            durationChangeText: change.value_text || '',
            lastWeekDurationText: overview.previous_average_text || '--',
            trend: mapTrend(change.trend),
            maxDurationText: overview.max_text || '--',
            maxDay: overview.max_label || '',
            highestHours: Math.floor((overview.max || 0) / 60),
            highestMinutes: (overview.max || 0) % 60,
            highestDay: overview.max_label || '--',
            minDurationText: overview.min_text || '--',
            minDay: overview.min_label || '',
            lowestHours: Math.floor((overview.min || 0) / 60),
            lowestMinutes: (overview.min || 0) % 60,
            lowestDay: overview.min_label || '--',
        },
        sleepStructure: {
            hasData: sleepStructure.has_data || false,
            stages,
        },
        routine: mappedRoutine,
        weeklySummary: {
            overview: apiData?.weekly_summary?.overview || null,
            highlights: apiData?.weekly_summary?.highlights || null,
            suggestions: apiData?.weekly_summary?.suggestions || [],
            dataAnalysis: apiData?.weekly_summary?.data_analysis || [],
        },
    }

    return result
}
