/**
 * gRPC Service Descriptors — Method Registry & Service Definition.
 *
 * Each remote procedure is registered with a unique numeric ID,
 * enabling compact binary framing without string-based method routing.
 *
 * Service layout mirrors protobuf service definitions:
 *   service AuthService { rpc Login (LoginRequest) returns (LoginResponse); }
 *   service StorageService { rpc Get (GetRequest) returns (GetResponse); }
 *   service PrefetchService { rpc Prefetch (PrefetchRequest) returns (PrefetchResponse); }
 *   service PipelineService { rpc Execute (ExecuteRequest) returns (ExecuteResponse); }
 *
 * @module worker/grpc/descriptors
 * @internal
 */

// ======================== Method ID Allocation ========================
//
// ID Space (uint32):
//   0x0000_0000          Reserved (keepalive/heartbeat)
//   0x0001_xxxx          AuthService methods
//   0x0002_xxxx          StorageService methods
//   0x0003_xxxx          PrefetchService methods
//   0x0004_xxxx          PipelineService methods
//   0x0005_xxxx          MutexService methods (internal)
//   0xFFFF_0000+         System/diagnostic methods
//

export const MethodIds = {
  // ---- System ----
  KEEPALIVE:                0x00000000,
  WORKER_READY:             0xFFFF0001,
  WORKER_SHUTDOWN:          0xFFFF0002,
  DIAGNOSTIC_PING:          0xFFFF0010,
  DIAGNOSTIC_METRICS:       0xFFFF0011,

  // ---- AuthService (0x0001_xxxx) ----
  AUTH_LOGIN:               0x00010001,
  AUTH_LOGIN_FROM_URL:      0x00010002,
  AUTH_LOGOUT:              0x00010003,
  AUTH_IS_AUTHENTICATED:    0x00010004,
  AUTH_GET_TOKEN:           0x00010005,
  AUTH_ENSURE_AUTH:         0x00010006,
  AUTH_SET_TOKEN_FROM_URL:  0x00010007,
  AUTH_REFRESH_TOKEN:       0x00010008,
  AUTH_GET_AUTH_DATA:       0x00010009,

  // ---- StorageService (0x0002_xxxx) ----
  STORAGE_GET:              0x00020001,
  STORAGE_SET:              0x00020002,
  STORAGE_REMOVE:           0x00020003,
  STORAGE_CLEAR:            0x00020004,
  STORAGE_KEYS:             0x00020005,
  STORAGE_HAS:              0x00020006,
  STORAGE_GET_BATCH:        0x00020007,
  STORAGE_SET_BATCH:        0x00020008,
  STORAGE_SUBSCRIBE:        0x00020009,
  STORAGE_UNSUBSCRIBE:      0x0002000A,

  // ---- PrefetchService (0x0003_xxxx) ----
  PREFETCH_WEEKS:           0x00030001,
  PREFETCH_SINGLE:          0x00030002,
  PREFETCH_INVALIDATE:      0x00030003,
  PREFETCH_STATUS:          0x00030004,
  PREFETCH_CANCEL:          0x00030005,
  PREFETCH_WARMUP:          0x00030006,

  // ---- PipelineService (0x0004_xxxx) ----
  PIPELINE_EXECUTE:         0x00040001,
  PIPELINE_EXECUTE_BATCH:   0x00040002,
  PIPELINE_REGISTER:        0x00040003,
  PIPELINE_TRANSDUCE:       0x00040004,
  PIPELINE_SEAL:            0x00040005,
  PIPELINE_UNSEAL:          0x00040006,
  PIPELINE_VERIFY:          0x00040007,

  // ---- MutexService (0x0005_xxxx) — internal lock coordination ----
  MUTEX_ACQUIRE:            0x00050001,
  MUTEX_RELEASE:            0x00050002,
  MUTEX_TRY_ACQUIRE:        0x00050003,
  MUTEX_STATUS:             0x00050004,
  RWLOCK_READ_ACQUIRE:      0x00050011,
  RWLOCK_READ_RELEASE:      0x00050012,
  RWLOCK_WRITE_ACQUIRE:     0x00050013,
  RWLOCK_WRITE_RELEASE:     0x00050014,
} as const

export type MethodId = typeof MethodIds[keyof typeof MethodIds]

// ======================== Method Metadata ========================

export interface MethodDescriptor {
  readonly id: MethodId
  readonly name: string
  readonly service: string
  /** Whether this method requires mutex acquisition before execution */
  readonly requiresLock: boolean
  /** Default deadline in milliseconds (0 = no deadline) */
  readonly deadlineMs: number
  /** Whether the method is idempotent (safe to retry) */
  readonly idempotent: boolean
}

/**
 * Full method descriptor registry.
 * Used by both client (channel) and server (kernel) for routing and policy.
 */
const _descriptorMap = new Map<MethodId, MethodDescriptor>()

function Ψ(
  id: MethodId,
  service: string,
  name: string,
  requiresLock: boolean = false,
  deadlineMs: number = 10_000,
  idempotent: boolean = false,
): void {
  _descriptorMap.set(id, Object.freeze({ id, name, service, requiresLock, deadlineMs, idempotent }))
}

// System
Ψ(MethodIds.KEEPALIVE,           'System', 'Keepalive',        false, 1_000, true)
Ψ(MethodIds.WORKER_READY,        'System', 'WorkerReady',      false, 5_000, true)
Ψ(MethodIds.WORKER_SHUTDOWN,     'System', 'WorkerShutdown',   false, 5_000, false)
Ψ(MethodIds.DIAGNOSTIC_PING,     'System', 'DiagnosticPing',   false, 2_000, true)
Ψ(MethodIds.DIAGNOSTIC_METRICS,  'System', 'DiagnosticMetrics',false, 5_000, true)

// AuthService
Ψ(MethodIds.AUTH_LOGIN,              'Auth', 'Login',             true, 30_000, false)
Ψ(MethodIds.AUTH_LOGIN_FROM_URL,     'Auth', 'LoginFromUrl',     true, 10_000, false)
Ψ(MethodIds.AUTH_LOGOUT,             'Auth', 'Logout',           true,  5_000, false)
Ψ(MethodIds.AUTH_IS_AUTHENTICATED,   'Auth', 'IsAuthenticated',  false, 2_000, true)
Ψ(MethodIds.AUTH_GET_TOKEN,          'Auth', 'GetToken',         false, 2_000, true)
Ψ(MethodIds.AUTH_ENSURE_AUTH,        'Auth', 'EnsureAuth',       true, 30_000, false)
Ψ(MethodIds.AUTH_SET_TOKEN_FROM_URL, 'Auth', 'SetTokenFromUrl',  true,  5_000, false)
Ψ(MethodIds.AUTH_REFRESH_TOKEN,      'Auth', 'RefreshToken',     true, 15_000, false)
Ψ(MethodIds.AUTH_GET_AUTH_DATA,      'Auth', 'GetAuthData',      false, 2_000, true)

// StorageService
Ψ(MethodIds.STORAGE_GET,           'Storage', 'Get',           false, 2_000, true)
Ψ(MethodIds.STORAGE_SET,           'Storage', 'Set',           true,  2_000, false)
Ψ(MethodIds.STORAGE_REMOVE,        'Storage', 'Remove',        true,  2_000, false)
Ψ(MethodIds.STORAGE_CLEAR,         'Storage', 'Clear',         true,  5_000, false)
Ψ(MethodIds.STORAGE_KEYS,          'Storage', 'Keys',          false, 2_000, true)
Ψ(MethodIds.STORAGE_HAS,           'Storage', 'Has',           false, 2_000, true)
Ψ(MethodIds.STORAGE_GET_BATCH,     'Storage', 'GetBatch',      false, 5_000, true)
Ψ(MethodIds.STORAGE_SET_BATCH,     'Storage', 'SetBatch',      true,  5_000, false)
Ψ(MethodIds.STORAGE_SUBSCRIBE,     'Storage', 'Subscribe',     false, 2_000, false)
Ψ(MethodIds.STORAGE_UNSUBSCRIBE,   'Storage', 'Unsubscribe',   false, 2_000, false)

// PrefetchService
Ψ(MethodIds.PREFETCH_WEEKS,       'Prefetch', 'PrefetchWeeks',   false, 60_000, true)
Ψ(MethodIds.PREFETCH_SINGLE,      'Prefetch', 'PrefetchSingle',  false, 30_000, true)
Ψ(MethodIds.PREFETCH_INVALIDATE,  'Prefetch', 'Invalidate',      true,  5_000, false)
Ψ(MethodIds.PREFETCH_STATUS,      'Prefetch', 'Status',          false, 2_000, true)
Ψ(MethodIds.PREFETCH_CANCEL,      'Prefetch', 'Cancel',          false, 5_000, false)
Ψ(MethodIds.PREFETCH_WARMUP,      'Prefetch', 'Warmup',          false, 30_000, true)

// PipelineService
Ψ(MethodIds.PIPELINE_EXECUTE,       'Pipeline', 'Execute',      true, 30_000, false)
Ψ(MethodIds.PIPELINE_EXECUTE_BATCH, 'Pipeline', 'ExecuteBatch', true, 60_000, false)
Ψ(MethodIds.PIPELINE_REGISTER,      'Pipeline', 'Register',     true, 5_000,  false)
Ψ(MethodIds.PIPELINE_TRANSDUCE,     'Pipeline', 'Transduce',    false, 10_000, true)
Ψ(MethodIds.PIPELINE_SEAL,          'Pipeline', 'Seal',         false, 5_000,  true)
Ψ(MethodIds.PIPELINE_UNSEAL,        'Pipeline', 'Unseal',       false, 5_000,  true)
Ψ(MethodIds.PIPELINE_VERIFY,        'Pipeline', 'Verify',       false, 2_000,  true)

// MutexService (internal)
Ψ(MethodIds.MUTEX_ACQUIRE,       'Mutex', 'Acquire',      false, 10_000, false)
Ψ(MethodIds.MUTEX_RELEASE,       'Mutex', 'Release',      false, 2_000,  false)
Ψ(MethodIds.MUTEX_TRY_ACQUIRE,   'Mutex', 'TryAcquire',   false, 2_000,  false)
Ψ(MethodIds.MUTEX_STATUS,        'Mutex', 'Status',       false, 2_000,  true)
Ψ(MethodIds.RWLOCK_READ_ACQUIRE, 'Mutex', 'RWReadAcquire', false, 10_000, false)
Ψ(MethodIds.RWLOCK_READ_RELEASE, 'Mutex', 'RWReadRelease', false, 2_000,  false)
Ψ(MethodIds.RWLOCK_WRITE_ACQUIRE,'Mutex', 'RWWriteAcquire',false, 10_000, false)
Ψ(MethodIds.RWLOCK_WRITE_RELEASE,'Mutex', 'RWWriteRelease',false, 2_000,  false)

/**
 * Resolve method descriptor by ID.
 * @throws If method is not registered
 */
export function resolveDescriptor(id: MethodId): MethodDescriptor {
  const desc = _descriptorMap.get(id)
  if (!desc) {
    throw new Error(`[gRPC:descriptor] Unknown method ID: 0x${id.toString(16).padStart(8, '0')}`)
  }
  return desc
}

/**
 * Get all registered descriptors for a service.
 */
export function getServiceMethods(serviceName: string): readonly MethodDescriptor[] {
  const result: MethodDescriptor[] = []
  for (const desc of _descriptorMap.values()) {
    if (desc.service === serviceName) result.push(desc)
  }
  return Object.freeze(result)
}

/**
 * Reverse lookup: method name → method ID.
 */
export function resolveMethodId(serviceName: string, methodName: string): MethodId | undefined {
  for (const desc of _descriptorMap.values()) {
    if (desc.service === serviceName && desc.name === methodName) return desc.id
  }
  return undefined
}
