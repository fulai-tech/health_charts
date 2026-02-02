/**
 * 每周健康分数 Widget 页面（独立路由 type-7）
 * 仅渲染 WeeklyHealthScoreWidget，数据通过 NativeBridge 接收。
 */

import { useState, useEffect } from 'react'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { WeeklyHealthScoreWidget, type WeeklyHealthScoreData } from '@/pages/widget/dialog/WeeklyHealthScoreWidget'
import { widgetBGColor } from '@/config/theme'

const PAGE_CONFIG = { pageId: 'weekly-health-score', pageName: '每周健康分数卡片', type: 7 } as const

const DEFAULT_DATA: WeeklyHealthScoreData = {
  weeklyScore: 92,
  maxScore: 100,
  weekNumber: 42,
  daysToTarget: 5,
  pointsHigherThanLastWeek: 12,
  metrics: [
    { type: 'sleep', label: 'Sleep duration', value: 324, unit: 'min' },
    { type: 'exercise', label: 'Exercise', value: 3, unit: 'times' },
    { type: 'dietary', label: 'Dietary', value: 'Goal', unit: '' },
  ],
}

function parseWeeklyHealthScoreData(raw: unknown): WeeklyHealthScoreData | null {
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      return null
    }
  }
  const obj = data as Record<string, unknown>
  const card = (obj.weekly_health_score_card ?? obj) as Record<string, unknown>
  if (typeof card.weeklyScore !== 'number' || typeof card.weekNumber !== 'number' || !Array.isArray(card.metrics) || card.metrics.length < 3) {
    return null
  }
  const m0 = card.metrics[0] as Record<string, unknown>
  const m1 = card.metrics[1] as Record<string, unknown>
  const m2 = card.metrics[2] as Record<string, unknown>
  return {
    weeklyScore: card.weeklyScore as number,
    maxScore: (card.maxScore as number) ?? 100,
    weekNumber: card.weekNumber as number,
    daysToTarget: card.daysToTarget as number | undefined,
    pointsHigherThanLastWeek: card.pointsHigherThanLastWeek as number | undefined,
    metrics: [
      { type: 'sleep', label: (m0.label as string) ?? 'Sleep duration', value: (m0.value as number) ?? 0, unit: (m0.unit as string) ?? 'min' },
      { type: 'exercise', label: (m1.label as string) ?? 'Exercise', value: (m1.value as number) ?? 0, unit: (m1.unit as string) ?? 'times' },
      { type: 'dietary', label: (m2.label as string) ?? 'Dietary', value: (m2.value as string | number) ?? 'Goal', unit: (m2.unit as string) ?? '' },
    ],
  }
}

export function WeeklyHealthScoreWidgetPage() {
  const [data, setData] = useState<WeeklyHealthScoreData>(DEFAULT_DATA)
  const { onData, send, isReady } = useNativeBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
  })

  useEffect(() => {
    onData((rawData) => {
      const parsed = parseWeeklyHealthScoreData(rawData)
      if (parsed) setData(parsed)
    })
  }, [onData])

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <div className="w-full max-w-md p-4">
        <WeeklyHealthScoreWidget
          data={data}
          summaryButtonLabel={`Week ${data.weekNumber} Summary`}
          onSummaryClick={() => send('summaryClick', { pageId: PAGE_CONFIG.pageId, weekNumber: data.weekNumber })}
        />
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">NativeBridge Ready: {isReady ? '✅' : '⏳'}</div>
        )}
      </div>
    </WidgetLayout>
  )
}
