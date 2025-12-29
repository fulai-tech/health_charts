import axios from 'axios'
import { API_CONFIG } from '@/config/api'
import type {
  DeviceLoginRequest,
  DeviceLoginResponse,
  StoredAuthData,
} from './types'
import { TOKEN_EXPIRY, AUTH_STORAGE_KEY } from './types'

/**
 * Authentication Service
 * Handles device login, token storage, and token refresh
 */
class AuthService {
  private authData: StoredAuthData | null = null

  constructor() {
    this.loadFromStorage()
  }

  /**
   * Load auth data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        this.authData = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load auth data from storage:', error)
      this.authData = null
    }
  }

  /**
   * Save auth data to localStorage
   */
  private saveToStorage(): void {
    try {
      if (this.authData) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.authData))
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch (error) {
      console.error('Failed to save auth data to storage:', error)
    }
  }

  /**
   * Device login
   */
  async login(request?: DeviceLoginRequest): Promise<StoredAuthData> {
    const loginData: DeviceLoginRequest = request || {
      username: API_CONFIG.device.username,
      password: API_CONFIG.device.password,
    }

    const response = await axios.post<DeviceLoginResponse>(
      `${API_CONFIG.baseURL}${API_CONFIG.auth.deviceLogin}`,
      loginData,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || 'Login failed')
    }

    const now = Date.now()
    this.authData = {
      user: response.data.data.user,
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
      accessTokenExpiry: now + TOKEN_EXPIRY.accessToken,
      refreshTokenExpiry: now + TOKEN_EXPIRY.refreshToken,
    }

    this.saveToStorage()
    return this.authData
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.authData) return false
    // Check if access token is still valid (with 5 min buffer)
    return Date.now() < this.authData.accessTokenExpiry - 5 * 60 * 1000
  }

  /**
   * Check if refresh token is valid
   */
  canRefresh(): boolean {
    if (!this.authData) return false
    return Date.now() < this.authData.refreshTokenExpiry
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    if (!this.authData) return null
    return this.authData.accessToken
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    if (!this.authData) return null
    return this.authData.refreshToken
  }

  /**
   * Get stored auth data
   */
  getAuthData(): StoredAuthData | null {
    return this.authData
  }

  /**
   * Logout - clear all auth data
   */
  logout(): void {
    this.authData = null
    this.saveToStorage()
  }

  /**
   * Ensure authenticated - login if needed
   */
  async ensureAuthenticated(): Promise<string> {
    if (this.isAuthenticated()) {
      return this.authData!.accessToken
    }

    // Need to login
    await this.login()
    return this.authData!.accessToken
  }
}

// Singleton instance
export const authService = new AuthService()

