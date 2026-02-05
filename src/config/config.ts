/**
 * Global Application Configuration
 * Environment and feature flags
 */

/**
 * Whether the current environment is a test environment
 * Set to true to enable test features like manual login/logout
 * Set to false for production builds
 */
export const IS_TEST_ENV = import.meta.env.DEV || true

/**
 * Token check interval in milliseconds (default: 1 minute)
 */
export const TOKEN_CHECK_INTERVAL = 60 * 1000

/**
 * Application configuration
 */
export const APP_CONFIG = {
  /** Enable test environment features */
  isTestEnv: IS_TEST_ENV,
  /** Token check interval */
  tokenCheckInterval: TOKEN_CHECK_INTERVAL,
} as const
