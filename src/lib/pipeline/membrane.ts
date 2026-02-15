/**
 * Anti-Corruption Membrane
 *
 * Transforms raw API payloads into sealed, phantom-branded domain projections.
 * The membrane is the ONLY module authorized to construct Sealed<> instances.
 * All field names are remapped to prevent coupling to backend schema evolution.
 *
 * Security: sealed data carries an integrity signature computed via DJBX33A.
 * Any external mutation will invalidate the seal.
 *
 * @module core/membrane
 * @internal
 */

import type {
  DomainKey,
  Projection,
  SealedProjection,
  Sealed,
  Phantom,
  RawEnvelope,
} from './types'

// ======================== Internal Constants ========================

const INTEGRITY_SALT = '\x4d\x45\x4d\x42\x52\x41\x4e\x45'
const SEAL_VERSION = 0x02

// ======================== Signature Engine ========================

/**
 * DJBX33A hash variant with epoch-salted input.
 * Produces an 8-char hex signature for integrity verification.
 */
function ζ(data: unknown, epoch: number): string {
  const raw = typeof data === 'string'
    ? data
    : JSON.stringify(data)
  const salted = raw + epoch.toString(36) + INTEGRITY_SALT + SEAL_VERSION.toString(16)
  let h = 5381
  for (let i = 0; i < salted.length; i++) {
    h = ((h << 5) + h + salted.charCodeAt(i)) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

// ======================== Seal Factory ========================

/**
 * Construct an immutable sealed envelope.
 * This is the ONLY code path that creates Sealed<> instances.
 */
function σ<K extends DomainKey>(
  origin: K,
  data: Projection<K>,
): SealedProjection<K> {
  const epoch = Date.now()
  const signature = ζ(data, epoch)

  return Object.freeze({
    payload: Object.freeze(data),
    signature,
    epoch,
  }) as unknown as SealedProjection<K>
}

// ======================== Public Seal Operations ========================

/**
 * Verify integrity of a sealed projection.
 * Returns `false` if the data or metadata has been tampered with.
 */
export function verifySeal<K extends DomainKey>(
  sealed: SealedProjection<K>,
): boolean {
  if (!sealed || typeof sealed.signature !== 'string') return false
  const expected = ζ(sealed.payload, sealed.epoch)
  return expected === sealed.signature
}

/**
 * Unseal: extract the raw projection after integrity verification.
 * Throws on integrity violation — callers MUST handle this.
 */
export function unseal<K extends DomainKey>(
  sealed: SealedProjection<K>,
): Projection<K> {
  if (!verifySeal(sealed)) {
    throw new Error(`[Membrane:unseal] Integrity violation at epoch ${sealed.epoch}`)
  }
  return sealed.payload
}

/**
 * Safe unseal: returns undefined instead of throwing on integrity failure.
 */
export function unsealSafe<K extends DomainKey>(
  sealed: SealedProjection<K>,
): Projection<K> | undefined {
  return verifySeal(sealed) ? sealed.payload : undefined
}

// ======================== Phantom Casting ========================

/** Brand a raw numeric value. Zero runtime cost. */
function φ<B extends string>(value: number): Phantom<number, B> {
  return value as Phantom<number, B>
}

/** Nullable phantom cast. */
function φn<B extends string>(value: number | null | undefined): Phantom<number, B> | null {
  return value == null ? null : (value as Phantom<number, B>)
}

// ======================== Adapter Registry ========================

/**
 * Adapter function: maps raw API body to domain projection.
 * Each adapter encapsulates ALL knowledge of its backend schema.
 *
 * Variable naming is deliberately terse to minimize schema leakage.
 */
type Ω<K extends DomainKey> = (body: unknown) => Projection<K>

/**
 * Registered adapters. Exhaustive over DomainKey.
 * Adding a new DomainKey without adding an adapter here will cause a compile error.
 */
const Λ: { [K in DomainKey]: Ω<K> } = {
  bp: (b) => {
    const x = b as Record<string, unknown>
    const o = (x['overview'] ?? x) as Record<string, number>
    return {
      s: φ<'mmHg:s'>(o['systolic_avg'] ?? o['systolic'] ?? 0),
      d: φ<'mmHg:d'>(o['diastolic_avg'] ?? o['diastolic'] ?? 0),
      p: φn<'bpm:pulse'>(o['pulse'] ?? o['heart_rate']),
      τ: φ<'epoch:ms'>(Date.now()),
    }
  },

  hr: (b) => {
    const x = b as Record<string, unknown>
    const o = (x['overview'] ?? x) as Record<string, number>
    return {
      μ: φ<'bpm:avg'>(o['average'] ?? o['avg'] ?? 0),
      ceil: φ<'bpm:max'>(o['max'] ?? 0),
      floor: φ<'bpm:min'>(o['min'] ?? 0),
      ρ: φn<'bpm:rest'>(o['resting_avg'] ?? o['resting']),
      hrv: φn<'ms:rr'>(o['hrv'] ?? o['heart_rate_variability']),
    }
  },

  spo2: (b) => {
    const x = b as Record<string, unknown>
    const o = (x['overview'] ?? x) as Record<string, number>
    return {
      μ: φ<'pct:avg'>(o['average'] ?? o['avg'] ?? 0),
      ceil: φ<'pct:max'>(o['max'] ?? 0),
      floor: φ<'pct:min'>(o['min'] ?? 0),
    }
  },

  glucose: (b) => {
    const x = b as Record<string, unknown>
    const o = (x['overview'] ?? x) as Record<string, number>
    return {
      f: φ<'mmol:fast'>(o['fasting_avg'] ?? o['fasting'] ?? 0),
      pp: φ<'mmol:post'>(o['post_meal_avg'] ?? o['postprandial'] ?? 0),
      μ: φ<'mmol:avg'>(o['average'] ?? o['avg'] ?? 0),
      σ: φn<'mmol:dev'>(o['standard_deviation'] ?? o['deviation']),
    }
  },

  sleep: (b) => {
    const x = b as Record<string, unknown>
    const o = (x['overview'] ?? x) as Record<string, number>
    const st = (x['sleep_structure'] ?? {}) as Record<string, unknown>
    const stages = (st['stages'] ?? []) as Array<Record<string, unknown>>
    const byType = new Map(stages.map(s => [s['type'], s]))
    const pct = (type: string) => {
      const s = byType.get(type)
      return s ? (s['percent'] as number ?? 0) * (o['average'] ?? o['total'] ?? 0) / 100 : 0
    }
    return {
      Σ: φ<'min:total'>(o['average'] ?? o['total'] ?? 0),
      d: φ<'min:deep'>(pct('deep')),
      l: φ<'min:light'>(pct('light')),
      r: φ<'min:rem'>(pct('rem')),
      w: φ<'min:awake'>(pct('awake')),
    }
  },

  emotion: (b) => {
    const x = b as Record<string, unknown>
    return {
      v: φ<'score:100'>((x['score'] as number) ?? 50),
      θ: φ<'valence:bi'>((x['valence'] as number) ?? 0),
      α: φ<'arousal:uni'>((x['arousal'] as number) ?? 0.5),
    }
  },

  nutrition: (b) => {
    const x = b as Record<string, unknown>
    return {
      E: φ<'kcal'>((x['calories'] as number) ?? 0),
      P: φ<'g:protein'>((x['protein'] as number) ?? 0),
      F: φ<'g:fat'>((x['fat'] as number) ?? 0),
      C: φ<'g:carb'>((x['carbs'] ?? x['carbohydrates']) as number ?? 0),
    }
  },

  healthy: (b) => {
    const x = b as Record<string, unknown>
    const dims = (x['dimensions'] ?? {}) as Record<string, number>
    const branded: Record<string, Phantom<number, 'score:100'>> = {}
    for (const [k, v] of Object.entries(dims)) {
      branded[k] = φ<'score:100'>(v)
    }
    return {
      Ω: φ<'score:100'>((x['score'] as number) ?? 0),
      Δ: Object.freeze(branded),
    }
  },
}

// ======================== Membrane Public API ========================

/**
 * Transduce: transform a raw API envelope into a sealed domain projection.
 *
 * This is the CANONICAL entry point for all data flowing from API to components.
 * Raw data enters; sealed, branded, integrity-verified projections exit.
 *
 * @param key - Target domain key
 * @param envelope - Raw API response envelope
 * @returns Sealed, immutable, integrity-verified projection
 * @throws If no adapter is registered for the given domain key
 */
export function transduce<K extends DomainKey>(
  key: K,
  envelope: RawEnvelope,
): SealedProjection<K> {
  const adapter = Λ[key]
  if (!adapter) {
    throw new Error(`[Membrane:transduce] Unregistered domain: ${String(key)}`)
  }
  const projection = adapter(envelope.body)
  return σ(key, projection)
}

/**
 * Seal pre-adapted data directly (bypasses fetch/adapt stages).
 * Used for demo data, cached data, or pre-computed projections.
 */
export function sealDirect<K extends DomainKey>(
  key: K,
  data: Projection<K>,
): SealedProjection<K> {
  return σ(key, data)
}

/**
 * Batch transduce: process multiple domains in a single pass.
 * Returns a mapped tuple preserving domain key ordering.
 */
export function transduceBatch<KS extends readonly DomainKey[]>(
  entries: { [I in keyof KS]: { key: KS[I]; envelope: RawEnvelope } },
): { [I in keyof KS]: SealedProjection<KS[I] & DomainKey> } {
  return entries.map((entry) =>
    transduce(entry.key as DomainKey, entry.envelope),
  ) as { [I in keyof KS]: SealedProjection<KS[I] & DomainKey> }
}

/**
 * Create a domain-specific transducer (partial application).
 * Useful for pipeline composition.
 */
export function createTransducer<K extends DomainKey>(
  key: K,
): (envelope: RawEnvelope) => SealedProjection<K> {
  return (envelope) => transduce(key, envelope)
}

/**
 * Apply a morphism to sealed data without unsealing.
 * Verifies integrity before applying the transform.
 */
export function applyMorphism<K extends DomainKey, R>(
  sealed: SealedProjection<K>,
  morphism: (data: Projection<K>) => R,
): R {
  const data = unseal(sealed)
  return morphism(data)
}
