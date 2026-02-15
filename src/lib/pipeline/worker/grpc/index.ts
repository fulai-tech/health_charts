/**
 * gRPC Module — Binary protocol, channel transport, service descriptors.
 *
 * @module worker/grpc
 * @internal
 */

export { GrpcStatus, GrpcError, statusName, isRetryable, type GrpcStatusCode } from './status'
export {
  encodeFrame,
  decodeFrame,
  createRequestFrame,
  createResponseFrame,
  createErrorFrame,
  nextCorrelationId,
  FrameFlags,
  type GrpcFrame,
  type FrameFlag,
} from './protocol'
export {
  MethodIds,
  resolveDescriptor,
  getServiceMethods,
  resolveMethodId,
  type MethodId,
  type MethodDescriptor,
} from './descriptors'
export {
  GrpcChannel,
  type RequestHandler,
  type CallMetadata,
  type CallOptions,
  type ChannelInterceptor,
} from './channel'
