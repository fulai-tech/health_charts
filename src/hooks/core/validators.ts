/**
 * Shared validators and parsers for URL params, options, and dates.
 */

import type { ParseResult } from './types'
import { ok, err } from './types'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function parseNonEmptyString(value: unknown): ParseResult<string> {
  if (typeof value !== 'string') return err('expected string')
  const trimmed = value.trim()
  if (trimmed.length === 0) return err('expected non-empty string')
  return ok(trimmed)
}

export function parseNumberInRange(
  value: unknown,
  min: number,
  max: number
): ParseResult<number> {
  const n = Number(value)
  if (Number.isNaN(n)) return err('expected number')
  if (n < min || n > max) return err(`expected number in [${min}, ${max}]`)
  return ok(n)
}

export function parseUnitInterval(value: unknown): ParseResult<number> {
  return parseNumberInRange(value, 0, 1)
}

export function parseDateString(value: unknown): ParseResult<string> {
  if (typeof value !== 'string') return err('expected date string')
  const trimmed = value.trim()
  if (!ISO_DATE_REGEX.test(trimmed)) return err('expected YYYY-MM-DD format')
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return err('invalid date')
  return ok(trimmed)
}

export function parseOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): ParseResult<T> {
  if (typeof value !== 'string') return err('expected string')
  const v = value.trim() as T
  if (!allowed.includes(v)) return err(`expected one of: ${allowed.join(', ')}`)
  return ok(v)
}

export function parseIntegerSafe(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined
  const n = Number(value)
  if (!Number.isInteger(n) || Number.isNaN(n)) return undefined
  return n
}

export function parseBooleanSafe(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0' || value === '') return false
  return Boolean(value)
}

/** Today's date in YYYY-MM-DD; fallback on error. */
export function getTodayDateISO(): string {
  try {
    return new Date().toISOString().split('T')[0]
  } catch {
    return '1970-01-01'
  }
}
