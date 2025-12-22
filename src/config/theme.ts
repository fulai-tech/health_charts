/**
 * Theme Configuration
 * Centralized color constants for the Health Vital Visualization library
 */

export const VITAL_COLORS = {
  /** Blood Pressure - Orange */
  bp: '#F4A261',
  /** Blood Oxygen (SpO2) - Cyan/Blue */
  spo2: '#4CC9F0',
  /** Heart Rate - Red */
  heartRate: '#F87171',
  /** Blood Glucose - Yellow/Gold */
  glucose: '#E9C46A',
} as const

export const CHART_COLORS = {
  bp: {
    primary: '#F4A261',
    secondary: '#F4A26180',
    gradient: {
      start: '#F4A261',
      end: '#F4A26120',
    },
  },
  spo2: {
    primary: '#4CC9F0',
    secondary: '#4CC9F080',
    gradient: {
      start: '#4CC9F0',
      end: '#4CC9F020',
    },
  },
  heartRate: {
    primary: '#F87171',
    secondary: '#F8717180',
    gradient: {
      start: '#F87171',
      end: '#F8717120',
    },
  },
  glucose: {
    primary: '#E9C46A',
    secondary: '#E9C46A80',
    gradient: {
      start: '#E9C46A',
      end: '#E9C46A20',
    },
  },
} as const

export const UI_COLORS = {
  card: {
    background: '#FFFFFF',
    border: '#E5E7EB',
  },
  page: {
    background: '#F8F9FA',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
  status: {
    normal: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  trend: {
    up: '#EF4444',
    down: '#10B981',
    stable: '#6B7280',
  },
} as const

export type VitalType = keyof typeof VITAL_COLORS
