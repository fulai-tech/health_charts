import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { EmbeddedContainer } from '@/components/common/EmbeddedContainer'
import { VITAL_COLORS, UI_COLORS, widgetBGColor } from '@/config/theme'

// ============================================
// 类型定义
// ============================================

/**
 * 状态类型
 */
type VitalStatus = 'normal' | 'warning' | 'danger'

/**
 * 单个体征数据类型
 */
interface _VitalItemData {
  type: 'heart-rate' | 'blood-pressure' | 'spo2' | 'poct'
  value: string | number
  subValue?: string | number // 用于血压的舒张压
  unit: string
  statusText: string
  status: VitalStatus
  highlighted?: boolean
}

/**
 * 健康体征总览卡片数据类型
 * 
 * JSON 数据格式规范（必须是 JSON 对象，不支持数组）：
 * {
 *   "heartRate": {
 *     "value": 68,
 *     "unit": "bpm",
 *     "statusText": "steady rhythm",
 *     "status": "normal"
 *   },
 *   "bloodPressure": {
 *     "systolic": 115,
 *     "diastolic": 75,
 *     "unit": "mmHg",
 *     "statusText": "Slightly high SBP",
 *     "status": "warning",
 *     "highlighted": true
 *   },
 *   "spo2": {
 *     "value": 98,
 *     "unit": "%",
 *     "statusText": "Sufficient oxygen supply",
 *     "status": "normal"
 *   },
 *   "poct": {
 *     "value": 5.1,
 *     "unit": "mmol/L",
 *     "statusText": "Normal metabolism",
 *     "status": "normal"
 *   }
 * }
 */
interface VitalOverviewData {
  heartRate: {
    value: number
    unit: string
    statusText: string
    status: VitalStatus
    highlighted?: boolean
  }
  bloodPressure: {
    systolic: number
    diastolic: number
    unit: string
    statusText: string
    status: VitalStatus
    highlighted?: boolean
  }
  spo2: {
    value: number
    unit: string
    statusText: string
    status: VitalStatus
    highlighted?: boolean
  }
  poct: {
    value: number
    unit: string
    statusText: string
    status: VitalStatus
    highlighted?: boolean
  }
}

// ============================================
// 配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'vital-overview',
  pageName: '健康体征总览卡片',
  type: 5, // 健康体征总览卡片类型标识
} as const

/** 开发环境自动触发延迟 (ms) */
const DELAY_START = 200
/** 收到 page-global-animate 后延迟触发动画 (ms) */
const DELAY_ANIMATE_START = 200

// ============================================
// 动画配置
// ============================================

/** 网格容器动画变体 */
const gridContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

/** 卡片动画变体 - 从下方淡入 + 轻微缩放 */
const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 16,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
    },
  },
}

const DEFAULT_DATA: VitalOverviewData = {
  heartRate: {
    value: 68,
    unit: 'bpm',
    statusText: 'steady rhythm',
    status: 'normal',
  },
  bloodPressure: {
    systolic: 115,
    diastolic: 75,
    unit: 'mmHg',
    statusText: 'Slightly high SBP',
    status: 'warning',
    highlighted: true,
  },
  spo2: {
    value: 98,
    unit: '%',
    statusText: 'Sufficient oxygen supply',
    status: 'normal',
  },
  poct: {
    value: 5.1,
    unit: 'mmol/L',
    statusText: 'Normal metabolism',
    status: 'normal',
  },
}

// ============================================
// 工具函数
// ============================================

/**
 * 数值边界限制
 * 确保数值在合理范围内显示
 */
function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 格式化体征数值显示
 * 对极端值进行合理格式化，避免 UI 溢出
 */
function formatVitalValue(value: number | string, type: 'heart-rate' | 'blood-pressure' | 'spo2' | 'poct'): string {
  if (typeof value === 'string') return value
  
  switch (type) {
    case 'heart-rate':
      // 心率范围通常 30-250 bpm
      return String(clampValue(Math.round(value), 0, 999))
    case 'spo2':
      // 血氧范围 0-100%
      return String(clampValue(Math.round(value), 0, 100))
    case 'poct':
      // POCT 值保留一位小数，限制范围
      return clampValue(value, 0, 99.9).toFixed(1)
    default:
      return String(value)
  }
}

/**
 * 截断文本，避免溢出
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 2) + '...'
}

/**
 * 获取状态颜色
 */
function getStatusColor(status: VitalStatus): string {
  switch (status) {
    case 'normal':
      return 'rgb(34, 197, 94)' // green-500
    case 'warning':
      return 'rgb(249, 115, 22)' // orange-500
    case 'danger':
      return 'rgb(239, 68, 68)' // red-500
    default:
      return 'rgb(34, 197, 94)'
  }
}

/**
 * 根据体征类型获取对应的主题色
 */
function getVitalThemeColor(type: 'heart-rate' | 'blood-pressure' | 'spo2' | 'poct'): string {
  switch (type) {
    case 'heart-rate':
      return VITAL_COLORS.bp // 用户要求 Heart rate 用 bp 颜色
    case 'blood-pressure':
      return VITAL_COLORS.bp
    case 'spo2':
      return VITAL_COLORS.spo2
    case 'poct':
      return VITAL_COLORS.glucose
    default:
      return VITAL_COLORS.bp
  }
}

/**
 * 解析原生数据
 * 
 * 期望的数据格式：JSON 对象（不支持数组）
 */
function parseVitalOverviewData(raw: unknown): VitalOverviewData | null {
  // 如果是字符串，先尝试 JSON 解析
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('[VitalOverviewWidget] JSON 解析失败:', raw)
      return null
    }
  }

  // 验证数据格式：必须是 JSON 对象，不支持数组
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('[VitalOverviewWidget] 数据格式错误，期望 JSON 对象:', data)
    return null
  }
  
  const obj = data as Record<string, unknown>
  
  // 验证必需字段
  if (!obj.heartRate || !obj.bloodPressure || !obj.spo2 || !obj.poct) {
    console.warn('[VitalOverviewWidget] 缺少必需字段:', data)
    return null
  }
  
  return data as VitalOverviewData
}

// ============================================
// 图标组件
// ============================================

interface VitalIconProps {
  type: 'heart-rate' | 'blood-pressure' | 'spo2' | 'poct'
  className?: string
}

function VitalIcon({ type, className }: VitalIconProps) {
  switch (type) {
    case 'heart-rate':
      return (
        <div className={`w-6 h-6 flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={VITAL_COLORS.heartRate}
            />
          </svg>
        </div>
      )
    case 'blood-pressure':
      return (
        <div className={`w-6 h-6 flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path
              d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"
              fill={VITAL_COLORS.bp}
            />
            <circle cx="12" cy="9" r="2.5" fill="white" />
          </svg>
        </div>
      )
    case 'spo2':
      return (
        <div className={`w-6 h-6 flex items-center justify-center ${className}`}>
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: VITAL_COLORS.spo2 }}
          >
            O
          </div>
        </div>
      )
    case 'poct':
      return (
        <div className={`w-6 h-6 flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <rect x="4" y="6" width="4" height="12" rx="1" fill={VITAL_COLORS.glucose} />
            <rect x="10" y="4" width="4" height="14" rx="1" fill={VITAL_COLORS.glucose} />
            <rect x="16" y="8" width="4" height="10" rx="1" fill={VITAL_COLORS.glucose} />
          </svg>
        </div>
      )
    default:
      return null
  }
}

// ============================================
// 单个体征卡片组件
// ============================================

interface VitalCardProps {
  type: 'heart-rate' | 'blood-pressure' | 'spo2' | 'poct'
  title: string
  value: string | number
  subValue?: string | number
  unit: string
  statusText: string
  status: VitalStatus
  highlighted?: boolean
  isActive?: boolean
  onClick?: () => void
}

function VitalCard({
  type,
  title,
  value,
  subValue,
  unit,
  statusText,
  status,
  highlighted: _highlighted,
  isActive,
  onClick,
}: VitalCardProps) {
  const statusColor = getStatusColor(status)
  const themeColor = getVitalThemeColor(type)
  
  // 格式化数值，防止极端值溢出
  const displayValue = type === 'blood-pressure' 
    ? value // 血压值在下面单独处理
    : formatVitalValue(value, type)
  
  // 血压舒张压格式化
  const displaySubValue = subValue !== undefined 
    ? String(clampValue(Number(subValue), 0, 999)) 
    : undefined
  
  // 血压收缩压格式化
  const displaySystolic = type === 'blood-pressure' 
    ? String(clampValue(Number(value), 0, 999)) 
    : displayValue
  
  // 截断状态文本，防止溢出（最多20个字符）
  const displayStatusText = truncateText(statusText, 20)
  
  return (
    <div
      className="bg-white rounded-2xl p-4 cursor-pointer select-none transition-all duration-200 border-2 overflow-hidden"
      style={{ borderColor: isActive ? themeColor : UI_COLORS.card.border }}
      onClick={onClick}
    >
      {/* 标题行 */}
      <div className="flex items-center gap-2 mb-2">
        <VitalIcon type={type} />
        <span className="text-sm font-medium text-slate-700 truncate">{title}</span>
      </div>
      
      {/* 数值 */}
      <div className="flex items-baseline gap-1 mb-1 min-w-0">
        {displaySubValue !== undefined ? (
          <>
            <span className="text-2xl sm:text-3xl font-bold text-slate-800 truncate">
              {displaySystolic}/{displaySubValue}
            </span>
            <span className="text-xs sm:text-sm text-slate-500 ml-1 flex-shrink-0">{unit}</span>
          </>
        ) : (
          <>
            <span className="text-2xl sm:text-3xl font-bold text-slate-800 truncate">
              {displayValue}
            </span>
            <span className="text-xs sm:text-sm text-slate-500 ml-1 flex-shrink-0">{unit}</span>
          </>
        )}
      </div>
      
      {/* 状态 */}
      <div className="flex items-center gap-1.5 min-w-0">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusColor }}
        />
        <span className="text-xs truncate" style={{ color: statusColor }}>
          {displayStatusText}
        </span>
      </div>
    </div>
  )
}

// ============================================
// 主组件
// ============================================

/**
 * 健康体征总览 Widget 页面
 * 
 * 路由: /widget/vital-overview
 * 
 * 通信方式：
 * - Android -> JS: NativeBridge.receiveData(jsonString)
 * - JS -> Android: window.android.onJsMessage(jsonString)
 */
export function Type5_VitalOverviewWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<VitalOverviewData>(DEFAULT_DATA)
  const [activeCard, setActiveCard] = useState<string | null>(null)

  // 初始化原生桥接
  const { onData, send, isReady } = useNativeBridge({
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

  // 注册数据接收回调（支持 vital_overview_card 或顶层体征字段）
  useEffect(() => {
    onData((rawData) => {
      console.log('[VitalOverviewWidget] 收到原生数据')
      const vital = parseVitalOverviewData(rawData)
      if (vital) {
        setData(vital)
        console.log('[VitalOverviewWidget] 体征总览渲染完成')
      } else {
        const obj = typeof rawData === 'string' ? (() => { try { return JSON.parse(rawData) } catch { return {} } })() : (rawData as Record<string, unknown>)
        if (obj && typeof obj === 'object') {
          const vitalPayload = obj.vital_overview_card ?? obj
          const v = parseVitalOverviewData(vitalPayload)
          if (v) setData(v)
        }
      }
    })
  }, [onData])

  // 处理卡片点击 - 内卡片高亮
  const handleCardClick = useCallback((cardType: string) => {
    setActiveCard(prev => prev === cardType ? null : cardType)
    send('cardClick', { pageId: PAGE_CONFIG.pageId, cardType, data })
  }, [send, data])

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <EmbeddedContainer maxWidth="md" fullHeight={false}>
        {/* 2x2 网格布局 - 带交错入场动画，等待 canAnimate 信号 */}
        <motion.div 
          key={animationKey}
          className="grid grid-cols-2 gap-3"
          initial="hidden"
          animate={canAnimate ? "visible" : "hidden"}
          variants={gridContainerVariants}
        >
          {/* 心率 */}
          <motion.div variants={cardVariants}>
            <VitalCard
              type="heart-rate"
              title={t('widgets.type5.heartRate')}
              value={data.heartRate.value}
              unit={data.heartRate.unit}
              statusText={data.heartRate.statusText}
              status={data.heartRate.status}
              highlighted={data.heartRate.highlighted}
              isActive={activeCard === 'heart-rate'}
              onClick={() => handleCardClick('heart-rate')}
            />
          </motion.div>
          
          {/* 血压 */}
          <motion.div variants={cardVariants}>
            <VitalCard
              type="blood-pressure"
              title={t('widgets.type5.bloodPressure')}
              value={data.bloodPressure.systolic}
              subValue={data.bloodPressure.diastolic}
              unit={data.bloodPressure.unit}
              statusText={data.bloodPressure.statusText}
              status={data.bloodPressure.status}
              highlighted={data.bloodPressure.highlighted}
              isActive={activeCard === 'blood-pressure'}
              onClick={() => handleCardClick('blood-pressure')}
            />
          </motion.div>
          
          {/* 血氧 */}
          <motion.div variants={cardVariants}>
            <VitalCard
              type="spo2"
              title={t('widgets.type5.spo2')}
              value={data.spo2.value}
              unit={data.spo2.unit}
              statusText={data.spo2.statusText}
              status={data.spo2.status}
              highlighted={data.spo2.highlighted}
              isActive={activeCard === 'spo2'}
              onClick={() => handleCardClick('spo2')}
            />
          </motion.div>
          
          {/* POCT */}
          <motion.div variants={cardVariants}>
            <VitalCard
              type="poct"
              title={t('widgets.type5.poct')}
              value={data.poct.value}
              unit={data.poct.unit}
              statusText={data.poct.statusText}
              status={data.poct.status}
              highlighted={data.poct.highlighted}
              isActive={activeCard === 'poct'}
              onClick={() => handleCardClick('poct')}
            />
          </motion.div>
        </motion.div>

        {/* 调试信息（仅开发环境） */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'}
          </div>
        )}
      </EmbeddedContainer>
    </WidgetLayout>
  )
}
