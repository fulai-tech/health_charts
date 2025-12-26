/**
 * Sleep Types
 * Defines API response types and frontend domain models
 */

// ============================================
// API Response Types
// ============================================

/** Sleep trend chart data point from API */
export interface SleepTrendChartDataPoint {
    date: string
    label: string
    total: number
    total_text: string
    deep: number
    deep_text: string
    light: number
    light_text: string
    rem: number
    rem_text: string
    awake: number
    awake_text: string
}

/** Sleep stage from API */
export interface SleepStageAPI {
    type: 'deep' | 'light' | 'rem' | 'awake'
    label: string
    percent: number
    reference: string
    evaluation: 'normal' | 'high' | 'low'
    evaluation_text: string
    color: string
}

/** Sleep routine from API */
export interface SleepRoutineAPI {
    has_data: boolean
    avg_sleep_time: {
        minutes: number
        time_text: string
        change: {
            value: number
            trend: 'up' | 'dn' | 'same'
            text: string
        }
    }
    avg_wake_time: {
        minutes: number
        time_text: string
        change: {
            value: number
            trend: 'up' | 'dn' | 'same'
            text: string
        }
    }
    insight: string | null
}

// ============================================
// Frontend Domain Models
// ============================================

/** Trend direction */
export type TrendDirection = 'up' | 'down' | 'stable'

/** Sleep stage status */
export type SleepStageStatus = 'normal' | 'high' | 'low'

/** Processed data point for frontend use */
export interface SleepDataPoint {
    /** JavaScript Date object */
    date: Date
    /** Formatted date label based on locale */
    dateLabel: string
    /** Short weekday label (translation key) */
    weekdayKey: string
    /** Total sleep duration in minutes */
    total: number
    /** Total sleep formatted text */
    totalText: string
    /** Deep sleep duration in minutes */
    deep: number
    /** Light sleep duration in minutes */
    light: number
    /** REM sleep duration in minutes */
    rem: number
    /** Awake duration in minutes */
    awake: number
}

/** Sleep stage distribution */
export interface SleepStage {
    type: 'deep' | 'light' | 'rem' | 'awake'
    labelKey: string
    percent: number
    reference: string
    status: SleepStageStatus
    statusText: string
    color: string
}

/** Sleep routine data */
export interface SleepRoutine {
    hasData: boolean
    avgSleepTime: {
        text: string
        changeValue: number
        trend: TrendDirection
        changeText: string
    }
    avgWakeTime: {
        text: string
        changeValue: number
        trend: TrendDirection
        changeText: string
    }
    insight: string | null
}

/** Summary statistics */
export interface SleepSummary {
    /** Average duration in minutes */
    avgDuration: number
    /** Average duration formatted text */
    avgDurationText: string
    /** Average hours (extracted from avgDuration) */
    avgHours: number
    /** Average minutes (extracted from avgDuration) */
    avgMinutes: number
    /** Duration change from previous week */
    durationChange: number
    /** Duration change text */
    durationChangeText: string
    /** Last week's duration text */
    lastWeekDurationText: string
    /** Trend direction */
    trend: TrendDirection
    /** Maximum duration text */
    maxDurationText: string
    /** Maximum duration day */
    maxDay: string
    /** Highest hours */
    highestHours: number
    /** Highest minutes */
    highestMinutes: number
    /** Highest day label */
    highestDay: string
    /** Minimum duration text */
    minDurationText: string
    /** Minimum duration day */
    minDay: string
    /** Lowest hours */
    lowestHours: number
    /** Lowest minutes */
    lowestMinutes: number
    /** Lowest day label */
    lowestDay: string
}

/** Complete domain model for sleep feature */
export interface SleepDomainModel {
    /** Processed chart data points */
    chartData: SleepDataPoint[]
    /** Y-axis range for chart (hours) */
    yAxisRange: { min: number; max: number }
    /** Stage colors from API */
    stageColors: {
        deep: string
        light: string
        rem: string
        awake: string
    }
    /** Summary statistics */
    summary: SleepSummary
    /** Sleep structure (stages breakdown) */
    sleepStructure: {
        hasData: boolean
        stages: SleepStage[]
    }
    /** Sleep routine data */
    routine: SleepRoutine
    /** Weekly summary */
    weeklySummary: {
        overview: string | null
        highlights: string | null
        suggestions: string[]
        dataAnalysis: string[]
    }
}
