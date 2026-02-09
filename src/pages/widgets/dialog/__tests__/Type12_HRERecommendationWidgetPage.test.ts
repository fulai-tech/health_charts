/**
 * Type 12 - HRE Recommendation Widget 测试
 *
 * 测试目标：验证 parseHREData 数据解析逻辑的正确性
 */

import { describe, it, expect } from 'vitest'
import { parseHREData } from '../Type12_HRERecommendationWidgetPage'
import {
  mockVideoRecommendation,
  mockAudioRecommendation,
  mockImageTextRecommendation,
  mockTextOnlyRecommendation,
  mockEmptyRecommendation,
  mockMultipleRecommendations,
  mockVideoRecommendationJSON,
  mockTextOnlyRecommendationJSON,
} from './type12-mock-data'

describe('parseHREData - 基本解析', () => {
  it('应该正确解析视频推荐数据', () => {
    const result = parseHREData(mockVideoRecommendation)
    expect(result).not.toBeNull()
    expect(result!.hre_recommendations).toHaveLength(1)

    const item = result!.hre_recommendations[0]
    expect(item.type).toBe('video')
    expect(item.content_type).toBe('exercise')
    expect(item.has_match).toBe(true)
    expect(item.title).toBe('Gentle 5-Minute Move')
    expect(item.minutes).toBe(15)
    expect(item.image_url).toBeDefined()
    expect(item.url).toBeDefined()
  })

  it('应该正确解析音频推荐数据', () => {
    const result = parseHREData(mockAudioRecommendation)
    expect(result).not.toBeNull()

    const item = result!.hre_recommendations[0]
    expect(item.type).toBe('audio')
    expect(item.content_type).toBe('music')
    expect(item.has_match).toBe(true)
    expect(item.minutes).toBe(10)
  })

  it('应该正确解析图文推荐数据', () => {
    const result = parseHREData(mockImageTextRecommendation)
    expect(result).not.toBeNull()

    const item = result!.hre_recommendations[0]
    expect(item.type).toBe('image_text')
    expect(item.content_type).toBe('food')
    expect(item.has_match).toBe(true)
    expect(item.minutes).toBeUndefined()
  })

  it('应该正确解析纯文本推荐（无匹配）', () => {
    const result = parseHREData(mockTextOnlyRecommendation)
    expect(result).not.toBeNull()

    const item = result!.hre_recommendations[0]
    expect(item.has_match).toBe(false)
    expect(item.title).toBe('Take a Short Walk')
    expect(item.image_url).toBeUndefined()
    expect(item.url).toBeUndefined()
    expect(item.type).toBeUndefined()
    expect(item.content_type).toBeUndefined()
  })

  it('应该正确解析多条推荐（按 rank 排序）', () => {
    const result = parseHREData(mockMultipleRecommendations)
    expect(result).not.toBeNull()
    expect(result!.hre_recommendations).toHaveLength(3)
  })
})

describe('parseHREData - JSON 字符串解析', () => {
  it('应该正确解析 JSON 字符串格式（模拟 NativeBridge）', () => {
    const result = parseHREData(mockVideoRecommendationJSON)
    expect(result).not.toBeNull()
    expect(result!.hre_recommendations).toHaveLength(1)
    expect(result!.hre_recommendations[0].type).toBe('video')
  })

  it('应该正确解析纯文本推荐的 JSON 字符串', () => {
    const result = parseHREData(mockTextOnlyRecommendationJSON)
    expect(result).not.toBeNull()
    expect(result!.hre_recommendations[0].has_match).toBe(false)
  })
})

describe('parseHREData - 无效数据处理', () => {
  it('无效 JSON 字符串应返回 null', () => {
    expect(parseHREData('invalid json {')).toBeNull()
  })

  it('null 应返回 null', () => {
    expect(parseHREData(null)).toBeNull()
  })

  it('undefined 应返回 null', () => {
    expect(parseHREData(undefined)).toBeNull()
  })

  it('数字应返回 null', () => {
    expect(parseHREData(123)).toBeNull()
  })

  it('数组应返回 null（必须是对象）', () => {
    expect(parseHREData([1, 2, 3])).toBeNull()
  })

  it('空对象（无 hre_recommendations）应返回 null', () => {
    expect(parseHREData({})).toBeNull()
  })

  it('hre_recommendations 不是数组应返回 null', () => {
    expect(parseHREData({ hre_recommendations: 'not an array' })).toBeNull()
  })

  it('空推荐列表应返回 null', () => {
    expect(parseHREData(mockEmptyRecommendation)).toBeNull()
  })
})

describe('parseHREData - 字段缺省处理', () => {
  it('缺少 title 的推荐项应被过滤', () => {
    const data = {
      hre_recommendations: [
        { has_match: true, explanation_text: 'test', detailed_text: 'test', rank: 1, total_count: 1 },
      ],
    }
    expect(parseHREData(data)).toBeNull()
  })

  it('缺少 has_match 的推荐项应被过滤', () => {
    const data = {
      hre_recommendations: [
        { title: 'Test', explanation_text: 'test', detailed_text: 'test', rank: 1, total_count: 1 },
      ],
    }
    expect(parseHREData(data)).toBeNull()
  })

  it('可选字段缺失时应使用默认值', () => {
    const data = {
      hre_recommendations: [{
        title: 'Minimal Item',
        has_match: false,
        rank: 1,
        total_count: 1,
      }],
    }
    const result = parseHREData(data)
    expect(result).not.toBeNull()

    const item = result!.hre_recommendations[0]
    expect(item.explanation_text).toBe('')
    expect(item.detailed_text).toBe('')
    expect(item.content_id).toBeUndefined()
    expect(item.type).toBeUndefined()
    expect(item.content_type).toBeUndefined()
    expect(item.image_url).toBeUndefined()
    expect(item.url).toBeUndefined()
    expect(item.minutes).toBeUndefined()
  })

  it('无效的 type 值应被忽略', () => {
    const data = {
      hre_recommendations: [{
        title: 'Test',
        type: 'invalid_type',
        has_match: true,
        rank: 1,
        total_count: 1,
      }],
    }
    const result = parseHREData(data)
    expect(result).not.toBeNull()
    expect(result!.hre_recommendations[0].type).toBeUndefined()
  })

  it('无效的 content_type 值应被忽略', () => {
    const data = {
      hre_recommendations: [{
        title: 'Test',
        content_type: 'invalid_content_type',
        has_match: true,
        rank: 1,
        total_count: 1,
      }],
    }
    const result = parseHREData(data)
    expect(result).not.toBeNull()
    expect(result!.hre_recommendations[0].content_type).toBeUndefined()
  })

  it('rank 缺失时应默认为 999', () => {
    const data = {
      hre_recommendations: [{
        title: 'Test',
        has_match: false,
        total_count: 1,
      }],
    }
    const result = parseHREData(data)
    expect(result).not.toBeNull()
    expect(result!.hre_recommendations[0].rank).toBe(999)
  })
})
