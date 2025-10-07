# SecureVault Backend Setup

## 🗄️ MongoDB Integration

Your SecureVault now has full MongoDB backend integration with:
- ✅ User authentication with JWT tokens
- ✅ Encrypted vault storage and sync
- ✅ Secure password hashing
- ✅ Client-side encryption (data never stored in plaintext)

## 🚀 Quick Setup

### 1. MongoDB Installation

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: Follow official MongoDB installation guide

# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Update `.env.local` with your connection string

### 2. Environment Setup

Update your `.env.local` file:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/securevault
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/securevault

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
```

### 3. Database Setup

```bash
# Setup database collections and indexes
npm run db:setup
```

### 4. Start the Application

```bash
npm run dev
```

## 🔐 Security Features

### Client-Side Encryption
- All vault data is encrypted in the browser before sending to server
- Server never sees plaintext passwords or vault items
- Uses AES-GCM encryption with PBKDF2 key derivation

### Authentication
- JWT tokens for session management
- bcrypt for password hashing (server-side)
- Secure salt generation for client-side key derivation

### Data Flow
1. **Signup**: User creates account → Server stores email + password hash + salt
2. **Login**: User authenticates → Server returns JWT + salt → Client derives encryption key
3. **Vault Sync**: Client encrypts data → Server stores encrypted blob → Never decrypts

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  passwordHash: "bcrypt_hash", // Server-side hash for auth
  saltB64: "base64_salt",      // Client-side salt for encryption
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

### Vaults Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  encryptedData: {
    iv: "base64_iv",
    ct: "base64_ciphertext",
    v: 1
  },
  itemCount: 5,
  lastSyncAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Authenticate user

### Vault Management
- `GET /api/vault/sync` - Retrieve encrypted vault
- `POST /api/vault/sync` - Save encrypted vault

### User Management
- `GET /api/user/profile` - Get user profile
- `DELETE /api/user/profile` - Delete user account

## 🔧 Development

### Testing API Endpoints

```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# Test signin
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

### Database Management

```bash
# Connect to MongoDB shell
mongosh

# Use SecureVault database
use securevault

# View collections
show collections

# View users
db.users.find()

# View vaults (encrypted)
db.vaults.find()
```

## 🚀 Production Deployment

### Environment Variables
Make sure to set secure values for:
- `JWT_SECRET` - Use a long, random string
- `MONGODB_URI` - Your production MongoDB connection
- `NEXTAUTH_SECRET` - Another long, random string

### Security Checklist
- ✅ Use HTTPS in production
- ✅ Set secure JWT secrets
- ✅ Configure MongoDB authentication
- ✅ Set up proper CORS policies
- ✅ Enable rate limiting
- ✅ Monitor for suspicious activity

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check if MongoDB is running: `mongod`
- Verify connection string in `.env.local`
- For Atlas: Check IP whitelist and credentials

**JWT Token Issues**
- Verify `JWT_SECRET` is set
- Check token expiration (7 days default)
- Clear browser localStorage if needed

**Encryption Errors**
- Ensure salt is properly retrieved from server
- Check that encryption key derivation matches
- Verify encrypted data format

### Debug Mode
Add to your `.env.local`:
```env
DEBUG=true
NODE_ENV=development
```

## 📈 Next Steps

Your backend is now ready! Consider adding:
- Rate limiting for API endpoints
- Audit logging for security events
- Backup and recovery procedures
- Monitoring and alerting
- Multi-factor authentication