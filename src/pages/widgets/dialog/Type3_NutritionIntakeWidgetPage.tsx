import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react-lite'
import { motion } from 'framer-motion'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { useWidgetEntrance } from '@/hooks/useWidgetEntrance'
import { WidgetEntranceContainer } from '@/components/common/WidgetEntranceContainer'
import { globalStore } from '@/stores/globalStore'
import { AlertTriangle, Flame, Utensils, TrendingUp } from 'lucide-react'
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
// 进度条组件 - 静态版 (默认)
// ============================================

interface IntakeProgressProps {
  label: string
  intake: IntakeData
  recommendedLabel: string
  exceedLabel: string
}

function IntakeProgressStatic({ label, intake, recommendedLabel, exceedLabel }: IntakeProgressProps) {
  const progress = calcProgress(intake.value, intake.recommended)
  const isExceeded = intake.exceedPercent > 0
  
  const displayValue = formatLargeNumber(intake.value)
  
  return (
    <div className="mb-4 last:mb-0">
      {/* 标题行 */}
      <div className="flex justify-between items-center mb-2 min-w-0">
        <span className="text-sm text-slate-700 truncate mr-2">{label}</span>
        <div className="flex items-baseline gap-1 flex-shrink-0">
          <span className="text-2xl font-semibold text-slate-800">{displayValue}</span>
          <span className="text-sm text-slate-500">{intake.unit}</span>
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isExceeded
              ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500'
              : 'bg-gradient-to-r from-emerald-400 to-green-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* 说明行 */}
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-xs text-slate-400 truncate mr-2">
          {recommendedLabel}
        </span>
        {isExceeded && (
          <span className="text-xs font-medium text-orange-500 flex-shrink-0">
            {exceedLabel}
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================
// 进度条组件 - 动效版 (开发者模式)
// ============================================

interface IntakeProgressAnimatedProps extends IntakeProgressProps {
  delay?: number
}

function IntakeProgressAnimated({ label, intake, recommendedLabel, exceedLabel, delay = 0 }: IntakeProgressAnimatedProps) {
  const progress = calcProgress(intake.value, intake.recommended)
  const isExceeded = intake.exceedPercent > 0
  
  const displayValue = formatLargeNumber(intake.value)
  
  return (
    <motion.div 
      className="mb-5 last:mb-0"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* 标题行 */}
      <div className="flex justify-between items-center mb-2.5 min-w-0">
        <span className="text-sm font-medium text-slate-600 truncate mr-2">{label}</span>
        <motion.div 
          className="flex items-baseline gap-1 flex-shrink-0"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
        >
          <span className="text-2xl font-bold text-slate-800 tabular-nums">{displayValue}</span>
          <span className="text-sm text-slate-400">{intake.unit}</span>
        </motion.div>
      </div>
      
      {/* 进度条 - 带动画 */}
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ delay: delay + 0.1, duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full relative ${
            isExceeded
              ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500'
              : 'bg-gradient-to-r from-emerald-400 to-green-500'
          }`}
        >
          {/* 进度条高光 */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          {/* 进度条尾部发光 */}
          {isExceeded && (
            <motion.div 
              className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/50 to-transparent"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </motion.div>
      </div>
      
      {/* 说明行 */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-slate-400 truncate mr-2">
          {recommendedLabel}
        </span>
        {isExceeded && (
          <motion.div 
            className="flex items-center gap-1 text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.5, type: "spring" }}
          >
            <TrendingUp size={10} />
            {exceedLabel}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// 主组件
// ============================================

/**
 * 营养摄入 Widget 页面
 * 
 * 路由: /widget/nutrition-intake
 * 
 * 支持两种渲染模式：
 * - 开发者模式 (isTestEnv=true): Framer Motion 高级动效版
 * - 默认模式: 静态版
 */
export const Type3_NutritionIntakeWidgetPage = observer(function Type3_NutritionIntakeWidgetPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<NutritionIntakeData>(DEFAULT_DATA)

  // 从 MobX store 获取开发者模式状态
  const isDevMode = globalStore.isTestEnv

  // 初始化原生桥接
  const { onData, send, isReady } = useNativeBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
  })

  // 入场动画控制
  const { canAnimate, animationKey } = useWidgetEntrance({
    pageId: PAGE_CONFIG.pageId,
    devAutoTriggerDelay: 300,
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

  // 开发者模式：高级动效版
  if (isDevMode) {
    return (
      <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
        <div className="w-full max-w-md p-4">
          <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="scale">
            {/* 营养摄入卡片 - 高级质感 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-white p-6 cursor-pointer select-none 
                       shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100
                       transition-all duration-200 active:scale-[0.98] active:opacity-90"
            onClick={handleCardClick}
          >
            {/* 顶部统计行 - 带动效 */}
            <div className="relative flex gap-6 mb-6">
              {/* 营养评分 */}
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <motion.span 
                    className="text-3xl font-bold text-emerald-500 tabular-nums block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {clampValue(Math.round(data.nutritionScore), 0, 100)}
                  </motion.span>
                  <span className="text-xs text-slate-400">{t('widgets.type3.nutritionalScore')}</span>
                </div>
              </motion.div>

              {/* 总热量 */}
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <motion.span 
                    className="text-3xl font-bold text-slate-800 tabular-nums block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {formatLargeNumber(data.totalCalories)}
                  </motion.span>
                  <span className="text-xs text-slate-400">{t('widgets.type3.totalCalories')}</span>
                </div>
              </motion.div>
            </div>

            {/* 警告区域 */}
            <div className="relative mb-5">
              {/* 警告标题 - 带脉冲动效 */}
              <motion.div 
                className="flex items-center gap-2 mb-5 min-w-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                </motion.div>
                <span className="text-base font-semibold text-orange-500 truncate">
                  {data.warningTitle.length > 30 ? data.warningTitle.slice(0, 28) + '...' : data.warningTitle}
                </span>
              </motion.div>

              {/* 本餐摄入 */}
              <IntakeProgressAnimated
                label={t('widgets.type3.thisMealIntake')}
                intake={data.mealIntake}
                recommendedLabel={t('widgets.type3.recommendedValue', { value: formatLargeNumber(data.mealIntake.recommended), unit: data.mealIntake.unit })}
                exceedLabel={t('widgets.type3.exceedPercent', { percent: clampValue(Math.round(data.mealIntake.exceedPercent), 0, 999) })}
                delay={0.4}
              />

              {/* 每日总摄入 */}
              <IntakeProgressAnimated
                label={t('widgets.type3.totalDailyIntake')}
                intake={data.dailyIntake}
                recommendedLabel={t('widgets.type3.recommendedValue', { value: formatLargeNumber(data.dailyIntake.recommended), unit: data.dailyIntake.unit })}
                exceedLabel={t('widgets.type3.exceedPercent', { percent: clampValue(Math.round(data.dailyIntake.exceedPercent), 0, 999) })}
                delay={0.6}
              />
            </div>

            {/* 提示卡片 - 带渐变背景 */}
            <motion.div 
              className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 overflow-hidden border border-amber-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-sm text-amber-800 leading-relaxed line-clamp-4">
                {truncateTipText(data.tipText, 200)}
              </p>
            </motion.div>
            </motion.div>
          </WidgetEntranceContainer>

          {/* 调试信息 */}
          {import.meta.env.DEV && (
            <div className="mt-4 text-xs text-gray-400 text-center">
              {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'} | 动效模式: ✨
            </div>
          )}
        </div>
      </WidgetLayout>
    )
  }

  // 默认模式：静态版
  return (
    <WidgetLayout align="left" className="p-0" style={{ backgroundColor: widgetBGColor }}>
      <div className="w-full max-w-md p-4">
        <WidgetEntranceContainer animate={canAnimate} animationKey={animationKey} mode="slideUp">
          {/* 营养摄入卡片 */}
          <div
            className="relative overflow-hidden rounded-2xl bg-white p-5 cursor-pointer select-none transition-all duration-200 active:scale-[0.98] active:opacity-90"
            onClick={handleCardClick}
          >

          {/* 顶部统计行 */}
          <div className="relative flex gap-6 sm:gap-10 mb-5 flex-wrap">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-2xl sm:text-3xl font-semibold text-emerald-500">
                {clampValue(Math.round(data.nutritionScore), 0, 100)}
              </span>
              <span className="text-sm text-slate-500">{t('widgets.type3.nutritionalScore')}</span>
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-2xl sm:text-3xl font-semibold text-slate-800">
                {formatLargeNumber(data.totalCalories)}
              </span>
              <span className="text-sm text-slate-500">{t('widgets.type3.totalCalories')}</span>
            </div>
          </div>

          {/* 警告区域 */}
          <div className="relative mb-4">
            {/* 警告标题 */}
            <div className="flex items-center gap-2 mb-4 min-w-0">
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-base font-medium text-orange-500 truncate">
                {data.warningTitle.length > 30 ? data.warningTitle.slice(0, 28) + '...' : data.warningTitle}
              </span>
            </div>

            {/* 本餐摄入 */}
            <IntakeProgressStatic
              label={t('widgets.type3.thisMealIntake')}
              intake={data.mealIntake}
              recommendedLabel={t('widgets.type3.recommendedValue', { value: formatLargeNumber(data.mealIntake.recommended), unit: data.mealIntake.unit })}
              exceedLabel={t('widgets.type3.exceedPercent', { percent: clampValue(Math.round(data.mealIntake.exceedPercent), 0, 999) })}
            />

            {/* 每日总摄入 */}
            <IntakeProgressStatic
              label={t('widgets.type3.totalDailyIntake')}
              intake={data.dailyIntake}
              recommendedLabel={t('widgets.type3.recommendedValue', { value: formatLargeNumber(data.dailyIntake.recommended), unit: data.dailyIntake.unit })}
              exceedLabel={t('widgets.type3.exceedPercent', { percent: clampValue(Math.round(data.dailyIntake.exceedPercent), 0, 999) })}
            />
          </div>

          {/* 提示卡片 */}
          <div className="relative bg-amber-50 rounded-xl p-4 overflow-hidden">
            <p className="text-sm text-amber-900 leading-relaxed line-clamp-4">
              {truncateTipText(data.tipText, 200)}
            </p>
          </div>
          </div>
        </WidgetEntranceContainer>

        {/* 调试信息 */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {t('widgets.nativeBridgeReady')}: {isReady ? '✅' : '⏳'}
          </div>
        )}
      </div>
    </WidgetLayout>
  )
})
