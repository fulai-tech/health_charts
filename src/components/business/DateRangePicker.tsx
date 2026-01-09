import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MUTED = '#918D8A'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onPrevious?: () => void
  onNext?: () => void
  /** Whether the next button should be disabled (e.g., reached current date) */
  disableNext?: boolean
  className?: string
}

/**
 * DateRangePicker - Displays date range with navigation arrows
 */
export function DateRangePicker({
  startDate,
  endDate,
  onPrevious,
  onNext,
  disableNext = false,
  className,
}: DateRangePickerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4 py-3 px-4 bg-white rounded-full shadow-sm border border-slate-100',
        className
      )}
    >
      <button
        onClick={onPrevious}
        className="p-1 transition-colors"
        style={{ color: ICON_MUTED }}
        aria-label="Previous period"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="text-sm font-medium text-slate-700">
        {startDate} ---- {endDate}
      </span>
      
      {!disableNext ? (
        <button
          onClick={onNext}
          className="p-1 transition-colors"
          style={{ color: ICON_MUTED }}
          aria-label="Next period"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-7 h-7" /> 
      )}
    </div>
  )
}
