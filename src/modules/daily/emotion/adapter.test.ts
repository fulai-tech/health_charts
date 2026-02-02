/**
 * 情绪日报数据适配器测试
 * 
 * 测试目标：防止 API 数据转换错误导致情绪数据展示异常
 */

import { describe, it, expect } from 'vitest'
import { adaptEmotionDailyData, generateEmotionDemoData } from '@/modules/daily/emotion/adapter'
import type { EmotionDailyApiResponse } from '@/modules/daily/emotion/types'

describe('emotion adapter - API 数据转换', () => {
  it('adaptEmotionDailyData 应该正确转换完整的 API 响应', () => {
    const mockApiResponse: EmotionDailyApiResponse = {
      code: 200,
      msg: 'success',
      data: {
        emotion_score: {
          score: 88,
          level: 'good',
          level_label: 'Good',
          percentile: 95,
          message: 'Exceeding 95% people',
        },
        ai_analysis: ['Strong self-regulation', 'Large mood swings'],
        chart: [
          { hour: '08:00', label: '8点-9点', positive: 60, neutral: 30, negative: 10 },
          { hour: '10:00', label: '10点-11点', positive: 50, neutral: 40, negative: 10 },
        ],
        emotion_distribution: {
          main_emotion: 'HAPPY',
          main_emotion_label: 'Happy',
          distribution: [
            { type: 'HAPPY', label: 'Happy', count: 42, percent: 42 },
            { type: 'CALM', label: 'Calm', count: 30, percent: 30 },
          ],
        },
        ai_insights: ['Your mood is stable this week'],
        suggestions: [
          { icon: '/images/daily_report/1.webp', title: 'Breathing method', description: 'Relieve anxiety' },
        ],
      },
    }

    const result = adaptEmotionDailyData(mockApiResponse)

    expect(result.score).toBe(88)
    expect(result.level).toBe('good')
    expect(result.levelLabel).toBe('Good')
    expect(result.percentile).toBe(95)
    expect(result.aiTags).toHaveLength(2)
    expect(result.chart).toHaveLength(2)
    expect(result.distribution.mainEmotion).toBe('HAPPY')
    expect(result.distribution.items).toHaveLength(2)
    expect(result.suggestions).toHaveLength(1)
  })

  it('adaptEmotionDailyData 应该处理空的可选字段', () => {
    const mockApiResponse: EmotionDailyApiResponse = {
      code: 200,
      msg: 'success',
      data: {
        emotion_score: {
          score: 70,
          level: 'fair',
          level_label: 'Fair',
          percentile: 50,
          message: 'Average',
        },
        ai_analysis: null as any,
        chart: null as any,
        emotion_distribution: null as any,
        ai_insights: null as any,
        suggestions: null as any,
      },
    }

    const result = adaptEmotionDailyData(mockApiResponse)

    expect(result.score).toBe(70)
    expect(result.aiTags).toEqual([])
    expect(result.chart).toEqual([])
    expect(result.distribution.mainEmotion).toBe('')
    expect(result.distribution.items).toEqual([])
    expect(result.aiInsights).toEqual([])
    expect(result.suggestions).toEqual([])
  })

  it('adaptEmotionDailyData 应该为建议添加图标路径', () => {
    const mockApiResponse: EmotionDailyApiResponse = {
      code: 200,
      msg: 'success',
      data: {
        emotion_score: {
          score: 80,
          level: 'good',
          level_label: 'Good',
          percentile: 80,
          message: 'Good',
        },
        suggestions: [
          { icon: '', title: 'Tip 1', description: 'Description 1' },
          { icon: '', title: 'Tip 2', description: 'Description 2' },
          { icon: '', title: 'Tip 3', description: 'Description 3' },
        ],
        ai_analysis: [],
        chart: [],
        emotion_distribution: null as any,
        ai_insights: [],
      },
    }

    const result = adaptEmotionDailyData(mockApiResponse)

    expect(result.suggestions[0].icon).toBe('/images/daily_report/1.webp')
    expect(result.suggestions[1].icon).toBe('/images/daily_report/2.webp')
    expect(result.suggestions[2].icon).toBe('/images/daily_report/3.webp')
  })

  it('adaptEmotionDailyData 应该处理缺少 title 或 description 的建议', () => {
    const mockApiResponse: EmotionDailyApiResponse = {
      code: 200,
      msg: 'success',
      data: {
        emotion_score: {
          score: 80,
          level: 'good',
          level_label: 'Good',
          percentile: 80,
          message: 'Good',
        },
        suggestions: [
          { icon: '', title: null as any, description: null as any },
        ],
        ai_analysis: [],
        chart: [],
        emotion_distribution: null as any,
        ai_insights: [],
      },
    }

    const result = adaptEmotionDailyData(mockApiResponse)

    expect(result.suggestions[0].title).toBe('')
    expect(result.suggestions[0].description).toBe('')
  })
})

describe('emotion adapter - Demo 数据生成', () => {
  it('generateEmotionDemoData 应该生成有效的 demo 数据', () => {
    const result = generateEmotionDemoData()

    expect(result.score).toBeGreaterThan(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.level).toBeDefined()
    expect(result.levelLabel).toBeDefined()
    expect(result.chart.length).toBeGreaterThan(0)
    expect(result.distribution.items.length).toBeGreaterThan(0)
  })

  it('generateEmotionDemoData 的图表数据应该符合格式要求', () => {
    const result = generateEmotionDemoData()

    result.chart.forEach((item) => {
      expect(item).toHaveProperty('hour')
      expect(item).toHaveProperty('label')
      expect(item).toHaveProperty('positive')
      expect(item).toHaveProperty('neutral')
      expect(item).toHaveProperty('negative')
      
      // 百分比总和应该约等于 100（允许小误差）
      const total = item.positive + item.neutral + item.negative
      expect(total).toBeGreaterThanOrEqual(95)
      expect(total).toBeLessThanOrEqual(105)
    })
  })

  it('generateEmotionDemoData 的情绪分布百分比总和应该为 100', () => {
    const result = generateEmotionDemoData()

    const totalPercent = result.distribution.items.reduce(
      (sum, item) => sum + item.percent,
      0
    )
    
    expect(totalPercent).toBe(100)
  })
})
