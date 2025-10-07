import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { hashPassword, generateToken, generateSalt, isValidEmail, validatePasswordStrength, validateUsername } from '@/lib/auth'
import { User, AuthResponse } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Username, email and password are required'
      }, { status: 400 })
    }

    const usernameValidation = validateUsername(username)
    if (!usernameValidation.isValid) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: `Username validation failed: ${usernameValidation.errors.join(', ')}`
      }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 })
    }

    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: `Password validation failed: ${passwordValidation.errors.join(', ')}`
      }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')

    // Check if username already exists
    const existingUsername = await usersCollection.findOne({ username: username.toLowerCase() })
    if (existingUsername) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Username already taken'
      }, { status: 409 })
    }

    // Check if email already exists
    const existingEmail = await usersCollection.findOne({ email: email.toLowerCase() })
    if (existingEmail) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'User already exists with this email'
      }, { status: 409 })
    }

    // Create new user
    const passwordHash = await hashPassword(password)
    const saltB64 = generateSalt()
    
    const newUser: User = {
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      saltB64,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await usersCollection.insertOne(newUser)
    
    if (!result.insertedId) {
      throw new Error('Failed to create user')
    }

    // Generate JWT token
    const token = generateToken(result.insertedId.toString(), username.toLowerCase(), email.toLowerCase())

    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: result.insertedId.toString(),
        username: username.toLowerCase(),
        email: email.toLowerCase()
      },
      token
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json<AuthResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}