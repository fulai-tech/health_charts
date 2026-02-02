/**
 * SBP & 睡眠时长趋势图 Widget 页面（独立路由 type-8）
 * 仅渲染 SbpSleepTrendChartWidget，数据通过 NativeBridge 接收。
 */

import { useState, useEffect } from 'react'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { SbpSleepTrendChartWidget, type SbpSleepTrendChartData } from '@/pages/widget/dialog/SbpSleepTrendChartWidget'
import { widgetBGColor } from '@/config/theme'

const PAGE_CONFIG = { pageId: 'sbp-sleep-trend', pageName: 'SBP与睡眠趋势图', type: 8 } as const

const DEFAULT_DATA: SbpSleepTrendChartData = {
  data: [
    { day: 'Mon', sbp: 118, sleepDuration: 6.2 },
    { day: 'Tue', sbp: 122, sleepDuration: 5.8 },
    { day: 'Wed', sbp: 115, sleepDuration: 6.5 },
    { day: 'Thu', sbp: 128, sleepDuration: 5.2 },
    { day: 'Fri', sbp: 120, sleepDuration: 5.4 },
    { day: 'Sat', sbp: 125, sleepDuration: 6.0 },
    { day: 'Sun', sbp: 119, sleepDuration: 5.7 },
  ],
  sbpLabel: 'SBP',
  sleepDurationLabel: 'Sleep duration',
  sbpColor: 'rgb(249, 115, 22)',
  sleepDurationColor: 'rgb(167, 139, 250)',
}

function parseSbpSleepTrendData(raw: unknown): SbpSleepTrendChartData | null {
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      return null
    }
  }
  const obj = data as Record<string, unknown>
  const card = (obj.sbp_sleep_trend_chart_card ?? obj) as Record<string, unknown>
  if (!Array.isArray(card.data) || card.data.length === 0) return null
  const points = card.data.map((d: Record<string, unknown>) => ({
    day: String(d.day ?? ''),
    sbp: Number(d.sbp ?? 0),
    sleepDuration: Number(d.sleepDuration ?? 0),
  }))
  return {
    data: points,
    sbpLabel: (card.sbpLabel as string) ?? 'SBP',
    sleepDurationLabel: (card.sleepDurationLabel as string) ?? 'Sleep duration',
    sbpColor: card.sbpColor as string | undefined,
    sleepDurationColor: card.sleepDurationColor as string | undefined,
  }
}

export function SbpSleepTrendWidgetPage() {
  const [data, setData] = useState<SbpSleepTrendChartData>(DEFAULT_DATA)
  const { onData, isReady } = useNativeBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
  })

  useEffect(() => {
    onData((rawData) => {
      const parsed = parseSbpSleepTrendData(rawData)
      if (parsed) setData(parsed)
    })
  }, [onData])

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <div className="w-full max-w-md p-4">
        <SbpSleepTrendChartWidget data={data} height={224} showLegend showArea={false} />
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">NativeBridge Ready: {isReady ? '✅' : '⏳'}</div>
        )}
      </div>
    </WidgetLayout>
  )
}
