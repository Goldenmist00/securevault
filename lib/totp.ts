import { authenticator } from 'otplib'
import QRCode from 'qrcode'

// Configure TOTP settings
authenticator.options = {
  step: 30, // 30 second window
  window: 1, // Allow 1 step tolerance
}

export interface TotpSetup {
  secret: string
  qrCodeUrl: string
  manualEntryKey: string
}

/**
 * Generate a new TOTP secret and QR code for setup
 */
export async function generateTotpSetup(username: string, serviceName: string = 'SecureVault'): Promise<TotpSetup> {
  // Generate a random secret
  const secret = authenticator.generateSecret()
  
  // Create the TOTP URL for QR code
  const totpUrl = authenticator.keyuri(username, serviceName, secret)
  
  // Generate QR code as data URL
  const qrCodeUrl = await QRCode.toDataURL(totpUrl)
  
  return {
    secret,
    qrCodeUrl,
    manualEntryKey: secret
  }
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTotpToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch (error) {
    console.error('TOTP verification error:', error)
    return false
  }
}

/**
 * Generate a TOTP token for testing (development only)
 */
export function generateTotpToken(secret: string): string {
  return authenticator.generate(secret)
}

/**
 * Get the current time step for TOTP
 */
export function getCurrentTimeStep(): number {
  return Math.floor(Date.now() / 1000 / 30)
}

/**
 * Get remaining seconds in current TOTP window
 */
export function getRemainingSeconds(): number {
  return 30 - (Math.floor(Date.now() / 1000) % 30)
}