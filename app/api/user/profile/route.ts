import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'
import { verifyAuth } from '@/lib/auth'
import { User, ApiResponse } from '@/lib/models'

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')

    const user = await usersCollection.findOne(
      { _id: new ObjectId(auth.userId) },
      { projection: { passwordHash: 0 } } // Exclude password hash
    )

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: user._id!.toString(),
        username: user.username,
        email: user.email,
        saltB64: user.saltB64,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    })

  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')
    const vaultsCollection = db.collection('vaults')

    const userId = new ObjectId(auth.userId)

    // Delete user's vault data
    await vaultsCollection.deleteMany({ userId })

    // Delete user account
    const result = await usersCollection.deleteOne({ _id: userId })

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}