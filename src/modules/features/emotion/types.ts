/**
 * Emotion Types
 * Defines frontend domain models for emotion feature
 */

/** Trend direction */
export type TrendDirection = 'up' | 'dn' | 'same'

/** Emotion level */
export type EmotionLevel = 'good' | 'neutral' | 'bad'

/** Emotion type */
export type EmotionType = 'happy' | 'angry' | 'neutral' | 'surprised' | 'sad' | 'fearful' | 'disgusted'

/** Distribution item */
export interface EmotionDistributionItem {
  type: EmotionType
  label: string
  count: number
  percent: number
}

/** Emotion composition data point */
export interface EmotionCompositionDataPoint {
  date: Date
  dateLabel: string
  weekdayKey: string
  positivePercent: number
  neutralPercent: number
  negativePercent: number
  positiveCount: number
  neutralCount: number
  negativeCount: number
}

/** Processed data point for trend chart */
export interface EmotionTrendDataPoint {
  date: Date
  dateLabel: string
  weekdayKey: string
  score: number | null
}

/** Emotion diary entry */
export interface EmotionDiaryEntry {
  diaryId: string
  title: string
  weekLabel: string
  dateLabel: string
  timeLabel: string
  content: string
  emotionTags: string[]
  imageUrl?: string
}

/** Summary statistics */
export interface EmotionSummary {
  /** Average emotion score */
  avgValue: number
  /** Previous week average */
  previousAvg: number
  /** Maximum score */
  maxValue: number
  /** Weekday key for max value */
  maxWeekdayKey: string
  /** Minimum score */
  minValue: number
  /** Weekday key for min value */
  minWeekdayKey: string
  /** Emotion level */
  emotionLevel: EmotionLevel
  /** Emotion label */
  emotionLabel: string
  /** Trend compared to previous period */
  trend: TrendDirection
  /** Change value */
  changeValue: number
}

/** Emotion distribution data */
export interface EmotionDistribution {
  totalCount: number
  dominantEmotion: string
  distribution: EmotionDistributionItem[]
}

/** Comparison data */
export interface EmotionComparison {
  current: { average: number }
  previous: { average: number }
  insight: string | null
}

/** Weekly summary data */
export interface EmotionWeeklySummary {
  overview: string | null
  highlights: string | null
  suggestions: string[]
  dataAnalysis: string[]
}

/** Complete domain model for emotion feature */
export interface EmotionDomainModel {
  /** Processed trend chart data points */
  trendChartData: EmotionTrendDataPoint[]
  /** Y-axis range for trend chart */
  yAxisRange: { min: number; max: number }
  /** Emotion composition data */
  compositionData: EmotionCompositionDataPoint[]
  /** Summary statistics */
  summary: EmotionSummary
  /** Emotion distribution */
  distribution: EmotionDistribution
  /** Comparison with previous period */
  comparison: EmotionComparison
  /** Weekly summary */
  weeklySummary: EmotionWeeklySummary
  /** Emotion diaries */
  diaries: EmotionDiaryEntry[]
}
