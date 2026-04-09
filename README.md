# 📚 TutorOps Backend

A production-ready backend server built with **Node.js 18+**, **Express 5**, **PostgreSQL**, **Redis**, **Prisma ORM**, and **BullMQ**.  
This server powers the TutorOps AI Tutoring Platform — enabling secure authentication, email verification, background job processing, and an extensible foundation for educational features.

**Version:** 1.0.0  
**Last Updated:** February 9, 2026

---

## 🚀 Features

### ✅ Core Features
- **Session-Based Authentication** with Redis storage
- **Email/Password Authentication** with bcrypt password hashing
- **Google OAuth 2.0** integration
- **Email Verification System** with 6-digit OTP
- **Multi-Device Session Tracking** (logout all devices)
- **CSRF Protection** with token generation
- **Background Job Processing** with BullMQ & email workers
- **Job Queue Monitoring** with Bull Board dashboard
- **Comprehensive Error Handling** with custom ApiError class
- **Structured Logging** with Pino logger (dev pretty-print, prod JSON)
- **Role-Based Access Control** (STUDENT, TEACHER, ADMIN)
- **Type-Safe Database Operations** with Prisma ORM
- **Request Validation** with Zod schemas
- **Graceful Shutdown** handling with process event handlers
- **Module Path Aliases** for clean imports

---

## 📁 Folder Structure

```
backend/
├── prisma/                          # Database schema & migrations
│   ├── schema.prisma                # Prisma data models
│   └── migrations/                  # Version-controlled migrations
│       ├── 20260202141504_init/
│       ├── 20260204161851_otp_expiry_added/
│       └── 20260205054930_email_verification_update/
│
├── src/                             # Main source code
│   ├── index.js                     # Server entry point
│   ├── app.js                       # Express app configuration
│   │
│   ├── api/                         # Feature-based API modules
│   │   ├── auth/                    # Authentication module
│   │   │   ├── router.js            # Routes
│   │   │   ├── controllers/         # HTTP handlers
│   │   │   ├── services/            # Business logic
│   │   │   ├── daos/                # Data access
│   │   │   └── dtos/                # Zod validation schemas
│   │   └── system/                  # System endpoints
│   │
│   ├── agents/                      # External service integrations
│   │   └── aiClient.js              # AI service client
│   │
│   ├── config/                      # Configuration
│   │   └── env.js                   # Environment variables
│   │
│   ├── core/                        # Core app modules
│   │   ├── router.js                # Main API router
│   │   └── socket.js                # Socket.IO (planned)
│   │
│   ├── entities/                    # Custom classes & entities
│   │   ├── ApiError.js              # Custom error class
│   │   └── ApiResponse.js           # Standard response wrapper
│   │
│   ├── generated/                   # Auto-generated files
│   │   └── prisma/                  # Prisma Client
│   │
│   ├── middlewares/                 # Express middlewares
│   │   ├── errorHandler.js          # Global error handler
│   │   ├── isAuthenticated.js       # Auth guard
│   │   └── zodValidator.js          # Request validation
│   │
│   ├── queues/                      # BullMQ job queues
│   │   └── email.queue.js           # Email queue config
│   │
│   ├── services/                    # Service modules
│   │   ├── aiEngine/                # AI tutoring services (planned)
│   │   ├── email/                   # Email service
│   │   │   ├── email.producer.js    # Job producer
│   │   │   ├── email.service.js     # Email logic
│   │   │   └── email.transport.js   # Nodemailer config
│   │   └── mathEngine/              # Math services (planned)
│   │
│   ├── utils/                       # Utility modules
│   │   ├── bullmqConnection.js      # BullMQ Redis connection
│   │   ├── constant.js              # App constants
│   │   ├── googleOAuth.js           # Google OAuth helpers
│   │   ├── logger.js                # Pino logger config
│   │   ├── normalizePath.js         # Path utilities
│   │   ├── prisma.js                # Prisma singleton
│   │   ├── redis.js                 # Redis & session store
│   │   └── test.js                  # Testing utilities
│   │
│   └── workers/                     # Background job processors
│       └── email.worker.js          # Email processing worker
│
├── tests/                           # Unit & integration tests
├── scripts/                         # Utility scripts
├── .env                             # Environment variables (git-ignored)
├── .env.example                     # Environment template
├── package.json                     # Dependencies & scripts
├── prisma.config.ts                 # Prisma configuration
├── tsconfig.json                    # TypeScript config
└── README.md                        # This file
```

---

## 🛠️ Setup Instructions

### Prerequisites

Before you begin, ensure you have installed:
- **Node.js** v18 or higher
- **PostgreSQL** (v13+)
- **Redis** (v6+)
- **npm** or **yarn**

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/TutorOps.git
cd TutorOps/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tutorops

# Redis
REDIS_URL=redis://localhost:6379

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Session
SESSION_SECRET=your-super-secret-key-change-in-production

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@tutorops.com

# Logging
LOG_LEVEL=debug
```

### 4. Setup the database

Run Prisma migrations:

```bash
npm run migrate
```

This will:
- Generate Prisma Client
- Run all pending migrations
- Apply schema changes to PostgreSQL

> ⚠️ **Important:** Ensure PostgreSQL and Redis are running before running migrations.

### 5. Start development server

```bash
npm run dev
```

The server will start on `http://localhost:3000` with:
- Hot-reload enabled (auto-restart on file changes)
- Structured logging (colored output in development)
- Redis session store connected

### 6. (Optional) Access Job Queue Dashboard

Open Bull Board to monitor background jobs:

```
http://localhost:3000/admin/queues
```

This dashboard shows:
- Email job queue status
- Pending, active, completed, and failed jobs
- Job retry management

---

## 📦 Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `dev` | Start development server with hot-reload | `npm run dev` |
| `start` | Start production server | `npm start` |
| `build` | Build for production | `npm run build` |
| `format` | Format code with Prettier | `npm run format` |
| `format:check` | Check code formatting | `npm run format:check` |
| `migrate` | Run Prisma migrations & regenerate | `npm run migrate` |
| `studio` | Open Prisma Studio (DB GUI) | `npm run studio` |
| `worker:email` | Run email worker independently | `npm run worker:email` |

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login with credentials |
| POST | `/api/auth/logout` | ❌ | Logout current device |
| POST | `/api/auth/logoutAllDevices` | ✅ | Logout all devices |
| POST | `/api/auth/googleCallback` | ❌ | Google OAuth callback |
| POST | `/api/auth/sendOtp` | ❌ | Send verification OTP |
| POST | `/api/auth/verifyOtp` | ❌ | Verify OTP & activate account |
| GET | `/api/auth/me` | ✅ | Get current user info |
| GET | `/api/auth/csrf-token` | ❌ | Get CSRF token |

### System Endpoints

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/api/system/health` | ❌ | Health check |
| GET | `/test` | ❌ | Basic handshake test |

### Admin Endpoints (Dev Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/queues` | Bull Board job queue dashboard |

---

## 🗄️ Database Schema

The database includes models for:

- **User** - Authentication & profile management
- **Class** - Teacher-created class containers
- **Enrollment** - Student class enrollments
- **Assignment** - Class assignments
- **Problem** - Reusable problem templates
- **ProblemInstance** - Specific problem instances
- **Attempt** - Student submission attempts
- **Report** - Performance analytics

See [BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md) for detailed schema documentation.

---

## 💡 Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Express** | 5.1.0+ | Web framework & routing |
| **PostgreSQL** | 13+ | Primary relational database |
| **Redis** | 6+ | Session store & job queue |
| **Prisma** | 7.0.1+ | ORM & database toolkit |
| **BullMQ** | 5.67.2+ | Background job processing |

### Key Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| **@bull-board/api** | 6.16.4 | Job queue monitoring API |
| **@bull-board/express** | 6.16.4 | Bull Board dashboard |
| **bcryptjs** | 3.0.2 | Password hashing |
| **connect-redis** | 6.1.3 | Redis session store |
| **csurf** | 1.11.0 | CSRF protection middleware |
| **express-session** | 1.18.2 | Session management |
| **ioredis** | 5.8.2 | Redis client |
| **nodemailer** | 7.0.13 | Email sending |
| **pino** | 9.11.0 | Structured logging |
| **zod** | 4.1.11 | Data validation |

---

## 🔐 Security Features

✅ **Session Security**
- Redis-backed session storage
- HttpOnly cookies (prevents XSS)
- Secure cookies in production (HTTPS only)
- SameSite attribute (CSRF prevention)
- 7-day rolling session expiration

✅ **Password Security**
- bcrypt hashing (10 salt rounds)
- Timing-safe comparison
- Never logged or exposed in responses

✅ **CSRF Protection**
- Token generation & validation
- Automatic token refresh

✅ **Input Validation**
- Zod schema validation
- Email normalization
- SQL injection prevention (Prisma ORM)

✅ **Error Handling**
- Sensitive data redaction in logs
- Stack trace filtering
- Generic error messages to clients

---

## 📝 Project Configuration

### Path Aliases

The project uses ES Module imports with path aliases for cleaner code:

```javascript
import ApiError from '#entities/ApiError.js';
import logger from '#utils/logger.js';
import prisma from '#utils/prisma.js';
```

### Available Aliases

- `#src/*` → `./src/*`
- `#utils/*` → `./src/utils/*`
- `#api/*` → `./src/api/*`
- `#entities/*` → `./src/entities/*`
- `#config/*` → `./src/config/*`
- `#middlewares/*` → `./src/middlewares/*`
- `#core/*` → `./src/core/*`

---

## 🧪 Testing

Currently, the project has a test utilities file:

```bash
# Run tests (if available)
npm test
```

Integration tests and unit tests are planned.

---

## 📊 Logging

The project uses **Pino** for structured logging:

**Development Mode:**
- Pretty-printed colored output
- Human-readable timestamps
- Filtered stack traces

**Production Mode:**
- JSON formatted logs
- Logged to `./logs/app.log`
- Machine-parseable for aggregation

### Log Levels

| Level | When Used |
|-------|-----------|
| `debug` | Detailed diagnostic info |
| `info` | General information |
| `warn` | Warning conditions |
| `error` | Error conditions |
| `fatal` | Critical errors |

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `SESSION_SECRET`
- [ ] Configure production `DATABASE_URL`
- [ ] Configure production `REDIS_URL`
- [ ] Set up SMTP credentials
- [ ] Enable secure cookies (HTTPS)
- [ ] Configure CORS origins
- [ ] Set up reverse proxy (Nginx)
- [ ] Enable error tracking (Sentry)
- [ ] Configure process manager (PM2)
- [ ] Set up monitoring & alerts
- [ ] Configure database backups

### Running in Production

```bash
# Install dependencies
npm install --only=production

# Run migrations
npm run migrate

# Start server
npm start
```

For process management, use **PM2** or **Docker**.

---

## 📚 Documentation

For comprehensive technical documentation, see:
- [BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md) - Complete architecture & features

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📬 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Contact the development team

---

**Version:** 1.0.0  
**Last Updated:** February 9, 2026
