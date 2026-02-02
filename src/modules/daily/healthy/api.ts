/**
 * Healthy Daily API helpers.
 * Actual request is made by @/services/api/dailyService (fetchHealthyDaily).
 * This file only exports data helpers; no duplicate fetch here.
 */

/**
 * Helper to check if a value represents "no data" from backend
 * Distinguishes between:
 * - null/undefined: truly no data
 * - 0: valid data point
 * - empty array: no items but valid response
 */
export function isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined) {
        return true
    }
    if (Array.isArray(value) && value.length === 0) {
        return true
    }
    if (typeof value === 'string' && value.trim() === '') {
        return true
    }
    return false
}

/**
 * Check if indicator has any meaningful data
 */
export function hasIndicatorData(indicator: {
    latest: unknown
    avg: unknown
    chart: unknown[]
}): boolean {
    return (
        !isEmptyValue(indicator.latest) ||
        !isEmptyValue(indicator.avg) ||
        (Array.isArray(indicator.chart) && indicator.chart.length > 0)
    )
}
