/// <reference lib="webworker" />

/**
 * Worker Kernel — Isolated execution environment for core operations.
 *
 * This Web Worker runs in a separate thread, hosting:
 *   - AuthService: login, token management, credential storage
 *   - StorageService: localStorage proxy with LRU cache
 *   - PrefetchService: background data prefetching with Φ-cache
 *
 * Communication: binary gRPC frames via postMessage (Transferable ArrayBuffers).
 * Synchronization: SharedArrayBuffer + Atomics mutex/rwlock primitives.
 *
 * Boot sequence:
 *   1. Main thread creates Worker
 *   2. Main thread sends init message with SharedArrayBuffer manifest
 *   3. Worker initializes services and mutex instances
 *   4. Worker sends WORKER_READY frame
 *   5. Bidirectional gRPC communication begins
 *
 * @module worker/kernel
 * @internal
 */

import { GrpcChannel } from './grpc/channel'
import { MethodIds } from './grpc/descriptors'
import { GrpcStatus, GrpcError } from './grpc/status'
import { encodeFrame, FrameFlags } from './grpc/protocol'
import { SharedMutex, setThreadId, getThreadId } from './mutex/SharedMutex'
import { RWLock } from './mutex/RWLock'
import {
  registerAuthService,
  configureAuthService,
  initAuthState,
  registerStorageService,
  createInternalStorageProxy,
  registerPrefetchService,
  type MainThreadStorageDelegate,
} from './services'

// ======================== Worker Context ========================

declare const self: DedicatedWorkerGlobalScope

// Unique worker thread ID
setThreadId((Math.random() * 0x7FFFFFFF) >>> 0 | 0x40000000)

// ======================== State ========================

let _channel: GrpcChannel | null = null
let _authMutex: SharedMutex | null = null
let _storageLock: RWLock | null = null
let _prefetchMutex: SharedMutex | null = null
let _isReady = false
let _bootTime = Date.now()

// ======================== Storage Delegate ========================

/**
 * Main-thread storage delegate.
 *
 * Since localStorage is inaccessible from Workers, storage operations
 * are delegated back to the main thread via gRPC reverse calls.
 *
 * This creates a circular dependency:
 *   Worker.StorageService → Main.localStorage (via channel.invoke)
 *
 * The main thread must set up a handler for these reverse storage calls.
 */
function createStorageDelegate(channel: GrpcChannel): MainThreadStorageDelegate {
  return {
    async getItem(key: string): Promise<string | null> {
      const result = await channel.invoke(MethodIds.STORAGE_GET, { key }) as {
        key: string
        value: string | null
      }
      return result?.value ?? null
    },

    async setItem(key: string, value: string): Promise<void> {
      await channel.invoke(MethodIds.STORAGE_SET, { key, value })
    },

    async removeItem(key: string): Promise<void> {
      await channel.invoke(MethodIds.STORAGE_REMOVE, { key })
    },

    async clear(): Promise<void> {
      await channel.invoke(MethodIds.STORAGE_CLEAR, {})
    },

    async keys(): Promise<string[]> {
      const result = await channel.invoke(MethodIds.STORAGE_KEYS, {}) as {
        keys: string[]
      }
      return result?.keys ?? []
    },
  }
}

// ======================== System Handlers ========================

function registerSystemHandlers(channel: GrpcChannel): void {
  // Keepalive / heartbeat
  channel.handle(MethodIds.KEEPALIVE, async () => {
    return {
      alive: true,
      uptime: Date.now() - _bootTime,
      threadId: getThreadId(),
      memoryUsage: typeof performance !== 'undefined'
        ? (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? null
        : null,
    }
  })

  // Diagnostic ping
  channel.handle(MethodIds.DIAGNOSTIC_PING, async (payload) => {
    const { timestamp } = payload as { timestamp: number }
    return {
      pong: true,
      echoTimestamp: timestamp,
      serverTimestamp: Date.now(),
      latencyMs: Date.now() - (timestamp || Date.now()),
    }
  })

  // Diagnostic metrics
  channel.handle(MethodIds.DIAGNOSTIC_METRICS, async () => {
    return {
      uptime: Date.now() - _bootTime,
      threadId: getThreadId(),
      channelMetrics: _channel?.metrics ?? null,
      mutexState: {
        auth: _authMutex?.snapshot() ?? null,
        storage: _storageLock ? {
          state: _storageLock.state,
          readers: _storageLock.readerCount,
        } : null,
        prefetch: _prefetchMutex?.snapshot() ?? null,
      },
    }
  })

  // Shutdown
  channel.handle(MethodIds.WORKER_SHUTDOWN, async () => {
    _isReady = false
    // Graceful shutdown: close channel, then self.close()
    setTimeout(() => {
      channel.close()
      self.close()
    }, 100)
    return { shuttingDown: true }
  })
}

// ======================== Boot Sequence ========================

/**
 * Initialize the Worker kernel.
 *
 * Called on receipt of the init message from the main thread.
 * Sets up mutex instances, gRPC channel, and service handlers.
 */
async function boot(initData: {
  mutexBuffers: {
    auth?: SharedArrayBuffer
    storage?: SharedArrayBuffer
    prefetch?: SharedArrayBuffer
  }
  config: {
    apiBaseUrl?: string
    apiAuthPath?: string
  }
}): Promise<void> {
  console.log(`[Kernel] Booting worker thread (tid: ${getThreadId()})`)

  // Initialize gRPC channel
  _channel = new GrpcChannel(self)

  // Reconstruct mutex instances from SharedArrayBuffers
  if (initData.mutexBuffers.auth) {
    _authMutex = new SharedMutex(initData.mutexBuffers.auth, 'auth')
  }
  if (initData.mutexBuffers.storage) {
    _storageLock = new RWLock(initData.mutexBuffers.storage, 'storage')
  }
  if (initData.mutexBuffers.prefetch) {
    _prefetchMutex = new SharedMutex(initData.mutexBuffers.prefetch, 'prefetch')
  }

  // Create storage delegate (proxies to main thread)
  const storageDelegate = createStorageDelegate(_channel)

  // Register system handlers
  registerSystemHandlers(_channel)

  // Register StorageService (with RWLock)
  registerStorageService(_channel, storageDelegate, _storageLock ?? undefined)

  // Create internal storage proxy for AuthService
  const internalStorage = createInternalStorageProxy()

  // Register AuthService (with mutex)
  registerAuthService(_channel, internalStorage, _authMutex ?? undefined)

  // Configure AuthService
  if (initData.config.apiBaseUrl || initData.config.apiAuthPath) {
    configureAuthService({
      baseUrl: initData.config.apiBaseUrl ?? '',
      authPath: initData.config.apiAuthPath ?? '',
    })
  }

  // Initialize auth state from storage
  await initAuthState(internalStorage)

  // Register PrefetchService (with mutex)
  registerPrefetchService(_channel, _prefetchMutex ?? undefined)

  _isReady = true
  _bootTime = Date.now()

  // Send WORKER_READY frame
  const readyFrame = encodeFrame(
    MethodIds.WORKER_READY,
    0, // correlation 0 = broadcast
    FrameFlags.RESPONSE,
    {
      ready: true,
      threadId: getThreadId(),
      bootTime: _bootTime,
      services: ['Auth', 'Storage', 'Prefetch'],
      mutexes: {
        auth: !!_authMutex,
        storage: !!_storageLock,
        prefetch: !!_prefetchMutex,
      },
    },
  )
  self.postMessage(readyFrame, [readyFrame])

  console.log(`[Kernel] Worker ready (tid: ${getThreadId()}, boot: ${Date.now() - _bootTime}ms)`)
}

// ======================== Message Router ========================

/**
 * Root message handler.
 *
 * Routes init messages to boot(), and gRPC frames to the channel.
 * The channel handles its own message routing via addEventListener.
 */
self.addEventListener('message', (event: MessageEvent) => {
  const data = event.data

  // Init message (plain object, not ArrayBuffer)
  if (data && typeof data === 'object' && !(data instanceof ArrayBuffer) && data.__init) {
    boot(data).catch((err) => {
      console.error('[Kernel] Boot failed:', err)
      // Send error frame
      const errFrame = encodeFrame(
        MethodIds.WORKER_READY,
        0,
        FrameFlags.ERROR,
        {
          code: GrpcStatus.INTERNAL,
          message: err instanceof Error ? err.message : 'Boot failed',
        },
      )
      self.postMessage(errFrame, [errFrame])
    })
    return
  }

  // ArrayBuffer frames are handled by the GrpcChannel's own listener
  // (set up in the constructor). No additional routing needed here.
})

// ======================== Error Boundary ========================

self.addEventListener('error', (event: ErrorEvent) => {
  console.error('[Kernel] Unhandled error:', event.message)
})

self.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  console.error('[Kernel] Unhandled promise rejection:', event.reason)
})
