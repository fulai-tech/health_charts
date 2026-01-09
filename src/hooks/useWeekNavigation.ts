import { useState, useMemo, useCallback } from 'react'
import {
  formatDateToAPI,
  formatDateForDisplay,
  getCurrentWeekDateRange,
  getPreviousWeekRange,
  getNextWeekRange,
  canNavigateToNextWeek
} from '@/lib/dateUtils'

/**
 * Date range with Date objects
 */
export interface DateRange {
  start: Date
  end: Date
}

/**
 * API-formatted date range (YYYY-MM-DD strings)
 */
export interface ApiDateRange {
  startDate: string
  endDate: string
}

/**
 * Display-formatted date range (YYYY/MM/DD strings)
 */
export interface DisplayDateRange {
  start: string
  end: string
}

/**
 * Return type of useWeekNavigation hook
 */
export interface UseWeekNavigationReturn {
  /** Current date range with Date objects */
  dateRange: DateRange
  /** Date range formatted for API requests */
  apiDateRange: ApiDateRange
  /** Date range formatted for UI display */
  displayDateRange: DisplayDateRange
  /** Whether navigation to next week is allowed (not in future) */
  canGoNext: boolean
  /** Navigate to previous week */
  goToPreviousWeek: () => void
  /** Navigate to next week (no-op if canGoNext is false) */
  goToNextWeek: () => void
}

/**
 * useWeekNavigation - Unified week navigation logic for all details pages
 * 
 * Encapsulates:
 * - Week-aligned date range state management
 * - Date formatting for API and display
 * - Navigation boundary checks (can't navigate to future)
 * 
 * @example
 * const { 
 *   apiDateRange, 
 *   displayDateRange, 
 *   canGoNext, 
 *   goToPreviousWeek, 
 *   goToNextWeek 
 * } = useWeekNavigation()
 * 
 * // Use in DateRangePicker
 * <DateRangePicker
 *   startDate={displayDateRange.start}
 *   endDate={displayDateRange.end}
 *   onPrevious={goToPreviousWeek}
 *   onNext={goToNextWeek}
 *   disableNext={!canGoNext}
 * />
 */
export function useWeekNavigation(): UseWeekNavigationReturn {
  // Date range state - week-aligned (Monday to Sunday)
  const [dateRange, setDateRange] = useState<DateRange>(() => getCurrentWeekDateRange())

  // Check if we can navigate to next week
  const canGoNext = useMemo(
    () => canNavigateToNextWeek(dateRange.start),
    [dateRange.start]
  )

  // Format dates for API
  const apiDateRange = useMemo<ApiDateRange>(
    () => ({
      startDate: formatDateToAPI(dateRange.start),
      endDate: formatDateToAPI(dateRange.end),
    }),
    [dateRange]
  )

  // Format dates for display
  const displayDateRange = useMemo<DisplayDateRange>(
    () => ({
      start: formatDateForDisplay(dateRange.start),
      end: formatDateForDisplay(dateRange.end),
    }),
    [dateRange]
  )

  // Navigate to previous week
  const goToPreviousWeek = useCallback(() => {
    setDateRange((prev) => getPreviousWeekRange(prev.start))
  }, [])

  // Navigate to next week (with boundary check)
  const goToNextWeek = useCallback(() => {
    setDateRange((prev) => {
      if (!canNavigateToNextWeek(prev.start)) return prev
      const next = getNextWeekRange(prev.start)
      return next || prev
    })
  }, [])

  return {
    dateRange,
    apiDateRange,
    displayDateRange,
    canGoNext,
    goToPreviousWeek,
    goToNextWeek,
  }
}

