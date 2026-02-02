/**
 * 日期工具函数测试
 * 
 * 测试目标：防止日期计算错误导致的数据展示问题
 */

import { describe, it, expect } from 'vitest'
import {
  formatDateToAPI,
  formatDateForDisplay,
  getWeekBounds,
  getCurrentWeekDateRange,
  getPreviousWeekRange,
} from '@/lib/dateUtils'

describe('dateUtils - 日期格式化', () => {
  it('formatDateToAPI 应该格式化为 YYYY-MM-DD', () => {
    const date = new Date(2026, 0, 15) // 2026-01-15
    expect(formatDateToAPI(date)).toBe('2026-01-15')
  })

  it('formatDateToAPI 应该正确补零', () => {
    const date = new Date(2026, 0, 5) // 2026-01-05
    expect(formatDateToAPI(date)).toBe('2026-01-05')
  })

  it('formatDateForDisplay 应该格式化为 YYYY/MM/DD', () => {
    const date = new Date(2026, 0, 15)
    expect(formatDateForDisplay(date)).toBe('2026/01/15')
  })
})

describe('dateUtils - 周边界计算', () => {
  it('getWeekBounds 周一应该返回当前周的Monday-Sunday', () => {
    // 2026-01-05 是周一
    const monday = new Date(2026, 0, 5)
    const { monday: calcMonday, sunday: calcSunday } = getWeekBounds(monday)

    expect(formatDateToAPI(calcMonday)).toBe('2026-01-05')
    expect(formatDateToAPI(calcSunday)).toBe('2026-01-11')
  })

  it('getWeekBounds 周四应该返回本周Monday-Sunday', () => {
    // 2026-01-08 是周四
    const thursday = new Date(2026, 0, 8)
    const { monday, sunday } = getWeekBounds(thursday)

    expect(formatDateToAPI(monday)).toBe('2026-01-05')
    expect(formatDateToAPI(sunday)).toBe('2026-01-11')
  })

  it('getWeekBounds 周日应该返回本周Monday-Sunday（周日是一周最后一天）', () => {
    // 2026-01-11 是周日
    const sunday = new Date(2026, 0, 11)
    const { monday, sunday: calcSunday } = getWeekBounds(sunday)

    expect(formatDateToAPI(monday)).toBe('2026-01-05')
    expect(formatDateToAPI(calcSunday)).toBe('2026-01-11')
  })

  it('getWeekBounds 跨月份应该正确计算', () => {
    // 2026-01-02 是周五，本周一是 2025-12-29
    const date = new Date(2026, 0, 2)
    const { monday, sunday } = getWeekBounds(date)

    expect(formatDateToAPI(monday)).toBe('2025-12-29')
    expect(formatDateToAPI(sunday)).toBe('2026-01-04')
  })
})

describe('dateUtils - 周范围计算', () => {
  it('getPreviousWeekRange 应该返回上一周的Monday-Sunday', () => {
    // 当前周一是 2026-01-05
    const currentMonday = new Date(2026, 0, 5)
    const { start, end } = getPreviousWeekRange(currentMonday)

    // 上一周应该是 2025-12-29 到 2026-01-04
    expect(formatDateToAPI(start)).toBe('2025-12-29')
    expect(formatDateToAPI(end)).toBe('2026-01-04')
  })

  it('getPreviousWeekRange 跨年份应该正确计算', () => {
    // 当前周一是 2026-01-05
    const currentMonday = new Date(2026, 0, 5)
    const { start } = getPreviousWeekRange(currentMonday)

    // 上一周的周一是 2025 年
    expect(start.getFullYear()).toBe(2025)
    expect(start.getMonth()).toBe(11) // 12月
  })
})

describe('dateUtils - 当前周范围', () => {
  it('getCurrentWeekDateRange 应该返回包含今天的完整一周', () => {
    const { start, end } = getCurrentWeekDateRange()

    // 验证 start 是周一（dayOfWeek = 1）
    const startDay = start.getDay()
    expect(startDay).toBe(1)

    // 验证 end 是周日（dayOfWeek = 0）
    const endDay = end.getDay()
    expect(endDay).toBe(0)

    // 验证时间差是 6 天
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    expect(daysDiff).toBe(6)
  })

  it('getCurrentWeekDateRange 返回的日期应该是午夜时间', () => {
    const { start, end } = getCurrentWeekDateRange()

    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)

    expect(end.getHours()).toBe(0)
    expect(end.getMinutes()).toBe(0)
    expect(end.getSeconds()).toBe(0)
  })
})
