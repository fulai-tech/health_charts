/**
 * Weekly Report Adapter
 * 数据适配层 - 将API数据转换为前端展示格式
 */

import type {
  WeeklyReportDataAPI,
  CombinedTrendDataPoint,
} from './types'

/**
 * 将生命体征趋势数据合并为组合图表数据
 */
export function adaptVitalSignsTrendData(
  vitalSigns: WeeklyReportDataAPI['vital_signs']
): CombinedTrendDataPoint[] {
  const { heart_rate, blood_pressure, blood_oxygen, blood_glucose } = vitalSigns

  // 使用心率的趋势图作为基准（所有图表应该有相同的日期）
  return heart_rate.trend_chart.map((hrItem, index) => {
    const bpItem = blood_pressure.trend_chart[index]
    const boItem = blood_oxygen.trend_chart[index]
    const bgItem = blood_glucose.trend_chart[index]

    return {
      label: hrItem.label,
      date: hrItem.date,
      heartRate: hrItem.value,
      systolic: bpItem?.value?.systolic ?? null,
      diastolic: bpItem?.value?.diastolic ?? null,
      bloodOxygen: boItem?.value ?? null,
      bloodGlucose: bgItem?.value ?? null,
    }
  })
}

/**
 * 获取状态等级对应的颜色
 */
export function getStatusLevelColor(level: string): string {
  const colors: Record<string, string> = {
    S: '#10B981', // 绿色 - 优秀
    A: '#22C55E', // 浅绿色 - 良好
    B: '#F59E0B', // 橙色 - 尚可
    C: '#EF4444', // 红色 - 需关注
    D: '#DC2626', // 深红色 - 警告
  }
  return colors[level] || '#6B7280'
}

/**
 * 获取用药状态对应的颜色
 */
export function getMedicationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    taken: '#10B981', // 绿色 - 按时服用
    delayed: '#F59E0B', // 橙色 - 迟服
    missed: '#EF4444', // 红色 - 漏服
  }
  return colors[status] || '#6B7280'
}

/**
 * 获取营养状态对应的颜色
 */
export function getNutritionStatusColor(status: string): string {
  const colors: Record<string, string> = {
    on_target: '#10B981', // 绿色 - 达标
    over: '#EF4444', // 红色 - 超标
    under: '#F59E0B', // 橙色 - 不足
  }
  return colors[status] || '#6B7280'
}

/**
 * 格式化睡眠时长（分钟转为小时分钟）
 */
export function formatSleepDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}小时`
  return `${hours}小时${mins}分钟`
}
