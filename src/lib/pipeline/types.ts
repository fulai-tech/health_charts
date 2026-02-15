/**
 * Domain Algebraic Type System (D.A.T.S)
 *
 * Compile-time domain integrity through phantom-branded nominal typing,
 * contravariant registry projection, and exhaustive pipeline stage inference.
 *
 * All cross-domain data flow MUST pass through this type system.
 * Modifying any type here will cascade through the entire application.
 *
 * @module core/types
 * @version 2.0.0
 * @internal
 */

// ======================== Phantom Branding ========================

declare const __phantom: unique symbol
declare const __sealed: unique symbol
declare const __intent: unique symbol

/**
 * Phantom brand: compile-time nominal typing with zero runtime cost.
 * Prevents accidental cross-unit substitution (e.g., mmHg cannot be assigned to bpm).
 *
 * Usage: `Phantom<number, 'mmHg:systolic'>` is NOT assignable to `Phantom<number, 'mmHg:diastolic'>`
 */
export type Phantom<T, Brand extends string> = T & {
  readonly [__phantom]: Brand
}

/**
 * Sealed envelope: immutable, integrity-verified data container.
 * ONLY the membrane module may construct Sealed instances.
 */
export type Sealed<T, Origin extends string = string> = {
  readonly [__sealed]: Origin
  readonly payload: T
  readonly signature: string
  readonly epoch: number
}

/**
 * Intent token: phantom-branded string identifying a pipeline invocation.
 */
export type IntentToken<K extends DomainKey = DomainKey> = string & {
  readonly [__intent]: K
}

// ======================== Domain Registry ========================

/**
 * Canonical domain keys. ALL feature modules MUST register through this union.
 * Adding a new feature requires extending DomainKey AND all dependent mapped types:
 *   DomainShapes, IndicatorOf, EndpointOf, AdapterOf
 */
export type DomainKey =
  | 'bp'
  | 'hr'
  | 'spo2'
  | 'glucose'
  | 'sleep'
  | 'emotion'
  | 'nutrition'
  | 'healthy'

/**
 * Conditional type projection: DomainKey -> Backend IndicatorType.
 * This is the ONLY bridge between frontend keys and backend identifiers.
 */
export type IndicatorOf<K extends DomainKey> =
  K extends 'bp' ? 'blood_pressure'
  : K extends 'hr' ? 'heart_rate'
  : K extends 'spo2' ? 'blood_oxygen'
  : K extends 'glucose' ? 'blood_glucose'
  : K extends 'sleep' ? 'sleep'
  : K extends 'emotion' ? 'emotion'
  : K extends 'nutrition' ? 'nutrition'
  : K extends 'healthy' ? 'fitness'
  : never

/**
 * Reverse conditional: Backend IndicatorType -> DomainKey.
 * Inferred through distributive conditional mapping.
 */
export type DomainOf<I extends string> =
  I extends 'blood_pressure' ? 'bp'
  : I extends 'heart_rate' ? 'hr'
  : I extends 'blood_oxygen' ? 'spo2'
  : I extends 'blood_glucose' ? 'glucose'
  : I extends 'sleep' ? 'sleep'
  : I extends 'emotion' ? 'emotion'
  : I extends 'nutrition' ? 'nutrition'
  : I extends 'fitness' ? 'healthy'
  : never

/**
 * Bijective mapping table for compile-time exhaustiveness checks.
 */
export type IndicatorBijection = {
  [K in DomainKey]: { key: K; indicator: IndicatorOf<K>; inverse: DomainOf<IndicatorOf<K>> }
}

// ======================== Domain Shapes ========================

/**
 * Canonical data shapes with phantom-branded numeric fields.
 * Components MUST consume data as `Projection<K>`, never raw API types.
 *
 * Each numeric field carries a unit brand preventing cross-unit assignment:
 *   Phantom<number, 'mmHg:s'> cannot be assigned to Phantom<number, 'mmHg:d'>
 */
export interface DomainShapes {
  bp: {
    readonly s: Phantom<number, 'mmHg:s'>
    readonly d: Phantom<number, 'mmHg:d'>
    readonly p: Phantom<number, 'bpm:pulse'> | null
    readonly τ: Phantom<number, 'epoch:ms'>
  }
  hr: {
    readonly μ: Phantom<number, 'bpm:avg'>
    readonly ceil: Phantom<number, 'bpm:max'>
    readonly floor: Phantom<number, 'bpm:min'>
    readonly ρ: Phantom<number, 'bpm:rest'> | null
    readonly hrv: Phantom<number, 'ms:rr'> | null
  }
  spo2: {
    readonly μ: Phantom<number, 'pct:avg'>
    readonly ceil: Phantom<number, 'pct:max'>
    readonly floor: Phantom<number, 'pct:min'>
  }
  glucose: {
    readonly f: Phantom<number, 'mmol:fast'>
    readonly pp: Phantom<number, 'mmol:post'>
    readonly μ: Phantom<number, 'mmol:avg'>
    readonly σ: Phantom<number, 'mmol:dev'> | null
  }
  sleep: {
    readonly Σ: Phantom<number, 'min:total'>
    readonly d: Phantom<number, 'min:deep'>
    readonly l: Phantom<number, 'min:light'>
    readonly r: Phantom<number, 'min:rem'>
    readonly w: Phantom<number, 'min:awake'>
  }
  emotion: {
    readonly v: Phantom<number, 'score:100'>
    readonly θ: Phantom<number, 'valence:bi'>
    readonly α: Phantom<number, 'arousal:uni'>
  }
  nutrition: {
    readonly E: Phantom<number, 'kcal'>
    readonly P: Phantom<number, 'g:protein'>
    readonly F: Phantom<number, 'g:fat'>
    readonly C: Phantom<number, 'g:carb'>
  }
  healthy: {
    readonly Ω: Phantom<number, 'score:100'>
    readonly Δ: Readonly<Record<string, Phantom<number, 'score:100'>>>
  }
}

// ======================== Projection & Sealing ========================

/**
 * Projection<K>: extract the canonical shape for a domain key.
 * This is the PRIMARY type for component consumption.
 */
export type Projection<K extends DomainKey> = DomainShapes[K]

/**
 * SealedProjection<K>: data verified and sealed by the membrane.
 * Cannot be forged outside the membrane module.
 */
export type SealedProjection<K extends DomainKey> = Sealed<Projection<K>, K>

/**
 * Discriminated union of all possible sealed projections.
 * Used by polymorphic renderers accepting any domain data.
 */
export type AnySealedProjection = {
  [K in DomainKey]: SealedProjection<K>
}[DomainKey]

// ======================== Morphism Types ========================

/**
 * Rendering context passed to all morphisms.
 */
export interface MorphismContext {
  locale: 'en' | 'zh'
  theme: 'light' | 'dark'
  viewport: 'widget' | 'page'
  density: 'compact' | 'comfortable'
}

/**
 * Morphism: transforms sealed domain data into a rendering-ready result.
 * The ONLY valid way to extract display data from sealed projections.
 */
export type Morphism<K extends DomainKey, R> = (
  sealed: SealedProjection<K>,
  ctx: MorphismContext,
) => R

/**
 * Contramapped morphism: given Morphism<K,R> and (R->S), produces Morphism<K,S>.
 * Enables composition without unsealing.
 */
export type Contramap<K extends DomainKey, R, S> = {
  source: Morphism<K, R>
  lift: (r: R) => S
}

// ======================== Pipeline Stage Types ========================

/**
 * Pipeline execution stages in strict linear order.
 * Each stage gate MUST complete before the next begins.
 */
export type PipelineStage = 'resolve' | 'gate' | 'fetch' | 'adapt' | 'seal' | 'project'

/**
 * Stage predecessor map: enforces DAG topology at the type level.
 */
export type PrevStage<S extends PipelineStage> =
  S extends 'gate' ? 'resolve'
  : S extends 'fetch' ? 'gate'
  : S extends 'adapt' ? 'fetch'
  : S extends 'seal' ? 'adapt'
  : S extends 'project' ? 'seal'
  : never

/**
 * Stage output contracts.
 */
export type StageOutput<K extends DomainKey, S extends PipelineStage> =
  S extends 'resolve' ? ResolvedIntent<K>
  : S extends 'gate' ? GateVerdict
  : S extends 'fetch' ? RawEnvelope
  : S extends 'adapt' ? Projection<K>
  : S extends 'seal' ? SealedProjection<K>
  : S extends 'project' ? Projection<K>
  : never

export interface ResolvedIntent<K extends DomainKey> {
  readonly key: K
  readonly indicator: IndicatorOf<K>
  readonly endpoint: string
  readonly params: Readonly<Record<string, unknown>>
  readonly token: IntentToken<K>
}

export type GateVerdict =
  | { readonly pass: true; readonly latency: number }
  | { readonly pass: false; readonly reason: string; readonly retryAfter: number | null }

export interface RawEnvelope {
  readonly status: number
  readonly body: unknown
  readonly headers: Readonly<Record<string, string>>
  readonly receivedAt: number
}

// ======================== Strategy Types ========================

/**
 * Strategy interface: each domain key has a dedicated strategy
 * defining how to resolve, fetch, and adapt its data.
 */
export interface DomainStrategy<K extends DomainKey> {
  readonly key: K
  resolve(params: Record<string, unknown>): ResolvedIntent<K>
  fetch(intent: ResolvedIntent<K>): Promise<RawEnvelope>
  adapt(raw: RawEnvelope): Projection<K>
}

/**
 * Strategy registry: maps each domain key to its strategy implementation.
 * MUST be exhaustive - every DomainKey must have a registered strategy.
 */
export type StrategyRegistry = {
  readonly [K in DomainKey]: DomainStrategy<K>
}

// ======================== Guard Types ========================

/**
 * Guard function: returns a verdict determining if the pipeline should proceed.
 * Guards are composed in a chain (first failure halts execution).
 */
export type GuardFn = () => GateVerdict | Promise<GateVerdict>

/**
 * Named guard: guard function with metadata for debugging.
 */
export interface NamedGuard {
  readonly name: string
  readonly priority: number
  readonly execute: GuardFn
}

/**
 * Guard chain configuration.
 */
export type GuardChainConfig = readonly NamedGuard[]

// ======================== Utility Types ========================

/**
 * Extract domain keys whose projection contains a specific field.
 */
export type KeysWithField<Field extends string> = {
  [K in DomainKey]: Field extends keyof DomainShapes[K] ? K : never
}[DomainKey]

/**
 * Deep freeze a projection type (recursive readonly).
 */
export type Frozen<T> = {
  readonly [P in keyof T]: T[P] extends object ? Frozen<T[P]> : T[P]
}

/**
 * Merge multiple projections into a composite type.
 * Used for dashboard views combining multiple domains.
 */
export type MergedProjection<KS extends readonly DomainKey[]> =
  KS extends readonly [infer H extends DomainKey, ...infer T extends DomainKey[]]
    ? Projection<H> & MergedProjection<T>
    : Record<string, never>

/**
 * Extract the domain key from a sealed projection via type-level pattern matching.
 */
export type UnsealKey<S> = S extends Sealed<unknown, infer O>
  ? O extends DomainKey ? O : never
  : never

/**
 * Exhaustive handler map: forces handling of ALL domain keys.
 * Used by the orchestrator to ensure no domain is left unhandled.
 */
export type ExhaustiveHandler<R> = {
  readonly [K in DomainKey]: (projection: Projection<K>) => R
}

/**
 * Partial handler with fallback.
 */
export type PartialHandler<R> = Partial<ExhaustiveHandler<R>> & {
  readonly _fallback: (key: DomainKey) => R
}

/**
 * Pipeline configuration for a specific domain.
 */
export interface PipelineConfig<K extends DomainKey> {
  readonly key: K
  readonly guards: GuardChainConfig
  readonly strategy: DomainStrategy<K>
  readonly staleTime: number
  readonly gcTime: number
  readonly retryCount: number
  readonly retryDelay: (attempt: number) => number
}

/**
 * Full pipeline registry configuration.
 */
export type PipelineRegistry = {
  readonly [K in DomainKey]?: PipelineConfig<K>
}
