// Database setup script for MongoDB
// Run with: node scripts/setup-db.js

const { MongoClient } = require('mongodb')

require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

async function setupDatabase() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local')
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB Atlas')
    
    const db = client.db(process.env.MONGODB_DB || 'securevault')
    console.log(`📊 Using database: ${process.env.MONGODB_DB || 'securevault'}`)
    
    // Create collections
    const collections = ['users', 'vaults', 'sessions', 'audit_logs']
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName)
        console.log(`✅ Created collection: ${collectionName}`)
      } catch (error) {
        if (error.code === 48) {
          console.log(`ℹ️  Collection ${collectionName} already exists`)
        } else {
          throw error
        }
      }
    }
    
    // Create indexes
    console.log('\n📊 Creating indexes...')
    
    // Users collection indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true })
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ createdAt: 1 })
    console.log('✅ Users indexes created')
    
    // Vaults collection indexes
    await db.collection('vaults').createIndex({ userId: 1 }, { unique: true })
    await db.collection('vaults').createIndex({ lastSyncAt: 1 })
    console.log('✅ Vaults indexes created')
    
    // Sessions collection indexes (if using)
    await db.collection('sessions').createIndex({ userId: 1 })
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true })
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    console.log('✅ Sessions indexes created')
    
    // Audit logs collection indexes (if using)
    await db.collection('audit_logs').createIndex({ userId: 1 })
    await db.collection('audit_logs').createIndex({ timestamp: 1 })
    await db.collection('audit_logs').createIndex({ action: 1 })
    console.log('✅ Audit logs indexes created')
    
    console.log('\n🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

setupDatabase()