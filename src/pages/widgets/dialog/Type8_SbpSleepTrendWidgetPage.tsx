/**
 * SBP & 睡眠时长趋势图 Widget 页面（type-8）
 * 路由: /widget/type-8
 * 复用 @/components/charts/TrendLineChart
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer } from '@/components/common/WidgetEntranceContainer'
import { EmbeddedContainer } from '@/components/common/EmbeddedContainer'
import { TrendLineChart, type ChartLine } from '@/components/charts/TrendLineChart'
import { BP_COLORS, VITAL_COLORS, widgetBGColor } from '@/config/theme'

interface SbpSleepTrendDataPoint {
  day: string
  sbp: number
  sleepDuration: number
}

interface SbpSleepTrendChartData {
  data: SbpSleepTrendDataPoint[]
  sbpLabel?: string
  sleepDurationLabel?: string
  sbpColor?: string
  sleepDurationColor?: string
}

const PAGE_CONFIG = { pageId: 'sbp-sleep-trend', pageName: 'SBP与睡眠趋势图', type: 8 } as const

/** 开发环境自动触发延迟 (ms) */
const DELAY_START = 200
/** 收到 page-global-animate 后延迟触发动画 (ms) */
const DELAY_ANIMATE_START = 200

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
    try { data = JSON.parse(raw) } catch { return null }
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

export function Type8_SbpSleepTrendWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<SbpSleepTrendChartData>(DEFAULT_DATA)
  const { onData, isReady } = useNativeBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
  })

  // 入场动画控制
  const { canAnimate, animationKey } = useWidgetEntrance({
    pageId: PAGE_CONFIG.pageId,
    devAutoTriggerDelay: DELAY_START,
    animateDelay: DELAY_ANIMATE_START,
  })

  useEffect(() => {
    onData((rawData) => {
      const parsed = parseSbpSleepTrendData(rawData)
      if (parsed) setData(parsed)
    })
  }, [onData])

  const sbpColor = data.sbpColor ?? BP_COLORS.systolic
  const sleepColor = data.sleepDurationColor ?? VITAL_COLORS.sleep
  const sbpLabel = data.sbpLabel ?? t('widgets.type8.sbp')
  const sleepLabel = data.sleepDurationLabel ?? t('widgets.type8.sleepDuration')

  const lines: ChartLine[] = useMemo(
    () => [
      { dataKey: 'sbp', color: sbpColor, label: sbpLabel, showArea: false, legendShape: 'circle', strokeWidth: 2 },
      { dataKey: 'sleepDuration', color: sleepColor, label: sleepLabel, showArea: false, legendShape: 'circle', strokeWidth: 2 },
    ],
    [sbpColor, sleepColor, sbpLabel, sleepLabel]
  )

  const chartData = useMemo(
    () => data.data.map((d) => ({ day: d.day, sbp: d.sbp, sleepDuration: d.sleepDuration })),
    [data.data]
  )

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <EmbeddedContainer maxWidth="md" fullHeight={false}>
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="slideUp">
          {chartData.length > 0 ? (
            <div className="bg-white rounded-2xl p-4">
              <TrendLineChart
                data={chartData}
                lines={lines}
                xAxisKey="day"
                height={224}
                showLegend={true}
                chartMargin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              />
            </div>
          ) : null}
        </WidgetEntranceContainer>
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">{t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'}</div>
        )}
      </EmbeddedContainer>
    </WidgetLayout>
  )
}
