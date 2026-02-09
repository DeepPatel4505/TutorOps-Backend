# 🔐 TutorOps Backend - Complete Technical Documentation

**Project:** TutorOps AI Tutoring Platform  
**Version:** 1.0.0  
**Last Updated:** February 5, 2026  
**Tech Stack:** Node.js 18+, Express 5, PostgreSQL, Redis, Prisma ORM, BullMQ

---

## 📋 Table of Contents

1. [Backend Architecture Overview](#backend-architecture)
2. [Complete Authentication Flow](#authentication-flow)
3. [Email Verification System](#email-verification)
4. [Background Job Processing](#background-jobs)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Security Features](#security-features)
8. [Logging & Monitoring](#logging)
9. [Tech Stack & Dependencies](#tech-stack)
10. [Configuration & Environment](#configuration)

---

## 🏗️ Backend Architecture Overview

### **Project Structure (Detailed)**

```
backend/
├── .env                           # Environment variables (git-ignored)
├── .env.example                   # Environment template
├── package.json                   # Dependencies & scripts
├── prisma.config.ts               # Prisma configuration
├── tsconfig.json                  # TypeScript configuration
├── README.md                      # Project documentation
│
├── prisma/                        # Database schema and migrations
│   ├── schema.prisma              # Database models & relations
│   └── migrations/                # Version-controlled migrations
│       ├── migration_lock.toml
│       ├── 20260202141504_init/   # Initial schema
│       └── 20260204161851_otp_expiry_added/  # OTP verification added
│
├── src/                           # Main backend source code
│   ├── index.js                   # Server entry point (HTTP server creation)
│   ├── app.js                     # Express app configuration & middleware setup
│   │
│   ├── agents/                    # External service agents
│   │   └── aiClinent.js           # AI service client integration
│   │
│   ├── api/                       # API modules (feature-based organization)
│   │   ├── auth/                  # Authentication module
│   │   │   ├── index.js           # Auth module exports
│   │   │   ├── router.js          # Auth routes definition
│   │   │   ├── controllers/       # HTTP request handlers
│   │   │   │   ├── getme.controller.js         # Get current user
│   │   │   │   ├── googleCallback.controller.js # Google OAuth handler
│   │   │   │   ├── login.controller.js         # Login handler
│   │   │   │   ├── logout.controller.js        # Logout handlers
│   │   │   │   ├── otp.controller.js           # OTP verification
│   │   │   │   └── register.controller.js      # Registration handler
│   │   │   ├── services/          # Business logic layer
│   │   │   │   ├── getMe.service.js            # User retrieval logic
│   │   │   │   ├── googleAuth.service.js       # Google OAuth logic
│   │   │   │   ├── login.service.js            # Login logic
│   │   │   │   ├── logout.service.js           # Logout logic
│   │   │   │   └── register.service.js         # Registration logic
│   │   │   ├── daos/              # Data access layer
│   │   │   │   ├── session.dao.js              # Redis session operations
│   │   │   │   └── user.dao.js                 # User database operations
│   │   │   └── dtos/              # Validation schemas (Zod)
│   │   │       ├── login.dto.js                # Login validation
│   │   │       └── register.dto.js             # Registration validation
│   │   │
│   │   └── system/                # System/health endpoints
│   │       ├── index.js
│   │       └── system.route.js
│   │
│   ├── config/                    # Configuration files
│   │   └── env.js                 # Environment variable loader
│   │
│   ├── core/                      # Core app modules
│   │   ├── router.js              # Main router (mounts /auth, /system)
│   │   └── socket.js              # WebSocket/Socket.IO setup (planned)
│   │
│   ├── entities/                  # Custom entities & classes
│   │   ├── ApiError.js            # Custom error class with helpers
│   │   └── ApiResponse.js         # Standard response wrapper
│   │
│   ├── generated/                 # Auto-generated files (Prisma)
│   │   └── prisma/                # Prisma Client (generated from schema)
│   │
│   ├── idea/                      # Design docs & architecture notes
│   │   ├── prisma_schema_backup.js
│   │   └── tutor_ai_platform_structure.js
│   │
│   ├── middlewares/               # Express middlewares
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── isAuthenticated.js     # Auth guard middleware
│   │   └── zodValidator.js        # Request validation middleware
│   │
│   ├── queues/                    # BullMQ job queues
│   │   └── email.queue.js         # Email job queue configuration
│   │
│   ├── services/                  # Service modules
│   │   ├── aiEngine/              # AI tutoring services (planned)
│   │   ├── email/                 # Email service
│   │   │   ├── email.producer.js  # Job producer (enqueue emails)
│   │   │   ├── email.service.js   # Email sending logic
│   │   │   └── email.transport.js # Nodemailer transport config
│   │   └── mathEngine/            # Math problem generation (planned)
│   │
│   ├── utils/                     # Utility modules
│   │   ├── bullmqConnection.js    # BullMQ Redis connection factory
│   │   ├── constant.js            # App constants
│   │   ├── googleOAuth.js         # Google OAuth helpers
│   │   ├── logger.js              # Pino logger configuration
│   │   ├── normalizePath.js       # Path normalization utility
│   │   ├── prisma.js              # Prisma client singleton
│   │   ├── redis.js               # Redis client & session store
│   │   └── test.js                # Testing utilities
│   │
│   └── workers/                   # Background job processors
│       └── email.worker.js        # Email worker (processes queue jobs)
│
├── scripts/                       # Utility scripts
└── tests/                         # Unit and integration tests
```

### **Architecture Pattern: 3-Tier MVC with Background Jobs**

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                             │
│                    (Frontend - React/Vite)                        │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP/WebSocket
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                           │
│                     (Controllers + Routes)                        │
│  • HTTP Request/Response handling                                │
│  • Input validation (DTOs)                                       │
│  • Session management                                            │
└────────────────────────────┬─────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│                        BUSINESS LAYER                             │
│                          (Services)                               │
│  • Business logic & validation                                   │
│  • Authentication & authorization                                │
│  • Job enqueueing (async tasks)                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                               │
│                            (DAOs)                                 │
│  • Database operations (Prisma)                                  │
│  • Redis operations (sessions, cache)                            │
└────────────────────────────┬─────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│                        PERSISTENCE LAYER                          │
│  PostgreSQL (Data) │ Redis (Sessions/Cache) │ BullMQ (Jobs)     │
└──────────────────────────────────────────────────────────────────┘

                  ┌─────────────────────────┐
                  │  BACKGROUND PROCESSING  │
                  │      (BullMQ Workers)   │
                  │  • Email worker         │
                  │  • AI processing        │
                  │  • Report generation    │
                  └─────────────────────────┘
```

### **Module Organization (Path Aliases)**

The project uses ES Module imports with path aliases for clean imports:

```javascript
import ApiError from '#entities/ApiError.js';
import logger from '#utils/logger.js';
import { findUserByEmail } from '#api/auth/daos/user.dao.js';
import { REDIS_URL } from '#config/env.js';

// Defined in package.json:
{
  "imports": {
    "#src/*": "./src/*",
    "#utils/*": "./src/utils/*",
    "#config/*": "./src/config/*",
    "#api/*": "./src/api/*",
    "#entities/*": "./src/entities/*",
    "#middlewares/*": "./src/middlewares/*",
    // ... and more
  }
}
```

---

## � Email Verification System

### **Overview**

The platform implements a secure **6-digit OTP (One-Time Password)** email verification system using:
- **BullMQ** for asynchronous job processing
- **Nodemailer** for email delivery
- **bcrypt** for OTP hashing
- **Redis** for job queue management

### **Email Verification Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER REGISTRATION                                            │
│    POST /api/auth/register                                      │
│    • User created with isVerified=false                         │
│    • OTP generated (6-digit number)                             │
│    • OTP hashed with bcrypt                                     │
│    • Hash stored in database with 10min expiry                  │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. EMAIL JOB ENQUEUED                                           │
│    enqueueVerificationEmail(userId, email, otp)                 │
│    • Job added to BullMQ email queue                            │
│    • Job name: "SEND_VERIFICATION_EMAIL"                        │
│    • Job ID: "verify-email:{userId}"                            │
│    • Retry policy: 5 attempts, exponential backoff             │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. BACKGROUND WORKER PROCESSES JOB                              │
│    email.worker.js (concurrency: 5)                             │
│    • Picks up job from queue                                    │
│    • Calls sendVerificationEmail(email, otp)                    │
│    • Sends email via Nodemailer                                 │
│    • Job marked as completed or failed                          │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. USER RECEIVES EMAIL                                          │
│    Subject: "Your TutorOps verification code"                   │
│    Body: Contains 6-digit OTP                                   │
│    Note: "This code expires in 10 minutes"                      │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. USER SUBMITS OTP                                             │
│    POST /api/auth/verifyOtp                                     │
│    Body: { email, otp }                                         │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. OTP VERIFICATION                                             │
│    • Find user by email                                         │
│    • Check if already verified                                  │
│    • Fetch OTP record from database                             │
│    • Check expiry (< 10 minutes)                                │
│    • Compare OTP with bcrypt.compare(otp, storedHash)          │
│    • If valid:                                                  │
│      - Mark user.isVerified = true                              │
│      - Delete OTP record                                        │
│      - Create session (auto-login)                              │
│      - Return success response                                  │
└─────────────────────────────────────────────────────────────────┘
```

### **Database Schema for OTP**

```prisma
model User {
  id         String    @id @default(cuid())
  email      String    @unique
  isVerified Boolean   @default(false)
  codehash   String?                    // ← Hashed OTP
  expiry     DateTime?                  // ← OTP expiration time
  // ... other fields
}
```

### **OTP API Endpoints**

#### **Send OTP** (POST /api/auth/sendOtp)
```javascript
Request:
{
  "email": "user@example.com"
}

Success Response (200):
{
  "success": true,
  "message": "OTP sent to email"
}

Error Cases:
• 404: User not found
• 400: Email already verified
```

#### **Verify OTP** (POST /api/auth/verifyOtp)
```javascript
Request:
{
  "email": "user@example.com",
  "otp": "123456"
}

Success Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4...",
      "email": "user@example.com",
      "role": "STUDENT",
      "isVerified": true
    }
  },
  "message": "Email verification successful"
}

Error Cases:
• 404: User not found
• 400: Email already verified
• 400: OTP not found or expired
• 400: Invalid OTP
```

### **Email Service Architecture**

#### **Producer (email.producer.js)**
```javascript
// Enqueues email jobs to BullMQ
export const enqueueVerificationEmail = async (userId, email, otp) => {
  return emailQueue.add("SEND_VERIFICATION_EMAIL", {
    userId,
    email,
    otp,
  }, {
    jobId: `verify-email:${userId}`,
  });
};
```

#### **Queue (email.queue.js)**
```javascript
// BullMQ queue configuration
export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: createBullmqConnection(),
  prefix: "tutorops:email",
  defaultJobOptions: {
    attempts: 5,                              // Retry up to 5 times
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,                   // Clean up successful jobs
    removeOnFail: false,                      // Keep failed jobs for debugging
  },
});
```

#### **Worker (email.worker.js)**
```javascript
// Background worker processing email jobs
const worker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    switch (job.name) {
      case "SEND_VERIFICATION_EMAIL":
        const { userId, email, otp } = job.data;
        await sendVerificationEmail({email, otp});
        break;
      // More job types can be added here
    }
  },
  {
    connection: createBullmqConnection(),
    concurrency: 5,  // Process 5 jobs concurrently
  }
);
```

#### **Service (email.service.js)**
```javascript
// Nodemailer email sending
export const sendVerificationEmail = async ({email, otp}) => { 
  const mailOptions = {
    from: `"TutorOps" <${process.env.MAIL_FROM}>`,
    to: email,
    subject: 'Your TutorOps verification code',
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:4px">${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  };
  
  const info = await transporter.sendMail(mailOptions);
};
```

---

## ⚙️ Background Job Processing

### **BullMQ Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION                              │
│  ┌──────────────┐                                               │
│  │  Controllers  │ → enqueueJob() → Producer                     │
│  └──────────────┘                                               │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                           REDIS                                  │
│  Queue: tutorops:email:SEND_VERIFICATION_EMAIL                  │
│  • Job data (userId, email, otp)                                │
│  • Job state (waiting, active, completed, failed)               │
│  • Retry attempts & backoff timing                              │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKGROUND WORKER                           │
│  email.worker.js                                                │
│  • Polls queue for jobs                                         │
│  • Processes jobs concurrently (5 workers)                      │
│  • Handles retries with exponential backoff                     │
│  • Emits events (completed, failed, error)                      │
└─────────────────────────────────────────────────────────────────┘
```

### **Job Processing Features**

| Feature | Configuration | Description |
|---------|--------------|-------------|
| **Concurrency** | 5 jobs | Process multiple emails simultaneously |
| **Retry Policy** | 5 attempts | Automatically retry failed jobs |
| **Backoff Strategy** | Exponential | Delay increases: 1s, 2s, 4s, 8s, 16s |
| **Job Cleanup** | Auto-remove | Successful jobs deleted automatically |
| **Failed Jobs** | Kept | Stored for debugging and manual retry |
| **Job Uniqueness** | By userId | One verification email per user at a time |

### **Worker Event Handling**

```javascript
worker.on("completed", (job) => {
  logSystemEvent(`Job completed: ${job.id} (${job.name})`);
});

worker.on("failed", (job, err) => {
  logError(`Job failed: ${job.id} (${job.name}) - Error: ${err.message}`);
});

worker.on("error", (err) => {
  logError(`Worker error: ${err.message}`);
});
```

### **Redis Connection Factory (bullmqConnection.js)**

```javascript
export const createBullmqConnection = () => {
  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,    // No retry limit for BullMQ
    enableReadyCheck: false,        // Faster startup
  });
};
```

### **Future Job Types (Planned)**

- **AI_GENERATE_PROBLEM** - Generate math problems using AI
- **AI_GRADE_ATTEMPT** - Auto-grade student submissions
- **GENERATE_REPORT** - Create student performance reports
- **SEND_REMINDER_EMAIL** - Assignment deadline reminders
- **BATCH_EXPORT_DATA** - Export large datasets
- **CLEANUP_OLD_SESSIONS** - Periodic session cleanup

---

## �🔐 Complete Authentication Flow

### **Overview**

The authentication system uses **session-based authentication** with Redis storage, supporting:

- ✅ Email/Password registration & login
- ✅ Google OAuth 2.0
- ✅ Multi-device session tracking
- ✅ Secure logout (single & all devices)
- ✅ CSRF protection
- ✅ Password hashing (bcrypt)

---

### **1️⃣ Registration Flow**

**Endpoint:** `POST /api/auth/register`  
**Request Body:**

```json
{
    "email": "student@example.com",
    "password": "SecurePass123",
    "username": "john_doe",
    "role": 0 // 0=STUDENT, 1=TEACHER, 2=ADMIN
}
```

**Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT REQUEST                                               │
│    POST /api/auth/register                                      │
│    Headers: { _csrf: "token" }                                  │
│    Body: { email, password, username, role }                    │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. MIDDLEWARE STACK (app.js)                                    │
│    ✓ CORS validation (localhost:5173 + 172.20.64.1:5000)       │
│    ✓ JSON body parsing                                          │
│    ✓ Cookie parsing                                             │
│    ✓ Request/Response logging (Pino)                            │
│    ✓ Session middleware (loads session from Redis)             │
│    ✓ CSRF token validation                                      │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. ROUTING                                                       │
│    core/router.js → /api/auth → auth/router.js                 │
│    auth/router.js → POST /register → registerController        │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. CONTROLLER (register.controller.js)                          │
│    • Extract { email, password, username, role }                │
│    • Call registerService()                                     │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. SERVICE (register.service.js)                                │
│    Step 1: Check if email exists                                │
│            findUserByEmail(email) → Prisma query                │
│            If exists → throw ApiError.badRequest(400)           │
│                                                                  │
│    Step 2: Hash password                                        │
│            salt = bcrypt.genSalt(10)                            │
│            hashedPassword = bcrypt.hash(password, salt)         │
│                                                                  │
│    Step 3: Convert role                                         │
│            ROLE[0] → "STUDENT"                                  │
│            ROLE[1] → "TEACHER"                                  │
│            ROLE[2] → "ADMIN"                                    │
│                                                                  │
│    Step 4: Create user in database                              │
│            createUser(prisma, {email, hashedPassword, ...})     │
│                                                                  │
│    Step 5: Return user data                                     │
│            return { id, role, email, username }                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. DAO (user.dao.js)                                            │
│    createUser():                                                │
│      • Normalize email to lowercase                             │
│      • Prisma: user.create({                                    │
│          data: {                                                │
│            email: email.toLowerCase(),                          │
│            password: hashedPassword,                            │
│            username,                                            │
│            name: username,                                      │
│            role: "STUDENT"                                      │
│          }                                                      │
│        })                                                       │
│      • Returns new user object with generated ID (cuid)         │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. SESSION CREATION (back in controller)                        │
│    Step 1: Regenerate session (prevents session fixation)      │
│            req.session.regenerate()                             │
│                                                                  │
│    Step 2: Store user in session                                │
│            req.session.user = { id, role }                      │
│                                                                  │
│    Step 3: Get session ID                                       │
│            sessionID = req.sessionID (auto-generated UUID)      │
│                                                                  │
│    Step 4: Track session in Redis                               │
│            addSessionForUser(userId, sessionID)                 │
│            Redis: SADD user_sessions:{userId} sessionID         │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. RESPONSE                                                      │
│    Status: 201 Created                                          │
│    Headers:                                                      │
│      Set-Cookie: tutorops_session={sessionID};                  │
│                  HttpOnly; SameSite=Lax; Max-Age=604800         │
│    Body:                                                         │
│      {                                                           │
│        "data": {                                                │
│          "userData": {                                          │
│            "id": "cm4abc123xyz",                                │
│            "email": "student@example.com",                      │
│            "username": "john_doe",                              │
│            "role": "STUDENT"                                    │
│          }                                                      │
│        },                                                       │
│        "message": "Registration successful"                     │
│      }                                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Database State After Registration:**

```
PostgreSQL (User table):
┌──────────────┬───────────────────────┬──────────┬─────────┬──────────────┐
│ id           │ email                 │ username │ role    │ password     │
├──────────────┼───────────────────────┼──────────┼─────────┼──────────────┤
│ cm4abc123xyz │ student@example.com   │ john_doe │ STUDENT │ $2a$10$...  │
└──────────────┴───────────────────────┴──────────┴─────────┴──────────────┘

Redis:
tutorops:sess:{sessionID} → { "user": { "id": "cm4abc123xyz", "role": "STUDENT" } }
user_sessions:cm4abc123xyz → ["sess:abc123..."]
```

---

### **2️⃣ Login Flow**

**Endpoint:** `POST /api/auth/login`  
**Request Body:**

```json
{
    "email": "student@example.com",
    "password": "SecurePass123"
}
```

**Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT REQUEST                                               │
│    POST /api/auth/login                                         │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. MIDDLEWARE STACK (same as registration)                      │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CONTROLLER (login.controller.js)                             │
│    • Extract { email, password }                                │
│    • Call loginService()                                        │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. SERVICE (login.service.js)                                   │
│    Step 1: Find user by email                                   │
│            user = findUserByEmail(email)                        │
│            If !user → throw ApiError(400, "Invalid email/pass") │
│                                                                  │
│    Step 2: Verify password                                      │
│            valid = verifyUserPassword(user, password)           │
│            Uses: bcrypt.compare(password, user.password)        │
│            If !valid → throw ApiError(400, "Invalid email/pass")│
│                                                                  │
│    Step 3: Return user payload                                  │
│            return { id, role, email, username }                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. SESSION CREATION (back in controller)                        │
│    Step 1: Regenerate session (security: new session ID)       │
│    Step 2: req.session.user = { id, role }                     │
│    Step 3: Track in Redis: addSessionForUser(userId, sessionID)│
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. RESPONSE                                                      │
│    Status: 200 OK                                               │
│    Cookie: tutorops_session (7-day expiry)                      │
│    Body: { data: { user }, message: "Login successful" }       │
└─────────────────────────────────────────────────────────────────┘
```

**Security Notes:**

- Session regeneration prevents **session fixation attacks**
- Generic error messages prevent **user enumeration**
- Bcrypt comparison is **timing-safe**

---

### **3️⃣ Get Current User (Me)**

**Endpoint:** `GET /api/auth/me`  
**Protected:** ✅ Yes (requires authentication)

**Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT REQUEST                                               │
│    GET /api/auth/me                                             │
│    Cookie: tutorops_session={sessionID}                         │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. SESSION MIDDLEWARE (app.js)                                  │
│    • Read cookie: tutorops_session                              │
│    • Query Redis: GET tutorops:sess:{sessionID}                 │
│    • Deserialize: req.session = { user: { id, role } }         │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. isAuthenticated MIDDLEWARE                                   │
│    Check 1: req.session exists? ✓                               │
│    Check 2: req.session.user exists? ✓                          │
│    Check 3: req.session.user.id exists? ✓                       │
│                                                                  │
│    If ANY check fails:                                          │
│      → return ApiError(401, "Unauthorized : Not logged in")     │
│                                                                  │
│    If all pass:                                                 │
│      → next()                                                   │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. CONTROLLER (getme.controller.js)                             │
│    • userId = req.session.user.id (guaranteed by middleware)    │
│    • Call getMe(req, res)                                       │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. SERVICE (getMe.service.js)                                   │
│    • user = findUserById(req.session.user.id)                   │
│    • Return { user }                                            │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. DAO (user.dao.js)                                            │
│    findUserById():                                              │
│      Prisma: user.findUnique({                                  │
│        where: { id },                                           │
│        select: { id, email, name, username, role }              │
│      })                                                         │
│      Note: password field is excluded                           │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. RESPONSE                                                      │
│    Status: 200 OK                                               │
│    Body: {                                                       │
│      "user": {                                                  │
│        "id": "cm4abc123xyz",                                    │
│        "email": "student@example.com",                          │
│        "name": "john_doe",                                      │
│        "username": "john_doe",                                  │
│        "role": "STUDENT"                                        │
│      }                                                          │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

### **4️⃣ Logout (Single Device)**

**Endpoint:** `POST /api/auth/logout`

**Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT REQUEST                                               │
│    POST /api/auth/logout                                        │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. CONTROLLER (logout.controller.js)                            │
│    Step 1: Get session info                                     │
│            userId = req.session?.user?.id                       │
│            sessionId = req.sessionID                            │
│                                                                  │
│    Step 2: Remove from tracking (if exists)                     │
│            if (userId && sessionId):                            │
│              logoutService(userId, sessionId)                   │
│              → Redis: SREM user_sessions:{userId} sessionId     │
│                                                                  │
│    Step 3: Destroy session                                      │
│            req.session.destroy()                                │
│            → Redis: DEL tutorops:sess:{sessionID}               │
│                                                                  │
│    Step 4: Clear cookie                                         │
│            res.clearCookie('tutorops_session')                  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. RESPONSE                                                      │
│    Status: 200 OK                                               │
│    Body: { message: "Logged out successfully" }                │
└─────────────────────────────────────────────────────────────────┘
```

---

### **5️⃣ Logout All Devices**

**Endpoint:** `POST /api/auth/logoutAllDevices`  
**Protected:** ✅ Yes (requires authentication)

**Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT REQUEST                                               │
│    POST /api/auth/logoutAllDevices                              │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. isAuthenticated MIDDLEWARE                                   │
│    Validates session exists                                     │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CONTROLLER (logoutAllDevicesController)                      │
│    Step 1: userId = req.session.user.id (guaranteed)            │
│                                                                  │
│    Step 2: Call logoutAllDevicesService(userId)                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. SERVICE (logoutAllDevicesService)                            │
│    Step 1: Get all session IDs for user                         │
│            sessions = getSessionsForUser(userId)                │
│            Redis: SMEMBERS user_sessions:{userId}               │
│            Returns: ["sess:abc", "sess:def", "sess:ghi"]        │
│                                                                  │
│    Step 2: Destroy each session in Redis store                  │
│            For each sessionId:                                  │
│              store.destroy(sessionId)                           │
│              Redis: DEL tutorops:sess:{sessionId}               │
│                                                                  │
│    Step 3: Clear tracking set                                   │
│            removeAllSessionsForUser(userId)                     │
│            Redis Pipeline: SREM user_sessions:{userId} (all)    │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. BACK TO CONTROLLER                                           │
│    Step 1: Destroy current session too                          │
│            req.session.destroy()                                │
│                                                                  │
│    Step 2: Clear cookie                                         │
│            res.clearCookie('tutorops_session')                  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. RESPONSE                                                      │
│    Status: 200 OK                                               │
│    Body: { message: "Logged out from all devices successfully" }│
└─────────────────────────────────────────────────────────────────┘
```

**Effect:**

- All active sessions destroyed across all devices
- User must login again everywhere
- Useful for security incidents or password changes

---

### **6️⃣ Google OAuth Flow**

**Endpoint:** `POST /api/auth/googleCallback`

**Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION                                             │
│    • User clicks "Sign in with Google" on frontend              │
│    • Frontend redirects to Google OAuth consent screen          │
│    • User approves permissions                                  │
│    • Google redirects to: {BACKEND_URL}/auth/google-callback    │
│      Query params: ?code=AUTH_CODE&state={"from":"/dashboard"}  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. CONTROLLER (googleCallback.controller.js)                    │
│    Step 1: Extract & parse params                               │
│            code = req.query.code                                │
│            state = JSON.parse(decodeURIComponent(req.query.state))│
│            If !code → redirect to FRONTEND_URL                  │
│                                                                  │
│    Step 2: Authenticate with Google                             │
│            googleUser = authenticateGoogleLogin(code)           │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. SERVICE (googleAuth.service.js)                              │
│    authenticateGoogleLogin(code):                               │
│      Call getGoogleUserFromCode(code)                           │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. OAUTH UTILITY (googleOAuth.js)                               │
│    getGoogleUserFromCode(code):                                 │
│                                                                  │
│    Step 1: Exchange code for tokens                             │
│            exchangeCodeForTokens(code)                          │
│            POST https://oauth2.googleapis.com/token             │
│            Body: {                                              │
│              client_id: GOOGLE_CLIENT_ID,                       │
│              client_secret: GOOGLE_CLIENT_SECRET,               │
│              code: code,                                        │
│              grant_type: "authorization_code",                  │
│              redirect_uri: "{BACKEND_URL}/auth/google-callback" │
│            }                                                    │
│            Response: { access_token, id_token }                 │
│                                                                  │
│    Step 2: Get user info                                        │
│            getGoogleUserInfo(access_token)                      │
│            GET https://googleapis.com/oauth2/v1/userinfo        │
│            Headers: { Authorization: "Bearer {access_token}" }  │
│            Response: { id, email, name, picture }               │
│                                                                  │
│    Return: { googleUser, tokens }                               │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. BACK TO CONTROLLER                                           │
│    Step 3: Find or create user                                  │
│            user = googleLoginService(googleUser)                │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. SERVICE (googleAuth.service.js)                              │
│    googleLoginService(googleUser):                              │
│                                                                  │
│    Step 1: Try to find existing user                            │
│            user = findUserByEmail(googleUser.email)             │
│                                                                  │
│    Step 2: If not found, create new user                        │
│            if (!user):                                          │
│              user = createGoogleUser(googleUser)                │
│              Prisma: user.create({                              │
│                email: googleUser.email.toLowerCase(),           │
│                name: googleUser.name,                           │
│                googleId: googleUser.id,                         │
│                password: null,  ← No password for OAuth users   │
│                role: "STUDENT"  ← Default role                  │
│              })                                                 │
│                                                                  │
│    Step 3: Return user                                          │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. BACK TO CONTROLLER - SESSION CREATION                        │
│    Step 1: Regenerate session                                   │
│            req.session.regenerate()                             │
│                                                                  │
│    Step 2: Store user in session                                │
│            req.session.user = { id: user.id, role: user.role }  │
│                                                                  │
│    Step 3: Track session                                        │
│            addSessionForUser(user.id, req.sessionID)            │
│                                                                  │
│    Step 4: Redirect to frontend                                 │
│            res.redirect(`${FRONTEND_URL}${state.from || '/'}`)  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. USER REDIRECTED TO FRONTEND                                  │
│    • Session cookie automatically sent                          │
│    • User is authenticated                                      │
│    • Lands on requested page (e.g., /dashboard)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### **Authentication Endpoints**

| Method | Endpoint                     | Protected | Description                           |
| ------ | ---------------------------- | --------- | ------------------------------------- |
| POST   | `/api/auth/register`         | ❌        | Register new user (email/password)    |
| POST   | `/api/auth/sendOtp`          | ❌        | Send/resend OTP for email verification|
| POST   | `/api/auth/verifyOtp`        | ❌        | Verify OTP and activate account       |
| POST   | `/api/auth/login`            | ❌        | Login with credentials                |
| POST   | `/api/auth/logout`           | ❌        | Logout current device                 |
| POST   | `/api/auth/logoutAllDevices` | ✅        | Logout all devices                    |
| POST   | `/api/auth/googleCallback`   | ❌        | Google OAuth callback handler         |
| GET    | `/api/auth/me`               | ✅        | Get current user info                 |
| GET    | `/api/auth/csrf-token`       | ❌        | Get CSRF token for forms              |

### **System Endpoints**

| Method | Endpoint             | Protected | Description              |
| ------ | -------------------- | --------- | ------------------------ |
| GET    | `/api/system/health` | ❌        | Health check (DB, Redis) |
| GET    | `/test`              | ❌        | Basic handshake test     |

### **Detailed Endpoint Specifications**

#### **POST /api/auth/register**
```javascript
// Request
{
  "email": "student@example.com",
  "password": "SecurePass123",
  "username": "john_doe",
  "role": 0  // 0=STUDENT, 1=TEACHER, 2=ADMIN
}

// Success Response (201)
{
  "success": true,
  "data": {
    "userData": {
      "id": "cm4abc123xyz",
      "email": "student@example.com",
      "username": "john_doe",
      "role": "STUDENT",
      "isVerified": false
    }
  },
  "message": "Registration successful"
}

// Automatically triggers:
• OTP generation (6-digit)
• OTP hash stored in database
• Verification email job enqueued
```

#### **POST /api/auth/sendOtp**
```javascript
// Request
{
  "email": "student@example.com"
}

// Success Response (200)
{
  "success": true,
  "message": "OTP sent to email"
}

// Error Responses
• 404: User not found
• 400: Email already verified
```

#### **POST /api/auth/verifyOtp**
```javascript
// Request
{
  "email": "student@example.com",
  "otp": "123456"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "email": "student@example.com",
      "username": "john_doe",
      "role": "STUDENT",
      "isVerified": true
    }
  },
  "message": "Email verification successful"
}

// Side Effects:
• User marked as verified
• OTP record deleted
• Session created (auto-login)
• Session cookie set
```

#### **POST /api/auth/login**
```javascript
// Request
{
  "email": "student@example.com",
  "password": "SecurePass123"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "email": "student@example.com",
      "username": "john_doe",
      "role": "STUDENT"
    }
  },
  "message": "Login successful"
}

// Side Effects:
• Session regenerated (prevents fixation)
• Session stored in Redis
• Cookie set (7-day expiry)
```

#### **GET /api/auth/me** (Protected)
```javascript
// Request Headers
Cookie: tutorops_session={sessionID}

// Success Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "email": "student@example.com",
      "name": "john_doe",
      "username": "john_doe",
      "role": "STUDENT",
      "isVerified": true
    }
  }
}

// Error Response
• 401: Unauthorized (not logged in or invalid session)
```

#### **POST /api/auth/logout**
```javascript
// Request
// No body required

// Success Response (200)
{
  "success": true,
  "message": "Logged out successfully"
}

// Side Effects:
• Current session destroyed in Redis
• Session removed from user's session set
• Cookie cleared
```

#### **POST /api/auth/logoutAllDevices** (Protected)
```javascript
// Request Headers
Cookie: tutorops_session={sessionID}

// Success Response (200)
{
  "success": true,
  "message": "Logged out from all devices successfully"
}

// Side Effects:
• All user sessions destroyed in Redis
• User's session tracking set cleared
• Current cookie cleared
```

#### **GET /api/auth/csrf-token**
```javascript
// Success Response (200)
{
  "csrfToken": "abc123def456..."
}

// Usage:
// Frontend must include this token in:
// - Form field: <input name="_csrf" value={token} />
// - Header: X-CSRF-Token: {token}
```

---

## 🗄️ Database Schema (Prisma ORM)

### **Complete Schema Overview**

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  engineType   = "client"
  moduleFormat = "esm"
}

datasource db {
  provider = "postgresql"
}

// User model with authentication and verification fields
model User {
  id         String    @id @default(cuid())
  name       String
  username   String?   @unique
  email      String    @unique
  password   String?                        // Nullable for OAuth users
  googleId   String?   @unique              // For Google OAuth
  role       Role
  isVerified Boolean   @default(false)      // Email verification status
  codehash   String?                        // Hashed OTP for verification
  expiry     DateTime?                      // OTP expiration timestamp
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  // Relations
  classesTaught   Class[]      @relation("TeacherClasses")
  enrollments     Enrollment[]
  problemsCreated Problem[]
  attempts        Attempt[]
  Report          Report[]

  // Indexes for performance
  @@index([email])
  @@index([username])
}

// Class model - Teachers create classes
model Class {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  teacherId   String
  teacher     User         @relation("TeacherClasses", fields: [teacherId], references: [id])
  enrollments Enrollment[]
  assignments Assignment[]

  @@index([teacherId])
}

// Enrollment model - Students join classes
model Enrollment {
  id       String   @id @default(cuid())
  joinedAt DateTime @default(now())

  // Relations
  classId   String
  studentId String
  class     Class  @relation(fields: [classId], references: [id])
  student   User   @relation(fields: [studentId], references: [id])
}

// Assignment model - Class assignments
model Assignment {
  id          String    @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  classId  String
  class    Class             @relation(fields: [classId], references: [id])
  problems ProblemInstance[]
  reports  Report[]
}

// Problem model - Reusable problem templates
model Problem {
  id           String   @id @default(cuid())
  templateCode String                        // Code to generate problem
  topic        String
  difficulty   String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  creatorId String
  creator   User              @relation(fields: [creatorId], references: [id])
  instances ProblemInstance[]
}

// ProblemInstance model - Specific problem instances
model ProblemInstance {
  id        String   @id @default(cuid())
  params    Json?                           // Problem parameters
  latex     String?                         // LaTeX representation
  answer    Json?                           // Correct answer(s)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  assignmentId String
  problemId    String
  assignment   Assignment @relation(fields: [assignmentId], references: [id])
  problem      Problem    @relation(fields: [problemId], references: [id])
  attempts     Attempt[]
}

// Attempt model - Student submissions
model Attempt {
  id             String   @id @default(cuid())
  response       Json?                      // Student's answer
  autoScore      Float?                     // AI-generated score
  finalScore     Float?                     // Teacher-adjusted score
  teacherComment String?
  submittedAt    DateTime @default(now())

  // Relations
  problemInstanceId String
  studentId         String
  problemInstance   ProblemInstance @relation(fields: [problemInstanceId], references: [id])
  student           User            @relation(fields: [studentId], references: [id])
}

// Report model - Performance reports
model Report {
  id          String   @id @default(cuid())
  data        Json?                         // Report data/analytics
  generatedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  assignmentId String
  studentId    String
  assignment   Assignment @relation(fields: [assignmentId], references: [id])
  student      User       @relation(fields: [studentId], references: [id])
}

// Enum for user roles
enum Role {
  STUDENT
  TEACHER
  ADMIN
}
```

### **Database Migrations**

| Migration ID | Date | Description |
|--------------|------|-------------|
| `20260202141504_init` | Feb 2, 2026 | Initial schema with all core models |
| `20260204161851_otp_expiry_added` | Feb 4, 2026 | Added OTP verification fields (codehash, expiry) |

### **Entity Relationships Diagram**

```
┌──────────────────────────────────────────────────────────────────┐
│                          USER                                     │
│  • Authentication (email, password, googleId)                    │
│  • Verification (isVerified, codehash, expiry)                   │
│  • Role (STUDENT, TEACHER, ADMIN)                                │
└─────────┬────────────────────────────────────┬──────────────────┘
          │                                    │
          │ Teacher                            │ Student
          ↓                                    ↓
┌─────────────────┐                   ┌──────────────────┐
│     CLASS       │←──────────────────│   ENROLLMENT     │
│  • name         │  classId           │  • joinedAt      │
│  • teacherId    │                    │  • studentId     │
└────────┬────────┘                   └──────────────────┘
         │
         │ has many
         ↓
┌──────────────────┐
│   ASSIGNMENT     │
│  • title         │
│  • description   │
│  • dueDate       │
└────────┬─────────┘
         │
         │ contains
         ↓
┌──────────────────────┐         ┌──────────────────┐
│  PROBLEM INSTANCE    │────────>│     PROBLEM      │
│  • params            │ uses    │  • templateCode  │
│  • latex             │         │  • topic         │
│  • answer            │         │  • difficulty    │
└────────┬─────────────┘         └──────────────────┘
         │
         │ receives
         ↓
┌──────────────────┐
│     ATTEMPT      │
│  • response      │
│  • autoScore     │
│  • finalScore    │
│  • studentId     │
└──────────────────┘

┌──────────────────┐
│     REPORT       │ (Generated per student per assignment)
│  • data          │
│  • assignmentId  │
│  • studentId     │
└──────────────────┘
```

### **Key Schema Features**

1. **User Authentication**
   - Email/password + Google OAuth support
   - OTP-based email verification
   - Role-based access control

2. **Educational Structure**
   - Teachers create classes
   - Students enroll in classes
   - Classes contain assignments

3. **Problem System**
   - Reusable problem templates
   - Parameterized problem instances
   - AI-generated problems (planned)

4. **Assessment**
   - Student attempts tracked
   - Auto-grading capability
   - Teacher override for final scores

5. **Analytics**
   - Performance reports per student
   - Data stored in JSON format for flexibility

---

## 🔍 Logging & Monitoring

### **Pino Logger Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                      PINO BASE LOGGER                            │
│  • Level: debug (dev) / info (prod)                             │
│  • ISO timestamps                                               │
│  • Auto-redaction: passwords, auth headers                      │
└──────────────────┬──────────────────────────────────────────────┘
                   ↓
         ┌─────────┴─────────┐
         │                   │
         ↓                   ↓
  ┌─────────────┐    ┌─────────────────┐
  │ DEVELOPMENT │    │   PRODUCTION    │
  │  pino-pretty │    │   JSON to file  │
  │  • Colored   │    │   ./logs/app.log│
  │  • Formatted │    │   • Structured  │
  └─────────────┘    └─────────────────┘
```

### **Logger Configuration (logger.js)**

```javascript
const baselogger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  redact: ['req.headers.authorization', 'password'],
  timestamp: pino.stdTimeFunctions.isoTime,
  
  serializers: {
    err: (error) => {
      // Control stack trace inclusion
      if (!error || error.showStack === false) {
        return error?.message;
      }
      return {
        message: error.message,
        stack: error.stack,
      };
    },
  },
  
  transport: !isProd
    ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        ignore: 'headers,query,params,body,pid,hostname',
        singleLine: true,
      },
    }
    : {
      target: 'pino/file',
      options: { destination: './logs/app.log' },
    },
});
```

### **Module-Specific Loggers**

```javascript
const childLoggers = {
  ai: baselogger.child({ module: 'AI' }),
  database: baselogger.child({ module: 'Database' }),
  http: baselogger.child({ module: 'HTTP' }),
  socket: baselogger.child({ module: 'Socket.IO' }),
};

// Dynamic logger creation
const getChildLogger = (module, meta = {}) => 
  baselogger.child({ module, ...meta });
```

### **Express Middleware Integration**

#### **Request Logger**
```javascript
const requestLogger = (req, res, next) => {
  baselogger.info({
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    params: req.params,
  }, 'Incoming request');
  next();
};
```

#### **Response Logger**
```javascript
const responseLogger = (req, res, next) => {
  const oldSend = res.send;
  res.send = function (...args) {
    baselogger.info({
      statusCode: res.statusCode,
      body: args[0],
    }, 'Response sent');
    oldSend.apply(res, args);
  };
  next();
};
```

#### **Error Logger**
```javascript
const errorLogger = (err, req, res, next, stackenabled = true) => {
  let cleanStack = '';
  
  if (err.stack && stackenabled) {
    cleanStack = err.stack
      .split('\n')
      .filter(line =>
        line.includes('src/') &&
        !line.includes('node_modules') &&
        !line.includes('(internal')
      )
      .map(line => normalizePath(line))
      .join('\n');
  }
  
  baselogger.error({
    message: err.message,
    code: err.statusCode || err.code,
    method: req.method,
    url: req.url,
    stack: cleanStack,
  }, 'Error occurred');
};
```

### **Helper Logging Functions**

```javascript
helpers = {
  logError: (message, meta = {}) => {
    baselogger.error({ ...meta }, message);
  },
  
  logWarning: (message, meta = {}) => {
    baselogger.warn({ ...meta }, message);
  },
  
  logSystemEvent: (message, meta = {}) => {
    baselogger.info({ ...meta }, message);
  },
};
```

### **Logging Best Practices**

1. **Selective Logging**
   - Skip logging for 400, 401, 403, 404 (common errors)
   - Always log 500+ errors
   - Always log Prisma errors

2. **Sensitive Data Redaction**
   - Auto-redact: `password`, `authorization` headers
   - Never log full user objects with passwords

3. **Stack Trace Filtering**
   - Only show `src/` files in stack traces
   - Exclude `node_modules`, internal Node.js calls
   - Normalize paths for consistency

4. **Environment-Specific Formatting**
   - **Development:** Pretty-printed, colored output
   - **Production:** JSON logs to file for aggregation

5. **Structured Logging**
   - Use JSON format for machine parsing
   - Include context: module, method, url, statusCode
   - Attach metadata for debugging

### **Log Levels**

| Level | When to Use | Example |
|-------|------------|---------|
| **debug** | Detailed diagnostic info | Variable values, function entry/exit |
| **info** | General information | Request received, job completed |
| **warn** | Warning conditions | Deprecated API usage, retry attempts |
| **error** | Error conditions | Failed database queries, exceptions |
| **fatal** | Critical errors | System crash, unrecoverable errors |

### **Example Log Outputs**

#### Development (pino-pretty)
```
[2026-02-05 14:30:15.123] INFO (HTTP): Incoming request
    method: "POST"
    url: "/api/auth/login"
    
[2026-02-05 14:30:15.456] INFO (HTTP): Response sent
    statusCode: 200
    
[2026-02-05 14:30:16.789] ERROR (Database): Query failed
    message: "Unique constraint violation"
    code: "P2002"
```

#### Production (JSON)
```json
{
  "level": 30,
  "time": "2026-02-05T14:30:15.123Z",
  "module": "HTTP",
  "method": "POST",
  "url": "/api/auth/login",
  "msg": "Incoming request"
}
```

---

## 🔒 Security Features

### **1. Session Security**

```javascript
{
  store: RedisStore,              // Fast, scalable storage
  name: 'tutorops_session',
  secret: SESSION_SECRET,         // From env variable
  resave: false,
  saveUninitialized: false,
  rolling: true,                  // Extend expiry on activity
  cookie: {
    httpOnly: true,               // Prevents XSS attacks
    secure: NODE_ENV === 'production',  // HTTPS only in prod
    sameSite: 'lax',              // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  }
}
```

**Session Regeneration:**

- After login → Prevents session fixation
- After registration → Prevents session fixation
- After OAuth → Prevents session fixation

### **2. Password Security**

- **Hashing:** bcrypt with 10 salt rounds
- **Comparison:** Timing-safe bcrypt.compare()
- **Storage:** Never returned in API responses
- **Validation:** Minimum complexity (enforced client-side)

### **3. CSRF Protection**

```javascript
app.use(csurf());  // After sessions

// Token exposed at:
GET /api/auth/csrf-token → { csrfToken: "..." }

// Frontend includes token in:
// - Form: <input name="_csrf" value={token} />
// - Header: X-CSRF-Token: {token}
```

### **4. CORS Configuration**

```javascript
cors({
    origin: [
        process.env.FRONTEND_URL, // Main frontend
        'http://172.20.64.1:5000', // Additional allowed origin
    ],
    credentials: true, // Allow cookies
});
```

### **5. Error Handling**

```javascript
// ApiError class with helper methods
ApiError.badRequest(400)      // Client errors
ApiError.unauthorized(401)     // Auth failures
ApiError.forbidden(403)        // Permission denied
ApiError.notFound(404)         // Resource not found
ApiError.internal(500)         // Server errors

// Global error handler:
• Masks Prisma errors in production
• Filters stack traces (only src/ files)
• Logs selectively (skips 400/401/403/404)
• Returns clean JSON responses
```

### **6. Input Validation**

- **DTOs:** Zod schemas for request validation
- **Email normalization:** Lowercase conversion
- **SQL injection:** Protected by Prisma ORM (parameterized queries)

### **7. Logging**

```javascript
// Pino logger with:
• Request/Response logging
• Error logging with clean stack traces
• Redaction: ['req.headers.authorization', 'password']
• Environment-based formatting:
  - Dev: pino-pretty (colored, formatted)
  - Prod: JSON to file (./logs/app.log)
```

---

## 🛠️ Tech Stack & Dependencies

### **Core Technologies**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.1.0 | Web framework |
| **PostgreSQL** | Latest | Primary database |
| **Redis** | Latest | Caching & sessions |
| **Prisma** | 7.0.1 | ORM & database toolkit |
| **BullMQ** | 5.67.2 | Background job processing |

### **Dependencies (package.json)**

#### **Production Dependencies**
```json
{
  "@prisma/adapter-pg": "^7.0.1",      // PostgreSQL adapter
  "@prisma/client": "^7.0.1",          // Prisma ORM client
  "axios": "^1.12.2",                  // HTTP client
  "bcryptjs": "^3.0.2",                // Password hashing
  "bullmq": "^5.67.2",                 // Job queue system
  "connect-redis": "^6.1.3",           // Redis session store
  "cookie-parser": "^1.4.7",           // Cookie middleware
  "cors": "^2.8.5",                    // Cross-origin requests
  "csurf": "^1.11.0",                  // CSRF protection
  "dotenv": "^16.6.1",                 // Environment variables
  "express": "^5.1.0",                 // Web framework
  "express-rate-limit": "^8.2.1",      // Rate limiting
  "express-session": "^1.18.2",        // Session management
  "ioredis": "^5.8.2",                 // Redis client
  "nodemailer": "^7.0.13",             // Email sending
  "pg": "^8.16.3",                     // PostgreSQL driver
  "pino": "^9.11.0",                   // Fast JSON logger
  "zod": "^4.1.11"                     // Schema validation
}
```

#### **Development Dependencies**
```json
{
  "nodemon": "^3.1.10",                // Auto-restart on changes
  "pino-pretty": "^13.1.2",            // Dev-friendly log output
  "prettier": "^3.5.3",                // Code formatting
  "prisma": "^7.0.1",                  // Prisma CLI
  "tsx": "^4.20.6"                     // TypeScript execution
}
```

### **NPM Scripts**

```json
{
  "dev": "nodemon --exec tsx src/index.js",     // Development mode
  "start": "tsx src/index.js",                  // Production start
  "build": "node src/index.js",                 // Build/run
  "format": "prettier --write .",               // Format all files
  "format:check": "prettier --check .",         // Check formatting
  "migrate": "npx prisma migrate dev && npx prisma generate",  // DB migration
  "studio": "npx prisma studio"                 // Open Prisma Studio
}
```

### **Module System & Path Aliases**

```javascript
// package.json imports configuration
{
  "type": "module",  // Use ES Modules
  "imports": {
    "#src/*": "./src/*",
    "#utils/*": "./src/utils/*",
    "#controllers/*": "./src/controllers/*",
    "#middlewares/*": "./src/middlewares/*",
    "#services/*": "./src/services/*",
    "#models/*": "./src/models/*",
    "#config/*": "./src/config/*",
    "#types/*": "./src/types/*",
    "#routes/*": "./src/routes/*",
    "#validators/*": "./src/validators/*",
    "#core/*": "./src/core/*",
    "#entities/*": "./src/entities/*",
    "#errors/*": "./src/errors/*",
    "#api/*": "./src/api/*"
  }
}
```

### **Key Libraries Explained**

#### **Authentication & Security**
- **bcryptjs** - One-way password hashing with salt
- **express-session** - Server-side session management
- **csurf** - Cross-Site Request Forgery protection
- **cors** - Cross-Origin Resource Sharing configuration
- **express-rate-limit** - API rate limiting

#### **Database & ORM**
- **@prisma/client** - Type-safe database client
- **@prisma/adapter-pg** - PostgreSQL adapter
- **pg** - Native PostgreSQL driver

#### **Caching & Sessions**
- **ioredis** - High-performance Redis client
- **connect-redis** - Express session store for Redis

#### **Background Jobs**
- **bullmq** - Redis-based job queue
  - Supports retries with backoff
  - Job prioritization
  - Concurrency control
  - Event-driven architecture

#### **Communication**
- **axios** - HTTP client for external APIs
- **nodemailer** - SMTP email sending

#### **Logging**
- **pino** - Ultra-fast JSON logger
- **pino-pretty** - Human-readable log formatting

#### **Validation**
- **zod** - TypeScript-first schema validation
  - Runtime type checking
  - Auto-generated TypeScript types
  - Composable schemas

---

## ⚙️ Configuration & Environment

### **Environment Variables (.env)**

```bash
# Server Configuration
NODE_ENV=development                   # development | production | test
PORT=3000                              # Server port

# URLs
FRONTEND_URL=http://localhost:5173     # Frontend origin (for CORS)
BACKEND_URL=http://localhost:3000      # Backend base URL

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tutorops
# Format: postgresql://[user[:password]@][host][:port][/dbname]

# Redis
REDIS_URL=redis://localhost:6379       # Redis connection string
# Format: redis://[[:password]@]host[:port][/db-number]

# Session
SESSION_SECRET=your-super-secret-key-change-in-production
# IMPORTANT: Use a strong, random secret in production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=${BACKEND_URL}/api/auth/googleCallback

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com               # SMTP server
MAIL_PORT=587                          # SMTP port (587 for TLS)
MAIL_SECURE=false                      # true for 465, false for other ports
MAIL_USER=your-email@gmail.com         # SMTP username
MAIL_PASS=your-app-password            # SMTP password/app-password
MAIL_FROM=noreply@tutorops.com         # From email address

# AI Services (Planned)
AI_API_KEY=your-ai-api-key             # AI service API key

# Logging
LOG_LEVEL=debug                        # debug | info | warn | error | fatal
```

### **Configuration Loading (config/env.js)**

```javascript
import dotenv from 'dotenv';
dotenv.config();  // Load .env file FIRST

export const {
  NODE_ENV,
  PORT = 3000,
  FRONTEND_URL,
  BACKEND_URL,
  DATABASE_URL,
  AI_API_KEY,
  SESSION_SECRET,
  REDIS_URL,
} = process.env;

// Validation (optional but recommended)
if (!DATABASE_URL) throw new Error('DATABASE_URL is required');
if (!REDIS_URL) throw new Error('REDIS_URL is required');
if (!SESSION_SECRET) throw new Error('SESSION_SECRET is required');
```

### **Prisma Configuration (prisma/schema.prisma)**

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"  // Custom output path
  engineType   = "client"
  moduleFormat = "esm"                      // ES Modules
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")            // From .env
}
```

### **Redis Configuration**

#### **Session Store (utils/redis.js)**
```javascript
const redisClient = new Redis(REDIS_URL);

const RedisStore = connectRedis(expressSession);
const store = new RedisStore({
  client: redisClient,
  prefix: 'tutorops:',              // Prefix all keys
});

// Event handlers
redisClient.on('error', (err) => {
  logger.base.error({ err }, 'Redis connection error');
});

redisClient.on('connect', () => {
  logger.base.info('Redis connected');
});

redisClient.on('reconnecting', () => {
  MaxAttempts--;
  logger.base.warn('Redis reconnecting...');
  if (MaxAttempts <= 0) {
    process.emit("RedisNotConnected", new Error('Max Redis reconnection attempts reached'));
  }
});
```

#### **BullMQ Connection (utils/bullmqConnection.js)**
```javascript
export const createBullmqConnection = () => {
  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,     // No retry limit for BullMQ
    enableReadyCheck: false,         // Faster startup
  });
};
```

### **Express Middleware Stack (app.js)**

```javascript
// 1. CORS - Cross-origin requests
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://172.20.64.1:5000'],
  credentials: true,  // Allow cookies
}));

// 2. Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Cookie Parsing
app.use(cookieParser());

// 4. Request/Response Logging
app.use(logger.express.requestLogger);
app.use(logger.express.responseLogger);

// 5. Session Management (MUST come before CSRF)
app.use(redisSession({
  store,
  name: 'tutorops_session',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  },
}));

// 6. CSRF Protection (AFTER sessions)
app.use(csurf());

// 7. Routes
app.use('/api', appRouter);

// 8. Error Handler (LAST)
app.use(errorHandler);
```

### **Session Configuration Details**

```javascript
{
  store: RedisStore,                  // Redis-backed storage
  name: 'tutorops_session',           // Cookie name
  secret: SESSION_SECRET,             // Signing secret
  resave: false,                      // Don't save unchanged sessions
  saveUninitialized: false,           // Don't create empty sessions
  rolling: true,                      // Reset expiry on each request
  cookie: {
    httpOnly: true,                   // Prevent XSS (no JS access)
    secure: NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax',                  // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000   // 7-day expiration
  }
}
```

### **Security Configuration**

#### **Password Hashing**
```javascript
const saltRounds = 10;
const salt = await bcrypt.genSalt(saltRounds);
const hashedPassword = await bcrypt.hash(password, salt);
```

#### **CSRF Token**
```javascript
// Token generation
const csrfToken = req.csrfToken();

// Token validation (automatic)
// Checks _csrf body param or X-CSRF-Token header
```

#### **CORS**
```javascript
{
  origin: [
    process.env.FRONTEND_URL,      // Primary frontend
    'http://172.20.64.1:5000',     // Additional origin
  ],
  credentials: true,                // Allow cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}
```

### **Database Connection**

#### **Prisma Client Singleton (utils/prisma.js)**
```javascript
import { PrismaClient } from '#src/generated/prisma/index.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

export default prisma;
```

### **Process Event Handlers (index.js)**

```javascript
// Unhandled Promise Rejection
process.on("unhandledRejection", (reason) => {
  logger.base.error({ reason }, "Unhandled Promise Rejection");
});

// Uncaught Exception (FATAL)
process.on("uncaughtException", (err) => {
  logger.base.fatal({ err }, "UNCAUGHT EXCEPTION - Server crashed");
  process.exit(1);  // Must exit
});

// Redis Connection Failure
process.on("RedisNotConnected", (err) => {
  logger.base.error({ err }, "Server Stopped - Redis Not Connected");
  process.exit(1);
});

// Graceful Shutdown
process.on("SIGINT", () => shutdown(server, "SIGINT"));
process.on("SIGTERM", () => shutdown(server, "SIGTERM"));

function shutdown(server, signal) {
  logger.base.warn(`⚠️ Received ${signal}. Shutting down gracefully...`);
  
  server.close(() => {
    logger.base.info("🛑 HTTP server closed");
    process.exit(0);
  });
  
  // Force quit if shutdown hangs (5s timeout)
  setTimeout(() => {
    logger.base.error("❗ Forcing shutdown");
    process.exit(1);
  }, 5000);
}
```

---

## 🚀 Server Startup Sequence

```
1. index.js entry point
   ↓
2. Import app.js (triggers all imports)
   ↓
3. Load environment variables (env.js) - FIRST
   ↓
4. Initialize Redis client (redis.js)
   • Connect to REDIS_URL
   • Setup event handlers (connect, error, reconnecting)
   • Max reconnection attempts: 5
   ↓
5. Initialize Prisma client (prisma.js)
   • Connect to DATABASE_URL (PostgreSQL)
   • Load generated Prisma Client
   ↓
6. Configure Express app (app.js)
   • CORS → JSON parsing → Cookies → Logging
   • Redis session store
   • CSRF protection
   • Mount routes: /api → appRouter
   • Global error handler
   ↓
7. Create HTTP server (index.js)
   • Listen on PORT (default: 3000)
   • Log: "Server running on port {PORT} in {NODE_ENV} mode"
   ↓
8. Register process event handlers
   • unhandledRejection → log & continue
   • uncaughtException → log & exit(1)
   • RedisNotConnected → log & exit(1)
   • SIGINT/SIGTERM → graceful shutdown (5s timeout)
   ↓
9. Server ready to accept requests ✓
```

---

## 📊 Redis Data Structures

### **Session Data** (managed by express-session)

```
Key: tutorops:sess:{sessionID}
Value: {
  "user": {
    "id": "cm4abc123xyz",
    "role": "STUDENT"
  },
  "cookie": {
    "originalMaxAge": 604800000,
    "expires": "2025-12-10T12:00:00.000Z",
    "httpOnly": true,
    "path": "/"
  }
}
TTL: 7 days (auto-renewed on activity if rolling: true)
```

### **Session Tracking** (managed by session.dao.js)

```
Key: user_sessions:{userId}
Type: Set
Members: ["sess:abc123...", "sess:def456...", "sess:ghi789..."]
Purpose: Track all active sessions per user for multi-device logout
```

---

## 🎯 Current Features Summary

### ✅ **Implemented**

1. **User Authentication**
    - Email/Password registration
    - Email/Password login
    - Google OAuth 2.0 integration
    - Session-based auth with Redis
    - Multi-device session tracking

2. **Session Management**
    - 7-day rolling sessions
    - Single device logout
    - All devices logout
    - Automatic session renewal

3. **Security**
    - CSRF protection
    - CORS configuration
    - Password hashing (bcrypt)
    - Session fixation prevention
    - HttpOnly cookies
    - Structured error handling

4. **User Management**
    - Role-based access (STUDENT, TEACHER, ADMIN)
    - User profile retrieval
    - Email uniqueness validation
    - Google account linking

5. **Infrastructure**
    - PostgreSQL database (Prisma ORM)
    - Redis caching & sessions
    - Structured logging (Pino)
    - Health check endpoint
    - Graceful shutdown handling

### 🔜 **Planned Features** (based on schema)

- Class management (teachers create classes)
- Student enrollment system
- Assignment creation & distribution
- Math problem generation (AI-powered)
- Student attempt tracking
- Auto-grading system
- Performance reports
- Real-time features (Socket.IO)

---

## 📝 Environment Variables Required

```env
# Server
NODE_ENV=development
PORT=3000

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tutorops

# Redis
REDIS_URL=redis://localhost:6379

# Session
SESSION_SECRET=your-super-secret-key-change-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI (future)
AI_API_KEY=your-ai-api-key
```

---

## 📈 Request/Response Flow Summary

```
┌──────────────┐
│    CLIENT    │
└──────┬───────┘
       │ HTTP Request (with cookies)
       ↓
┌──────────────────────────────────────────────┐
│  EXPRESS MIDDLEWARE STACK                    │
│  1. CORS validation                          │
│  2. Body parsing (JSON, URL-encoded)         │
│  3. Cookie parsing                           │
│  4. Request logging                          │
│  5. Session loading (from Redis)             │
│  6. CSRF validation                          │
│  7. Route matching                           │
│  8. isAuthenticated (if protected)           │
└──────┬───────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────┐
│  CONTROLLER (HTTP Layer)                     │
│  • Extract request data                      │
│  • Call service layer                        │
│  • Handle session operations                 │
│  • Format response                           │
└──────┬───────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────┐
│  SERVICE (Business Logic)                    │
│  • Validate business rules                   │
│  • Process data                              │
│  • Call DAO layer                            │
│  • Return results                            │
└──────┬───────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────┐
│  DAO (Data Access)                           │
│  • Prisma queries (PostgreSQL)               │
│  • Redis operations (sessions, cache)        │
│  • Return raw data                           │
└──────┬───────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────┐
│  DATABASE / REDIS                            │
└──────┬───────────────────────────────────────┘
       │
       ↓ (Response flows back up the stack)
┌──────────────────────────────────────────────┐
│  RESPONSE MIDDLEWARE                         │
│  • Response logging                          │
│  • Error handling (if error occurred)        │
└──────┬───────────────────────────────────────┘
       │
       ↓
┌──────────────┐
│    CLIENT    │  ← JSON response + Set-Cookie header
└──────────────┘
```

---

## 🚀 Server Startup Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. index.js - Entry Point                                       │
│    • Import app.js (triggers all module loading)                │
│    • Import environment configuration                           │
│    • Register process event handlers                            │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. config/env.js - Environment Variables                        │
│    • Load .env file with dotenv                                 │
│    • Export environment variables                               │
│    • Validate required variables                                │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. utils/redis.js - Redis Initialization                        │
│    • Create Redis client (ioredis)                              │
│    • Connect to REDIS_URL                                       │
│    • Setup event handlers:                                      │
│      - on('error') → Log error                                  │
│      - on('connect') → Log success                              │
│      - on('reconnecting') → Retry (max 5 attempts)              │
│    • Create RedisStore for sessions                             │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. utils/prisma.js - Prisma Client                              │
│    • Import generated Prisma Client                             │
│    • Create PrismaClient singleton                              │
│    • Configure query logging (dev mode only)                    │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. utils/bullmqConnection.js - BullMQ Setup                     │
│    • Create Redis connection for BullMQ                         │
│    • Configure: maxRetriesPerRequest: null                      │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. queues/email.queue.js - Email Queue Initialization           │
│    • Create BullMQ Queue                                        │
│    • Configure retry policy (5 attempts, exponential backoff)   │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. workers/email.worker.js - Background Worker Start            │
│    • Create BullMQ Worker                                       │
│    • Set concurrency: 5                                         │
│    • Register job handlers:                                     │
│      - SEND_VERIFICATION_EMAIL                                  │
│    • Setup event listeners:                                     │
│      - on('completed') → Log success                            │
│      - on('failed') → Log error                                 │
│      - on('error') → Log worker error                           │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. app.js - Express App Configuration                           │
│    • Create Express app                                         │
│    • Configure middleware stack:                                │
│      1. CORS (allow FRONTEND_URL + credentials)                 │
│      2. JSON body parser                                        │
│      3. URL-encoded body parser                                 │
│      4. Cookie parser                                           │
│      5. Request logger (Pino)                                   │
│      6. Response logger (Pino)                                  │
│      7. Redis session store                                     │
│      8. CSRF protection                                         │
│    • Mount routes: /api → appRouter                             │
│    • Register global error handler                              │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. core/router.js - API Router Assembly                         │
│    • Mount /auth → authRouter                                   │
│    • Mount /system → systemRouter                               │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. HTTP Server Creation (index.js)                             │
│    • Create HTTP server: http.createServer(app)                 │
│    • Listen on PORT (default: 3000)                             │
│    • Log: "Server running on port {PORT} in {NODE_ENV} mode"   │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. Process Event Handlers Active                               │
│    • unhandledRejection → Log & continue                        │
│    • uncaughtException → Log & exit(1)                          │
│    • RedisNotConnected → Log & exit(1)                          │
│    • SIGINT/SIGTERM → Graceful shutdown (5s timeout)            │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ ✅ SERVER READY TO ACCEPT REQUESTS                              │
│    • HTTP server listening on PORT                              │
│    • Redis connected for sessions & jobs                        │
│    • PostgreSQL connected via Prisma                            │
│    • Background workers processing jobs                         │
└─────────────────────────────────────────────────────────────────┘
```

### **Critical Startup Dependencies**

1. **Environment Variables** - Must be loaded first
2. **Redis** - Required for sessions and job queue
3. **PostgreSQL** - Required for data persistence
4. **All must be healthy for server to accept requests**

### **Failure Modes & Recovery**

| Failure | Behavior | Recovery |
|---------|----------|----------|
| **Redis connection lost** | Max 5 reconnection attempts | Process exits if all fail |
| **Postgres connection lost** | Prisma will retry | Connection pool management |
| **Uncaught exception** | Process exits immediately | Requires restart (PM2/Docker) |
| **Unhandled rejection** | Logged, process continues | Should be fixed in code |
| **Graceful shutdown** | 5-second timeout | Force exit if not closed |

---

## 📊 Redis Data Structures in Detail

### **Session Data** (managed by express-session)

```
Key Pattern: tutorops:sess:{sessionID}
Type: String (JSON serialized)

Example:
Key: tutorops:sess:abc123def456...
Value: {
  "user": {
    "id": "cm4abc123xyz",
    "role": "STUDENT"
  },
  "cookie": {
    "originalMaxAge": 604800000,
    "expires": "2026-02-12T14:30:00.000Z",
    "httpOnly": true,
    "path": "/",
    "sameSite": "lax"
  }
}
TTL: 7 days (auto-renewed on activity if rolling: true)
```

### **Session Tracking** (managed by session.dao.js)

```
Key Pattern: user_sessions:{userId}
Type: Set

Example:
Key: user_sessions:cm4abc123xyz
Members: [
  "sess:abc123def456...",
  "sess:ghi789jkl012...",
  "sess:mno345pqr678..."
]

Purpose: Track all active sessions per user for:
• Multi-device logout
• Session auditing
• Security monitoring
```

### **BullMQ Job Queues** (managed by BullMQ)

```
Key Pattern: tutorops:email:{queue-operations}
Type: Multiple (List, Hash, Set, ZSet)

Examples:
tutorops:email:wait            → List (pending jobs)
tutorops:email:active          → ZSet (active jobs with scores)
tutorops:email:completed       → ZSet (completed jobs)
tutorops:email:failed          → ZSet (failed jobs)
tutorops:email:id              → String (counter for job IDs)

Job Data:
tutorops:email:verify-email:cm4abc123xyz → Hash {
  "name": "SEND_VERIFICATION_EMAIL",
  "data": "{\"userId\":\"cm4...\",\"email\":\"...\",\"otp\":\"123456\"}",
  "opts": "{\"attempts\":5,\"backoff\":{...}}",
  "timestamp": 1707144000000,
  "attemptsMade": 0
}
```

---

## 🎯 Complete System Summary

### **✅ Implemented Features**

#### **1. User Authentication**
- ✅ Email/Password registration with validation
- ✅ Email/Password login with bcrypt verification
- ✅ Google OAuth 2.0 integration
- ✅ Session-based auth with Redis storage
- ✅ Multi-device session tracking
- ✅ Email verification with OTP (6-digit)
- ✅ OTP hashing with bcrypt
- ✅ OTP expiration (10 minutes)

#### **2. Session Management**
- ✅ 7-day rolling sessions (auto-renewed)
- ✅ Single device logout
- ✅ All devices logout
- ✅ Session fixation prevention
- ✅ HttpOnly cookies
- ✅ CSRF protection

#### **3. Security**
- ✅ CSRF token generation & validation
- ✅ CORS configuration (whitelisted origins)
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Session regeneration on auth events
- ✅ Secure cookie configuration
- ✅ Structured error handling
- ✅ Sensitive data redaction in logs

#### **4. Background Jobs**
- ✅ BullMQ job queue system
- ✅ Email worker (5 concurrent jobs)
- ✅ Verification email sending
- ✅ Retry policy (5 attempts, exponential backoff)
- ✅ Job event logging

#### **5. User Management**
- ✅ Role-based access (STUDENT, TEACHER, ADMIN)
- ✅ User profile retrieval
- ✅ Email uniqueness validation
- ✅ Google account linking
- ✅ Verification status tracking

#### **6. Infrastructure**
- ✅ PostgreSQL database (Prisma ORM)
- ✅ Redis caching & sessions
- ✅ Structured logging (Pino)
- ✅ Health check endpoints
- ✅ Graceful shutdown handling
- ✅ Process error handlers

#### **7. Email System**
- ✅ Nodemailer integration
- ✅ Verification email templates
- ✅ Background job processing
- ✅ Email queue management

### **🔜 Planned Features** (based on schema)

#### **Educational Platform**
- ⏳ Class management (teachers create classes)
- ⏳ Student enrollment system
- ⏳ Assignment creation & distribution
- ⏳ Assignment due date tracking

#### **AI-Powered Features**
- ⏳ Math problem generation (AI-powered)
- ⏳ Problem parameterization (unique instances)
- ⏳ Auto-grading system
- ⏳ AI tutoring assistant

#### **Assessment & Analytics**
- ⏳ Student attempt tracking
- ⏳ Performance reports generation
- ⏳ Teacher grading interface
- ⏳ Analytics dashboard

#### **Real-time Features**
- ⏳ WebSocket/Socket.IO integration
- ⏳ Real-time notifications
- ⏳ Live class features
- ⏳ Collaborative problem solving

### **📦 Project Statistics**

| Metric | Count |
|--------|-------|
| **Total Dependencies** | 15 production + 5 dev |
| **API Endpoints** | 9 authentication + 2 system |
| **Database Models** | 8 models (User, Class, Assignment, etc.) |
| **Middleware** | 3 custom + 8 third-party |
| **Background Workers** | 1 (email worker) |
| **Job Types** | 1 implemented + 5 planned |
| **Redis Data Structures** | 3 types (sessions, tracking, jobs) |
| **Lines of Code** | ~2500+ lines (backend only) |

### **🛡️ Security Checklist**

- ✅ Password hashing (bcrypt)
- ✅ CSRF protection (csurf)
- ✅ CORS configuration
- ✅ HttpOnly cookies
- ✅ Secure cookies (production)
- ✅ SameSite cookie attribute
- ✅ Session regeneration
- ✅ Input validation (Zod)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Error message sanitization
- ✅ Sensitive data redaction
- ✅ Rate limiting (configured, not yet used)

### **🏗️ Architecture Highlights**

1. **Separation of Concerns**
   - Controllers: HTTP handling
   - Services: Business logic
   - DAOs: Data access
   - Clear boundaries between layers

2. **Scalability**
   - Redis for distributed sessions
   - Background job processing
   - Horizontal scaling ready
   - Stateless application design

3. **Reliability**
   - Graceful shutdown
   - Error recovery
   - Job retry mechanisms
   - Health check endpoints

4. **Maintainability**
   - Modular structure
   - Path aliases for clean imports
   - Consistent naming conventions
   - Comprehensive logging

5. **Type Safety**
   - Prisma-generated types
   - Zod schema validation
   - ES Modules with imports

### **📝 Environment Requirements**

| Service | Minimum Version | Purpose |
|---------|----------------|---------|
| Node.js | 18.0.0+ | Runtime environment |
| PostgreSQL | 13+ | Primary database |
| Redis | 6+ | Sessions & job queue |
| SMTP Server | Any | Email delivery |

### **🚀 Deployment Checklist**

- [ ] Set NODE_ENV=production
- [ ] Generate strong SESSION_SECRET
- [ ] Configure production DATABASE_URL
- [ ] Configure production REDIS_URL
- [ ] Set up SMTP credentials
- [ ] Configure CORS origins
- [ ] Enable secure cookies
- [ ] Set up SSL/TLS
- [ ] Configure logging (JSON to file)
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring
- [ ] Configure backups (DB)
- [ ] Set up error tracking (Sentry)

### **📚 Additional Resources**

- **Prisma Docs:** https://www.prisma.io/docs
- **BullMQ Docs:** https://docs.bullmq.io
- **Pino Docs:** https://getpino.io
- **Express Docs:** https://expressjs.com
- **Redis Docs:** https://redis.io/docs

---

## 🎓 Conclusion

The **TutorOps Backend** is a production-ready, secure, and scalable authentication system with email verification and background job processing. Built with modern best practices and enterprise-grade libraries, it provides a solid foundation for an AI-powered educational platform.

**Key Strengths:**
- ✅ Comprehensive security measures
- ✅ Clean architecture with clear separation of concerns
- ✅ Robust error handling and logging
- ✅ Background job processing for async tasks
- ✅ Scalable session management
- ✅ Type-safe database operations
- ✅ Well-documented codebase

**Ready for:**
- Building out educational features
- AI integration (problem generation, grading)
- Real-time features (Socket.IO)
- Horizontal scaling
- Production deployment

The foundation is solid. Let's build something amazing! 🚀

---

**Document Version:** 2.0  
**Last Updated:** February 5, 2026  
**Maintained By:** TutorOps Development Team
