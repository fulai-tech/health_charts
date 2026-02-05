/**
 * Global Application Configuration
 * Environment and feature flags
 *
 * 这些配置值作为默认值，实际运行时由 mobx globalStore 管理
 * 不依赖 vite 环境变量，完全由配置控制
 */

/**
 * 默认是否为测试环境
 * true = 启用测试功能（手动登录/登出等）
 * false = 生产模式
 */
export const DEFAULT_IS_TEST_ENV = true

/**
 * 是否显示 SuperPanel（硬编码控制，不存入 localStorage）
 * true = 显示悬浮控制面板
 * false = 隐藏
 */
export const SHOW_SUPER_PANEL = true

/**
 * Token check interval in milliseconds (default: 1 minute)
 */
export const TOKEN_CHECK_INTERVAL = 60 * 1000

/**
 * Application configuration
 */
export const APP_CONFIG = {
  /** Default test environment setting */
  defaultIsTestEnv: DEFAULT_IS_TEST_ENV,
  /** Show super panel (hardcoded) */
  showSuperPanel: SHOW_SUPER_PANEL,
  /** Token check interval */
  tokenCheckInterval: TOKEN_CHECK_INTERVAL,
} as const
