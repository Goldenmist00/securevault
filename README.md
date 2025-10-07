# 🔐 SecureVault - Privacy-First Password Manager

A modern, secure password manager built with Next.js, featuring client-side encryption and zero-knowledge architecture.

![SecureVault Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## ✨ Features

### 🔒 **Security First**
- **Client-side encryption** with AES-GCM + PBKDF2 (200k iterations)
- **Zero-knowledge architecture** - server never sees plaintext
- **Two-factor authentication** (TOTP) with QR code setup
- **Secure password generation** with customizable options
- **Auto-clearing clipboard** (12-second security timeout)

### 🎯 **Core Functionality**
- **Password Generator** - Length slider, character options, exclude look-alikes
- **Secure Vault** - Store passwords, usernames, URLs, and notes
- **Smart Organization** - Tags and folders for easy management
- **Real-time Search** - Find items instantly across all fields
- **Cloud Sync** - MongoDB Atlas integration with encrypted storage

### 🎨 **Modern Experience**
- **Responsive Design** - Works perfectly on desktop and mobile
- **Dark Mode** - Persistent theme switching
- **Smooth Animations** - Framer Motion transitions
- **Toast Notifications** - Clear user feedback
- **Advanced Clipboard** - Smart permission handling with fallbacks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/securevault.git
   cd securevault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/securevault
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NEXTAUTH_SECRET=your-nextauth-secret-change-in-production
   ```

4. **Set up the database**
   ```bash
   npm run db:setup
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Framer Motion** - Smooth animations

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB Atlas** - Cloud database
- **JWT** - Stateless authentication
- **bcrypt** - Password hashing

### Security
- **Web Crypto API** - Browser-native encryption
- **AES-GCM** - Authenticated encryption
- **PBKDF2** - Key derivation (200k iterations)
- **TOTP** - Two-factor authentication

## 🔐 Security Architecture

### Client-Side Encryption
```
User Password → PBKDF2 (200k iterations) → AES-256 Key
Vault Data → AES-GCM Encryption → Encrypted Blob → Server
```

### Zero-Knowledge Design
- **Server stores**: Only encrypted blobs + authentication data
- **Server never sees**: Plaintext passwords, vault items, or encryption keys
- **Client controls**: All encryption/decryption operations

### Multi-Layer Security
1. **Transport**: HTTPS (TLS 1.3)
2. **Authentication**: bcrypt + JWT + optional TOTP
3. **Data**: AES-GCM with authenticated encryption
4. **Keys**: Client-side derivation, never transmitted

## 📱 Usage

### Getting Started
1. **Sign Up** - Create account with username, email, and secure password
2. **Enable 2FA** (Optional) - Scan QR code with authenticator app
3. **Generate Password** - Use the built-in generator with custom options
4. **Save to Vault** - Store with title, username, URL, notes, and tags
5. **Organize** - Use folders and tags for easy management
6. **Search** - Find items instantly with real-time search

### Password Generator
- **Length**: 8-64 characters
- **Character Types**: Uppercase, lowercase, numbers, symbols
- **Security**: Exclude look-alike characters (0, O, 1, l, etc.)
- **Instant**: Client-side generation for speed

### Vault Management
- **Full CRUD**: Create, read, update, delete vault items
- **Organization**: Tags and folders for categorization
- **Search**: Real-time filtering across all fields
- **Security**: 12-second clipboard auto-clear

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret-256-bits
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
```

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:setup     # Initialize database
```

### Project Structure
```
securevault/
├── app/                 # Next.js app directory
│   ├── (auth)/         # Authentication pages
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── ...            # Custom components
├── lib/               # Utility libraries
│   ├── crypto.ts      # Encryption utilities
│   ├── auth.ts        # Authentication helpers
│   └── ...            # Other utilities
├── context/           # React context providers
└── hooks/             # Custom React hooks
```

## 🔒 Security Notes

### Cryptographic Implementation
- **AES-GCM**: Provides both confidentiality and integrity
- **PBKDF2**: 200,000 iterations protect against brute force
- **Random Salts**: Unique per user and per encryption
- **Secure Random**: Web Crypto API for all randomness

### Best Practices
- All sensitive operations happen client-side
- Server never has access to plaintext data
- Passwords are hashed with bcrypt (cost 12)
- JWT tokens expire after 7 days
- TOTP codes expire after 30 seconds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



---