# SaveMoney Backend API

A Node.js Express backend for the SaveMoney cashback platform using Supabase as the database.

## 🚀 Features

- **RESTful API** with Express.js
- **Supabase Integration** for database operations
- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (User, Admin, Moderator)
- **File Upload** with Cloudinary integration
- **Email Service** with Mailtrap/SMTP
- **Rate Limiting** and security middleware
- **Input Validation** with express-validator
- **Error Handling** with custom error middleware

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcryptjs
- **File Storage**: Cloudinary
- **Email**: Nodemailer + Mailtrap
- **Validation**: express-validator + Joi
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
src/
├── config/
│   ├── supabase.js          # Supabase client configuration
│   └── cloudinary.js        # Cloudinary configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Global error handler
│   └── notFound.js          # 404 handler
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── stores.js            # Store management routes
│   ├── categories.js        # Category routes
│   ├── offers.js            # Offer management routes
│   ├── wallet.js            # Wallet & transactions
│   ├── referrals.js         # Referral system
│   ├── notifications.js     # Notification system
│   ├── admin.js             # Admin panel routes
│   └── upload.js            # File upload routes
├── validators/
│   ├── auth.js              # Authentication validators
│   ├── user.js              # User data validators
│   └── offer.js             # Offer validators
├── services/
│   ├── emailService.js      # Email sending service
│   ├── uploadService.js     # File upload service
│   └── notificationService.js # Notification service
├── utils/
│   ├── helpers.js           # Utility functions
│   └── constants.js         # Application constants
└── server.js                # Main server file
```

## 🔧 Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret key for JWT tokens
- `CLOUDINARY_*` - Cloudinary credentials for file uploads
- `MAILTRAP_*` or `SMTP_*` - Email service credentials

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Ensure your Supabase database has the required tables. The frontend project contains migration files that should be applied to your Supabase project.

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "password": "SecurePass123!",
  "referralCode": "SAVE123"
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### Store Endpoints

#### GET /stores
Get all stores with pagination and filters.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `category` - Filter by category ID
- `search` - Search in store name/description
- `sortBy` - Sort field (name, cashback_rate, created_at)
- `sortOrder` - Sort order (asc, desc)
- `isPopular` - Filter popular stores (true/false)

#### GET /stores/:id
Get single store details.

#### POST /stores (Admin only)
Create new store.

### Offer Endpoints

#### GET /offers
Get all offers with pagination and filters.

#### GET /offers/trending
Get trending offers.

#### GET /offers/featured
Get featured offers.

#### POST /offers/:id/track
Track offer click (requires authentication).

### Wallet Endpoints

#### GET /wallet
Get user wallet data (requires authentication).

#### GET /wallet/transactions
Get user transactions (requires authentication).

#### POST /wallet/withdraw
Create withdrawal request (requires authentication).

## 🔒 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

### Token Refresh

Access tokens expire after 7 days. Use the refresh token to get a new access token:

```javascript
POST /api/auth/refresh
{
  "refreshToken": "your_refresh_token"
}
```

## 🛡️ Security Features

- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **Rate Limiting** to prevent abuse
- **Input Validation** with express-validator
- **Password Hashing** with bcryptjs
- **JWT Tokens** with expiration
- **Role-based Access Control**

## 📊 Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database URLs
3. Set secure JWT secrets
4. Configure production SMTP settings

### Docker Deployment
```bash
# Build image
docker build -t savemoney-backend .

# Run container
docker run -p 3001:3001 --env-file .env savemoney-backend
```

## 📈 Monitoring

- Health check endpoint: `GET /health`
- Request logging with Morgan
- Error tracking and logging
- Performance monitoring ready

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

For frontend integration, update your frontend's API base URL to point to this backend server.