import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api'
import { authService } from '@/services/auth'

/**
 * Create authenticated Axios instance
 * Automatically adds auth token to requests
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000,
  })

  // Request interceptor - add auth token
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        // Ensure we have a valid token
        const token = await authService.ensureAuthenticated()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Failed to get auth token:', error)
        // Continue without token - the request will likely fail but let the error bubble up
      }
      
      // Debug: Log request details
      console.log('[API Request]', config.method?.toUpperCase(), config.url, config.data)
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // If 401 and we haven't retried yet, try to re-login
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          // Force re-login
          authService.logout()
          const token = await authService.ensureAuthenticated()
          originalRequest.headers.Authorization = `Bearer ${token}`
          return client(originalRequest)
        } catch (loginError) {
          return Promise.reject(loginError)
        }
      }

      return Promise.reject(error)
    }
  )

  return client
}

/** Singleton API client instance */
export const apiClient = createApiClient()

