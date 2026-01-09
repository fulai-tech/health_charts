import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { getWeekBounds } from '@/lib/dateUtils'

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
 * Format date to short display format (e.g., "Jan 05")
 */
function formatShortDate(dateStr: string, locale: string): string {
  // Parse YYYY/MM/DD format
  const parts = dateStr.split('/')
  if (parts.length !== 3) return dateStr
  
  const [year, month, day] = parts.map(Number)
  const date = new Date(year, month - 1, day)
  
  return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
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

  const locale = i18n.language || 'en'
  
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

  const monthYearLabel = viewDate.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
  })

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
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

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

  return (
    <div
      className={cn(
        // Premium glassmorphic container with gradient border and hover effects
        'group relative inline-flex items-center gap-0.5',
        'bg-gradient-to-b from-white/90 to-white/70',
        'backdrop-blur-xl backdrop-saturate-150',
        'rounded-2xl p-1.5',
        'shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]',
        'border border-white/60',
        'transition-all duration-300 ease-out',
        // Enhanced hover effects for entire component
        'hover:bg-gradient-to-b hover:from-white hover:to-white/80',
        'hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none transition-opacity duration-300 group-hover:opacity-80" />

      {/* Previous Button */}
      <button
        onClick={onPrevious}
        className={cn(
          'relative z-10 flex items-center justify-center w-9 h-9 rounded-xl',
          'transition-all duration-200 ease-out',
          'text-slate-500 hover:text-slate-700',
          'hover:bg-white/80 hover:shadow-sm',
          'active:scale-95 active:shadow-inner',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1'
        )}
        aria-label="Previous week"
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {/* Date Range Trigger - Premium Button with fixed width */}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              'relative z-10 flex items-center justify-center gap-2.5 px-4 py-2 mx-0.5 rounded-xl',
              'min-w-[180px]', // Fixed minimum width for stability
              'transition-all duration-200 ease-out',
              'hover:bg-white/95 hover:shadow-md',
              'active:scale-[0.98]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1',
              open && 'bg-white/95 shadow-lg'
            )}
          >
            {/* Text with premium typography and fixed width */}
            <span className="text-[15px] font-semibold text-slate-700 tabular-nums tracking-tight whitespace-nowrap inline-block min-w-[130px] text-center">
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
              'z-50 w-[340px]',
              // Premium glassmorphic card
              'bg-gradient-to-br from-white via-white to-slate-50/50',
              'backdrop-blur-2xl backdrop-saturate-150',
              'rounded-3xl p-5',
              'shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.03)]',
              'border border-white/80',
              // Smooth animations
              'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'duration-200'
            )}
            sideOffset={12}
            align="center"
          >
            {/* Decorative gradient background */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />
            
            {/* Calendar Header */}
            <div className="relative flex items-center justify-between mb-5">
              <button
                onClick={handlePrevMonth}
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
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg',
                  'text-slate-600 hover:text-slate-800',
                  'hover:bg-slate-100/70 transition-all duration-150',
                  'active:scale-95'
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
                {locale === 'zh' ? '点击选择一周' : 'Click a row to select week'}
              </p>
            </div>

            {/* Popover arrow with gradient */}
            <Popover.Arrow className="fill-white drop-shadow-sm" width={16} height={8} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Next Button */}
      {!disableNext ? (
        <button
          onClick={onNext}
          className={cn(
            'relative z-10 flex items-center justify-center w-9 h-9 rounded-xl',
            'transition-all duration-200 ease-out',
            'text-slate-500 hover:text-slate-700',
            'hover:bg-white/80 hover:shadow-sm',
            'active:scale-95 active:shadow-inner',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1'
          )}
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
      ) : (
        <div className="relative z-10 w-9 h-9" />
      )}
    </div>
  )
}
