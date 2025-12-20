# RetailScore AI - Node.js API Gateway

Email OTP Authentication System built with Fastify, PostgreSQL, SendGrid, and JWT.

## Features

- Passwordless email-based authentication using OTP
- Secure OTP storage (bcrypt hashing)
- Rate limiting (3 requests per 30 minutes per email)
- JWT tokens (access + refresh)
- PostgreSQL database with connection pooling
- SendGrid email service integration
- Production-ready error handling
- TypeScript for type safety
- Structured logging with Pino

## Tech Stack

- **Framework**: Fastify 5
- **Database**: PostgreSQL
- **Email**: SendGrid
- **Authentication**: JWT
- **Validation**: Zod
- **Password Hashing**: bcrypt
- **Logging**: Pino

## Project Structure

```
node/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── database/        # Migrations
│   ├── middleware/      # Middleware functions
│   ├── models/          # TypeScript interfaces
│   ├── repositories/    # Data access layer
│   ├── routes/          # API routes
│   ├── schemas/         # Validation schemas
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── .env                 # Environment variables (gitignored)
├── .env.example         # Environment template
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- SendGrid API key

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/retailscore_db

# SendGrid
SENDGRID_API_KEY=SG.your-actual-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=RetailScore AI

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your-secure-access-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-secure-refresh-secret-minimum-32-characters
```

### 4. Database Setup

Run the migrations to create tables:

```bash
npm run db:migrate
```

This will create:
- `users` table (stores user accounts)
- `otp_tokens` table (stores OTP hashes with expiry and rate limiting)

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Send OTP

**Endpoint**: `POST /api/auth/send-otp`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "expiresIn": 15
}
```

**Error Responses**:
- `400` - Invalid email format
- `429` - Rate limit exceeded (too many requests)
- `500` - Email service error

### 2. Verify OTP

**Endpoint**: `POST /api/auth/verify-otp`

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "is_verified": true,
    "created_at": "2025-12-20T10:00:00Z",
    "last_login_at": "2025-12-20T10:05:00Z"
  },
  "tokens": {
    "access_token": "jwt-access-token",
    "refresh_token": "jwt-refresh-token",
    "expires_in": 900
  }
}
```

**Error Responses**:
- `400` - Invalid OTP / Expired OTP / Max attempts exceeded
- `401` - Invalid OTP
- `404` - No OTP found for email

### 3. Health Check

**Endpoint**: `GET /health`

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2025-12-20T10:00:00Z"
}
```

## Available Scripts

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run database migrations
npm run db:migrate
```

## Security Features

### OTP Security
- OTPs are hashed with bcrypt (10 rounds) before storage
- Never stored in plaintext
- 15-minute expiration
- One-time use (verified flag prevents reuse)
- Max 5 verification attempts per OTP

### Rate Limiting
- **Global**: 100 requests per IP per 15 minutes
- **Email-specific**: 3 OTP requests per email per 30 minutes (database-backed)

### Input Validation
- All inputs validated with Zod schemas
- Email format validation at database level
- OTP must be exactly 6 digits

### SQL Injection Prevention
- All database queries use parameterized statements
- Never concatenate user input into SQL

### Security Headers
- Helmet middleware for XSS protection
- Content Security Policy configured
- CORS whitelisting

## Authentication Flow

### Send OTP Flow

1. User submits email
2. Validate email format
3. Check rate limit (3 per 30 min)
4. Find or create user in database
5. Generate 6-digit OTP (crypto-secure)
6. Hash OTP with bcrypt
7. Invalidate previous unverified OTPs
8. Store OTP record (hash, expiry: now + 15min)
9. Send email via SendGrid
10. Return success response

### Verify OTP Flow

1. User submits email + OTP
2. Validate inputs
3. Find latest unverified OTP for email
4. Check if already verified
5. Check expiry
6. Check attempts (max 5)
7. Compare OTP with bcrypt hash
   - If invalid: increment attempts, return error
   - If valid: continue
8. Mark OTP as verified
9. Update user (is_verified = true, last_login_at = now)
10. Generate JWT access token (15 min expiry)
11. Generate JWT refresh token (7 days expiry)
12. Return user data + tokens

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SENDGRID_API_KEY` | SendGrid API key | Required |
| `SENDGRID_FROM_EMAIL` | Sender email address | Required |
| `SENDGRID_FROM_NAME` | Sender name | RetailScore AI |
| `JWT_ACCESS_SECRET` | JWT access token secret (min 32 chars) | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (min 32 chars) | Required |
| `JWT_ACCESS_EXPIRY` | Access token expiry | 15m |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | 7d |
| `OTP_EXPIRY_MINUTES` | OTP expiration time | 15 |
| `OTP_RATE_LIMIT_COUNT` | Max OTP requests | 3 |
| `OTP_RATE_LIMIT_WINDOW_MINUTES` | Rate limit window | 30 |
| `LOG_LEVEL` | Logging level | info |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:3000,localhost:8081 |

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE
);
```

### OTP Tokens Table

```sql
CREATE TABLE otp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Next Steps

1. **Setup Database**: Create a PostgreSQL database and update `DATABASE_URL` in `.env`
2. **Configure SendGrid**: Get a SendGrid API key and update `.env`
3. **Generate JWT Secrets**: Use a secure random string generator for JWT secrets
4. **Run Migrations**: Execute `npm run db:migrate` to create tables
5. **Start Server**: Run `npm run dev` to start the development server
6. **Test API**: Use Postman/Insomnia to test the endpoints

## Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production` in environment
2. Use strong, randomly generated JWT secrets (32+ characters)
3. Configure proper database backup strategy
4. Setup monitoring and logging (e.g., DataDog, New Relic)
5. Configure SSL/TLS certificates
6. Setup reverse proxy (e.g., Nginx)
7. Configure environment-specific CORS origins
8. Enable database connection pooling (already configured)

## License

ISC
