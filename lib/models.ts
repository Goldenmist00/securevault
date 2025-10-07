import { ObjectId } from 'mongodb'

// User model
export interface User {
  _id?: ObjectId
  username: string
  email: string
  passwordHash: string // This is the hash of the user's master password
  saltB64: string // Salt for client-side key derivation
  twoFactorSecret?: string // TOTP secret
  twoFactorEnabled: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

// Vault model - stores encrypted vault data
export interface Vault {
  _id?: ObjectId
  userId: ObjectId
  encryptedData: {
    iv: string
    ct: string
    v: number
  }
  itemCount: number // For quick stats without decryption
  lastSyncAt: Date
  createdAt: Date
  updatedAt: Date
}

// Session model (optional - for JWT blacklisting)
export interface Session {
  _id?: ObjectId
  userId: ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
  userAgent?: string
  ipAddress?: string
}

// Audit log model (optional - for security monitoring)
export interface AuditLog {
  _id?: ObjectId
  userId: ObjectId
  action: 'login' | 'logout' | 'vault_sync' | 'password_change' | 'account_delete'
  details?: any
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
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