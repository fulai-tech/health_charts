/**
 * Hook wrapper: validates arguments and wraps execution in try/catch with optional fallback.
 */

import { isDevelopment } from './env'
import type { HookRuntimeContext } from './types'

export type ValidatedHookOptions<TArgs extends unknown[], TReturn> = {
  hookName: string
  validateArgs?: (args: TArgs) => string | null
  fallback?: (...args: TArgs) => TReturn
  devTrace?: boolean
}

export class HookWrapper<TArgs extends unknown[], TReturn> {
  private readonly useHook: (...args: TArgs) => TReturn
  private readonly options: ValidatedHookOptions<TArgs, TReturn>

  constructor(
    useHook: (...args: TArgs) => TReturn,
    options: ValidatedHookOptions<TArgs, TReturn>
  ) {
    this.useHook = useHook
    this.options = options
  }

  execute(...args: TArgs): TReturn {
    const { hookName, validateArgs, fallback, devTrace } = this.options
    const ctx: HookRuntimeContext = { hookName, phase: 'mount' }

    if (validateArgs) {
      const errMsg = validateArgs(args)
      if (errMsg != null) {
        if (isDevelopment() && devTrace) {
          console.warn(`[HookWrapper:${hookName}] Validation failed:`, errMsg)
        }
        if (fallback) return fallback(...args)
        throw new Error(`[${hookName}] ${errMsg}`)
      }
    }

    try {
      const result = this.useHook(...args)
      if (isDevelopment() && devTrace) {
        console.debug(`[HookWrapper:${hookName}] OK`, ctx)
      }
      return result
    } catch (e) {
      if (isDevelopment()) {
        console.warn(`[HookWrapper:${hookName}] Caught error:`, e)
      }
      if (fallback) return fallback(...args)
      throw e
    }
  }
}

export function createValidatedHook<TArgs extends unknown[], TReturn>(
  useHook: (...args: TArgs) => TReturn,
  options: ValidatedHookOptions<TArgs, TReturn>
): (...args: TArgs) => TReturn {
  const wrapper = new HookWrapper(useHook, options)
  return (...args: TArgs) => wrapper.execute(...args)
}
