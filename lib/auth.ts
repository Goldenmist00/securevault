import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

export interface JWTPayload {
  userId: string
  username: string
  email: string
  iat?: number
  exp?: number
}

// Hash password for storage
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(userId: string, username: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    username,
    email
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Extract token from request headers
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

// Middleware to verify authentication
export function verifyAuth(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}

// Generate secure random salt for client-side key derivation
export function generateSalt(): string {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)
  return btoa(String.fromCharCode(...salt))
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate username
export function validateUsername(username: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!username || username.trim().length === 0) {
    errors.push('Username is required')
  }
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long')
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters')
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens')
  }
  
  if (/^[0-9]+$/.test(username)) {
    errors.push('Username cannot be only numbers')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate password strength (for master password)
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  // Check for common weak passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein']
  if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
    errors.push('Password contains common weak patterns')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}