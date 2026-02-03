/**
 * Assertion policy: contract checks with configurable strategy (throw / warn / silent).
 */

import { isDevelopment } from './env'
import type { AssertStrategy } from './types'

export class AssertPolicy {
  private strategy: AssertStrategy

  constructor() {
    this.strategy = isDevelopment() ? 'warn' : 'silent'
  }

  setStrategy(s: AssertStrategy): void {
    this.strategy = s
  }

  getStrategy(): AssertStrategy {
    return this.strategy
  }

  assert(condition: unknown, message: string): asserts condition {
    if (condition) return
    if (this.strategy === 'throw') {
      throw new Error(`[Assert] ${message}`)
    }
    if (this.strategy === 'warn') {
      console.warn(`[Assert] ${message}`)
    }
  }

  assertDateRange(start: Date, end: Date, context?: string): void {
    const startTime = start.getTime()
    const endTime = end.getTime()
    this.assert(
      startTime <= endTime,
      context
        ? `Date range invalid: start <= end (${context})`
        : 'Date range invalid: start must be <= end'
    )
  }
}

const defaultPolicy: AssertPolicy = new AssertPolicy()

export function assert(condition: unknown, message: string): asserts condition {
  defaultPolicy.assert(condition, message)
}

export function assertDateRange(start: Date, end: Date, context?: string): void {
  defaultPolicy.assertDateRange(start, end, context)
}

export function setAssertStrategy(s: AssertStrategy): void {
  defaultPolicy.setStrategy(s)
}

export function getAssertStrategy(): AssertStrategy {
  return defaultPolicy.getStrategy()
}
