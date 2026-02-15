/**
 * gRPC Binary Wire Protocol — Hand-written protobuf-like codec.
 *
 * Frame layout (big-endian):
 * ┌──────────┬─────────┬──────────┬─────────────┬──────────────┬─────────┬──────────┐
 * │ Magic(4) │ Ver(1)  │ Flags(1) │ MethodID(4) │ CorrelID(4)  │ Len(4)  │ Payload  │
 * │ 0x67524D │ 0x01    │ bitfield │ uint32      │ uint32       │ uint32  │ N bytes  │
 * └──────────┴─────────┴──────────┴─────────────┴──────────────┴─────────┴──────────┘
 *
 * Payload encoding: custom TBON (Typed Binary Object Notation)
 * - 0x00: null
 * - 0x01: boolean (1 byte: 0=false, 1=true)
 * - 0x02: int32 (4 bytes, big-endian)
 * - 0x03: float64 (8 bytes, IEEE 754)
 * - 0x04: string (4-byte length prefix + UTF-8 bytes)
 * - 0x05: bytes (4-byte length prefix + raw bytes)
 * - 0x06: array (4-byte count + elements)
 * - 0x07: map (4-byte count + key-value pairs)
 * - 0x08: uint32 (4 bytes, unsigned)
 * - 0x09: timestamp (8 bytes, milliseconds since epoch)
 *
 * @module worker/grpc/protocol
 * @internal
 */

// ======================== Constants ========================

const MAGIC = 0x67524D54  // "gRMT" — gRPC Message Transport
const VERSION = 0x01

/** Frame header size in bytes: magic(4) + ver(1) + flags(1) + method(4) + correl(4) + len(4) = 18 */
const HEADER_SIZE = 18

/** Flag bitfield definitions */
export const FrameFlags = {
  REQUEST:       0b00000001,
  RESPONSE:      0b00000010,
  ERROR:         0b00000100,
  STREAMING:     0b00001000,
  COMPRESSED:    0b00010000,
  HAS_DEADLINE:  0b00100000,
  REQUIRES_LOCK: 0b01000000,
  KEEPALIVE:     0b10000000,
} as const

export type FrameFlag = typeof FrameFlags[keyof typeof FrameFlags]

// ======================== TBON Type Tags ========================

const TBONTag = {
  NULL:      0x00,
  BOOLEAN:   0x01,
  INT32:     0x02,
  FLOAT64:   0x03,
  STRING:    0x04,
  BYTES:     0x05,
  ARRAY:     0x06,
  MAP:       0x07,
  UINT32:    0x08,
  TIMESTAMP: 0x09,
} as const

// ======================== Encoder ========================

const _textEncoder = new TextEncoder()
const _textDecoder = new TextDecoder('utf-8')

/**
 * TBON Encoder — serializes JS values into typed binary notation.
 *
 * Uses a growable ArrayBuffer strategy with amortized O(1) append.
 */
class TBONEncoder {
  private _buf: ArrayBuffer
  private _view: DataView
  private _u8: Uint8Array
  private _offset: number

  constructor(initialCapacity = 256) {
    this._buf = new ArrayBuffer(initialCapacity)
    this._view = new DataView(this._buf)
    this._u8 = new Uint8Array(this._buf)
    this._offset = 0
  }

  private _grow(needed: number): void {
    if (this._offset + needed <= this._buf.byteLength) return
    let newCap = this._buf.byteLength
    while (newCap < this._offset + needed) newCap *= 2
    const newBuf = new ArrayBuffer(newCap)
    new Uint8Array(newBuf).set(this._u8.subarray(0, this._offset))
    this._buf = newBuf
    this._view = new DataView(this._buf)
    this._u8 = new Uint8Array(this._buf)
  }

  private _writeByte(b: number): void {
    this._grow(1)
    this._u8[this._offset++] = b
  }

  private _writeUint32(v: number): void {
    this._grow(4)
    this._view.setUint32(this._offset, v >>> 0, false)
    this._offset += 4
  }

  private _writeFloat64(v: number): void {
    this._grow(8)
    this._view.setFloat64(this._offset, v, false)
    this._offset += 8
  }

  private _writeBytes(bytes: Uint8Array): void {
    this._writeUint32(bytes.length)
    this._grow(bytes.length)
    this._u8.set(bytes, this._offset)
    this._offset += bytes.length
  }

  /** Encode any JS value into TBON. */
  encode(value: unknown): this {
    if (value === null || value === undefined) {
      this._writeByte(TBONTag.NULL)
    } else if (typeof value === 'boolean') {
      this._writeByte(TBONTag.BOOLEAN)
      this._writeByte(value ? 1 : 0)
    } else if (typeof value === 'number') {
      if (Number.isInteger(value) && value >= -2147483648 && value <= 2147483647) {
        this._writeByte(TBONTag.INT32)
        this._grow(4)
        this._view.setInt32(this._offset, value, false)
        this._offset += 4
      } else {
        this._writeByte(TBONTag.FLOAT64)
        this._writeFloat64(value)
      }
    } else if (typeof value === 'string') {
      this._writeByte(TBONTag.STRING)
      const encoded = _textEncoder.encode(value)
      this._writeBytes(encoded)
    } else if (value instanceof Uint8Array) {
      this._writeByte(TBONTag.BYTES)
      this._writeBytes(value)
    } else if (value instanceof Date) {
      this._writeByte(TBONTag.TIMESTAMP)
      this._writeFloat64(value.getTime())
    } else if (Array.isArray(value)) {
      this._writeByte(TBONTag.ARRAY)
      this._writeUint32(value.length)
      for (const item of value) {
        this.encode(item)
      }
    } else if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
      this._writeByte(TBONTag.MAP)
      this._writeUint32(entries.length)
      for (const [k, v] of entries) {
        // Key is always a string (without tag prefix)
        const keyBytes = _textEncoder.encode(k)
        this._writeBytes(keyBytes)
        this.encode(v)
      }
    } else {
      // Fallback: stringify
      this._writeByte(TBONTag.STRING)
      const encoded = _textEncoder.encode(String(value))
      this._writeBytes(encoded)
    }
    return this
  }

  /** Extract the encoded buffer (trimmed to exact size). */
  finish(): Uint8Array {
    return new Uint8Array(this._buf, 0, this._offset)
  }
}

// ======================== Decoder ========================

/**
 * TBON Decoder — deserializes typed binary notation back to JS values.
 */
class TBONDecoder {
  private _view: DataView
  private _u8: Uint8Array
  private _offset: number

  constructor(buffer: Uint8Array) {
    this._u8 = buffer
    this._view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    this._offset = 0
  }

  private _readByte(): number {
    return this._u8[this._offset++]
  }

  private _readUint32(): number {
    const v = this._view.getUint32(this._offset, false)
    this._offset += 4
    return v
  }

  private _readInt32(): number {
    const v = this._view.getInt32(this._offset, false)
    this._offset += 4
    return v
  }

  private _readFloat64(): number {
    const v = this._view.getFloat64(this._offset, false)
    this._offset += 8
    return v
  }

  private _readBytes(): Uint8Array {
    const len = this._readUint32()
    const bytes = this._u8.slice(this._offset, this._offset + len)
    this._offset += len
    return bytes
  }

  private _readString(): string {
    const bytes = this._readBytes()
    return _textDecoder.decode(bytes)
  }

  /** Decode one TBON value. */
  decode(): unknown {
    const tag = this._readByte()

    switch (tag) {
      case TBONTag.NULL:
        return null

      case TBONTag.BOOLEAN:
        return this._readByte() !== 0

      case TBONTag.INT32:
        return this._readInt32()

      case TBONTag.FLOAT64:
        return this._readFloat64()

      case TBONTag.STRING:
        return this._readString()

      case TBONTag.BYTES:
        return this._readBytes()

      case TBONTag.ARRAY: {
        const count = this._readUint32()
        const arr: unknown[] = new Array(count)
        for (let i = 0; i < count; i++) {
          arr[i] = this.decode()
        }
        return arr
      }

      case TBONTag.MAP: {
        const count = this._readUint32()
        const obj: Record<string, unknown> = Object.create(null)
        for (let i = 0; i < count; i++) {
          const key = this._readString()
          obj[key] = this.decode()
        }
        return obj
      }

      case TBONTag.UINT32:
        return this._readUint32()

      case TBONTag.TIMESTAMP:
        return new Date(this._readFloat64())

      default:
        throw new Error(`[TBON:decode] Unknown tag: 0x${tag.toString(16).padStart(2, '0')}`)
    }
  }
}

// ======================== Frame Types ========================

/**
 * Deserialized frame representation.
 */
export interface GrpcFrame {
  readonly methodId: number
  readonly correlationId: number
  readonly flags: number
  readonly payload: unknown
}

/**
 * Correlation ID generator — monotonic counter with wraparound.
 */
let _correlCounter = 0
export function nextCorrelationId(): number {
  _correlCounter = (_correlCounter + 1) & 0xFFFFFFFF
  return _correlCounter
}

// ======================== Frame Codec ========================

/**
 * Encode a gRPC frame into a binary buffer for postMessage transfer.
 *
 * @param methodId - Numeric method identifier from service descriptor
 * @param correlationId - Request/response correlation identifier
 * @param flags - Bitfield flags (see FrameFlags)
 * @param payload - Arbitrary JS value to serialize as TBON
 * @returns ArrayBuffer suitable for Transferable postMessage
 */
export function encodeFrame(
  methodId: number,
  correlationId: number,
  flags: number,
  payload: unknown,
): ArrayBuffer {
  // Encode payload with TBON
  const encoder = new TBONEncoder(512)
  encoder.encode(payload)
  const payloadBytes = encoder.finish()

  // Construct header + payload
  const totalSize = HEADER_SIZE + payloadBytes.length
  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  const u8 = new Uint8Array(buffer)

  let offset = 0

  // Magic (4 bytes)
  view.setUint32(offset, MAGIC, false)
  offset += 4

  // Version (1 byte)
  u8[offset++] = VERSION

  // Flags (1 byte)
  u8[offset++] = flags & 0xFF

  // Method ID (4 bytes)
  view.setUint32(offset, methodId >>> 0, false)
  offset += 4

  // Correlation ID (4 bytes)
  view.setUint32(offset, correlationId >>> 0, false)
  offset += 4

  // Payload length (4 bytes)
  view.setUint32(offset, payloadBytes.length, false)
  offset += 4

  // Payload
  u8.set(payloadBytes, offset)

  return buffer
}

/**
 * Decode a binary buffer into a gRPC frame.
 *
 * @param buffer - Raw ArrayBuffer received from postMessage
 * @returns Decoded frame
 * @throws On magic mismatch or version mismatch
 */
export function decodeFrame(buffer: ArrayBuffer): GrpcFrame {
  const view = new DataView(buffer)
  const u8 = new Uint8Array(buffer)

  let offset = 0

  // Verify magic
  const magic = view.getUint32(offset, false)
  offset += 4
  if (magic !== MAGIC) {
    throw new Error(
      `[gRPC:decode] Invalid magic: 0x${magic.toString(16).padStart(8, '0')} ` +
      `(expected 0x${MAGIC.toString(16).padStart(8, '0')})`
    )
  }

  // Verify version
  const version = u8[offset++]
  if (version !== VERSION) {
    throw new Error(`[gRPC:decode] Unsupported version: ${version} (expected ${VERSION})`)
  }

  // Flags
  const flags = u8[offset++]

  // Method ID
  const methodId = view.getUint32(offset, false)
  offset += 4

  // Correlation ID
  const correlationId = view.getUint32(offset, false)
  offset += 4

  // Payload length
  const payloadLen = view.getUint32(offset, false)
  offset += 4

  // Decode payload
  const payloadBytes = u8.slice(offset, offset + payloadLen)
  const decoder = new TBONDecoder(payloadBytes)
  const payload = decoder.decode()

  return Object.freeze({
    methodId,
    correlationId,
    flags,
    payload,
  })
}

// ======================== Helpers ========================

/**
 * Create a request frame.
 */
export function createRequestFrame(
  methodId: number,
  payload: unknown,
  extraFlags: number = 0,
): { buffer: ArrayBuffer; correlationId: number } {
  const correlationId = nextCorrelationId()
  const flags = FrameFlags.REQUEST | extraFlags
  const buffer = encodeFrame(methodId, correlationId, flags, payload)
  return { buffer, correlationId }
}

/**
 * Create a response frame.
 */
export function createResponseFrame(
  methodId: number,
  correlationId: number,
  payload: unknown,
): ArrayBuffer {
  return encodeFrame(methodId, correlationId, FrameFlags.RESPONSE, payload)
}

/**
 * Create an error frame.
 */
export function createErrorFrame(
  methodId: number,
  correlationId: number,
  error: { code: number; message: string; metadata?: Record<string, string> },
): ArrayBuffer {
  return encodeFrame(methodId, correlationId, FrameFlags.ERROR, error)
}
