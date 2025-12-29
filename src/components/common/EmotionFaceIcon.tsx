import { memo } from 'react'

/**
 * 情绪等级类型
 */
export type EmotionLevel = 'good' | 'neutral' | 'bad'

interface EmotionFaceIconProps {
    /** 情绪等级 */
    level: EmotionLevel
    /** 图标大小（像素） */
    size?: number
    /** 自定义类名 */
    className?: string
}

/**
 * CSS绘制的表情图标组件
 * 根据情绪等级显示不同的表情
 * - good: 笑脸（实心橙色弧形眯眼 + 向上的嘴巴）
 * - neutral: 平静（圆形眼睛 + 直线嘴巴）
 * - bad: 悲伤（圆形眼睛 + 向下的嘴巴）
 */
export const EmotionFaceIcon = memo(({ level, size = 48, className = '' }: EmotionFaceIconProps) => {
    // 根据size计算各部分的尺寸
    const scale = size / 48 // 基准尺寸为48px

    // 眯眼参数（good状态）
    const smileyEyeWidth = 14 * scale // 眯眼宽度
    const smileyEyeHeight = 8 * scale // 眯眼高度
    const smileyEyeTop = 18 * scale
    const smileyEyeGap = 10 * scale // 两个眯眼之间的间距

    // 普通眼睛参数（neutral/bad状态）
    const normalEyeSize = 3 * scale
    const normalEyeTop = 18 * scale
    const normalEyeGap = 12 * scale

    // 嘴巴参数
    const mouthBottom = 14 * scale
    const mouthWidth = level === 'good' || level === 'bad' ? 16 * scale : 12 * scale
    const mouthHeight = level === 'good' || level === 'bad' ? 8 * scale : 2 * scale

    return (
        <div
            className={`relative rounded-full flex items-center justify-center ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                background: '#FFFFFF',
                boxShadow: `0 0 0 ${1 * scale}px rgba(0, 0, 0, 0.06), 0 ${2 * scale}px ${10 * scale}px rgba(15, 23, 42, 0.06)`
            }}
        >
            {/* 彩色光晕效果 - 粉→紫→蓝渐变 */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: `${size * 1.9}px`,
                    height: `${size * 1.9}px`,
                    background:
                        'radial-gradient(circle at 30% 35%, rgba(255, 168, 90, 0.95) 0%, rgba(255, 168, 90, 0.0) 55%), radial-gradient(circle at 65% 70%, rgba(255, 120, 200, 0.85) 0%, rgba(255, 120, 200, 0.0) 60%)',
                    filter: `blur(${22 * scale}px)`,
                    opacity: 0.55,
                    zIndex: -1,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            />

            {/* 眼睛 */}
            <div
                className="absolute flex items-center justify-center"
                style={{
                    top: `${level === 'good' ? smileyEyeTop : normalEyeTop}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    gap: `${level === 'good' ? smileyEyeGap : normalEyeGap}px`
                }}
            >
                {level === 'good' ? (
                    // 笑眯眯的眼睛（实心橙色向上弧形）
                    <>
                        <div
                            style={{
                                width: `${smileyEyeWidth}px`,
                                height: `${smileyEyeHeight}px`,
                                borderTop: `${3 * scale}px solid #F59E0B`,
                                borderRadius: `${smileyEyeWidth / 2}px ${smileyEyeWidth / 2}px 0 0`,
                                background: 'transparent'
                            }}
                        />
                        <div
                            style={{
                                width: `${smileyEyeWidth}px`,
                                height: `${smileyEyeHeight}px`,
                                borderTop: `${3 * scale}px solid #F59E0B`,
                                borderRadius: `${smileyEyeWidth / 2}px ${smileyEyeWidth / 2}px 0 0`,
                                background: 'transparent'
                            }}
                        />
                    </>
                ) : (
                    // 普通圆形眼睛（橙色）
                    <>
                        <div
                            className="rounded-full"
                            style={{
                                width: `${normalEyeSize}px`,
                                height: `${normalEyeSize}px`,
                                background: '#FFA500'
                            }}
                        />
                        <div
                            className="rounded-full"
                            style={{
                                width: `${normalEyeSize}px`,
                                height: `${normalEyeSize}px`,
                                background: '#FFA500'
                            }}
                        />
                    </>
                )}
            </div>

            {/* 嘴巴 */}
            <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{ bottom: `${mouthBottom}px` }}
            >
                {level === 'good' ? null : level === 'bad' ? (
                    // 悲伤嘴巴（向下的弧线）
                    <div
                        style={{
                            width: `${mouthWidth}px`,
                            height: `${mouthHeight}px`,
                            borderTop: `${2 * scale}px solid #94A3B8`,
                            borderRadius: `${mouthWidth / 2}px ${mouthWidth / 2}px 0 0`,
                            transform: `translateY(${4 * scale}px)`
                        }}
                    />
                ) : (
                    // 平静嘴巴（直线）
                    <div
                        className="rounded-full"
                        style={{
                            width: `${mouthWidth}px`,
                            height: `${mouthHeight}px`,
                            background: '#94A3B8'
                        }}
                    />
                )}
            </div>
        </div>
    )
})

EmotionFaceIcon.displayName = 'EmotionFaceIcon'
