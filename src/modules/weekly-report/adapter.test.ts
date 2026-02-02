/**
 * 周报数据适配器测试
 * 
 * 测试目标：防止 API 数据转换错误导致图表渲染问题
 */

import { describe, it, expect } from 'vitest'
import {
  normalizeWeeklyReportData,
  getStatusLevelColor,
} from '@/modules/weekly-report/adapter'
import type { WeeklyReportDataAPI } from '@/modules/weekly-report/types'

describe('weekly-report adapter - 数据归一化', () => {
  it('normalizeWeeklyReportData 应该处理 null 输入', () => {
    const result = normalizeWeeklyReportData(null)
    
    expect(result).toBeDefined()
    expect(result.overall).toBeDefined()
    expect(result.vital_signs).toBeDefined()
    expect(result.week_range).toBeDefined()
  })

  it('normalizeWeeklyReportData 应该处理 undefined 输入', () => {
    const result = normalizeWeeklyReportData(undefined)
    
    expect(result).toBeDefined()
    expect(result.overall).toBeDefined()
    expect(result.overall.score).toBeDefined()
  })

  it('normalizeWeeklyReportData 应该合并部分数据与默认值', () => {
    const partial: Partial<WeeklyReportDataAPI> = {
      overall: {
        score: 85,
        status: { level: 'A', label: 'Good' },
        evaluate: 'Test message',
        peer_compare: 'Better than 90%',
        days_on_target: 5,
        score_change: { value: 5, text: '+5' },
      },
    }
    
    const result = normalizeWeeklyReportData(partial)
    
    expect(result.overall.score).toBe(85)
    expect(result.overall.status.level).toBe('A')
    // 其他字段应该有默认值
    expect(result.vital_signs).toBeDefined()
    expect(result.week_range).toBeDefined()
  })

  it('normalizeWeeklyReportData 应该保护嵌套的 null 值', () => {
    const dataWithNulls = {
      overall: {
        score: 80,
        status: null as any, // 模拟 API 返回 null
        evaluate: 'Test',
        peer_compare: 'Test',
        days_on_target: 5,
        score_change: { value: 0, text: '0' },
      },
    }
    
    const result = normalizeWeeklyReportData(dataWithNulls)
    
    // status 应该被默认值填充
    expect(result.overall.status).toBeDefined()
    expect(result.overall.status.label).toBeDefined()
    expect(result.overall.status.level).toBeDefined()
  })
})

describe('weekly-report adapter - 状态颜色映射', () => {
  it('getStatusLevelColor 应该返回正确的颜色', () => {
    expect(getStatusLevelColor('S')).toBe('#10B981') // 绿色
    expect(getStatusLevelColor('A')).toBe('#22C55E')
    expect(getStatusLevelColor('B')).toBe('#F59E0B') // 橙色
    expect(getStatusLevelColor('C')).toBe('#EF4444') // 红色
  })

  it('getStatusLevelColor 应该处理未知等级', () => {
    const color = getStatusLevelColor('UNKNOWN')
    expect(color).toBeDefined()
    expect(color).toMatch(/^#[0-9A-F]{6}$/i) // 应该是有效的颜色代码
  })
})
