import { useTranslation } from 'react-i18next'
import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SwipeableCarousel, CarouselIndicator, useCarouselState } from '@/components/ui/swipeable-carousel'
import type { WeeklyComparisonData, ComparisonDishData } from '../types'
import { VITAL_COLORS } from '@/config/theme'
import { useState, useEffect, useRef } from 'react'

// Theme colors
const _PEACH_BG = '#FEE4CD'
const BRAND_ORANGE = '#FB923D'
const _MUTED_GREY = '#94A3B8'
const LIGHT_BLUE_BG = '#EFF6FF'
const BAR_GREY = '#D1D5DB'
const DATA_ATTRIBUTION_BG = '#F8F8F8'
const TEXT_MUTED = '#918D8A'

// Card theme colors (for up to 3 cards)
const CARD_THEME_COLORS = [
    {
        primary: '#FB923D', // Orange - 第1个卡片
        bg: '#FEE4CD', // Light orange background
        inactive: '#FED7AA', // Inactive indicator color
    },
    {
        primary: '#A78BFA', // Blue-purple - 第2个卡片
        bg: '#EDE9FE', // Light purple background
        inactive: '#DDD6FE', // Inactive indicator color
    },
    {
        primary: '#10B981', // Green - 第3个卡片
        bg: '#D1FAE5', // Light green background
        inactive: '#A7F3D0', // Inactive indicator color
    },
]

interface NutritionComparisonCardProps {
    data?: WeeklyComparisonData
    className?: string
    isLoading?: boolean
}

/**
 * Meal type translation keys
 */
const MEAL_TYPE_KEYS: Record<string, string> = {
    breakfast: 'nutrition.comparison.breakfast',
    lunch: 'nutrition.comparison.lunch', 
    dinner: 'nutrition.comparison.dinner',
    snacks: 'nutrition.comparison.snacks',
}

/**
 * Format date for display (e.g., "Nov.22 Saturday")
 */
function formatDishDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    const month = months[date.getMonth()]
    const day = date.getDate()
    const weekday = days[date.getDay()]
    
    return `${month}.${day} ${weekday}`
}

/**
 * Comparison Bar Chart - Shows last week vs this week
 */
interface ComparisonBarChartProps {
    lastWeekValue: number
    thisWeekValue: number
    themeColor?: string
}

const ComparisonBarChart = ({ lastWeekValue, thisWeekValue, themeColor = BRAND_ORANGE }: ComparisonBarChartProps) => {
    const { t } = useTranslation()
    const maxValue = Math.max(lastWeekValue, thisWeekValue)
    
    // Fixed container height in pixels
    const containerHeight = 64 // h-16 = 64px
    const minVisibleHeight = 4 // tiny stub so zero values are still visible
    
    // Calculate heights in pixels (max value gets full container height)
    const lastWeekHeight = maxValue > 0 ? (lastWeekValue / maxValue) * containerHeight : 0
    const thisWeekHeight = maxValue > 0 ? (thisWeekValue / maxValue) * containerHeight : 0
    
    return (
        <div className="flex items-end gap-3 h-20">
            {/* Last week bar */}
            <div className="flex flex-col items-center gap-1">
                <div className="flex items-end h-16">
                    <div 
                        className="w-4 rounded-t-full transition-all duration-300"
                        style={{ 
                            height: `${Math.max(lastWeekHeight, lastWeekHeight > 0 ? minVisibleHeight : 0)}px`,
                            backgroundColor: BAR_GREY 
                        }}
                    />
                </div>
                <span className="text-[10px] whitespace-nowrap" style={{ color: TEXT_MUTED }}>
                    {t('nutrition.comparison.lastWeek', 'Last week')}
                </span>
            </div>
            {/* This week bar */}
            <div className="flex flex-col items-center gap-1">
                <div className="flex items-end h-16">
                    <div 
                        className="w-4 rounded-t-full transition-all duration-300"
                        style={{ 
                            height: `${Math.max(thisWeekHeight, thisWeekHeight > 0 ? minVisibleHeight : 0)}px`,
                            backgroundColor: themeColor 
                        }}
                    />
                </div>
                <span className="text-[10px] whitespace-nowrap" style={{ color: TEXT_MUTED }}>
                    {t('nutrition.comparison.thisWeek', 'This week')}
                </span>
            </div>
        </div>
    )
}

/**
 * Hook for animating number changes using hybrid algorithm
 * Large errors: step by ±10 for fast response
 * Small errors: PID control for smooth finish
 * Guaranteed to complete within 1 second
 */
function useAnimatedNumber(targetValue: number) {
    const [displayValue, setDisplayValue] = useState(targetValue)
    const animationFrameRef = useRef<number | undefined>(undefined)
    const startTimeRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)
    
    // PID controller state (for small errors)
    const integralRef = useRef<number>(0)
    const lastErrorRef = useRef<number>(0)
    
    // PID tuning parameters (for smooth finish)
    const Kp = 5.0   // Proportional gain - very high for fast response
    const Ki = 0.1   // Integral gain
    const Kd = 0.3   // Derivative gain
    const threshold = 5   // Switch to adaptive mode when error is below this
    const maxStep = 10     // Maximum step size for large errors
    const minStep = 2      // Minimum step size for small errors (to avoid +1+1)
    const maxDuration = 1000 // Maximum duration in milliseconds (1 second)

    useEffect(() => {
        // Reset when target changes
        if (Math.abs(targetValue - displayValue) > 0.1) {
            startTimeRef.current = performance.now()
            lastTimeRef.current = performance.now()
            integralRef.current = 0
            lastErrorRef.current = targetValue - displayValue
        }

        const animate = (currentTime: number) => {
            const error = targetValue - displayValue
            const elapsed = currentTime - startTimeRef.current
            
            // Stop if reached target
            if (Math.abs(error) < 0.1) {
                setDisplayValue(targetValue)
                return
            }

            // Force completion after 1 second
            if (elapsed >= maxDuration) {
                setDisplayValue(targetValue)
                return
            }

            const deltaTime = Math.max(1, currentTime - lastTimeRef.current) / 1000 // Convert to seconds
            lastTimeRef.current = currentTime
            const remainingTime = (maxDuration - elapsed) / 1000 // Remaining time in seconds
            const remainingError = Math.abs(error)

            let step: number

            if (Math.abs(error) > threshold) {
                // Large error: use fixed step size (±10)
                step = Math.sign(error) * Math.min(maxStep, Math.abs(error))
            } else {
                // Small error: use adaptive step based on remaining time and error
                // Calculate required speed to complete in remaining time
                const requiredSpeed = remainingError / Math.max(remainingTime, 0.001)
                
                // PID calculations for smoothness
                const proportional = Kp * error
                integralRef.current += error * deltaTime
                const maxIntegral = Math.abs(error) * 10
                integralRef.current = Math.max(-maxIntegral, Math.min(maxIntegral, integralRef.current))
                const integral = Ki * integralRef.current
                const derivative = Kd * (error - lastErrorRef.current) / Math.max(deltaTime, 0.001)
                lastErrorRef.current = error

                const pidOutput = proportional + integral + derivative
                const pidStep = pidOutput * deltaTime
                
                // Use required speed to ensure completion in time
                const requiredStep = requiredSpeed * deltaTime
                
                // Use the larger of PID step, required step, or minimum step
                // This ensures we don't get stuck with +1+1 increments
                step = Math.sign(error) * Math.max(
                    Math.abs(pidStep),
                    Math.abs(requiredStep),
                    minStep
                )
                
                // Don't overshoot
                step = Math.sign(error) * Math.min(Math.abs(step), Math.abs(error))
            }

            // Update display value
            const newValue = displayValue + step
            setDisplayValue(newValue)

            // Continue animation
            animationFrameRef.current = requestAnimationFrame(animate)
        }

        // Start animation if there's a significant difference
        if (Math.abs(targetValue - displayValue) > 0.1) {
            animationFrameRef.current = requestAnimationFrame(animate)
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [targetValue, displayValue])

    return Math.round(displayValue)
}

/**
 * Single slide content for the carousel
 */
interface ComparisonSlideProps {
    data: WeeklyComparisonData
    dish: ComparisonDishData
    index?: number
}

const ComparisonSlide = ({ data, dish, index = 0 }: ComparisonSlideProps) => {
    const { t } = useTranslation()
    const animatedCalorieChange = useAnimatedNumber(data.calorieChange)
    const isPositiveChange = animatedCalorieChange > 0
    const changeSign = isPositiveChange ? '+' : ''
    
    // Get theme colors based on index (0, 1, or 2)
    const themeIndex = Math.min(index, 2)
    const theme = CARD_THEME_COLORS[themeIndex]
    
    // Format meal type
    const mealTypeKey = MEAL_TYPE_KEYS[dish.mealType] || 'nutrition.comparison.dinner'
    const mealTypeText = t(mealTypeKey, dish.mealType)
    
    // Format date
    const dateText = formatDishDate(dish.date)
    
    return (
        <div className="px-[25px]">
            <div className="rounded-2xl overflow-hidden">
                <div className="flex flex-col">
                    {/* Top Half - Theme Background */}
                    <div 
                        className="px-5 py-3 flex justify-between items-start"
                        style={{ backgroundColor: theme.bg }}
                    >
                        {/* Left Stats */}
                        <div className="flex flex-col gap-1 flex-1">
                            <span className="text-xs" style={{ color: TEXT_MUTED }}>
                                {t('nutrition.comparison.avgCaloriesCompare', 'Average calories compare to last week')}
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span 
                                    className="text-3xl font-bold"
                                    style={{ color: theme.primary }}
                                >
                                    {changeSign}{animatedCalorieChange}
                                </span>
                                <span className="text-sm text-slate-500">
                                    {t('nutrition.kcal', 'kcal')}
                                </span>
                            </div>
                            <span className="text-xs" style={{ color: TEXT_MUTED }}>
                                {t('nutrition.comparison.lastWeekValue', 'Last week')}: {Math.round(data.lastWeekCalories)} {t('nutrition.kcal', 'kcal')}
                            </span>
                        </div>
                        
                        {/* Right Chart */}
                        <ComparisonBarChart 
                            lastWeekValue={data.lastWeekCalories}
                            thisWeekValue={data.thisWeekCalories}
                            themeColor={theme.primary}
                        />
                    </div>
                    
                    {/* Bottom Half - White Background */}
                    <div className="p-4 pb-4" style={{ backgroundColor: DATA_ATTRIBUTION_BG }}>
                        {/* Section Label */}
                        <p className="text-xs mb-3" style={{ color: TEXT_MUTED }}>
                            {t('nutrition.comparison.mainCause', 'Data attribution: Primarily caused by...')}
                        </p>
                        
                        {/* Dish Item */}
                        <div className="flex items-center gap-3">
                            {/* Dish Image */}
                            <div className="w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                {dish.imageUrl ? (
                                    <img 
                                        src={dish.imageUrl} 
                                        alt={dish.dishName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        🍽️
                                    </div>
                                )}
                            </div>
                            
                            {/* Dish Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-base font-semibold text-slate-800 truncate">
                                    {dish.dishName}
                                </h4>
                                <p className="text-xs truncate" style={{ color: TEXT_MUTED }}>
                                    {dateText} {mealTypeText}
                                </p>
                            </div>
                            
                            {/* Status Badge */}
                            <div 
                                className="flex flex-col items-center px-3 py-1.5 rounded-lg"
                                style={{ backgroundColor: theme.primary }}
                            >
                                <span className="text-xs font-medium text-white">
                                    {dish.calories} {t('nutrition.kcal', 'kcal')}
                                </span>
                                <span className="text-[10px] text-white/80">
                                    {dish.remark || t('nutrition.exceed', 'Exceed')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * NutritionComparisonCard - Compare with last week health analysis card
 * 
 * Layout:
 * 1. Static Header (icon + title)
 * 2. Carousel Container (swipeable slides)
 * 3. Static Evaluation Box (trend analysis text)
 * 4. Carousel Indicators (pagination dots)
 */
export const NutritionComparisonCard = ({ data, className, isLoading }: NutritionComparisonCardProps) => {
    const { t } = useTranslation()
    const _isPlaceholder = !data

    // Placeholder content when no data is provided
    const placeholderDish: ComparisonDishData = {
        dishName: t('nutrition.comparison.sampleDish', 'Sample high-calorie dinner'),
        calories: 680,
        mealType: 'dinner',
        date: new Date(),
        remark: t('nutrition.comparison.placeholderRemark', 'Likely the main contributor'),
    }

    const placeholderData: WeeklyComparisonData = {
        lastWeekCalories: 2100,
        thisWeekCalories: 1800,
        calorieChange: 1800 - 2100,
        trendAnalysis: t(
            'nutrition.comparison.placeholderTrend',
            'This week is slightly lower than last week. Watch dinner calories to keep the downward trend.'
        ),
        mainCauseDishes: [placeholderDish],
    }

    const effectiveData = data ?? placeholderData
    
    // Get actual dishes from backend (max 3)
    const dishesSource = effectiveData.mainCauseDishes && effectiveData.mainCauseDishes.length > 0
        ? effectiveData.mainCauseDishes
        : [placeholderDish]
    
    // Limit to 3 dishes maximum
    const slides = dishesSource.slice(0, 3)
    const hasMultipleSlides = slides.length >= 2
    
    // Use external carousel state (only needed when there are multiple slides)
    const carouselState = useCarouselState(slides.length)
    
    return (
        <Card className={`${className} flex flex-col gap-4`}>
            {/* 1. Static Header */}
            <div className="flex items-center gap-2">
                <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${VITAL_COLORS.nutrition}20` }}
                >
                    <TrendingUp className="w-4 h-4" style={{ color: VITAL_COLORS.nutrition }} />
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                    {t('nutrition.comparison.title', 'Compare with last week')}
                </h3>
            </div>
            
            {/* 2. Content Container */}
            {slides.length > 0 && (
                <div className="-mx-[25px]">
                    {hasMultipleSlides ? (
                        // Multiple slides: Use carousel
                        <SwipeableCarousel
                            items={slides}
                            renderItem={(dish: ComparisonDishData, index: number) => (
                                <ComparisonSlide data={effectiveData} dish={dish} index={index} />
                            )}
                            currentIndex={carouselState.currentIndex}
                            onIndexChange={carouselState.setCurrentIndex}
                            hideIndicators
                            wrapInCard={false}
                            isLoading={isLoading}
                            emptyMessage={t('common.noData', 'No data available')}
                        />
                    ) : (
                        // Single slide: Render directly without carousel
                        <ComparisonSlide data={effectiveData} dish={slides[0]} index={0} />
                    )}
                </div>
            )}
            
            {/* 3. Static Evaluation Box */}
            {effectiveData.trendAnalysis && (
                <div 
                    className="rounded-xl p-4"
                    style={{ backgroundColor: LIGHT_BLUE_BG }}
                >
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {effectiveData.trendAnalysis}
                    </p>
                </div>
            )}
            
            {/* 4. Carousel Indicators - Only show when there are 2+ slides */}
            {hasMultipleSlides && (
                <CarouselIndicator
                    total={slides.length}
                    current={carouselState.currentIndex}
                    onSelect={carouselState.setCurrentIndex}
                    activeColor={BRAND_ORANGE}
                    inactiveColor="#FED7AA"
                    className="mt-2"
                />
            )}
        </Card>
    )
}

