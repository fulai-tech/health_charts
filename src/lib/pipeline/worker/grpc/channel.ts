/**
 * gRPC Channel — Bidirectional communication channel over Worker postMessage.
 *
 * Implements request-response correlation, deadline enforcement,
 * interceptor pipeline, and automatic retry for transient failures.
 *
 * Architecture:
 *   MainThread                          Worker Thread
 *   ┌─────────────┐  postMessage(buf)  ┌──────────────┐
 *   │ GrpcChannel  │ ──────────────→  │ GrpcChannel   │
 *   │  (client)    │ ←──────────────  │  (server)     │
 *   └─────────────┘  postMessage(buf)  └──────────────┘
 *
 * Both sides instantiate a GrpcChannel. The client side calls invoke(),
 * the server side calls onRequest() handlers.
 *
 * @module worker/grpc/channel
 * @internal
 */

import {
  encodeFrame,
  decodeFrame,
  FrameFlags,
  nextCorrelationId,
  type GrpcFrame,
} from './protocol'
import { resolveDescriptor, type MethodId } from './descriptors'
import { GrpcStatus, GrpcError, type GrpcStatusCode, isRetryable } from './status'

// ======================== Types ========================

export type RequestHandler = (
  payload: unknown,
  metadata: CallMetadata,
) => unknown | Promise<unknown>

export interface CallMetadata {
  readonly correlationId: number
  readonly methodId: MethodId
  readonly deadline: number
  readonly flags: number
}

export interface CallOptions {
  /** Override default deadline (ms). */
  deadlineMs?: number
  /** Additional flags to set on the frame. */
  extraFlags?: number
  /** Number of retries for retryable errors. */
  retryCount?: number
  /** Base delay for exponential backoff (ms). */
  retryBaseDelay?: number
}

/**
 * Interceptor: wraps each outgoing call for cross-cutting concerns.
 * Returns the (possibly modified) result.
 */
export type ChannelInterceptor = (
  methodId: MethodId,
  payload: unknown,
  next: (payload: unknown) => Promise<unknown>,
) => Promise<unknown>

// ======================== Pending Call ========================

interface PendingCall {
  resolve: (value: unknown) => void
  reject: (error: GrpcError) => void
  timer: ReturnType<typeof setTimeout> | null
  methodId: MethodId
  createdAt: number
}

// ======================== Channel ========================

/**
 * Accepted transport endpoints for GrpcChannel.
 * Covers Worker, MessagePort, window (typeof globalThis), and DedicatedWorkerGlobalScope.
 */
export type GrpcTransport = MessagePort | Worker | typeof globalThis | {
  postMessage(message: unknown, transfer: Transferable[]): void
  postMessage(message: unknown, options?: StructuredSerializeOptions): void
  addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void
}

/**
 * GrpcChannel: bidirectional gRPC-over-postMessage transport.
 *
 * Client mode: call invoke() to send requests, receive responses via correlation.
 * Server mode: call handle() to register handlers, dispatch incoming requests.
 */
export class GrpcChannel {
  private _port: GrpcTransport
  private _pending = new Map<number, PendingCall>()
  private _handlers = new Map<number, RequestHandler>()
  private _interceptors: ChannelInterceptor[] = []
  private _isAlive = true
  private _messageCount = 0
  private _errorCount = 0
  private _latencySum = 0

  constructor(port: GrpcTransport) {
    this._port = port
    this._setupListener()
  }

  // ======================== Client API ========================

  /**
   * Invoke a remote procedure.
   *
   * Encodes the request, sends it via postMessage, and returns a Promise
   * that resolves when the correlated response arrives.
   *
   * @param methodId - Numeric method ID from descriptors
   * @param payload - Request payload (will be TBON-encoded)
   * @param options - Call options (deadline, retry, flags)
   * @returns Response payload
   * @throws GrpcError on timeout, transport error, or server error
   */
  async invoke(
    methodId: MethodId,
    payload: unknown,
    options: CallOptions = {},
  ): Promise<unknown> {
    if (!this._isAlive) {
      throw new GrpcError(GrpcStatus.UNAVAILABLE, 'Channel is closed')
    }

    // Apply interceptors
    const chain = this._buildInterceptorChain(methodId, options)
    return chain(payload)
  }

  /**
   * Send a fire-and-forget message (no response expected).
   */
  fire(methodId: MethodId, payload: unknown, extraFlags: number = 0): void {
    if (!this._isAlive) return
    const correlationId = nextCorrelationId()
    const flags = FrameFlags.REQUEST | extraFlags
    const buffer = encodeFrame(methodId, correlationId, flags, payload)
    this._postMessage(buffer)
  }

  // ======================== Server API ========================

  /**
   * Register a handler for a specific method.
   */
  handle(methodId: MethodId, handler: RequestHandler): void {
    this._handlers.set(methodId, handler)
  }

  /**
   * Register multiple handlers at once.
   */
  handleAll(handlers: Array<[MethodId, RequestHandler]>): void {
    for (const [id, handler] of handlers) {
      this._handlers.set(id, handler)
    }
  }

  // ======================== Interceptors ========================

  /**
   * Add an interceptor to the chain.
   * Interceptors run in LIFO order (last added = outermost).
   */
  addInterceptor(interceptor: ChannelInterceptor): void {
    this._interceptors.push(interceptor)
  }

  // ======================== Lifecycle ========================

  /**
   * Close the channel and reject all pending calls.
   */
  close(): void {
    this._isAlive = false
    for (const [, pending] of this._pending) {
      if (pending.timer) clearTimeout(pending.timer)
      pending.reject(new GrpcError(GrpcStatus.CANCELLED, 'Channel closed'))
    }
    this._pending.clear()
  }

  /**
   * Diagnostic metrics.
   */
  get metrics() {
    return {
      pending: this._pending.size,
      handlers: this._handlers.size,
      messageCount: this._messageCount,
      errorCount: this._errorCount,
      avgLatencyMs: this._messageCount > 0
        ? Math.round(this._latencySum / this._messageCount)
        : 0,
    }
  }

  // ======================== Internal ========================

  private _setupListener(): void {
    const handler = (event: MessageEvent) => {
      const data = event.data
      if (!(data instanceof ArrayBuffer)) return
      this._onFrame(data)
    }

    if ('onmessage' in this._port) {
      ;(this._port as Worker).addEventListener('message', handler)
    } else {
      ;(this._port as typeof globalThis).addEventListener('message', handler)
    }
  }

  private _postMessage(buffer: ArrayBuffer): void {
    const port = this._port
    if ('postMessage' in port && typeof port.postMessage === 'function') {
      ;(port as Worker).postMessage(buffer, [buffer])
    }
  }

  private async _onFrame(buffer: ArrayBuffer): Promise<void> {
    let frame: GrpcFrame
    try {
      frame = decodeFrame(buffer)
    } catch {
      this._errorCount++
      return
    }

    this._messageCount++

    // Response or Error → resolve pending call
    if (frame.flags & FrameFlags.RESPONSE || frame.flags & FrameFlags.ERROR) {
      this._handleResponse(frame)
      return
    }

    // Request → dispatch to handler
    if (frame.flags & FrameFlags.REQUEST) {
      await this._handleRequest(frame)
    }
  }

  private _handleResponse(frame: GrpcFrame): void {
    const pending = this._pending.get(frame.correlationId)
    if (!pending) return

    this._pending.delete(frame.correlationId)
    if (pending.timer) clearTimeout(pending.timer)

    const latency = Date.now() - pending.createdAt
    this._latencySum += latency

    if (frame.flags & FrameFlags.ERROR) {
      const errData = frame.payload as { code: number; message: string; metadata?: Record<string, string> }
      pending.reject(GrpcError.fromTransport(errData))
    } else {
      pending.resolve(frame.payload)
    }
  }

  private async _handleRequest(frame: GrpcFrame): Promise<void> {
    const handler = this._handlers.get(frame.methodId)

    if (!handler) {
      // Send UNIMPLEMENTED error
      const errBuf = encodeFrame(
        frame.methodId,
        frame.correlationId,
        FrameFlags.ERROR,
        { code: GrpcStatus.UNIMPLEMENTED, message: `Method 0x${frame.methodId.toString(16)} not implemented` },
      )
      this._postMessage(errBuf)
      return
    }

    const metadata: CallMetadata = {
      correlationId: frame.correlationId,
      methodId: frame.methodId as MethodId,
      deadline: Date.now() + 30_000, // default server-side deadline
      flags: frame.flags,
    }

    try {
      const result = await handler(frame.payload, metadata)

      // Send response
      const resBuf = encodeFrame(
        frame.methodId,
        frame.correlationId,
        FrameFlags.RESPONSE,
        result,
      )
      this._postMessage(resBuf)
    } catch (err) {
      const grpcErr = err instanceof GrpcError
        ? err
        : new GrpcError(GrpcStatus.INTERNAL, err instanceof Error ? err.message : 'Unknown handler error')

      const errBuf = encodeFrame(
        frame.methodId,
        frame.correlationId,
        FrameFlags.ERROR,
        grpcErr.toTransport(),
      )
      this._postMessage(errBuf)
    }
  }

  private _buildInterceptorChain(
    methodId: MethodId,
    options: CallOptions,
  ): (payload: unknown) => Promise<unknown> {
    // Base invocation (innermost)
    const base = (payload: unknown): Promise<unknown> => {
      return this._rawInvoke(methodId, payload, options)
    }

    // Wrap with interceptors (outermost first)
    let chain = base
    for (let i = this._interceptors.length - 1; i >= 0; i--) {
      const interceptor = this._interceptors[i]
      const next = chain
      chain = (payload: unknown) => interceptor(methodId, payload, next)
    }

    return chain
  }

  private _rawInvoke(
    methodId: MethodId,
    payload: unknown,
    options: CallOptions,
  ): Promise<unknown> {
    const {
      retryCount = 0,
      retryBaseDelay = 500,
    } = options

    return this._invokeWithRetry(methodId, payload, options, retryCount, retryBaseDelay)
  }

  private async _invokeWithRetry(
    methodId: MethodId,
    payload: unknown,
    options: CallOptions,
    retriesLeft: number,
    baseDelay: number,
  ): Promise<unknown> {
    try {
      return await this._invokeSingle(methodId, payload, options)
    } catch (err) {
      if (
        retriesLeft > 0
        && err instanceof GrpcError
        && isRetryable(err.code)
      ) {
        const delay = baseDelay * Math.pow(2, (options.retryCount ?? 0) - retriesLeft)
        await new Promise(r => setTimeout(r, delay))
        return this._invokeWithRetry(methodId, payload, options, retriesLeft - 1, baseDelay)
      }
      throw err
    }
  }

  private _invokeSingle(
    methodId: MethodId,
    payload: unknown,
    options: CallOptions,
  ): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      const correlationId = nextCorrelationId()

      // Determine deadline
      let deadlineMs = options.deadlineMs
      if (deadlineMs === undefined) {
        try {
          const desc = resolveDescriptor(methodId)
          deadlineMs = desc.deadlineMs
        } catch {
          deadlineMs = 10_000
        }
      }

      // Deadline timer
      const timer = deadlineMs > 0
        ? setTimeout(() => {
            const pending = this._pending.get(correlationId)
            if (pending) {
              this._pending.delete(correlationId)
              pending.reject(new GrpcError(
                GrpcStatus.DEADLINE_EXCEEDED,
                `Method 0x${methodId.toString(16)} deadline exceeded (${deadlineMs}ms)`,
              ))
            }
          }, deadlineMs)
        : null

      // Register pending
      this._pending.set(correlationId, {
        resolve,
        reject,
        timer,
        methodId,
        createdAt: Date.now(),
      })

      // Encode and send
      const flags = FrameFlags.REQUEST | (options.extraFlags ?? 0)
      const buffer = encodeFrame(methodId, correlationId, flags, payload)
      this._postMessage(buffer)
    })
  }
}
