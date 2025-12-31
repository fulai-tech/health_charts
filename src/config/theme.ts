/**
 * 主题配置
 * 健康生命体征可视化库的集中颜色常量
 */

/**
 * 生命体征主题色
 * 用于各生命体征模块的主色调
 */
export const VITAL_COLORS = {
  /** 血压 - 橙色，用于血压相关组件的图标、标题、高亮显示 */
  bp: 'rgb(244, 162, 97)',
  /** 血氧(SpO2) - 青蓝色，用于血氧相关组件的图标、标题、高亮显示 */
  spo2: 'rgb(76, 201, 240)',
  /** 心率 - 红色，用于心率相关组件的图标、标题、高亮显示 */
  heartRate: 'rgb(248, 113, 113)',
  /** 血糖 - 黄色/金色，用于血糖相关组件的图标、标题、高亮显示 */
  glucose: 'rgb(233, 196, 106)',
  /** 睡眠 - 紫色，用于睡眠相关组件的图标、标题、高亮显示 */
  sleep: 'rgb(167, 139, 250)',
  /** 营养 - 橙色，用于营养相关组件的图标、标题、高亮显示 */
  nutrition: 'rgb(251, 146, 61)',
} as const

/**
 * 生命体征主题色 - 半透明版本
 * 用于图标背景、卡片背景等需要半透明效果的场景
 */
export const VITAL_COLORS_ALPHA = {
  /** 血压半透明 - 橙色，用于图标背景 */
  bp: 'rgba(244, 162, 97, 0.125)',
  /** 血氧半透明 - 青蓝色，用于图标背景 */
  spo2: 'rgba(76, 201, 240, 0.125)',
  /** 心率半透明 - 红色，用于图标背景 */
  heartRate: 'rgba(248, 113, 113, 0.125)',
  /** 血糖半透明 - 黄色/金色，用于图标背景 */
  glucose: 'rgba(233, 196, 106, 0.125)',
  /** 睡眠半透明 - 紫色，用于图标背景 */
  sleep: 'rgba(167, 139, 250, 0.125)',
  /** 营养半透明 - 橙色，用于图标背景 */
  nutrition: 'rgba(251, 146, 61, 0.125)',
} as const

/**
 * 健康概览颜色
 * 用于健康概览页面的主题色
 */
export const HEALTHY_COLORS = {
  /** 健康概览主题色 - 绿色，用于健康概览卡片 */
  primary: 'rgb(16, 185, 129)',
  /** 健康概览半透明 - 绿色，用于图标背景 */
  alpha: 'rgba(16, 185, 129, 0.125)',
} as const

/**
 * 图表颜色配置
 * 包含主色、次色和渐变色，用于各种图表组件
 */
export const CHART_COLORS = {
  /** 血压图表颜色 */
  bp: {
    primary: 'rgb(244, 162, 97)',
    secondary: 'rgba(244, 162, 97, 0.5)',
    gradient: {
      start: 'rgb(244, 162, 97)',
      end: 'rgba(244, 162, 97, 0.125)',
    },
  },
  /** 血氧图表颜色 */
  spo2: {
    primary: 'rgb(76, 201, 240)',
    secondary: 'rgba(76, 201, 240, 0.5)',
    gradient: {
      start: 'rgb(76, 201, 240)',
      end: 'rgba(76, 201, 240, 0.125)',
    },
  },
  /** 心率图表颜色 */
  heartRate: {
    primary: 'rgb(248, 113, 113)',
    secondary: 'rgba(248, 113, 113, 0.5)',
    gradient: {
      start: 'rgb(248, 113, 113)',
      end: 'rgba(248, 113, 113, 0.125)',
    },
  },
  /** 血糖图表颜色 */
  glucose: {
    primary: 'rgb(233, 196, 106)',
    secondary: 'rgba(233, 196, 106, 0.5)',
    gradient: {
      start: 'rgb(233, 196, 106)',
      end: 'rgba(233, 196, 106, 0.125)',
    },
  },
} as const

/**
 * UI 组件样式
 */
export const UI_STYLES = {
  /** 加载遮罩背景颜色 - 半透明黑色，用于卡片加载时的遮罩层 */
  loadingOverlay: 'rgba(0, 0, 0, 0)',
  /** 卡片圆角 - 30px，用于所有卡片组件的统一圆角 */
  cardBorderRadius: '30px',
  /** 卡片内边距 - 20px，用于所有卡片组件的统一内边距 */
  cardPaddingX: '25px',
  /** 页面最大宽度 - max-w-2xl (672px)，用于 daily 和 details 页面的内容容器 */
  pageMaxWidth: 'max-w-xl',
} as const

/**
 * UI 颜色配置
 * 用于界面元素的颜色定义
 */
export const UI_COLORS = {
  /** 卡片颜色 */
  card: {
    background: 'rgb(255, 255, 255)',
    border: 'rgb(229, 231, 235)',
  },
  /** 页面颜色 */
  page: {
    background: 'rgb(248, 249, 250)',
  },
  /** 文本颜色 */
  text: {
    primary: 'rgb(31, 41, 55)',
    secondary: 'rgb(107, 114, 128)',
    muted: 'rgb(156, 163, 175)',
  },
  /** 状态颜色 */
  status: {
    normal: 'rgb(16, 185, 129)',
    warning: 'rgb(245, 158, 11)',
    danger: 'rgb(239, 68, 68)',
  },
  /** 趋势颜色 */
  trend: {
    up: 'rgb(239, 68, 68)',
    down: 'rgb(16, 185, 129)',
    stable: 'rgb(107, 114, 128)',
  },
  /** 背景颜色 */
  background: {
    warning: 'rgb(248, 248, 248)',
    neutral: 'rgb(248, 248, 248)',
    summaryBox: 'rgb(248, 248, 248)',
  },
  /** 图表颜色 */
  chart: {
    grid: 'rgb(226, 232, 240)',
    tick: 'rgb(148, 163, 184)',
    activeDot: {
      fill: 'rgb(255, 255, 255)',
    },
  },
} as const

/**
 * 状态颜色配置
 * 各生命体征统计数据的正常/异常状态颜色
 */
export const STATUS_COLORS = {
  /** 血氧状态颜色 */
  spo2: {
    normal: 'rgb(178, 238, 177)',
    low: 'rgb(105, 218, 252)',
    too_low: 'rgb(248, 113, 113)',
  },
  /** 血压状态颜色 */
  bp: {
    normal: 'rgb(145, 198, 255)',
    high_normal: 'rgb(178, 238, 177)',
    low_bp: 'rgb(255, 147, 147)',
    high_bp: 'rgb(255, 208, 36)',
  },
  /** 血糖状态颜色 */
  glucose: {
    normal: 'rgb(178, 238, 177)',
    high: 'rgb(251, 191, 36)',
    too_high: 'rgb(248, 113, 113)',
    too_low: 'rgb(96, 165, 250)',
  },
  /** 心率状态颜色 */
  heartRate: {
    normal: 'rgb(95, 228, 143)',
    high: 'rgb(251, 191, 36)',
    too_high: 'rgb(248, 113, 113)',
    slow: 'rgb(96, 165, 250)',
    low: 'rgb(96, 165, 250)',
  },
} as const

/**
 * 睡眠阶段颜色
 * 用于睡眠结构图和趋势图中不同睡眠阶段的显示
 */
export const SLEEP_COLORS = {
  /** 深睡 - 深紫色，用于显示深度睡眠阶段 */
  deep: 'rgb(162, 126, 253)',
  /** 浅睡 - 浅紫色，用于显示轻度睡眠阶段 */
  light: 'rgb(217, 203, 254)',
  /** 快速眼动睡眠(REM) - 极浅紫色，用于显示REM睡眠阶段 */
  rem: 'rgb(236, 229, 254)',
  /** 清醒 - 橙色，用于显示清醒时间 */
  awake: 'rgb(249, 147, 59)',
} as const

/**
 * 情绪颜色
 * 用于情绪卡片中不同情绪状态的显示
 */
export const EMOTION_COLORS = {
  /** 情绪主题色 - 橙色，用于情绪页面的图标、标题等 */
  primary: 'rgb(251, 146, 61)',
  /** 积极情绪 - 橙色 #FB923C，用于显示积极情绪状态 */
  positive: 'rgb(251, 146, 60)',
  /** 中性情绪 - 绿色 #B2EDB5，用于显示中性情绪状态 */
  neutral: 'rgb(178, 237, 181)',
  /** 消极情绪 - 蓝色 #579EFF，用于显示消极情绪状态 */
  negative: 'rgb(87, 158, 255)',
  /** 开心 - 黄色 #FBD026 */
  happy: 'rgb(251, 211, 77)',
  /** 惊讶/庆幸 - 橙色 #FB923C */
  surprised: 'rgb(251, 146, 60)',
  /** 平静 - 绿色 #B2EEB3 */
  calm: 'rgb(178, 237, 181)',
  /** 悲伤 - 灰色 #94A3B8 */
  sad: 'rgb(148, 163, 184)',
  /** 生气 - 蓝色 #569FFF */
  angry: 'rgb(87, 158, 255)',
  /** 恐惧 - 青色 #22D3EE */
  fearful: 'rgb(34, 211, 238)',
  /** 厌恶/憎恨 - 紫色 #A78BFA */
  disgusted: 'rgb(167, 139, 250)',
} as const

/**
 * 血压特定颜色
 * 用于血压卡片中收缩压和舒张压的区分显示
 */
export const BP_COLORS = {
  /** 收缩压(SBP) - 橙色，用于显示收缩压数据 */
  systolic: 'rgb(249, 115, 22)',
  /** 舒张压(DBP) - 绿色，用于显示舒张压数据 */
  diastolic: 'rgb(74, 222, 128)',
  /** 血压柱状图颜色 - 浅灰色，用于血压柱状图的默认颜色 */
  bar: 'rgb(226, 232, 240)',
} as const

/**
 * 综合健康颜色
 * 用于综合健康卡片的主题色
 */
export const HEALTH_COLORS = {
  /** 综合健康主题色 - 橙色，用于综合健康卡片 */
  primary: 'rgb(251, 146, 61)',
  /** 目标参考线颜色 - 橙色，用于图表中的目标参考线 */
  targetLine: 'rgb(251, 146, 61)',
} as const

/**
 * 图表组件颜色
 * 用于各种图表组件的通用颜色
 */
export const CHART_COMPONENT_COLORS = {
  /** 图表柱状图默认颜色 - 浅灰色，用于柱状图的默认填充色 */
  barDefault: 'rgb(156, 163, 175)',
  /** 图表柱状图浅色 - 浅灰色，用于堆叠柱状图的浅色部分 */
  barLight: 'rgb(209, 213, 219)',
  /** 图表线条颜色 - 浅蓝灰色，用于折线图的线条 */
  line: 'rgb(203, 213, 225)',
  /** 图表线条渐变起始色 - 浅蓝灰色，用于面积图的渐变起始 */
  gradientStart: 'rgb(203, 213, 225)',
  /** 图表线条渐变结束色 - 半透明浅蓝灰色，用于面积图的渐变结束 */
  gradientEnd: 'rgba(203, 213, 225, 0.05)',
  /** 图表数据点颜色 - 浅蓝灰色，用于图表数据点的填充 */
  dot: 'rgb(203, 213, 225)',
  /** 图表参考线颜色 - 琥珀色，用于图表中的参考线和高亮标记 */
  referenceLine: 'rgb(251, 191, 36)',
} as const

/**
 * 健康卡片特定颜色
 * 用于健康概览页面各卡片的主题色
 */
export const HEALTH_CARD_COLORS = {
  /** 心率卡片颜色 - 珊瑚粉色，用于心率卡片 */
  heartRate: 'rgb(248, 113, 113)',
  /** 血糖卡片颜色 - 琥珀色，用于血糖卡片 */
  bloodSugar: 'rgb(245, 158, 11)',
  /** 睡眠卡片颜色 - 靛蓝色，用于睡眠卡片 */
  sleep: 'rgb(129, 140, 248)',
  /** 血氧卡片颜色 - 紫色，用于血氧卡片 */
  bloodOxygen: 'rgb(167, 139, 250)',
} as const

/**
 * 趋势报告卡片颜色
 * 用于趋势报告卡片中的高亮标记
 */
export const TRENDY_REPORT_COLORS = {
  /** 高亮标记颜色 - 琥珀色，用于需要关注的异常高亮 */
  highlight: 'rgb(251, 191, 36)',
} as const

/**
 * 图表网格和轴颜色
 * 用于图表的网格线和坐标轴
 */
export const CHART_GRID_COLORS = {
  /** 网格线颜色 - 浅蓝灰色，用于图表的水平/垂直网格线 */
  grid: 'rgb(226, 232, 240)',
  /** 刻度文本颜色 - 蓝灰色，用于坐标轴的刻度文字 */
  tick: 'rgb(148, 163, 184)',
  /** 坐标轴线颜色 - 浅蓝灰色，用于坐标轴线条 */
  axis: 'rgb(226, 232, 240)',
} as const

/**
 * 加载状态颜色
 * 用于加载动画和加载遮罩
 */
export const LOADING_COLORS = {
  /** 加载遮罩背景 - 半透明黑色，用于卡片加载时的遮罩层 */
  overlay: 'rgba(0, 0, 0, 0.27)',
  /** 加载指示器颜色 - 白色，用于加载旋转图标 */
  spinner: 'rgb(255, 255, 255)',
} as const

/**
 * 导航和交互颜色
 * 用于导航箭头、按钮等交互元素
 */
export const NAVIGATION_COLORS = {
  /** 导航箭头颜色 - 灰色，用于卡片右上角的导航箭头 */
  arrow: 'rgb(148, 163, 184)',
  /** 悬停阴影颜色 - 用于卡片悬停时的阴影效果 */
  hoverShadow: 'rgba(0, 0, 0, 0.1)',
} as const

/**
 * 总结框颜色
 * 用于卡片中的总结描述框
 */
export const SUMMARY_BOX_COLORS = {
  /** 总结框背景 - 浅灰色，用于总结描述框的背景色 */
  background: 'rgb(248, 250, 252)',
  /** 总结框文本 - 深灰色，用于总结描述框的文字颜色 */
  text: 'rgb(71, 85, 105)',
} as const

/**
 * 类型定义
 */
export type VitalType = keyof typeof VITAL_COLORS
export type SleepStageType = keyof typeof SLEEP_COLORS
export type EmotionType = keyof typeof EMOTION_COLORS
