import type {
  EmotionDomainModel,
  EmotionTrendDataPoint,
  EmotionCompositionDataPoint,
  EmotionDiaryEntry,
  TrendDirection,
  EmotionLevel,
} from './types'

/**
 * Map Chinese weekday labels to translation keys
 */
const WEEKDAY_MAP: Record<string, string> = {
  周一: 'weekdays.mon',
  周二: 'weekdays.tue',
  周三: 'weekdays.wed',
  周四: 'weekdays.thu',
  周五: 'weekdays.fri',
  周六: 'weekdays.sat',
  周日: 'weekdays.sun',
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
 * Safely get trend direction
 */
function safeTrend(trend?: string): TrendDirection {
  if (trend === 'up' || trend === 'dn' || trend === 'same') {
    return trend
  }
  return 'same'
}

/**
 * Safely get emotion level
 */
function safeEmotionLevel(level?: string): EmotionLevel {
  if (level === 'good' || level === 'neutral' || level === 'bad') {
    return level
  }
  return 'neutral'
}

// API response types (internal)
interface ApiEmotionData {
  indicator_type: string
  title: string
  overview?: {
    average?: number
    previous_average?: number
    change?: { value?: number; trend?: string }
    max?: number
    max_label?: string
    min?: number
    min_label?: string
    emotion_level?: string
    emotion_label?: string
  }
  trend_chart?: {
    chart_data?: Array<{
      date: string
      label: string
      score: number | null
    }>
    y_axis_range?: { min: number; max: number }
  }
  emotion_composition?: {
    chart_data?: Array<{
      date: string
      label: string
      positive_percent: number
      neutral_percent: number
      negative_percent: number
      positive_count: number
      neutral_count: number
      negative_count: number
    }>
  }
  emotion_distribution?: {
    total_count?: number
    dominant_emotion?: string
    distribution?: Array<{
      type: string
      label: string
      count: number
      percent: number
    }>
  }
  comparison?: {
    current?: { average?: number }
    previous?: { average?: number }
    changes?: { average?: { value?: number; trend?: string } }
    insight?: string | null
  }
  weekly_summary?: {
    overview?: string | null
    highlights?: string | null
    suggestions?: string[]
    data_analysis?: string[]
  }
  emotion_diaries?: Array<{
    diary_id: string
    title: string
    week_label: string
    date_label: string
    time_label: string
    content: string
    emotion_tag: string[]
    image_url?: string
  }>
}

/**
 * Dummy data for when API doesn't return data
 * Returns consistent demo data for all emotion components
 */
export function getDummyEmotionData(): EmotionDomainModel {
  const today = new Date()
  const dummyTrendData: EmotionTrendDataPoint[] = []
  const dummyCompositionData: EmotionCompositionDataPoint[] = []

  // Consistent score values for 7 days
  const scores = [78, 82, 75, 88, 85, 90, 86]
  const positivePercents = [25, 30, 20, 35, 32, 40, 38]
  const neutralPercents = [55, 50, 60, 45, 48, 42, 44]
  const negativePercents = [20, 20, 20, 20, 20, 18, 18]

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const weekdayIndex = date.getDay()
    const weekdayKeys = ['weekdays.sun', 'weekdays.mon', 'weekdays.tue', 'weekdays.wed', 'weekdays.thu', 'weekdays.fri', 'weekdays.sat']
    const dataIndex = 6 - i

    dummyTrendData.push({
      date,
      dateLabel: formatDate(date.toISOString().split('T')[0]),
      weekdayKey: weekdayKeys[weekdayIndex],
      score: scores[dataIndex],
    })

    dummyCompositionData.push({
      date,
      dateLabel: formatDate(date.toISOString().split('T')[0]),
      weekdayKey: weekdayKeys[weekdayIndex],
      positivePercent: positivePercents[dataIndex],
      neutralPercent: neutralPercents[dataIndex],
      negativePercent: negativePercents[dataIndex],
      positiveCount: Math.round(positivePercents[dataIndex] / 5),
      neutralCount: Math.round(neutralPercents[dataIndex] / 5),
      negativeCount: Math.round(negativePercents[dataIndex] / 5),
    })
  }

  return {
    trendChartData: dummyTrendData,
    yAxisRange: { min: 0, max: 100 },
    compositionData: dummyCompositionData,
    summary: {
      avgValue: 85,
      previousAvg: 86,
      maxValue: 88,
      maxWeekdayKey: 'weekdays.tue',
      minValue: 82,
      minWeekdayKey: 'weekdays.mon',
      emotionLevel: 'good',
      emotionLabel: '积极向好',
      trend: 'dn',
      changeValue: 1,
    },
    distribution: {
      totalCount: 55,
      dominantEmotion: '平静',
      distribution: [
        { type: 'happy', label: '开心', count: 4, percent: 7 },
        { type: 'angry', label: '生气', count: 5, percent: 9 },
        { type: 'neutral', label: '平静', count: 45, percent: 82 },
        { type: 'surprised', label: '庆幸', count: 0, percent: 0 },
        { type: 'sad', label: '悲伤', count: 1, percent: 2 },
        { type: 'fearful', label: '恐惧', count: 0, percent: 0 },
        { type: 'disgusted', label: '厌恶', count: 0, percent: 0 },
      ],
    },
    comparison: {
      current: { average: 85 },
      previous: { average: 86 },
      insight: null,
    },
    weeklySummary: {
      overview: '本周"开心"与"平静"占比合计达 72%。周六的户外活动显著提升了您的愉悦指数。',
      highlights: '周二出现短暂的"疲惫/悲伤"情绪，主要与工作压力及前一晚睡眠不足有关。',
      suggestions: [],
      dataAnalysis: [
        '您的情绪以积极为主，整体状态良好',
        '情绪波动在正常范围内，情绪调节能力较强',
        '建议继续保持积极的生活态度，适当进行放松训练',
      ],
    },
    diaries: [
      {
        diaryId: 'dummy-1',
        title: '钱包失而复得',
        weekLabel: '周四 Thu',
        dateLabel: 'Nov.21',
        timeLabel: '20:22',
        content: '今天出门买菜时不小心把钱包落在了超市，回家才发现。正着急的时候，超市打来电话说有人捡到交给了服务台。真是太感谢那位好心人了，世界还是好人多啊！',
        emotionTags: ['庆幸'],
        imageUrl: '/src/assets/images/emotion/wallet.png',
      },
      {
        diaryId: 'dummy-2',
        title: '社区活动真热闹',
        weekLabel: '周五 Fri',
        dateLabel: 'Nov.22',
        timeLabel: '15:30',
        content: '今天参加了社区组织的老年人联谊会，见到了好多老朋友。大家一起聊天、下棋、唱歌，度过了愉快的下午。活动结束后还一起合影留念，真希望这样的活动能多举办几次。',
        emotionTags: ['开心'],
        imageUrl: '/src/assets/images/emotion/meeting.png',
      },
      {
        diaryId: 'dummy-3',
        title: '期待已久的家庭聚餐',
        weekLabel: '周一 Mon',
        dateLabel: 'Nov.24',
        timeLabel: '19:33',
        content: '今天孩子们都回来了，我特意做了他们爱吃的红烧肉。小孙子讲了很多学校的事情，女儿也分享了工作上的趣事。一家人围坐在一起吃饭聊天，这种温馨的感觉真好。',
        emotionTags: ['开心'],
        imageUrl: '/src/assets/images/emotion/daughter.png',
      },
    ],
  }
}

/**
 * Adapter function to transform API response to frontend domain model
 */
export function adaptEmotionData(apiData: ApiEmotionData | null | undefined): EmotionDomainModel {
  console.log('[Emotion Adapter] Input:', apiData)

  // If no data, return dummy data
  if (!apiData) {
    console.warn('[Emotion Adapter] No API data, using dummy data')
    return getDummyEmotionData()
  }

  // Transform trend chart data
  const rawTrendData = apiData?.trend_chart?.chart_data || []
  const trendChartData: EmotionTrendDataPoint[] = rawTrendData.map((point) => ({
    date: new Date(point.date),
    dateLabel: formatDate(point.date),
    weekdayKey: WEEKDAY_MAP[point.label] || 'weekdays.mon',
    score: point.score,
  }))

  // Transform composition data
  const rawCompositionData = apiData?.emotion_composition?.chart_data || []
  const compositionData: EmotionCompositionDataPoint[] = rawCompositionData.map((point) => ({
    date: new Date(point.date),
    dateLabel: formatDate(point.date),
    weekdayKey: WEEKDAY_MAP[point.label] || 'weekdays.mon',
    positivePercent: point.positive_percent,
    neutralPercent: point.neutral_percent,
    negativePercent: point.negative_percent,
    positiveCount: point.positive_count,
    neutralCount: point.neutral_count,
    negativeCount: point.negative_count,
  }))

  // Transform diaries
  const rawDiaries = apiData?.emotion_diaries || []
  const diaries: EmotionDiaryEntry[] = rawDiaries.map((diary) => ({
    diaryId: diary.diary_id,
    title: diary.title,
    weekLabel: diary.week_label,
    dateLabel: diary.date_label,
    timeLabel: diary.time_label,
    content: diary.content,
    emotionTags: diary.emotion_tag || [],
    imageUrl: diary.image_url,
  }))

  // Get values from overview
  const overview = apiData?.overview || {}
  const avgValue = overview.average || 0
  const previousAvg = overview.previous_average || 0
  const maxValue = overview.max || 0
  const minValue = overview.min || 0
  const maxWeekdayKey = overview.max_label ? (WEEKDAY_MAP[overview.max_label] || 'weekdays.mon') : 'weekdays.mon'
  const minWeekdayKey = overview.min_label ? (WEEKDAY_MAP[overview.min_label] || 'weekdays.mon') : 'weekdays.mon'
  const emotionLevel = safeEmotionLevel(overview.emotion_level)
  const emotionLabel = overview.emotion_label || ''

  // Get trend from change
  const change = overview.change || {}
  const trend = safeTrend(change.trend)
  const changeValue = change.value || 0

  // Get distribution
  const distributionData = apiData?.emotion_distribution || {}
  const distribution = {
    totalCount: distributionData.total_count || 0,
    dominantEmotion: distributionData.dominant_emotion || '',
    distribution: (distributionData.distribution || []).map((item) => ({
      type: item.type as any,
      label: item.label,
      count: item.count,
      percent: item.percent,
    })),
  }

  // Get comparison
  const comparison = apiData?.comparison || {}

  // Get weekly summary
  const weeklySummary = apiData?.weekly_summary || {}

  const result: EmotionDomainModel = {
    trendChartData: trendChartData.length > 0 ? trendChartData : getDummyEmotionData().trendChartData,
    yAxisRange: apiData?.trend_chart?.y_axis_range || { min: 0, max: 100 },
    compositionData: compositionData.length > 0 ? compositionData : getDummyEmotionData().compositionData,
    summary: {
      avgValue,
      previousAvg,
      maxValue,
      maxWeekdayKey,
      minValue,
      minWeekdayKey,
      emotionLevel,
      emotionLabel,
      trend,
      changeValue,
    },
    distribution,
    comparison: {
      current: { average: comparison.current?.average || avgValue },
      previous: { average: comparison.previous?.average || previousAvg },
      insight: comparison.insight || null,
    },
    weeklySummary: {
      overview: weeklySummary.overview || null,
      highlights: weeklySummary.highlights || null,
      suggestions: weeklySummary.suggestions || [],
      dataAnalysis: weeklySummary.data_analysis || [],
    },
    diaries: diaries.length > 0 ? diaries : getDummyEmotionData().diaries,
  }

  console.log('[Emotion Adapter] Output:', result)
  return result
}
