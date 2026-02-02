/**
 * 统一的 URL Query 参数 Hook
 * 
 * 专注于 URL 参数解析，不处理状态应用逻辑
 * 状态应用由 initPage 统一处理
 */

import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'

/**
 * 解析当前 URL 上所有 query 参数的键值对（只取每个 key 的第一个值）
 * 
 * @example
 * const params = useQueryParams()
 * const rid = params.rid
 * const date = params.date
 * const theme = params.theme
 */
export function useQueryParams(): Record<string, string> {
  const [searchParams] = useSearchParams()
  return useMemo(() => {
    const record: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      record[key] = value
    })
    return record
  }, [searchParams])
}

/**
 * 获取特定的 URL 参数值
 */
export function useUrlParam(key: string): string | undefined {
  const params = useQueryParams()
  return params[key]
}

/**
 * 获取多个 URL 参数值
 */
export function useUrlParams<T extends readonly string[]>(
  keys: T
): Record<T[number], string | undefined> {
  const params = useQueryParams()
  return useMemo(() => {
    const result: Record<string, string | undefined> = {}
    keys.forEach((key) => {
      result[key] = params[key]
    })
    return result as Record<T[number], string | undefined>
  }, [params, keys])
}
