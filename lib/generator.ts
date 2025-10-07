// Password generator utility functions

export interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeLookAlikes: boolean
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
const NUMBERS = "0123456789"
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/"
const LOOK_ALIKES = new Set(["0", "O", "o", "1", "l", "I", "L"])

export function buildCharset(options: PasswordOptions): string {
  let charset = ""
  
  if (options.includeUppercase) charset += UPPERCASE
  if (options.includeLowercase) charset += LOWERCASE
  if (options.includeNumbers) charset += NUMBERS
  if (options.includeSymbols) charset += SYMBOLS
  
  if (options.excludeLookAlikes) {
    charset = Array.from(charset)
      .filter(char => !LOOK_ALIKES.has(char))
      .join("")
  }
  
  return charset
}

export function generateSecurePassword(options: PasswordOptions): string {
  const charset = buildCharset(options)
  
  if (!charset) {
    throw new Error("No character types selected")
  }
  
  if (options.length < 4) {
    throw new Error("Password length must be at least 4 characters")
  }
  
  // Use crypto.getRandomValues for cryptographically secure randomness
  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)
  
  let password = ""
  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length]
  }
  
  // Ensure password meets requirements by including at least one character from each selected type
  if (options.includeUppercase && !hasUppercase(password)) {
    password = replaceRandomChar(password, getRandomChar(UPPERCASE, options.excludeLookAlikes))
  }
  if (options.includeLowercase && !hasLowercase(password)) {
    password = replaceRandomChar(password, getRandomChar(LOWERCASE, options.excludeLookAlikes))
  }
  if (options.includeNumbers && !hasNumbers(password)) {
    password = replaceRandomChar(password, getRandomChar(NUMBERS, options.excludeLookAlikes))
  }
  if (options.includeSymbols && !hasSymbols(password)) {
    password = replaceRandomChar(password, getRandomChar(SYMBOLS, options.excludeLookAlikes))
  }
  
  return password
}

function hasUppercase(str: string): boolean {
  return /[A-Z]/.test(str)
}

function hasLowercase(str: string): boolean {
  return /[a-z]/.test(str)
}

function hasNumbers(str: string): boolean {
  return /[0-9]/.test(str)
}

function hasSymbols(str: string): boolean {
  return /[!@#$%^&*()\-_=+\[\]{};:,.?/]/.test(str)
}

function getRandomChar(charset: string, excludeLookAlikes: boolean): string {
  let chars = charset
  if (excludeLookAlikes) {
    chars = Array.from(charset).filter(char => !LOOK_ALIKES.has(char)).join("")
  }
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return chars[array[0] % chars.length]
}

function replaceRandomChar(password: string, newChar: string): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const index = array[0] % password.length
  return password.substring(0, index) + newChar + password.substring(index + 1)
}

// Password strength estimation
export function estimatePasswordStrength(password: string): {
  score: number // 0-4
  label: string
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // Length check
  if (password.length >= 12) score += 1
  else if (password.length >= 8) score += 0.5
  else feedback.push("Use at least 8 characters")
  
  // Character variety
  if (hasUppercase(password)) score += 0.5
  else feedback.push("Include uppercase letters")
  
  if (hasLowercase(password)) score += 0.5
  else feedback.push("Include lowercase letters")
  
  if (hasNumbers(password)) score += 0.5
  else feedback.push("Include numbers")
  
  if (hasSymbols(password)) score += 0.5
  else feedback.push("Include symbols")
  
  // Avoid common patterns
  if (!/(.)\1{2,}/.test(password)) score += 0.5
  else feedback.push("Avoid repeated characters")
  
  if (!/123|abc|qwe|password|admin/i.test(password)) score += 0.5
  else feedback.push("Avoid common patterns")
  
  const finalScore = Math.min(4, Math.floor(score))
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
  
  return {
    score: finalScore,
    label: labels[finalScore],
    feedback: feedback.slice(0, 3) // Limit feedback to 3 items
  }
}