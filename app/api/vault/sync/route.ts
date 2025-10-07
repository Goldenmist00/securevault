import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'
import { verifyAuth } from '@/lib/auth'
import { Vault, VaultSyncResponse } from '@/lib/models'

// GET - Retrieve user's vault
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json<VaultSyncResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const db = await getDatabase()
    const vaultsCollection = db.collection<Vault>('vaults')

    const vault = await vaultsCollection.findOne({ 
      userId: new ObjectId(auth.userId) 
    })

    if (!vault) {
      // Return empty vault if none exists
      return NextResponse.json<VaultSyncResponse>({
        success: true,
        vault: {
          encryptedData: { items: [] },
          lastSyncAt: new Date().toISOString(),
          itemCount: 0
        }
      })
    }

    return NextResponse.json<VaultSyncResponse>({
      success: true,
      vault: {
        encryptedData: vault.encryptedData,
        lastSyncAt: vault.lastSyncAt.toISOString(),
        itemCount: vault.itemCount
      }
    })

  } catch (error) {
    console.error('Vault sync GET error:', error)
    return NextResponse.json<VaultSyncResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST - Save/update user's vault
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json<VaultSyncResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const { encryptedData, itemCount } = await request.json()

    if (!encryptedData) {
      return NextResponse.json<VaultSyncResponse>({
        success: false,
        error: 'Encrypted data is required'
      }, { status: 400 })
    }

    // Validate encrypted data structure
    if (!encryptedData.iv || !encryptedData.ct || !encryptedData.v) {
      return NextResponse.json<VaultSyncResponse>({
        success: false,
        error: 'Invalid encrypted data format'
      }, { status: 400 })
    }

    const db = await getDatabase()
    const vaultsCollection = db.collection<Vault>('vaults')

    const now = new Date()
    const userId = new ObjectId(auth.userId)

    // Upsert vault data
    const result = await vaultsCollection.updateOne(
      { userId },
      {
        $set: {
          encryptedData,
          itemCount: itemCount || 0,
          lastSyncAt: now,
          updatedAt: now
        },
        $setOnInsert: {
          userId,
          createdAt: now
        }
      },
      { upsert: true }
    )

    return NextResponse.json<VaultSyncResponse>({
      success: true,
      vault: {
        encryptedData,
        lastSyncAt: now.toISOString(),
        itemCount: itemCount || 0
      }
    })

  } catch (error) {
    console.error('Vault sync POST error:', error)
    return NextResponse.json<VaultSyncResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}