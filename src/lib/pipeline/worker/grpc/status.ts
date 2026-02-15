/**
 * gRPC Status Codes — W3C WebTransport–aligned status enumeration.
 *
 * Mirrors canonical gRPC status codes (google.golang.org/grpc/codes)
 * adapted for in-process WebWorker transport.
 *
 * @module worker/grpc/status
 * @internal
 */

// ======================== Status Code Enum ========================

export const GrpcStatus = {
  /** 0 – The operation completed successfully. */
  OK:                  0x00,
  /** 1 – The operation was cancelled (typically by the caller). */
  CANCELLED:           0x01,
  /** 2 – Unknown error. */
  UNKNOWN:             0x02,
  /** 3 – Client specified an invalid argument. */
  INVALID_ARGUMENT:    0x03,
  /** 4 – Deadline expired before operation could complete. */
  DEADLINE_EXCEEDED:   0x04,
  /** 5 – Requested entity was not found. */
  NOT_FOUND:           0x05,
  /** 6 – Entity that a client attempted to create already exists. */
  ALREADY_EXISTS:      0x06,
  /** 7 – Caller does not have permission. */
  PERMISSION_DENIED:   0x07,
  /** 8 – Resource has been exhausted (e.g., rate limit). */
  RESOURCE_EXHAUSTED:  0x08,
  /** 9 – Operation rejected because system precondition not met. */
  FAILED_PRECONDITION: 0x09,
  /** 10 – Operation was aborted (e.g., concurrency conflict). */
  ABORTED:             0x0A,
  /** 11 – Operation attempted past the valid range. */
  OUT_OF_RANGE:        0x0B,
  /** 12 – Operation is not implemented or supported. */
  UNIMPLEMENTED:       0x0C,
  /** 13 – Internal errors. */
  INTERNAL:            0x0D,
  /** 14 – Service is currently unavailable. */
  UNAVAILABLE:         0x0E,
  /** 15 – Unrecoverable data loss or corruption. */
  DATA_LOSS:           0x0F,
  /** 16 – Request does not have valid authentication credentials. */
  UNAUTHENTICATED:     0x10,
  /** 17 – Mutex acquisition timed out (extension). */
  LOCK_TIMEOUT:        0x11,
  /** 18 – Worker thread not ready. */
  WORKER_NOT_READY:    0x12,
} as const

export type GrpcStatusCode = typeof GrpcStatus[keyof typeof GrpcStatus]

// ======================== Status Metadata ========================

const _statusNames: Record<number, string> = {
  [GrpcStatus.OK]:                  'OK',
  [GrpcStatus.CANCELLED]:           'CANCELLED',
  [GrpcStatus.UNKNOWN]:             'UNKNOWN',
  [GrpcStatus.INVALID_ARGUMENT]:    'INVALID_ARGUMENT',
  [GrpcStatus.DEADLINE_EXCEEDED]:   'DEADLINE_EXCEEDED',
  [GrpcStatus.NOT_FOUND]:           'NOT_FOUND',
  [GrpcStatus.ALREADY_EXISTS]:      'ALREADY_EXISTS',
  [GrpcStatus.PERMISSION_DENIED]:   'PERMISSION_DENIED',
  [GrpcStatus.RESOURCE_EXHAUSTED]:  'RESOURCE_EXHAUSTED',
  [GrpcStatus.FAILED_PRECONDITION]: 'FAILED_PRECONDITION',
  [GrpcStatus.ABORTED]:             'ABORTED',
  [GrpcStatus.OUT_OF_RANGE]:        'OUT_OF_RANGE',
  [GrpcStatus.UNIMPLEMENTED]:       'UNIMPLEMENTED',
  [GrpcStatus.INTERNAL]:            'INTERNAL',
  [GrpcStatus.UNAVAILABLE]:         'UNAVAILABLE',
  [GrpcStatus.DATA_LOSS]:           'DATA_LOSS',
  [GrpcStatus.UNAUTHENTICATED]:     'UNAUTHENTICATED',
  [GrpcStatus.LOCK_TIMEOUT]:        'LOCK_TIMEOUT',
  [GrpcStatus.WORKER_NOT_READY]:    'WORKER_NOT_READY',
}

/**
 * Resolve a numeric status code to its canonical name.
 */
export function statusName(code: GrpcStatusCode): string {
  return _statusNames[code] ?? `STATUS_${code}`
}

/**
 * Check if a status code represents a retryable error.
 */
export function isRetryable(code: GrpcStatusCode): boolean {
  return code === GrpcStatus.UNAVAILABLE
    || code === GrpcStatus.DEADLINE_EXCEEDED
    || code === GrpcStatus.RESOURCE_EXHAUSTED
    || code === GrpcStatus.ABORTED
    || code === GrpcStatus.LOCK_TIMEOUT
    || code === GrpcStatus.WORKER_NOT_READY
}

// ======================== gRPC Error ========================

/**
 * Structured gRPC error with status code, message, and optional metadata.
 * Extends Error for stack trace support.
 */
export class GrpcError extends Error {
  readonly code: GrpcStatusCode
  readonly metadata: Readonly<Record<string, string>>

  constructor(
    code: GrpcStatusCode,
    message: string,
    metadata: Record<string, string> = {},
  ) {
    super(`[gRPC:${statusName(code)}] ${message}`)
    this.name = 'GrpcError'
    this.code = code
    this.metadata = Object.freeze({ ...metadata })
  }

  /** Serialize for cross-thread transport. */
  toTransport(): { code: number; message: string; metadata: Record<string, string> } {
    return {
      code: this.code,
      message: this.message,
      metadata: { ...this.metadata },
    }
  }

  /** Reconstruct from transport representation. */
  static fromTransport(t: { code: number; message: string; metadata?: Record<string, string> }): GrpcError {
    return new GrpcError(t.code as GrpcStatusCode, t.message, t.metadata ?? {})
  }
}
