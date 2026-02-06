import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer, useWidgetAnimation } from '@/components/common/WidgetEntranceContainer'
import { EmbeddedContainer } from '@/components/common/EmbeddedContainer'
import { AlertTriangle } from 'lucide-react'
import { widgetBGColor } from '@/config/theme'

// ============================================
// 类型定义
// ============================================

/**
 * 摄入数据类型
 */
interface IntakeData {
  value: number
  unit: string
  recommended: number
  exceedPercent: number
}

/**
 * 营养摄入卡片数据类型
 * 
 * JSON 数据格式规范（必须是 JSON 对象，不支持数组）：
 * {
 *   "nutritionScore": 85,              // 营养评分 (0-100)
 *   "totalCalories": 880,              // 总热量
 *   "warningTitle": "钠摄入严重超标",    // 警告标题
 *   "mealIntake": {                    // 本餐摄入
 *     "value": 8,                      // 摄入值
 *     "unit": "mg",                    // 单位
 *     "recommended": 5,                // 推荐值
 *     "exceedPercent": 40              // 超标百分比（负数表示未超标）
 *   },
 *   "dailyIntake": {                   // 每日总摄入
 *     "value": 28,
 *     "unit": "mg",
 *     "recommended": 20,
 *     "exceedPercent": 27
 *   },
 *   "tipText": "您的钠摄入超出每日基准14%..."  // 提示文字
 * }
 */
interface NutritionIntakeData {
  nutritionScore: number
  totalCalories: number
  warningTitle: string
  mealIntake: IntakeData
  dailyIntake: IntakeData
  tipText: string
}

// ============================================
// 配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'nutrition-intake',
  pageName: '营养摄入卡片',
  type: 3, // 营养摄入卡片类型标识
} as const

/** 开发环境自动触发延迟 (ms) */
const DELAY_START = 200
/** 收到 page-global-animate 后延迟触发动画 (ms) */
const DELAY_ANIMATE_START = 200

const DEFAULT_DATA: NutritionIntakeData = {
  nutritionScore: 85,
  totalCalories: 880,
  warningTitle: 'Sodium intake seriously exceeded',
  mealIntake: {
    value: 8,
    unit: 'mg',
    recommended: 5,
    exceedPercent: 40,
  },
  dailyIntake: {
    value: 28,
    unit: 'mg',
    recommended: 20,
    exceedPercent: 27,
  },
  tipText: 'Your sodium intake exceeds the daily baseline by 14%, and also surpasses the daily baseline. The excess sodium primarily comes from Kung Pao Chicken and soy sauce.',
}

// ============================================
// 工具函数
// ============================================

/**
 * 数值边界限制
 */
function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 计算进度条宽度（0-100%）
 * 处理负数和极端值
 */
function calcProgress(value: number, recommended: number): number {
  // 确保值非负
  const safeValue = Math.max(0, value)
  // 确保推荐值为正数，避免除以0
  const safeRecommended = Math.max(0.1, recommended)
  // 限制在 0-100 范围内
  return clampValue((safeValue / safeRecommended) * 100, 0, 100)
}

/**
 * 格式化大数值显示
 * 避免过长数字溢出
 */
function formatLargeNumber(value: number, _maxDigits: number = 4): string {
  if (value < 0) return '0'
  if (value >= 10000) return '9999+'
  if (value >= 1000) return value.toFixed(0)
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}

/**
 * 限制 tipText 长度
 */
function truncateTipText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * 解析原生数据
 * 
 * 期望的数据格式：JSON 对象（不支持数组）
 */
function parseNutritionData(raw: unknown): NutritionIntakeData | null {
  // 如果是字符串，先尝试 JSON 解析
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('[NutritionIntakeWidget] JSON 解析失败:', raw)
      return null
    }
  }

  // 验证数据格式：必须是 JSON 对象，不支持数组
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('[NutritionIntakeWidget] 数据格式错误，期望 JSON 对象:', data)
    return null
  }
  
  const obj = data as Record<string, unknown>
  
  if (typeof obj.nutritionScore !== 'number') {
    console.warn('[NutritionIntakeWidget] 缺少必需字段 nutritionScore:', data)
    return null
  }
  
  return {
    nutritionScore: obj.nutritionScore as number,
    totalCalories: (obj.totalCalories as number) || 0,
    warningTitle: (obj.warningTitle as string) || '',
    mealIntake: (obj.mealIntake as IntakeData) || DEFAULT_DATA.mealIntake,
    dailyIntake: (obj.dailyIntake as IntakeData) || DEFAULT_DATA.dailyIntake,
    tipText: (obj.tipText as string) || '',
  }
}

// ============================================
// 进度条组件 - 带入场微动画
// ============================================

interface IntakeProgressProps {
  label: string
  intake: IntakeData
  recommendedLabel: string
  exceedLabel: string
  delay?: number
}

function IntakeProgress({ label, intake, recommendedLabel, exceedLabel, delay = 0 }: IntakeProgressProps) {
  const { canAnimate, animationKey } = useWidgetAnimation()
  const progress = calcProgress(intake.value, intake.recommended)
  const isExceeded = intake.exceedPercent > 0
  
  const displayValue = formatLargeNumber(intake.value)
  
  return (
    <motion.div 
      key={`progress-${animationKey}`}
      className="mb-4 last:mb-0"
      initial={{ opacity: 0, y: 8 }}
      animate={canAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
    >
      {/* 标题行 */}
      <div className="flex justify-between items-center mb-2 min-w-0">
        <span className="text-sm text-slate-700 truncate mr-2">{label}</span>
        <motion.div 
          key={`value-${animationKey}`}
          className="flex items-baseline gap-1 flex-shrink-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={canAnimate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ delay: delay + 0.1, duration: 0.3 }}
        >
          <span className="text-2xl font-semibold text-slate-800">{displayValue}</span>
          <span className="text-sm text-slate-500">{intake.unit}</span>
        </motion.div>
      </div>
      
      {/* 进度条 */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          key={`bar-${animationKey}`}
          initial={{ width: 0 }}
          animate={canAnimate ? { width: `${progress}%` } : { width: 0 }}
          transition={{ delay: delay + 0.15, duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isExceeded
              ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500'
              : 'bg-gradient-to-r from-emerald-400 to-green-500'
          }`}
        />
      </div>
      
      {/* 说明行 */}
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-xs text-slate-400 truncate mr-2">
          {recommendedLabel}
        </span>
        {isExceeded && (
          <motion.span 
            key={`exceed-${animationKey}`}
            className="text-xs font-medium text-orange-500 flex-shrink-0"
            initial={{ opacity: 0 }}
            animate={canAnimate ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: delay + 0.4, duration: 0.25 }}
          >
            {exceedLabel}
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// 卡片内容组件 - 使用 Context 同步动画
// ============================================

interface CardContentProps {
  data: NutritionIntakeData
  onClick: () => void
  t: (key: string, params?: Record<string, unknown>) => string
}

function CardContent({ data, onClick, t }: CardContentProps) {
  const { canAnimate, animationKey } = useWidgetAnimation()

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white p-5 cursor-pointer select-none transition-all duration-200 active:scale-[0.98] active:opacity-90"
      onClick={onClick}
    >
      {/* 顶部统计行 */}
      <motion.div 
        key={`stats-${animationKey}`}
        className="relative flex gap-6 sm:gap-10 mb-5 flex-wrap"
        initial={{ opacity: 0, y: 10 }}
        animate={canAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="flex items-baseline gap-2 min-w-0">
          <motion.span 
            key={`score-${animationKey}`}
            className="text-2xl sm:text-3xl font-semibold text-emerald-500"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={canAnimate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {clampValue(Math.round(data.nutritionScore), 0, 100)}
          </motion.span>
          <span className="text-sm text-slate-500">{t('widgets.type3.nutritionalScore')}</span>
        </div>
        <div className="flex items-baseline gap-2 min-w-0">
          <motion.span 
            key={`calories-${animationKey}`}
            className="text-2xl sm:text-3xl font-semibold text-slate-800"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={canAnimate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            {formatLargeNumber(data.totalCalories)}
          </motion.span>
          <span className="text-sm text-slate-500">{t('widgets.type3.totalCalories')}</span>
        </div>
      </motion.div>

      {/* 警告区域 */}
      <div className="relative mb-4">
        {/* 警告标题 */}
        <motion.div 
          key={`warning-${animationKey}`}
          className="flex items-center gap-2 mb-4 min-w-0"
          initial={{ opacity: 0, x: -8 }}
          animate={canAnimate ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span className="text-base font-medium text-orange-500 truncate">
            {data.warningTitle.length > 30 ? data.warningTitle.slice(0, 28) + '...' : data.warningTitle}
          </span>
        </motion.div>

        {/* 本餐摄入 */}
        <IntakeProgress
          label={t('widgets.type3.thisMealIntake')}
          intake={data.mealIntake}
          recommendedLabel={t('widgets.type3.recommendedValue', { value: formatLargeNumber(data.mealIntake.recommended), unit: data.mealIntake.unit })}
          exceedLabel={t('widgets.type3.exceedPercent', { percent: clampValue(Math.round(data.mealIntake.exceedPercent), 0, 999) })}
          delay={0.25}
        />

        {/* 每日总摄入 */}
        <IntakeProgress
          label={t('widgets.type3.totalDailyIntake')}
          intake={data.dailyIntake}
          recommendedLabel={t('widgets.type3.recommendedValue', { value: formatLargeNumber(data.dailyIntake.recommended), unit: data.dailyIntake.unit })}
          exceedLabel={t('widgets.type3.exceedPercent', { percent: clampValue(Math.round(data.dailyIntake.exceedPercent), 0, 999) })}
          delay={0.35}
        />
      </div>

      {/* 提示卡片 */}
      <motion.div 
        key={`tip-${animationKey}`}
        className="relative bg-amber-50 rounded-xl p-4 overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={canAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ delay: 0.5, duration: 0.35 }}
      >
        <p className="text-sm text-amber-900 leading-relaxed line-clamp-4">
          {truncateTipText(data.tipText, 200)}
        </p>
      </motion.div>
    </div>
  )
}

// ============================================
// 主组件
// ============================================

/**
 * 营养摄入 Widget 页面
 * 
 * 路由: /widget/nutrition-intake
 */
export function Type3_NutritionIntakeWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<NutritionIntakeData>(DEFAULT_DATA)

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

  // 注册数据接收回调
  useEffect(() => {
    onData((rawData) => {
      console.log('[NutritionIntakeWidget] 收到原生数据')
      const parsed = parseNutritionData(rawData)
      if (parsed) {
        setData(parsed)
        console.log('[NutritionIntakeWidget] 渲染完成')
      } else {
        console.warn('[NutritionIntakeWidget] 数据解析失败，使用默认数据')
      }
    })
  }, [onData])

  // 处理卡片点击
  const handleCardClick = useCallback(() => {
    send('cardClick', { pageId: PAGE_CONFIG.pageId, data })
  }, [send, data])

  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <EmbeddedContainer maxWidth="md" fullHeight={false}>
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="slideUp">
          <CardContent data={data} onClick={handleCardClick} t={t} />
        </WidgetEntranceContainer>

        {/* 调试信息 */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'}
          </div>
        )}
      </EmbeddedContainer>
    </WidgetLayout>
  )
}
