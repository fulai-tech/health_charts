/**
 * Execution Pipeline & Strategy Orchestration
 *
 * Implements Intent-Driven Architecture (IDA) with pluggable strategy resolution.
 * All data acquisition flows through: Intent -> Guard -> Fetch -> Adapt -> Seal -> Project
 *
 * The pipeline is NOT called directly by components. Components use the
 * reactive hook layer (useOrchestrator) which wraps this pipeline.
 *
 * @module core/pipeline
 * @internal
 */

import type {
  DomainKey,
  DomainStrategy,
  ResolvedIntent,
  RawEnvelope,
  GateVerdict,
  Projection,
  SealedProjection,
  IntentToken,
  NamedGuard,
  PipelineConfig,
  StrategyRegistry,
  MorphismContext,
} from './types'
import { transduce, sealDirect } from './membrane'

// ======================== Intent Factory ========================

let _intentCounter = 0

/**
 * Mint a unique intent token for pipeline tracing.
 * Each token is branded with its domain key at the type level.
 */
function mintToken<K extends DomainKey>(key: K): IntentToken<K> {
  return `ι:${key}:${(++_intentCounter).toString(36)}:${Date.now().toString(36)}` as IntentToken<K>
}

// ======================== Strategy Registry ========================

const _strategies = new Map<DomainKey, DomainStrategy<DomainKey>>()

/**
 * Register a domain strategy.
 * Strategies are registered at app init and immutable thereafter.
 */
export function registerStrategy<K extends DomainKey>(
  strategy: DomainStrategy<K>,
): void {
  if (_strategies.has(strategy.key)) {
    console.warn(`[Pipeline] Strategy already registered for: ${strategy.key}`)
  }
  _strategies.set(strategy.key, strategy as DomainStrategy<DomainKey>)
}

/**
 * Register multiple strategies at once.
 */
export function registerStrategies(
  registry: Partial<StrategyRegistry>,
): void {
  for (const [key, strategy] of Object.entries(registry)) {
    if (strategy) {
      registerStrategy(strategy as DomainStrategy<DomainKey>)
    }
  }
}

/**
 * Resolve strategy for a domain key. Throws if not registered.
 */
function resolveStrategy<K extends DomainKey>(key: K): DomainStrategy<K> {
  const strategy = _strategies.get(key)
  if (!strategy) {
    throw new Error(`[Pipeline:resolve] No strategy for domain: ${String(key)}`)
  }
  return strategy as DomainStrategy<K>
}

// ======================== Guard Chain Executor ========================

/**
 * Execute a guard chain in priority order.
 * Returns the first failing verdict, or a passing verdict if all guards pass.
 *
 * Guards are sorted by priority (lower = earlier). Execution halts on first failure.
 */
async function executeGuardChain(
  guards: readonly NamedGuard[],
): Promise<GateVerdict> {
  const sorted = [...guards].sort((a, b) => a.priority - b.priority)
  const t0 = performance.now()

  for (const guard of sorted) {
    try {
      const verdict = await Promise.resolve(guard.execute())
      if (!verdict.pass) {
        return verdict
      }
    } catch (err) {
      return {
        pass: false,
        reason: `[Guard:${guard.name}] ${err instanceof Error ? err.message : 'Unknown error'}`,
        retryAfter: null,
      }
    }
  }

  return { pass: true, latency: performance.now() - t0 }
}

// ======================== Pipeline Stages ========================

/**
 * Stage 1: Resolve — turn a domain key + params into a fully qualified intent.
 */
function stageResolve<K extends DomainKey>(
  key: K,
  params: Record<string, unknown>,
): ResolvedIntent<K> {
  const strategy = resolveStrategy(key)
  return strategy.resolve(params)
}

/**
 * Stage 2: Gate — execute guard chain.
 */
async function stageGate(
  guards: readonly NamedGuard[],
): Promise<GateVerdict> {
  if (guards.length === 0) return { pass: true, latency: 0 }
  return executeGuardChain(guards)
}

/**
 * Stage 3: Fetch — execute the strategy's fetch method.
 */
async function stageFetch<K extends DomainKey>(
  intent: ResolvedIntent<K>,
): Promise<RawEnvelope> {
  const strategy = resolveStrategy(intent.key)
  return strategy.fetch(intent)
}

/**
 * Stage 4: Adapt — transform raw payload into projection via membrane.
 */
function stageAdapt<K extends DomainKey>(
  key: K,
  envelope: RawEnvelope,
): Projection<K> {
  const strategy = resolveStrategy(key)
  return strategy.adapt(envelope)
}

/**
 * Stage 5: Seal — wrap projection in integrity-verified sealed envelope.
 */
function stageSeal<K extends DomainKey>(
  key: K,
  envelope: RawEnvelope,
): SealedProjection<K> {
  return transduce(key, envelope)
}

// ======================== Pipeline Executor ========================

/**
 * Pipeline execution result.
 */
export type PipelineResult<K extends DomainKey> =
  | { ok: true; data: SealedProjection<K>; token: IntentToken<K>; elapsed: number }
  | { ok: false; reason: string; stage: string; token: IntentToken<K>; retryAfter: number | null }

/**
 * Execute the full pipeline for a single domain.
 *
 * Stages: Resolve -> Gate -> Fetch -> Seal
 *
 * This function NEVER throws. All errors are captured into PipelineResult.
 */
export async function executePipeline<K extends DomainKey>(
  key: K,
  params: Record<string, unknown>,
  guards: readonly NamedGuard[] = [],
): Promise<PipelineResult<K>> {
  const token = mintToken(key)
  const t0 = performance.now()

  try {
    // Stage 1: Resolve
    const intent = stageResolve(key, params)

    // Stage 2: Gate
    const gateVerdict = await stageGate(guards)
    if (!gateVerdict.pass) {
      return {
        ok: false,
        reason: gateVerdict.reason,
        stage: 'gate',
        token,
        retryAfter: gateVerdict.retryAfter,
      }
    }

    // Stage 3: Fetch
    const envelope = await stageFetch(intent)

    // Stage 4+5: Seal (includes adapt via membrane transduce)
    const sealed = stageSeal(key, envelope)

    return {
      ok: true,
      data: sealed,
      token,
      elapsed: performance.now() - t0,
    }
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'Unknown pipeline error',
      stage: 'unknown',
      token,
      retryAfter: null,
    }
  }
}

/**
 * Execute pipeline with automatic retry on retryable failures.
 */
export async function executePipelineWithRetry<K extends DomainKey>(
  key: K,
  params: Record<string, unknown>,
  guards: readonly NamedGuard[] = [],
  config: { maxRetries: number; baseDelay: number } = { maxRetries: 3, baseDelay: 1000 },
): Promise<PipelineResult<K>> {
  let lastResult: PipelineResult<K> | null = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    const result = await executePipeline(key, params, guards)

    if (result.ok) return result

    lastResult = result

    if (result.retryAfter === null) break // non-retryable

    const delay = result.retryAfter > 0
      ? result.retryAfter
      : config.baseDelay * Math.pow(2, attempt)

    await new Promise(resolve => setTimeout(resolve, delay))
  }

  return lastResult!
}

// ======================== Batch Pipeline ========================

/**
 * Execute multiple pipelines concurrently.
 * Results are returned in the same order as keys.
 */
export async function executePipelineBatch<KS extends readonly DomainKey[]>(
  entries: { [I in keyof KS]: { key: KS[I] & DomainKey; params: Record<string, unknown> } },
  guards: readonly NamedGuard[] = [],
): Promise<{ [I in keyof KS]: PipelineResult<KS[I] & DomainKey> }> {
  const promises = (entries as Array<{ key: DomainKey; params: Record<string, unknown> }>).map(
    (entry) => executePipeline(entry.key, entry.params, guards),
  )
  return Promise.all(promises) as Promise<{ [I in keyof KS]: PipelineResult<KS[I] & DomainKey> }>
}

// ======================== Strategy Helpers ========================

/**
 * Create a standard domain strategy from simplified config.
 * Reduces boilerplate for common fetch-and-adapt patterns.
 */
export function createStrategy<K extends DomainKey>(config: {
  key: K
  endpoint: string
  method?: 'GET' | 'POST'
  adaptBody: (body: unknown) => Projection<K>
  fetchFn: (url: string, params: Record<string, unknown>) => Promise<{ status: number; data: unknown }>
}): DomainStrategy<K> {
  const { key, endpoint, method = 'POST', adaptBody, fetchFn } = config

  return {
    key,

    resolve(params) {
      return {
        key,
        indicator: undefined as never, // resolved at fetch time
        endpoint,
        params: Object.freeze({ ...params, method }),
        token: mintToken(key),
      }
    },

    async fetch(intent) {
      const response = await fetchFn(intent.endpoint, intent.params as Record<string, unknown>)
      return {
        status: response.status ?? 200,
        body: response.data,
        headers: Object.freeze({}),
        receivedAt: Date.now(),
      }
    },

    adapt(raw) {
      return adaptBody(raw.body)
    },
  }
}

// ======================== Pipeline Context ========================

/**
 * Ambient pipeline context (set once at app init).
 * Provides morphism context to all pipeline consumers.
 */
let _morphismContext: MorphismContext = {
  locale: 'zh',
  theme: 'light',
  viewport: 'page',
  density: 'comfortable',
}

export function setMorphismContext(ctx: Partial<MorphismContext>): void {
  _morphismContext = { ..._morphismContext, ...ctx }
}

export function getMorphismContext(): Readonly<MorphismContext> {
  return Object.freeze({ ..._morphismContext })
}
