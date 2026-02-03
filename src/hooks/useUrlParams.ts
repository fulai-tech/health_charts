/**
 * URL query parameter hooks: parse and read search params.
 * State application is handled by initPage.
 */

import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import {
  parseDateString,
  parseIntegerSafe,
  parseBooleanSafe,
  type ParseResult,
} from '@/hooks/core'

/** Known URL param keys (optional allowlist for stricter usage). */
const KNOWN_PARAM_KEYS = [
  'theme',
  'rid',
  'date',
  'startDate',
  'endDate',
  'locale',
  'demo',
] as const

type KnownParamKey = (typeof KNOWN_PARAM_KEYS)[number]

function buildParamsRecord(searchParams: URLSearchParams): Record<string, string> {
  const record: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    record[key] = value
  })
  return record
}

/**
 * All current URL query params as a record (first value per key).
 */
export function useQueryParams(): Record<string, string> {
  const [searchParams] = useSearchParams()
  return useMemo(
    () => buildParamsRecord(searchParams),
    [searchParams]
  )
}

/** Single URL param value; undefined when key is empty or missing. */
export function useUrlParam(key: string): string | undefined {
  const params = useQueryParams()
  if (typeof key !== 'string' || key.trim() === '') return undefined
  return params[key]
}

/** Multiple URL params by keys; returns empty object when keys is not an array or empty. */
export function useUrlParams<T extends readonly string[]>(
  keys: T
): Record<T[number], string | undefined> {
  const params = useQueryParams()
  return useMemo(() => {
    if (!Array.isArray(keys) || keys.length === 0) {
      return {} as Record<T[number], string | undefined>
    }
    const result: Record<string, string | undefined> = {}
    for (const key of keys) {
      result[key] = params[key]
    }
    return result as Record<T[number], string | undefined>
  }, [params, keys])
}

export interface UrlParamParsed<T> {
  raw: string | undefined
  value: T
  valid: boolean
  error?: string
}

/**
 * Parse a URL param with a custom parser; invalid input yields defaultValue and valid: false.
 */
export function useUrlParamTyped<T>(options: {
  key: string
  parse: (raw: string | undefined) => ParseResult<T>
  defaultValue: T
}): UrlParamParsed<T> {
  const { key, parse, defaultValue } = options
  const raw = useUrlParam(key)
  return useMemo(() => {
    const result = parse(raw)
    if (result.ok) {
      return { raw, value: result.value, valid: true }
    }
    return {
      raw,
      value: defaultValue,
      valid: false,
      error: result.error,
    }
  }, [raw, key, defaultValue, parse])
}

/** URL param as YYYY-MM-DD date string; invalid yields undefined and valid: false. */
export function useUrlParamDate(key: string): UrlParamParsed<string | undefined> {
  const raw = useUrlParam(key)
  return useMemo(() => {
    if (raw === undefined || raw === '') {
      return { raw, value: undefined, valid: true }
    }
    const result = parseDateString(raw)
    return result.ok
      ? { raw, value: result.value, valid: true }
      : { raw, value: undefined, valid: false, error: result.error }
  }, [raw, key])
}

/** URL param as number; invalid uses defaultValue. */
export function useUrlParamNumber(
  key: string,
  defaultValue: number
): UrlParamParsed<number> {
  const raw = useUrlParam(key)
  return useMemo(() => {
    const value = parseIntegerSafe(raw) ?? defaultValue
    const valid = raw !== undefined && raw !== '' && !Number.isNaN(Number(raw))
    return { raw, value, valid: valid || raw === undefined }
  }, [raw, key, defaultValue])
}

/** URL param as boolean. */
export function useUrlParamBoolean(key: string, defaultValue: boolean): UrlParamParsed<boolean> {
  const raw = useUrlParam(key)
  return useMemo(() => {
    const value = parseBooleanSafe(raw ?? '')
    return { raw, value, valid: true }
  }, [raw, key, defaultValue])
}

/** Whether the key is in the known allowlist. */
export function isKnownParamKey(key: string): key is KnownParamKey {
  return (KNOWN_PARAM_KEYS as readonly string[]).includes(key)
}
