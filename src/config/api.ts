/**
 * API Configuration
 * Centralized API endpoints and configuration
 */

export const API_CONFIG = {
  /** Base URL for all API requests */
  baseURL: 'https://test.fulai.tech',

  /** Auth endpoints */
  auth: {
    deviceLogin: '/auth/device/login',
  },

  /** Trend review endpoints */
  trendReview: {
    overview: '/trend-review/overview',
    indicatorDetail: '/trend-review/indicator-detail',
  },

  /** Device credentials (for demo/testing) */
  device: {
    deviceId: 'FL-DEVICE-001',
    deviceSecret: 'device_secret_key_123',
  },
} as const

/** Indicator types supported by the API */
export type IndicatorType =
  | 'blood_pressure'
  | 'heart_rate'
  | 'blood_glucose'
  | 'blood_oxygen'
  | 'sleep'
  | 'emotion'
  | 'nutrition'

/** View types for overview API */
export type ViewType = 'day' | 'week'

