/**
 * Hooks core: shared types, validators, assertion policy, and hook wrapper.
 */

export {
  type Result,
  type ValidatorPredicate,
  type ParseResult,
  type HookRuntimeContext,
  type AssertStrategy,
  ok,
  err,
  unwrapOptional,
  unwrapOr,
} from './types'

export { isDevelopment } from './env'

export {
  parseNonEmptyString,
  parseNumberInRange,
  parseUnitInterval,
  parseDateString,
  parseOneOf,
  parseIntegerSafe,
  parseBooleanSafe,
  getTodayDateISO,
} from './validators'

export {
  AssertPolicy,
  assert,
  assertDateRange,
  setAssertStrategy,
  getAssertStrategy,
} from './assert'

export {
  HookWrapper,
  createValidatedHook,
  type ValidatedHookOptions,
} from './createValidatedHook'
