import { useTranslation } from 'react-i18next'
import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SwipeableCarousel, CarouselIndicator, useCarouselState } from '@/components/ui/swipeable-carousel'
import type { WeeklyComparisonData, ComparisonDishData } from '../types'
import { VITAL_COLORS } from '@/config/theme'
import { useState, useEffect, useRef } from 'react'

// Theme colors
const PEACH_BG = '#FEE4CD'
const BRAND_ORANGE = '#FB923D'
const MUTED_GREY = '#94A3B8'
const LIGHT_BLUE_BG = '#EFF6FF'
const BAR_GREY = '#D1D5DB'
const DATA_ATTRIBUTION_BG = '#F8F8F8'
const TEXT_MUTED = '#918D8A'

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
}

const ComparisonBarChart = ({ lastWeekValue, thisWeekValue }: ComparisonBarChartProps) => {
    const { t } = useTranslation()
    const maxValue = Math.max(lastWeekValue, thisWeekValue)
    
    // Fixed container height in pixels
    const containerHeight = 64 // h-16 = 64px
    
    // Calculate heights in pixels (max value gets full container height)
    const lastWeekHeight = maxValue > 0 ? (lastWeekValue / maxValue) * containerHeight : 0
    const thisWeekHeight = maxValue > 0 ? (thisWeekValue / maxValue) * containerHeight : 0
    
    return (
        <div className="flex items-end gap-3 h-20">
            {/* Last week bar */}
            <div className="flex flex-col items-center gap-1 h-16">
                <div 
                    className="w-4 rounded-t-full transition-all duration-300"
                    style={{ 
                        height: `${lastWeekHeight}px`,
                        minHeight: 8,
                        backgroundColor: BAR_GREY 
                    }}
                />
                <span className="text-[10px] whitespace-nowrap" style={{ color: TEXT_MUTED }}>
                    {t('nutrition.comparison.lastWeek', 'Last week')}
                </span>
            </div>
            {/* This week bar */}
            <div className="flex flex-col items-center gap-1 h-16">
                <div 
                    className="w-4 rounded-t-full transition-all duration-300"
                    style={{ 
                        height: `${thisWeekHeight}px`,
                        minHeight: 8,
                        backgroundColor: BRAND_ORANGE 
                    }}
                />
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
    const startTimeRef = useRef<number>(performance.now())
    const lastTimeRef = useRef<number>(performance.now())
    
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
}

const ComparisonSlide = ({ data, dish }: ComparisonSlideProps) => {
    const { t } = useTranslation()
    const animatedCalorieChange = useAnimatedNumber(data.calorieChange)
    const isPositiveChange = animatedCalorieChange > 0
    const changeSign = isPositiveChange ? '+' : ''
    
    // Format meal type
    const mealTypeKey = MEAL_TYPE_KEYS[dish.mealType] || 'nutrition.comparison.dinner'
    const mealTypeText = t(mealTypeKey, dish.mealType)
    
    // Format date
    const dateText = formatDishDate(dish.date)
    
    return (
        <div className="px-[25px]">
            <div className="rounded-2xl overflow-hidden">
                <div className="flex flex-col">
                    {/* Top Half - Peach Background */}
                    <div 
                        className="px-5 py-3 flex justify-between items-start"
                        style={{ backgroundColor: PEACH_BG }}
                    >
                        {/* Left Stats */}
                        <div className="flex flex-col gap-1 flex-1">
                            <span className="text-xs" style={{ color: TEXT_MUTED }}>
                                {t('nutrition.comparison.avgCaloriesCompare', 'Average calories compare to last week')}
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span 
                                    className="text-3xl font-bold"
                                    style={{ color: BRAND_ORANGE }}
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
                                style={{ backgroundColor: BRAND_ORANGE }}
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
    
    // Since backend only returns one dish, duplicate it for demo (as per requirement)
    const slides = data?.mainCauseDishes && data.mainCauseDishes.length > 0
        ? [data.mainCauseDishes[0], data.mainCauseDishes[0], data.mainCauseDishes[0]]
        : []
    
    // Use external carousel state
    const carouselState = useCarouselState(slides.length)
    
    if (!data) return null
    
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
            
            {/* 2. Carousel Container - Break out of card padding for full-width slides */}
            {slides.length > 0 && (
                <div className="-mx-[25px]">
                    <SwipeableCarousel
                        items={slides}
                        renderItem={(dish: ComparisonDishData) => (
                            <ComparisonSlide data={data} dish={dish} />
                        )}
                        currentIndex={carouselState.currentIndex}
                        onIndexChange={carouselState.setCurrentIndex}
                        hideIndicators
                        wrapInCard={false}
                        isLoading={isLoading}
                        emptyMessage={t('common.noData', 'No data available')}
                    />
                </div>
            )}
            
            {/* 3. Static Evaluation Box */}
            {data.trendAnalysis && (
                <div 
                    className="rounded-xl p-4"
                    style={{ backgroundColor: LIGHT_BLUE_BG }}
                >
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {data.trendAnalysis}
                    </p>
                </div>
            )}
            
            {/* 4. Carousel Indicators */}
            <CarouselIndicator
                total={slides.length}
                current={carouselState.currentIndex}
                onSelect={carouselState.setCurrentIndex}
                activeColor={BRAND_ORANGE}
                inactiveColor="#FED7AA"
                className="mt-2"
            />
        </Card>
    )
}

