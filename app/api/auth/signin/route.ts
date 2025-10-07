import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { verifyPassword, generateToken, isValidEmail } from '@/lib/auth'
import { User, AuthResponse } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json()

    // Validate input
    if (!emailOrUsername || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Email/username and password are required'
      }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')

    // Find user by email or username
    const isEmail = isValidEmail(emailOrUsername)
    const query = isEmail 
      ? { email: emailOrUsername.toLowerCase() }
      : { username: emailOrUsername.toLowerCase() }
    
    const user = await usersCollection.findOne(query)
    if (!user) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        }
      }
    )

    // Generate JWT token
    const token = generateToken(user._id!.toString(), user.username, user.email)

    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: user._id!.toString(),
        username: user.username,
        email: user.email
      },
      token
    })

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json<AuthResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}