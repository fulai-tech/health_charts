/**
 * 工具函数测试
 * 
 * 测试目标：验证通用工具函数的正确性
 */

import { describe, it, expect } from 'vitest'
import { cn, getOptimizedAnimationDuration, getChartAnimationProps } from '@/lib/utils'

describe('utils - cn 类名合并', () => {
  it('应该合并多个类名', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toContain('text-red-500')
    expect(result).toContain('bg-blue-500')
  })

  it('应该处理条件类名', () => {
    const result = cn('base', true && 'conditional', false && 'hidden')
    expect(result).toContain('base')
    expect(result).toContain('conditional')
    expect(result).not.toContain('hidden')
  })

  it('应该解决 Tailwind 冲突类（优先使用后面的）', () => {
    const result = cn('p-4', 'p-8')
    // twMerge 会保留最后一个 padding 类
    expect(result).toBe('p-8')
  })

  it('应该处理 undefined 和 null', () => {
    const result = cn('base', undefined, null, 'valid')
    expect(result).toContain('base')
    expect(result).toContain('valid')
  })
})

describe('utils - 动画配置', () => {
  it('getOptimizedAnimationDuration 应该返回有效的动画时长', () => {
    const duration = getOptimizedAnimationDuration()
    expect(duration).toBeGreaterThan(0)
    expect(duration).toBeLessThan(5000) // 不应该超过 5 秒
  })

  it('getChartAnimationProps 应该返回完整的动画配置', () => {
    const props = getChartAnimationProps()
    
    expect(props).toHaveProperty('animationDuration')
    expect(props).toHaveProperty('animationEasing')
    expect(props).toHaveProperty('isAnimationActive')
    
    expect(typeof props.animationDuration).toBe('number')
    expect(typeof props.animationEasing).toBe('string')
    expect(typeof props.isAnimationActive).toBe('boolean')
  })

  it('动画配置应该符合 Recharts 要求', () => {
    const props = getChartAnimationProps()
    
    // animationEasing 应该是有效的 easing 函数
    const validEasings = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']
    expect(validEasings).toContain(props.animationEasing)
  })
})
