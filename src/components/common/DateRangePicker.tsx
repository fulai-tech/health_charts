import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { getWeekBounds } from '@/lib/dateUtils'
import type { TouchEvent } from 'react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onPrevious?: () => void
  onNext?: () => void
  /** Whether the next button should be disabled (e.g., reached current date) */
  disableNext?: boolean
  /** Callback when a week is selected from the calendar */
  onSelectWeek?: (startDate: Date, endDate: Date) => void
  className?: string
}

/**
 * Format date to short display format (e.g., "Jan 05" or "1月05日")
 */
function formatShortDate(dateStr: string, locale: string): string {
  // Parse YYYY/MM/DD format
  const parts = dateStr.split('/')
  if (parts.length !== 3) return dateStr
  
  const [year, month, day] = parts.map(Number)
  const date = new Date(year, month - 1, day)
  
  // Normalize locale: 'zh' or 'zh-CN' -> 'zh-CN', otherwise 'en-US'
  const normalizedLocale = locale.startsWith('zh') ? 'zh-CN' : 'en-US'
  
  return date.toLocaleDateString(normalizedLocale, {
    month: 'short',
    day: '2-digit',
  })
}

/**
 * Generate calendar weeks for a given month
 */
function getCalendarWeeks(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Start from the Monday of the week containing the first day
  const { monday: startMonday } = getWeekBounds(firstDay)
  
  const weeks: Date[][] = []
  let currentDate = new Date(startMonday)
  
  // Generate weeks until we've covered the entire month
  while (currentDate <= lastDay || currentDate.getDay() !== 1) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
    
    // Stop if we've passed the last day and completed the week
    if (currentDate > lastDay && currentDate.getDay() === 1) break
    // Safety limit
    if (weeks.length > 6) break
  }
  
  return weeks
}

/**
 * DateRangePicker - Premium Segmented Control style date picker
 */
export function DateRangePicker({
  startDate,
  endDate,
  onPrevious,
  onNext,
  disableNext = false,
  onSelectWeek,
  className,
}: DateRangePickerProps) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    // Initialize view date from startDate
    const parts = startDate.split('/')
    if (parts.length === 3) {
      const [year, month] = parts.map(Number)
      return new Date(year, month - 1, 1)
    }
    return new Date()
  })

  // Use resolvedLanguage which returns the actual language being used
  const locale = i18n.resolvedLanguage || i18n.language || 'zh'
  
  // Format dates for display
  const formattedStart = formatShortDate(startDate, locale)
  const formattedEnd = formatShortDate(endDate, locale)
  
  // Parse current selected week for highlighting
  const selectedWeek = useMemo(() => {
    const startParts = startDate.split('/')
    const endParts = endDate.split('/')
    if (startParts.length === 3 && endParts.length === 3) {
      const [sy, sm, sd] = startParts.map(Number)
      const [ey, em, ed] = endParts.map(Number)
      return {
        start: new Date(sy, sm - 1, sd),
        end: new Date(ey, em - 1, ed),
      }
    }
    return null
  }, [startDate, endDate])

  // Calendar data
  const calendarWeeks = useMemo(
    () => getCalendarWeeks(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  )

  // Normalize locale for date formatting and memoize month/year label
  const normalizedLocale = useMemo(() => {
    return locale.startsWith('zh') ? 'zh-CN' : 'en-US'
  }, [locale])
  
  const monthYearLabel = useMemo(() => {
    return viewDate.toLocaleDateString(normalizedLocale, {
      year: 'numeric',
      month: 'long',
    })
  }, [viewDate, normalizedLocale])

  // Weekday headers
  const weekdayHeaders = [
    t('weekdays.mon'),
    t('weekdays.tue'),
    t('weekdays.wed'),
    t('weekdays.thu'),
    t('weekdays.fri'),
    t('weekdays.sat'),
    t('weekdays.sun'),
  ]

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    const today = new Date()
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Don't allow navigating to future months
    if (nextMonth > currentMonth) return
    
    setViewDate(nextMonth)
  }

  // Check if we can navigate to next month
  const canGoNextMonth = useMemo(() => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    const today = new Date()
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    return nextMonth <= currentMonth
  }, [viewDate])

  // Swipe gesture handling for month navigation
  const swipeStartX = useRef<number>(0)
  const swipeStartY = useRef<number>(0)
  const swipeEndX = useRef<number>(0)
  const swipeEndY = useRef<number>(0)
  const isSwiping = useRef<boolean>(false)
  const SWIPE_THRESHOLD = 50
  const HORIZONTAL_RATIO = 1.2

  const handleSwipeStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    swipeStartX.current = touch.clientX
    swipeStartY.current = touch.clientY
    swipeEndX.current = touch.clientX
    swipeEndY.current = touch.clientY
    isSwiping.current = false
  }, [])

  const handleSwipeMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    swipeEndX.current = touch.clientX
    swipeEndY.current = touch.clientY

    const diffX = Math.abs(touch.clientX - swipeStartX.current)
    const diffY = Math.abs(touch.clientY - swipeStartY.current)

    // Mark as swiping if horizontal movement is dominant
    if (diffX > diffY * HORIZONTAL_RATIO && diffX > 10) {
      isSwiping.current = true
    }
  }, [])

  const handleSwipeEnd = useCallback(() => {
    if (!isSwiping.current) return

    const diffX = swipeEndX.current - swipeStartX.current
    const diffY = Math.abs(swipeEndY.current - swipeStartY.current)
    const absDiffX = Math.abs(diffX)

    // Only trigger if:
    // 1. Horizontal distance exceeds threshold
    // 2. Horizontal movement is dominant
    if (absDiffX >= SWIPE_THRESHOLD && absDiffX > diffY * HORIZONTAL_RATIO) {
      if (diffX > 0) {
        // Swipe right → go to previous month
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
      } else {
        // Swipe left → go to next month
        setViewDate(prev => {
          const nextMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
          const today = new Date()
          const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
          
          // Don't allow swiping to future months
          if (nextMonth > currentMonth) return prev
          
          return nextMonth
        })
      }
    }

    // Reset state
    isSwiping.current = false
    swipeStartX.current = 0
    swipeStartY.current = 0
    swipeEndX.current = 0
    swipeEndY.current = 0
  }, [])

  const handleWeekSelect = (weekDates: Date[]) => {
    if (onSelectWeek && weekDates.length === 7) {
      const monday = weekDates[0]
      const sunday = weekDates[6]
      
      // Check if the selected week is in the future
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (monday > today) return
      
      onSelectWeek(monday, sunday)
      setOpen(false)
    }
  }

  const isDateInSelectedWeek = (date: Date): boolean => {
    if (!selectedWeek) return false
    const dateTime = date.getTime()
    return dateTime >= selectedWeek.start.getTime() && dateTime <= selectedWeek.end.getTime()
  }

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === viewDate.getMonth()
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isFutureWeek = (weekDates: Date[]): boolean => {
    const monday = weekDates[0]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return monday > today
  }

  // Close popover on scroll
  useEffect(() => {
    if (!open) return

    const handleScroll = () => {
      setOpen(false)
    }

    window.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  return (
    <div
      className={cn(
        // Premium glassmorphic container with gradient border and hover effects
        'group relative inline-flex items-center gap-0.5 flex-shrink-0',
        'bg-gradient-to-b from-white/90 to-white/70',
        'backdrop-blur-xl backdrop-saturate-150',
        'rounded-full p-1.5',
        'shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]',
        'border border-white/60',
        'transition-all duration-300 ease-out',
        // Enhanced hover effects for entire component
        'hover:bg-gradient-to-b hover:from-white hover:to-white/80',
        // Deeper shadow when popover is open (selecting date)
        open && 'shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)]',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none transition-opacity duration-300 group-hover:opacity-80" />

      {/* Previous Button */}
      <button
        onClick={onPrevious}
        className={cn(
          'relative z-10 flex items-center justify-center w-9 h-9 rounded-full',
          'transition-all duration-200 ease-out',
          'text-slate-500 hover:text-slate-700',
          'hover:bg-white/80 hover:shadow-sm',
          'active:scale-95 active:shadow-inner',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1'
        )}
        aria-label={t('datePicker.previousWeek')}
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {/* Date Range Trigger - Premium Button with fixed width */}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              'relative z-10 flex items-center justify-center gap-2.5 px-4 py-2 mx-0.5 rounded-full',
              'w-[200px]', // Fixed width to prevent layout shift
              'transition-all duration-200 ease-out',
              'hover:bg-white/95 hover:shadow-md',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1'
            )}
          >
            {/* Text with premium typography and fixed width */}
            <span className="text-[15px] font-semibold text-slate-700 tabular-nums tracking-tight whitespace-nowrap flex-1 text-center">
              {formattedStart}
              <span className="mx-1.5 text-slate-400 font-normal">–</span>
              {formattedEnd}
            </span>
            
            {/* Icon with simple rotation - no scale */}
            <Calendar 
              className={cn(
                'w-[18px] h-[18px] transition-all duration-300 flex-shrink-0',
                open ? 'rotate-12 text-blue-500' : 'text-slate-400'
              )} 
              strokeWidth={2}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={cn(
              'date-range-picker-popover',
              'z-50 w-[340px]',
              // Premium glassmorphic card
              'bg-gradient-to-br from-white via-white to-slate-50/50',
              'backdrop-blur-2xl backdrop-saturate-150',
              'rounded-3xl p-5',
              'shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.03)]',
              'border border-white/80'
            )}
            sideOffset={12}
            align="center"
            data-swipe-ignore
            onTouchStart={handleSwipeStart}
            onTouchMove={handleSwipeMove}
            onTouchEnd={handleSwipeEnd}
          >
            {/* Decorative gradient background */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />
            
            {/* Calendar Header */}
            <div className="relative flex items-center justify-between mb-5">
              <button
                onClick={handlePrevMonth}
                aria-label={t('datePicker.previousMonth')}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg',
                  'text-slate-600 hover:text-slate-800',
                  'hover:bg-slate-100/70 transition-all duration-150',
                  'active:scale-95'
                )}
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
              
              <span className="text-sm font-bold text-slate-800 tracking-tight">
                {monthYearLabel}
              </span>
              
              <button
                onClick={handleNextMonth}
                disabled={!canGoNextMonth}
                aria-label={t('datePicker.nextMonth')}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg',
                  'transition-all duration-150',
                  canGoNextMonth ? [
                    'text-slate-600 hover:text-slate-800',
                    'hover:bg-slate-100/70',
                    'active:scale-95'
                  ] : [
                    'text-slate-300 cursor-not-allowed opacity-50'
                  ]
                )}
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="relative grid grid-cols-7 gap-1 mb-3">
              {weekdayHeaders.map((day, index) => (
                <div
                  key={index}
                  className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1.5"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid - Premium week rows */}
            <div className="relative space-y-1">
              {calendarWeeks.map((week, weekIndex) => {
                const isSelected = week.some(date => isDateInSelectedWeek(date))
                const isFuture = isFutureWeek(week)
                
                return (
                  <button
                    key={weekIndex}
                    onClick={() => !isFuture && handleWeekSelect(week)}
                    disabled={isFuture}
                    className={cn(
                      'w-full grid grid-cols-7 gap-1 py-1.5 px-1 rounded-xl',
                      'transition-all duration-200 ease-out',
                      !isFuture && 'hover:bg-blue-50/60 cursor-pointer hover:shadow-sm',
                      isFuture && 'opacity-35 cursor-not-allowed',
                      isSelected && [
                        'bg-blue-100/80',
                        'shadow-sm',
                        'hover:bg-blue-100'
                      ]
                    )}
                  >
                    {week.map((date, dayIndex) => {
                      const inMonth = isCurrentMonth(date)
                      const today = isToday(date)
                      const inSelected = isDateInSelectedWeek(date)
                      
                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            'relative text-center text-sm py-1.5 rounded-lg tabular-nums',
                            'transition-all duration-150',
                            // Default styles
                            inMonth ? 'text-slate-700 font-medium' : 'text-slate-300 font-normal',
                            // Today indicator
                            today && !inSelected && [
                              'font-bold text-blue-600',
                              'after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2',
                              'after:w-1 after:h-1 after:rounded-full after:bg-blue-500'
                            ],
                            // Selected week styles - simple blue text
                            inSelected && inMonth && 'text-blue-600 font-bold',
                            inSelected && !inMonth && 'text-blue-400/60'
                          )}
                        >
                          {date.getDate()}
                        </div>
                      )
                    })}
                  </button>
                )
              })}
            </div>

            {/* Premium hint text with icon */}
            <div className="relative flex items-center justify-center gap-2 mt-5 pt-4 border-t border-slate-100/80">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
              <p className="text-xs font-medium text-slate-400 tracking-wide">
                {t('datePicker.selectWeek')}
              </p>
            </div>

            {/* Popover arrow with gradient */}
            <Popover.Arrow className="fill-white drop-shadow-sm" width={16} height={8} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={disableNext}
        className={cn(
          'relative z-10 flex items-center justify-center w-9 h-9 rounded-full',
          'transition-all duration-200 ease-out',
          disableNext
            ? [
                'text-slate-300 cursor-not-allowed',
                'opacity-50'
              ]
            : [
                'text-slate-500 hover:text-slate-700',
                'hover:bg-white/80 hover:shadow-sm',
                'active:scale-95 active:shadow-inner',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1'
              ]
        )}
        aria-label={t('datePicker.nextWeek')}
      >
        <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
      </button>
    </div>
  )
}
