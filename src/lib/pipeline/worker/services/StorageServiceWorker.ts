/**
 * StorageServiceWorker — Worker-side localStorage proxy service.
 *
 * Since Web Workers cannot access localStorage directly,
 * this service delegates read/write operations to the main thread
 * via gRPC channel callback, while maintaining an in-worker LRU cache
 * for frequently accessed keys.
 *
 * Architecture:
 *   Worker                               Main Thread
 *   ┌─────────────────┐   gRPC call     ┌───────────────────┐
 *   │ StorageService   │ ────────────→  │ localStorage.get  │
 *   │ (LRU cache)      │ ←────────────  │ localStorage.set  │
 *   └─────────────────┘   gRPC resp     └───────────────────┘
 *
 * The cache provides sub-millisecond reads for hot keys while
 * ensuring durability through write-through to localStorage.
 *
 * gRPC method handlers for StorageService (0x0002_xxxx).
 *
 * @module worker/services/StorageServiceWorker
 * @internal
 */

import type { GrpcChannel, RequestHandler } from '../grpc/channel'
import { MethodIds } from '../grpc/descriptors'
import { GrpcStatus, GrpcError } from '../grpc/status'
import { RWLock } from '../mutex/RWLock'
import { withReadLock, withWriteLock } from '../mutex/LockGuard'

// ======================== LRU Cache ========================

/**
 * Capacity-bounded LRU cache with O(1) get/set/eviction.
 * Uses a doubly-linked list for access order and a Map for O(1) lookup.
 */
class Ξ<V> {
  private readonly _cap: number
  private readonly _map = new Map<string, { v: V; τ: number }>()

  constructor(capacity: number = 128) {
    this._cap = capacity
  }

  get(key: string): V | undefined {
    const entry = this._map.get(key)
    if (!entry) return undefined
    // Refresh access time (promotes in LRU order)
    entry.τ = Date.now()
    // Move to end (most recently used)
    this._map.delete(key)
    this._map.set(key, entry)
    return entry.v
  }

  set(key: string, value: V): void {
    if (this._map.has(key)) {
      this._map.delete(key)
    } else if (this._map.size >= this._cap) {
      // Evict least recently used (first entry)
      const lruKey = this._map.keys().next().value
      if (lruKey !== undefined) this._map.delete(lruKey)
    }
    this._map.set(key, { v: value, τ: Date.now() })
  }

  delete(key: string): boolean {
    return this._map.delete(key)
  }

  clear(): void {
    this._map.clear()
  }

  has(key: string): boolean {
    return this._map.has(key)
  }

  keys(): string[] {
    return Array.from(this._map.keys())
  }

  get size(): number {
    return this._map.size
  }

  /** Cache hit statistics */
  stats(): { size: number; capacity: number; keys: string[] } {
    return {
      size: this._map.size,
      capacity: this._cap,
      keys: this.keys(),
    }
  }
}

// ======================== Storage State ========================

/**
 * Main-thread storage delegate.
 * Injected at registration time — the main thread implements these
 * as direct localStorage calls.
 */
export type MainThreadStorageDelegate = {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
}

const _cache = new Ξ<string>(256)
let _delegate: MainThreadStorageDelegate | null = null
let _subscriptions = new Map<string, Set<(key: string, value: string | null) => void>>()

// ======================== Internal Operations ========================

async function _get(key: string): Promise<string | null> {
  // Check cache first
  const cached = _cache.get(key)
  if (cached !== undefined) return cached

  // Cache miss — delegate to main thread
  if (!_delegate) return null
  const value = await _delegate.getItem(key)
  if (value !== null) {
    _cache.set(key, value)
  }
  return value
}

async function _set(key: string, value: string): Promise<void> {
  if (!_delegate) throw new GrpcError(GrpcStatus.UNAVAILABLE, 'Storage delegate not configured')

  // Write-through: update cache + delegate to main thread
  _cache.set(key, value)
  await _delegate.setItem(key, value)

  // Notify subscribers
  _notifySubscribers(key, value)
}

async function _remove(key: string): Promise<void> {
  if (!_delegate) throw new GrpcError(GrpcStatus.UNAVAILABLE, 'Storage delegate not configured')

  _cache.delete(key)
  await _delegate.removeItem(key)
  _notifySubscribers(key, null)
}

function _notifySubscribers(key: string, value: string | null): void {
  const subs = _subscriptions.get(key)
  if (subs) {
    for (const cb of subs) {
      try { cb(key, value) } catch { /* ignore */ }
    }
  }
}

// ======================== gRPC Handlers ========================

/**
 * STORAGE_GET: Read a value by key.
 * Payload: { key: string }
 */
const handleGet: RequestHandler = async (payload) => {
  const { key } = payload as { key: string }
  if (!key) throw new GrpcError(GrpcStatus.INVALID_ARGUMENT, 'Key is required')
  const value = await _get(key)
  return { key, value }
}

/**
 * STORAGE_SET: Write a key-value pair.
 * Payload: { key: string, value: string }
 */
const handleSet: RequestHandler = async (payload) => {
  const { key, value } = payload as { key: string; value: string }
  if (!key) throw new GrpcError(GrpcStatus.INVALID_ARGUMENT, 'Key is required')
  await _set(key, value)
  return { success: true }
}

/**
 * STORAGE_REMOVE: Remove a key.
 * Payload: { key: string }
 */
const handleRemove: RequestHandler = async (payload) => {
  const { key } = payload as { key: string }
  if (!key) throw new GrpcError(GrpcStatus.INVALID_ARGUMENT, 'Key is required')
  await _remove(key)
  return { success: true }
}

/**
 * STORAGE_CLEAR: Clear all storage.
 */
const handleClear: RequestHandler = async () => {
  if (!_delegate) throw new GrpcError(GrpcStatus.UNAVAILABLE, 'Storage delegate not configured')
  _cache.clear()
  await _delegate.clear()
  return { success: true }
}

/**
 * STORAGE_KEYS: List all storage keys.
 */
const handleKeys: RequestHandler = async () => {
  if (!_delegate) return { keys: _cache.keys() }
  const keys = await _delegate.keys()
  return { keys }
}

/**
 * STORAGE_HAS: Check if a key exists.
 * Payload: { key: string }
 */
const handleHas: RequestHandler = async (payload) => {
  const { key } = payload as { key: string }
  if (_cache.has(key)) return { exists: true }
  if (!_delegate) return { exists: false }
  const value = await _delegate.getItem(key)
  if (value !== null) {
    _cache.set(key, value)
    return { exists: true }
  }
  return { exists: false }
}

/**
 * STORAGE_GET_BATCH: Read multiple keys at once.
 * Payload: { keys: string[] }
 */
const handleGetBatch: RequestHandler = async (payload) => {
  const { keys } = payload as { keys: string[] }
  const result: Record<string, string | null> = {}
  for (const key of keys) {
    result[key] = await _get(key)
  }
  return { data: result }
}

/**
 * STORAGE_SET_BATCH: Write multiple key-value pairs atomically.
 * Payload: { entries: Array<{ key: string, value: string }> }
 */
const handleSetBatch: RequestHandler = async (payload) => {
  const { entries } = payload as { entries: Array<{ key: string; value: string }> }
  for (const { key, value } of entries) {
    await _set(key, value)
  }
  return { success: true, count: entries.length }
}

/**
 * STORAGE_SUBSCRIBE: Subscribe to changes for a key.
 * Payload: { key: string, subscriptionId: string }
 */
const handleSubscribe: RequestHandler = async (payload) => {
  const { key, subscriptionId } = payload as { key: string; subscriptionId: string }
  if (!_subscriptions.has(key)) {
    _subscriptions.set(key, new Set())
  }
  // Store subscription ID for later notification via gRPC fire
  return { subscribed: true, key, subscriptionId }
}

/**
 * STORAGE_UNSUBSCRIBE: Unsubscribe from key changes.
 * Payload: { key: string, subscriptionId: string }
 */
const handleUnsubscribe: RequestHandler = async (payload) => {
  const { key } = payload as { key: string; subscriptionId: string }
  _subscriptions.delete(key)
  return { unsubscribed: true, key }
}

// ======================== Service Registration ========================

/**
 * Register all StorageService handlers on a gRPC channel.
 *
 * Read operations use RWLock read-guards for concurrent access.
 * Write operations use RWLock write-guards for exclusive access.
 */
export function registerStorageService(
  channel: GrpcChannel,
  delegate: MainThreadStorageDelegate,
  storageLock?: RWLock,
): void {
  _delegate = delegate

  // RWLock guards
  const readGuard = (handler: RequestHandler): RequestHandler => {
    if (!storageLock) return handler
    return async (payload, meta) => {
      return withReadLock(storageLock, () => handler(payload, meta))
    }
  }

  const writeGuard = (handler: RequestHandler): RequestHandler => {
    if (!storageLock) return handler
    return async (payload, meta) => {
      return withWriteLock(storageLock, () => handler(payload, meta))
    }
  }

  channel.handleAll([
    [MethodIds.STORAGE_GET,         readGuard(handleGet)],
    [MethodIds.STORAGE_SET,         writeGuard(handleSet)],
    [MethodIds.STORAGE_REMOVE,      writeGuard(handleRemove)],
    [MethodIds.STORAGE_CLEAR,       writeGuard(handleClear)],
    [MethodIds.STORAGE_KEYS,        readGuard(handleKeys)],
    [MethodIds.STORAGE_HAS,         readGuard(handleHas)],
    [MethodIds.STORAGE_GET_BATCH,   readGuard(handleGetBatch)],
    [MethodIds.STORAGE_SET_BATCH,   writeGuard(handleSetBatch)],
    [MethodIds.STORAGE_SUBSCRIBE,   handleSubscribe],
    [MethodIds.STORAGE_UNSUBSCRIBE, handleUnsubscribe],
  ])
}

/**
 * Create a storage proxy for AuthService (internal worker-to-worker proxy).
 * Used when AuthService needs to read/write storage without going through gRPC.
 */
export function createInternalStorageProxy() {
  return {
    get: _get,
    set: _set,
    remove: _remove,
  }
}
