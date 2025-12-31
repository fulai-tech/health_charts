import { useTranslation } from 'react-i18next'
import { StatisticsPieChart } from '@/components/charts/StatisticsPieChart'
import { Info, Loader2, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES } from '@/config/theme'
import { getChartAnimationProps } from '@/lib/utils'
import { memo, useMemo, useState, useCallback } from 'react'

/**
 * Distribution item data structure
 */
export interface DistributionItem {
    /** Unique type/key identifier */
    type: string
    /** Display label */
    label: string
    /** Percentage value (0-100) */
    percent: number
    /** Count value (optional, for count mode) */
    count?: number
    /** Color for this item */
    color: string
    /** Duration display (optional, for sleep stages like "1h 30m") */
    duration?: string
    /** Status badge (optional, for sleep stages like "Good") */
    status?: string
}

/**
 * DistributionCard Props
 */
export interface DistributionCardProps {
    /** Card title */
    title: string
    /** Title icon component */
    icon?: LucideIcon
    /** Custom icon element (for custom shapes like colored bars) */
    iconElement?: React.ReactNode
    /** Theme color for the card */
    themeColor: string
    /** Distribution items to display */
    items: DistributionItem[]
    /** Value to show in donut center */
    centerValue?: string | number
    /** Label below center value */
    centerLabel?: string
    /** Custom color for center value text */
    centerValueColor?: string
    /** Whether to show count column (default: true) */
    showCount?: boolean
    /** Number of columns for legend (1 or 2, default: 1) */
    columns?: 1 | 2
    /** Number of grid columns for items (default: 1, use 2 for BP/Glucose style) */
    gridColumns?: 1 | 2
    /** Highlight value (large number display for BP/Glucose) */
    highlightValue?: number
    /** Highlight label (e.g., "/ 12 times") */
    highlightLabel?: string
    /** Highlight description (e.g., "Normal results") */
    highlightDescription?: string
    /** Item layout mode */
    itemLayout?: 'default' | 'with-duration' | 'grid-2col'
    /** Pie chart size */
    pieChartSize?: 'auto' | 'small' | 'medium' | 'large'
    /** Donut chart thickness (percentage, default: 12 for thin donut) */
    donutThickness?: number
    /** Additional class names */
    className?: string
    /** Loading state */
    isLoading?: boolean
    /** Whether to show info icon (default: true) */
    showInfo?: boolean
    /** Info content to display in modal (optional, can be string or React node) */
    infoContent?: string | React.ReactNode
}

/**
 * DistributionCard - A reusable card component for displaying distribution data
 * with a donut chart and legend.
 * 
 * Supports three modes:
 * 1. Single column with counts (for heart-rate, spo2)
 * 2. Two columns without counts (for emotion)
 * 3. Highlight mode with grid layout (for blood-pressure, glucose)
 */
const DistributionCardInner = ({
    title,
    icon: Icon,
    iconElement,
    themeColor,
    items,
    centerValue,
    centerLabel,
    centerValueColor,
    showCount = true,
    columns = 1,
    gridColumns = 1,
    highlightValue,
    highlightLabel,
    highlightDescription,
    itemLayout = 'default',
    pieChartSize = 'auto',
    donutThickness = 12,
    className = '',
    isLoading = false,
    showInfo = true,
    infoContent,
}: DistributionCardProps) => {
    const { t } = useTranslation()
    const animationProps = getChartAnimationProps()

    // Info modal state
    const [showInfoModal, setShowInfoModal] = useState(false)

    const handleInfoClick = useCallback(() => {
        setShowInfoModal(true)
    }, [])

    const handleCloseModal = useCallback(() => {
        setShowInfoModal(false)
    }, [])

    // Prepare pie chart data - only items with percent > 0
    const pieData = useMemo(() => {
        const dataWithValues = items
            .filter(d => d.percent > 0 || (d.count !== undefined && d.count > 0))
            .map((d) => ({
                name: d.label,
                value: d.percent > 0 ? d.percent : 0.1,
                color: d.color,
                count: d.count,
            }))

        // If no data, create a placeholder gray circle to maintain layout
        if (dataWithValues.length === 0) {
            return [{
                name: 'No Data',
                value: 100,
                color: '#E5E7EB', // gray-200
            }]
        }

        return dataWithValues
    }, [items])

    // Always show chart for stable layout
    const hasChartData = true

    // Calculate pie chart size class based on pieChartSize prop
    const getChartSizeClass = () => {
        if (pieChartSize === 'small') return 'w-32 h-32'
        if (pieChartSize === 'medium') return 'w-40 h-40'
        if (pieChartSize === 'large') return 'w-48 h-48'
        // 'auto' - determine based on columns and highlightValue
        if (columns === 2 || highlightValue !== undefined) return 'w-48 h-48'
        return 'w-32 h-32'
    }

    const chartSizeClass = getChartSizeClass()

    // Calculate inner and outer radius based on donut thickness
    const getDonutRadii = () => {
        // For columns === 2 or highlightValue mode, use custom thickness
        // Also apply custom thickness for grid-2col layout (used in daily emotion)
        if (columns === 2 || highlightValue !== undefined || itemLayout === 'grid-2col') {
            // Base outerRadius at 98% to nearly fill the container (leaving 2% margin to prevent clipping)
            // innerRadius = outerRadius - thickness
            const baseOuterRadius = 98
            const innerRadius = baseOuterRadius - donutThickness
            return { innerRadius: `${innerRadius}%`, outerRadius: `${baseOuterRadius}%` }
        }
        // Default mode: outerRadius at 80%
        // innerRadius = outerRadius - thickness (default thickness is approx 20% if not specified)
        const baseOuterRadius = 80
        // Use provided thickness or default to 20 if not specified (though default prop is 12)
        const innerRadius = baseOuterRadius - (donutThickness || 20)
        return { innerRadius: `${innerRadius}%`, outerRadius: `${baseOuterRadius}%` }
    }

    const { innerRadius, outerRadius } = getDonutRadii()

    return (
        <Card className={`${className} relative overflow-hidden`}>

            {/* Main content: flex layout with left (header + metrics) and right (chart) */}
            <div className="flex items-center gap-6">
                {/* Left: Header + Metrics */}
                <div className="flex-1 min-w-0 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        {iconElement ? iconElement : Icon && <Icon className="w-5 h-5" style={{ color: themeColor }} />}
                        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                        {showInfo && (
                            <Info
                                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                                onClick={handleInfoClick}
                            />
                        )}
                    </div>

                    {/* Metrics */}
                    <div className="flex-1">
                        {/* Highlight mode (for BP/Glucose) */}
                        {highlightValue !== undefined ? (
                            <>
                                {/* Large highlight number */}
                                <div className="mb-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold" style={{ color: themeColor }}>
                                            {highlightValue}
                                        </span>
                                        {highlightLabel && (
                                            <span className="text-base text-slate-400">{highlightLabel}</span>
                                        )}
                                    </div>
                                    {highlightDescription && (
                                        <p className="text-sm text-slate-500 mt-1">
                                            {highlightDescription}
                                        </p>
                                    )}
                                </div>

                                {/* Grid layout for items */}
                                <div className={`grid ${gridColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-x-4 gap-y-2`}>
                                    {items.map((item) => (
                                        <div key={item.type} className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="text-sm text-slate-600">{item.label}</span>
                                            </div>
                                            <span
                                                className="text-base font-semibold ml-[18px]"
                                                style={{ color: item.color }}
                                            >
                                                {item.count} {item.count === 1 ? t('common.time') : t('common.times')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : itemLayout === 'with-duration' ? (
                            // With-duration mode (for sleep)
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div key={item.type} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm text-slate-600">{item.label}</span>
                                            <span className="text-sm font-medium text-slate-800">
                                                {item.percent}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.duration && (
                                                <span className="text-xs text-slate-500">{item.duration}</span>
                                            )}
                                            {item.status && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                                                    {item.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : itemLayout === 'grid-2col' ? (
                            // Grid 2-column mode (for emotion daily)
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {items.slice(0, 8).map((item) => (
                                    <div key={item.type} className="flex items-center gap-2">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm text-slate-600">{item.label}</span>
                                        <span className="text-sm font-medium text-slate-800">
                                            {item.percent}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : columns === 2 ? (
                            // Two-column mode (for emotion features)
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                {items.map((item) => (
                                    <div key={item.type} className="flex items-center gap-2 min-w-0">
                                        <span
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm text-slate-700 flex-shrink-0">{item.label}</span>
                                        <span
                                            className="text-sm font-medium ml-auto flex-shrink-0"
                                            style={{ color: item.color }}
                                        >
                                            {item.percent}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Single-column mode (for heart-rate, spo2)
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div key={item.type} className="flex items-center gap-3">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm text-slate-600 w-14">{item.label}</span>
                                        <span
                                            className="text-sm font-semibold w-10"
                                            style={{ color: item.color }}
                                        >
                                            {item.percent}%
                                        </span>
                                        {showCount && (
                                            <span className="text-sm" style={{ color: item.color }}>
                                                {item.count ?? 0} {t('common.times')}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Donut Chart */}
                {hasChartData && (
                    <StatisticsPieChart
                        data={pieData}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={columns === 2 ? 2 : highlightValue !== undefined ? 2 : 3}
                        widthClass={chartSizeClass}
                        heightClass=""
                        animationProps={animationProps}
                    >
                        <span
                            className="text-2xl font-bold text-center px-2"
                            style={{ color: centerValueColor || themeColor }}
                        >
                            {centerValue}
                        </span>
                        {centerLabel && (
                            <span className="text-xs text-slate-400 mt-1">{centerLabel}</span>
                        )}
                    </StatisticsPieChart>
                )}
            </div>

            {/* Info Modal */}
            {showInfoModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                        style={{ borderRadius: UI_STYLES.cardBorderRadius }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 pt-6 pb-4">
                            <h3 className="text-xl font-bold text-slate-800 text-center">
                                {t('common.illustrate')}
                            </h3>
                        </div>

                        {/* Modal Content */}
                        <div className="px-6 pb-6 max-h-96 overflow-y-auto">
                            <div className="bg-slate-50 rounded-2xl p-4">
                                {infoContent ? (
                                    typeof infoContent === 'string' ? (
                                        <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                            {infoContent}
                                        </div>
                                    ) : (
                                        infoContent
                                    )
                                ) : (
                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <div key={item.type} className="flex items-start gap-3">
                                                <span
                                                    className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-800">
                                                        {item.label}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {item.percent}% ({item.count || 0} {t('common.times')})
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 pb-6">
                            <button
                                onClick={handleCloseModal}
                                className="w-full py-3 rounded-full font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                                style={{ backgroundColor: themeColor }}
                            >
                                {t('common.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}

export const DistributionCard = memo(DistributionCardInner)
