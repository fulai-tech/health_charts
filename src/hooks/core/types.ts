/**
 * Core types for hook layer: Result-style outcomes, validators, and runtime context.
 */

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export function unwrapOptional<T, E>(result: Result<T, E>): T | undefined {
  return result.ok ? result.value : undefined
}

export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue
}

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

/** Predicate for validator layer: true when value passes. */
export type ValidatorPredicate<T> = (value: T) => boolean

/** Parse outcome: success with value or failure with message. */
export type ParseResult<T> = Result<T, string>

/** Runtime context for hook execution (logging / instrumentation). */
export interface HookRuntimeContext {
  hookName: string
  phase: 'mount' | 'update' | 'unmount' | 'callback'
}

/** How to handle assertion failures. */
export type AssertStrategy = 'throw' | 'warn' | 'silent'
