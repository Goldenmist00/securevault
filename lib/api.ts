// API helpers for MongoDB integration

export interface VaultItem {
  id: string
  title: string
  username: string
  password: string
  url: string
  notes: string
  tags: string[]
  folder: string
  updatedAt: number
}

export interface User {
  id: string
  username: string
  email: string
  createdAt: number
}

export interface AuthResponse {
  success: boolean
  user?: {
    id: string
    username: string
    email: string
  }
  token?: string
  error?: string
}

export interface VaultSyncResponse {
  success: boolean
  vault?: {
    encryptedData: any
    lastSyncAt: string
    itemCount: number
  }
  error?: string
}

// API functions for MongoDB backend integration
export const api = {
  // Auth endpoints
  async signUp(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      return await response.json()
    } catch (error) {
      console.error('API: Signup error', error)
      return { success: false, error: 'Network error' }
    }
  },

  async signIn(emailOrUsername: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername, password }),
      })

      return await response.json()
    } catch (error) {
      console.error('API: Signin error', error)
      return { success: false, error: 'Network error' }
    }
  },

  // Vault endpoints
  async getVault(token: string): Promise<VaultSyncResponse> {
    try {
      const response = await fetch('/api/vault/sync', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      return await response.json()
    } catch (error) {
      console.error('API: Get vault error', error)
      return { success: false, error: 'Network error' }
    }
  },

  async syncVault(token: string, encryptedData: any, itemCount: number): Promise<VaultSyncResponse> {
    try {
      const response = await fetch('/api/vault/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encryptedData, itemCount }),
      })

      return await response.json()
    } catch (error) {
      console.error('API: Sync vault error', error)
      return { success: false, error: 'Network error' }
    }
  },

  // User endpoints
  async getUserProfile(token: string) {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      return await response.json()
    } catch (error) {
      console.error('API: Get profile error', error)
      return { success: false, error: 'Network error' }
    }
  },

  async deleteAccount(token: string) {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      return await response.json()
    } catch (error) {
      console.error('API: Delete account error', error)
      return { success: false, error: 'Network error' }
    }
  }
}

// Error handling
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Request helper with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error occurred')
  }
}