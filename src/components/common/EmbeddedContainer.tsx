import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 内边距配置映射
 */
const PADDING_MAP = {
  none: '',
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
} as const

/**
 * 单方向内边距配置映射
 */
const PADDING_TOP_MAP = {
  none: '',
  xs: 'pt-1',
  sm: 'pt-2',
  md: 'pt-4',
  lg: 'pt-6',
} as const

const PADDING_BOTTOM_MAP = {
  none: '',
  xs: 'pb-1',
  sm: 'pb-2',
  md: 'pb-4',
  lg: 'pb-6',
} as const

const PADDING_LEFT_MAP = {
  none: '',
  xs: 'pl-1',
  sm: 'pl-2',
  md: 'pl-4',
  lg: 'pl-6',
} as const

const PADDING_RIGHT_MAP = {
  none: '',
  xs: 'pr-1',
  sm: 'pr-2',
  md: 'pr-4',
  lg: 'pr-6',
} as const

/**
 * 最大宽度配置映射
 */
const MAX_WIDTH_MAP = {
  sm: 'max-w-sm',      // 384px
  md: 'max-w-md',      // 448px
  lg: 'max-w-lg',      // 512px
  xl: 'max-w-xl',      // 576px
  '2xl': 'max-w-2xl',  // 672px
  full: 'max-w-full',  // 100%
} as const

export interface EmbeddedContainerProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /**
   * 是否使用全屏高度（自动适配 webview 视窗）
   * @default true
   */
  fullHeight?: boolean
  /**
   * 内边距配置
   * @default 'none'
   */
  padding?: keyof typeof PADDING_MAP
  /**
   * 上内边距配置（会覆盖 padding 的上边距）
   * @default undefined
   */
  paddingTop?: keyof typeof PADDING_TOP_MAP
  /**
   * 下内边距配置（会覆盖 padding 的下边距）
   * @default undefined
   */
  paddingBottom?: keyof typeof PADDING_BOTTOM_MAP
  /**
   * 左内边距配置（会覆盖 padding 的左边距）
   * @default undefined
   */
  paddingLeft?: keyof typeof PADDING_LEFT_MAP
  /**
   * 右内边距配置（会覆盖 padding 的右边距）
   * @default undefined
   */
  paddingRight?: keyof typeof PADDING_RIGHT_MAP
  /**
   * 最大宽度
   * @default 'full'
   */
  maxWidth?: keyof typeof MAX_WIDTH_MAP
  /**
   * 是否水平居中
   * @default false
   */
  centered?: boolean
  /**
   * 是否启用响应式内边距（移动端较小，桌面端较大）
   * @default false
   */
  responsivePadding?: boolean
}

/**
 * 设置 CSS 变量来处理移动端视窗高度问题
 * 
 * 移动端浏览器（尤其是 iOS Safari）中，100vh 包含了地址栏高度，
 * 导致实际可视区域小于 100vh。使用 window.innerHeight 来获取真实高度。
 */
function useViewportHeight() {
  useEffect(() => {
    const setVH = () => {
      // 计算真实的 1vh 单位
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    // 初始设置
    setVH()

    // 监听 resize 和 orientationchange 事件
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', setVH)

    return () => {
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', setVH)
    }
  }, [])
}

/**
 * EmbeddedContainer - 统一的嵌入式容器组件
 * 
 * 专为 WebView / iframe 嵌入场景设计，解决以下问题：
 * 1. 移动端 100vh 高度问题（地址栏遮挡）
 * 2. 去除默认页边距，自适应充满视窗
 * 3. 响应式布局支持
 * 4. 统一的样式配置接口
 * 
 * @example
 * ```tsx
 * // 基础用法 - 无边距，充满视窗
 * <EmbeddedContainer>
 *   <YourWidget />
 * </EmbeddedContainer>
 * 
 * // 带内边距和最大宽度限制
 * <EmbeddedContainer padding="md" maxWidth="md" centered>
 *   <YourWidget />
 * </EmbeddedContainer>
 * 
 * // 响应式内边距
 * <EmbeddedContainer responsivePadding maxWidth="lg">
 *   <YourWidget />
 * </EmbeddedContainer>
 * ```
 */
export function EmbeddedContainer({
  children,
  className,
  style,
  fullHeight = true,
  padding = 'none',
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  maxWidth = 'full',
  centered = false,
  responsivePadding = false,
}: EmbeddedContainerProps) {
  // 设置视窗高度 CSS 变量
  useViewportHeight()

  // 构建内边距类名
  const paddingClass = responsivePadding
    ? 'p-2 sm:p-3 md:p-4 lg:p-6'
    : PADDING_MAP[padding]

  // 构建方向性内边距类名
  const directionalPaddingClasses = [
    paddingTop && PADDING_TOP_MAP[paddingTop],
    paddingBottom && PADDING_BOTTOM_MAP[paddingBottom],
    paddingLeft && PADDING_LEFT_MAP[paddingLeft],
    paddingRight && PADDING_RIGHT_MAP[paddingRight],
  ].filter(Boolean)

  return (
    <div
      className={cn(
        // 基础样式
        'w-full',
        // 全屏高度：优先使用 dvh（Dynamic Viewport Height），回退到 CSS 变量，最后使用 vh
        // 使用 min-h 而不是 h，允许内容超出时可滚动
        fullHeight && 'min-h-[100dvh] min-h-[calc(var(--vh,1vh)*100)]',
        // 最大宽度
        MAX_WIDTH_MAP[maxWidth],
        // 居中
        centered && 'mx-auto',
        // 内边距
        paddingClass,
        // 方向性内边距（覆盖 padding 对应方向）
        ...directionalPaddingClasses,
        // 自定义类名
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

/**
 * EmbeddedScrollContainer - 可滚动的嵌入容器
 * 
 * 用于内容可能超出视窗高度的场景，提供原生滚动体验
 */
export function EmbeddedScrollContainer({
  children,
  className,
  style,
  padding = 'none',
  maxWidth = 'full',
  centered = false,
  responsivePadding = false,
}: Omit<EmbeddedContainerProps, 'fullHeight'>) {
  useViewportHeight()

  const paddingClass = responsivePadding
    ? 'p-2 sm:p-3 md:p-4 lg:p-6'
    : PADDING_MAP[padding]

  return (
    <div
      className={cn(
        // 固定高度容器
        'w-full h-[100dvh] h-[calc(var(--vh,1vh)*100)]',
        // 启用滚动
        'overflow-y-auto overflow-x-hidden',
        // 优化移动端滚动体验
        'overscroll-contain',
        // 隐藏滚动条（可选）
        'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
        className
      )}
      style={style}
    >
      <div
        className={cn(
          'w-full min-h-full',
          MAX_WIDTH_MAP[maxWidth],
          centered && 'mx-auto',
          paddingClass
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default EmbeddedContainer
