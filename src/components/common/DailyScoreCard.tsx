/**
 * DailyScoreCard
 * 
 * Top score card with circular progress ring, percentile comparison, and AI analysis tags.
 * Used across Emotion, Sleep, and Healthy daily report pages.
 */

import { memo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'

export interface DailyScoreCardProps {
    /** Score value (null shows '--') */
    score: number | null
    /** Maximum score (default: 100) */
    maxScore?: number
    /** Level label (e.g., "良好", "fair") */
    levelLabel?: string | null
    /** Percentile rank (e.g., 95 = top 95%) */
    percentile?: number | null
    /** Percentile message (e.g., "Exceeding 95% people with same age!") */
    percentileMessage?: string | null
    /** AI analysis tags */
    aiTags?: string[]
    /** Theme color for ring and tags (start color for gradient) */
    themeColor: string
    /** End color for gradient (optional, defaults to semi-transparent themeColor) */
    gradientEndColor?: string
    /** Light background color for tags */
    tagBgColor?: string
    /** Optional icon to display in the ring center */
    icon?: ReactNode
    /** Card title */
    title: string
    /** Additional class names */
    className?: string
}

/**
 * Circular progress ring component
 */
const CircularProgress = ({
    percentage,
    color,
    size = 80,
    strokeWidth = 6,
    icon,
}: {
    percentage: number
    color: string
    size?: number
    strokeWidth?: number
    icon?: ReactNode
}) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="white"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            {/* Center icon */}
            {icon && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {icon}
                </div>
            )}
        </div>
    )
}

const DailyScoreCardInner = ({
    score,
    maxScore = 100,
    levelLabel,
    percentile,
    percentileMessage,
    aiTags = [],
    themeColor,
    gradientEndColor,
    tagBgColor,
    icon,
    title,
    className = '',
}: DailyScoreCardProps) => {
    const { t } = useTranslation()
    const percentage = score !== null ? (score / maxScore) * 100 : 0

    // Fallback to orange if themeColor is not provided
    const bgColor = themeColor || '#FB923D'

    // Use custom end color or create semi-transparent version
    const endColor = gradientEndColor || (
        bgColor.startsWith('rgb(')
            ? bgColor.replace('rgb(', 'rgba(').replace(')', ', 0.8)')
            : bgColor + 'cc'
    )

    return (
        <div
            className={`rounded-2xl p-5 shadow-sm ${className}`}
            style={{
                background: `linear-gradient(135deg, ${bgColor} 0%, ${endColor} 100%)`,
            }}
        >
            <div className="flex items-start justify-between">
                {/* Left: Score and info */}
                <div className="flex-1">
                    {/* Title */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <Sparkles className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">{title}</span>
                    </div>

                    {/* Score */}
                    <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-5xl font-bold text-white drop-shadow-sm">
                            {score !== null ? score : '--'}
                        </span>
                        <span className="text-white/80 text-lg">/{maxScore}</span>
                        {levelLabel && (
                            <span className="ml-2 text-white text-sm font-medium">{levelLabel}</span>
                        )}
                    </div>

                    {/* Percentile message */}
                    {percentileMessage && (
                        <div className="inline-flex items-center gap-1.5 bg-white/30 backdrop-blur-sm rounded-full px-3 py-1.5 mb-3">
                            <span className="text-white text-xs font-medium">✓</span>
                            <span className="text-white text-xs font-medium">{percentileMessage}</span>
                        </div>
                    )}

                    {/* AI Analysis section */}
                    {aiTags.length > 0 && (
                        <div className="mt-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                <span className="text-white text-xs font-medium">
                                    {t('daily.aiAnalysis', 'AI Analysis')}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {aiTags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium shadow-sm"
                                        style={{
                                            backgroundColor: tagBgColor || 'rgba(255,255,255,0.35)',
                                            color: 'white',
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Circular progress */}
                <div className="ml-4">
                    <CircularProgress
                        percentage={percentage}
                        color={themeColor}
                        size={80}
                        strokeWidth={6}
                        icon={icon}
                    />
                </div>
            </div>
        </div>
    )
}

export const DailyScoreCard = memo(DailyScoreCardInner)
