/**
 * WidgetEntranceContainer - Widget 入场动画容器
 * 
 * 功能：
 * - 等待 `canAnimate` 信号后播放入场动画
 * - 支持多种动画模式：fade（淡入）、slide（滑入）、scale（缩放）、spring（弹性）
 * - 支持子元素交错动画
 * 
 * @example
 * ```tsx
 * // 基础用法
 * <WidgetEntranceContainer animate={canAnimate}>
 *   <MyCard />
 * </WidgetEntranceContainer>
 * 
 * // 交错动画
 * <WidgetEntranceContainer animate={canAnimate} stagger>
 *   <Card1 />
 *   <Card2 />
 *   <Card3 />
 * </WidgetEntranceContainer>
 * ```
 */

import { Children } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants, Transition } from 'framer-motion'

/** 动画模式 */
type AnimationMode = 'fade' | 'slide' | 'scale' | 'spring' | 'slideUp'

interface WidgetEntranceContainerProps {
  children: ReactNode
  /** 是否开始动画 */
  animate: boolean
  /** 动画 key，改变时强制重新挂载以重新播放动画（用于调试） */
  animationKey?: number
  /** 动画模式，默认 slideUp */
  mode?: AnimationMode
  /** 容器类名 */
  className?: string
  /** 容器样式 */
  style?: CSSProperties
  /** 是否启用子元素交错动画 */
  stagger?: boolean
  /** 交错延迟（秒），默认 0.08s */
  staggerDelay?: number
  /** 初始延迟（秒），默认 0.05s */
  initialDelay?: number
  /** 动画持续时间（秒），默认根据 mode 自动设置 */
  duration?: number
}

// 动画变体配置
const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const slideVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
}

const springVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

// 获取动画变体
function getVariants(mode: AnimationMode): Variants {
  switch (mode) {
    case 'fade':
      return fadeVariants
    case 'slide':
      return slideVariants
    case 'slideUp':
      return slideUpVariants
    case 'scale':
      return scaleVariants
    case 'spring':
      return springVariants
    default:
      return slideUpVariants
  }
}

// 获取过渡配置
function getTransition(mode: AnimationMode, duration?: number): Transition {
  const baseDuration = duration ?? (mode === 'spring' ? 0.5 : 0.4)
  
  if (mode === 'spring') {
    return {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      duration: baseDuration,
    }
  }
  
  return {
    duration: baseDuration,
    ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
  }
}

export function WidgetEntranceContainer({
  children,
  animate,
  animationKey = 0,
  mode = 'slideUp',
  className = '',
  style,
  stagger = false,
  staggerDelay = 0.08,
  initialDelay = 0.05,
  duration,
}: WidgetEntranceContainerProps) {
  const variants = getVariants(mode)
  const transition = getTransition(mode, duration)

  // 非交错模式：整体动画
  if (!stagger) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          className={className}
          style={style}
          initial="hidden"
          animate={animate ? 'visible' : 'hidden'}
          variants={variants}
          transition={{
            ...transition,
            delay: initialDelay,
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  }

  // 交错模式：子元素依次动画
  const childArray = Children.toArray(children)
  
  // 容器变体（控制子元素交错）
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  }

  // 子元素变体
  const itemVariants: Variants = {
    hidden: variants.hidden,
    visible: {
      ...(variants.visible as Record<string, unknown>),
      transition,
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animationKey}
        className={className}
        style={style}
        initial="hidden"
        animate={animate ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        {childArray.map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

export type { AnimationMode, WidgetEntranceContainerProps }
