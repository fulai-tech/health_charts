/**
 * Worker Services — gRPC service implementations.
 *
 * @module worker/services
 * @internal
 */

export {
  registerAuthService,
  configureAuthService,
  initAuthState,
} from './AuthServiceWorker'

export {
  registerStorageService,
  createInternalStorageProxy,
  type MainThreadStorageDelegate,
} from './StorageServiceWorker'

export {
  registerPrefetchService,
  getCachedData,
} from './PrefetchServiceWorker'
