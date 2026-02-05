/**
 * Week-Aligned Date Utilities
 * 
 * Provides functions to calculate date ranges aligned to calendar weeks (Monday-Sunday).
 * Used for weekly report pages to ensure data matches X-axis labels.
 */

/**
 * Format Date to YYYY-MM-DD string for API
 */
export function formatDateToAPI(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Format Date for display (YYYY/MM/DD)
 */
export function formatDateForDisplay(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}/${m}/${d}`
}

/**
 * Get the Monday and Sunday dates of the week containing the given date.
 * 
 * @param date - Any date within the week
 * @returns Object with monday and sunday Date objects
 * 
 * @example
 * // If date is Thursday Jan 9, 2026
 * getWeekBounds(date) // { monday: Jan 6, sunday: Jan 12 }
 */
export function getWeekBounds(date: Date): { monday: Date; sunday: Date } {
    // Create a new date at midnight local time to avoid timezone issues
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    const d = new Date(year, month, day, 0, 0, 0, 0)

    // Get day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayOfWeek = d.getDay()

    // Calculate offset to Monday (if Sunday, go back 6 days; otherwise go back dayOfWeek-1)
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    const monday = new Date(d)
    monday.setDate(d.getDate() + mondayOffset)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    return { monday, sunday }
}

/**
 * Get the current week's date range for API requests.
 * 
 * - start: This week's Monday
 * - end: This week's Sunday (full natural week)
 * 
 * This ensures weekly charts request data for the full natural week.
 * 
 * @example
 * // If today is Thursday Jan 9, 2026
 * getCurrentWeekDateRange() // { start: Jan 6 (Mon), end: Jan 12 (Sun) }
 */
export function getCurrentWeekDateRange(): { start: Date; end: Date } {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)

    const { monday, sunday } = getWeekBounds(today)

    return {
        start: monday,
        end: sunday
    }
}

/**
 * Get the previous week's date range given the current week's start date (Monday).
 * 
 * @param currentMonday - The Monday of the current displayed week
 * @returns Previous week's full range (Monday to Sunday)
 * 
 * @example
 * // currentMonday is Jan 6, 2026
 * getPreviousWeekRange(currentMonday) // { start: Dec 30, end: Jan 5 }
 */
export function getPreviousWeekRange(currentMonday: Date): { start: Date; end: Date } {
    // Create a date 7 days before currentMonday to get previous week's Monday
    const year = currentMonday.getFullYear()
    const month = currentMonday.getMonth()
    const day = currentMonday.getDate()

    const prevMonday = new Date(year, month, day - 7, 0, 0, 0, 0)
    const prevSunday = new Date(year, month, day - 1, 0, 0, 0, 0)

    return {
        start: prevMonday,
        end: prevSunday
    }
}

/**
 * Get the next week's date range given the current week's start date (Monday).
 * Returns null if the next week's Monday is in the future (can't navigate forward).
 * 
 * @param currentMonday - The Monday of the current displayed week
 * @returns Next week's range (Monday to Sunday), or null if not allowed
 * 
 * @example
 * // currentMonday is Dec 30, 2025; today is Jan 9, 2026
 * getNextWeekRange(currentMonday) // { start: Jan 6, end: Jan 12 }
 */
export function getNextWeekRange(currentMonday: Date): { start: Date; end: Date } | null {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)

    const year = currentMonday.getFullYear()
    const month = currentMonday.getMonth()
    const day = currentMonday.getDate()

    const nextMonday = new Date(year, month, day + 7, 0, 0, 0, 0)

    // If next Monday is after today, can't navigate forward
    if (nextMonday > today) {
        return null
    }

    const nextSunday = new Date(year, month, day + 13, 0, 0, 0, 0)

    return {
        start: nextMonday,
        end: nextSunday
    }
}

/**
 * Check if we can navigate to the next week.
 * 
 * @param currentMonday - The Monday of the currently displayed week
 * @returns true if next week navigation is allowed
 */
export function canNavigateToNextWeek(currentMonday: Date): boolean {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)

    const { sunday } = getWeekBounds(currentMonday)

    // Can only navigate forward if the current week's Sunday has passed
    return sunday < today
}

/**
 * Weekday keys in order (Monday to Sunday)
 */
export const WEEKDAY_KEYS = [
    'weekdays.mon',
    'weekdays.tue',
    'weekdays.wed',
    'weekdays.thu',
    'weekdays.fri',
    'weekdays.sat',
    'weekdays.sun',
] as const

/**
 * Map weekday labels (Chinese and English) to translation keys
 */
export const WEEKDAY_LABEL_MAP: Record<string, string> = {
    // Chinese labels
    周一: 'weekdays.mon',
    周二: 'weekdays.tue',
    周三: 'weekdays.wed',
    周四: 'weekdays.thu',
    周五: 'weekdays.fri',
    周六: 'weekdays.sat',
    周日: 'weekdays.sun',
    // English labels (common variations)
    Mon: 'weekdays.mon',
    Tue: 'weekdays.tue',
    Wed: 'weekdays.wed',
    Thu: 'weekdays.thu',
    Fri: 'weekdays.fri',
    Sat: 'weekdays.sat',
    Sun: 'weekdays.sun',
    // Additional English variations
    Monday: 'weekdays.mon',
    Tuesday: 'weekdays.tue',
    Wednesday: 'weekdays.wed',
    Thursday: 'weekdays.thu',
    Friday: 'weekdays.fri',
    Saturday: 'weekdays.sat',
    Sunday: 'weekdays.sun',
}

/**
 * Get weekday index from weekday key (0 = Monday, 6 = Sunday)
 */
export function getWeekdayIndex(weekdayKey: string): number {
    return WEEKDAY_KEYS.indexOf(weekdayKey as typeof WEEKDAY_KEYS[number])
}

/**
 * Get the current weekday index (0 = Monday, 6 = Sunday).
 * This is useful for determining how many days of the week have data.
 */
export function getCurrentWeekdayIndex(): number {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ...
    // Convert to 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1
}

/**
 * Ensure chart data array has entries for all 7 weekdays (Monday-Sunday).
 * Missing days will be filled with the result of createEmptyEntry function.
 * 
 * @param data - Array of data points with weekdayKey property
 * @param createEmptyEntry - Function to create an empty entry for a weekday
 * @returns Array with exactly 7 entries, one for each weekday
 * 
 * @example
 * const filledData = ensureFullWeekData(partialData, (weekdayKey) => ({
 *   weekdayKey,
 *   value: null,
 *   date: new Date(),
 * }))
 */
export function ensureFullWeekData<T extends { weekdayKey: string }>(
    data: T[],
    createEmptyEntry: (weekdayKey: string, index: number) => T
): T[] {
    // Create a map of existing data by weekdayKey
    const dataMap = new Map<string, T>()
    for (const item of data) {
        dataMap.set(item.weekdayKey, item)
    }

    // Build result array with all 7 weekdays
    return WEEKDAY_KEYS.map((weekdayKey, index) => {
        const existingData = dataMap.get(weekdayKey)
        if (existingData) {
            return existingData
        }
        return createEmptyEntry(weekdayKey, index)
    })
}

/**
 * Get the Monday date for a given week offset from the current week's Monday.
 * 
 * @param currentMonday - The Monday of the current week
 * @param dayOffset - Day offset within the week (0 = Monday, 6 = Sunday)
 * @returns Date object for that day
 */
export function getDateForWeekday(currentMonday: Date, dayOffset: number): Date {
    const date = new Date(currentMonday)
    date.setDate(currentMonday.getDate() + dayOffset)
    return date
}
