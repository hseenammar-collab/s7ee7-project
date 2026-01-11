# S7EE7 Academy - Technical Documentation

## Overview

S7EE7 Academy is a comprehensive Arabic e-learning platform built with modern web technologies. The platform provides course management, secure video delivery, payment processing, and certificate generation.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Authentication System](#authentication-system)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Security Features](#security-features)
7. [Admin Panel](#admin-panel)
8. [User Dashboard](#user-dashboard)
9. [Payment Flow](#payment-flow)
10. [Deployment](#deployment)

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.1.0 | React Framework with App Router |
| React | 18.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 3.3.x | Styling |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | Latest | PostgreSQL Database & Auth |
| @supabase/ssr | 0.1.0 | Server-Side Rendering Support |

### UI Components
| Technology | Purpose |
|------------|---------|
| Radix UI | Headless UI Components |
| Shadcn/UI | Pre-built Component Library |
| Lucide React | Icons |
| Framer Motion | Animations |

### Security
| Technology | Purpose |
|------------|---------|
| FingerprintJS | Device Fingerprinting |
| Zod | Input Validation |

### Form Handling
| Technology | Purpose |
|------------|---------|
| React Hook Form | Form State Management |
| @hookform/resolvers | Zod Integration |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin Panel Routes
│   │   └── admin/
│   │       ├── page.tsx          # Dashboard
│   │       ├── courses/          # Course Management
│   │       ├── users/            # User Management
│   │       ├── orders/           # Order Management
│   │       ├── coupons/          # Coupon Management
│   │       ├── reports/          # Analytics
│   │       └── login/            # Admin Login
│   │
│   ├── (auth)/                   # Authentication Routes
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   │
│   ├── (dashboard)/              # User Dashboard Routes
│   │   ├── dashboard/
│   │   ├── my-courses/
│   │   ├── profile/
│   │   └── certificates/
│   │
│   ├── (marketing)/              # Public Routes
│   │   ├── page.tsx              # Homepage
│   │   ├── courses/
│   │   ├── about/
│   │   ├── contact/
│   │   └── checkout/
│   │
│   └── api/                      # API Routes
│       ├── auth/callback/
│       ├── coupons/validate/
│       ├── enrollment/check/
│       ├── orders/
│       └── progress/
│
├── components/
│   ├── admin/                    # Admin Components
│   ├── certificates/             # Certificate Components
│   ├── checkout/                 # Checkout Components
│   ├── course/                   # Course Components
│   ├── forms/                    # Form Components
│   ├── layout/                   # Layout Components
│   ├── learn/                    # Learning Components
│   ├── providers/                # Context Providers
│   └── ui/                       # Shadcn UI Components
│
├── contexts/
│   └── AuthContext.tsx           # Authentication Context
│
├── lib/
│   ├── security/                 # Security Utilities
│   │   ├── antiPiracy.ts
│   │   ├── deviceFingerprint.ts
│   │   └── sessionManager.ts
│   └── supabase/                 # Supabase Clients
│       ├── client.ts             # Browser Client
│       └── server.ts             # Server Client
│
├── hooks/                        # Custom Hooks
│
└── types/
    └── database.ts               # TypeScript Types
```

---

## Authentication System

### Overview
The authentication system uses Supabase Auth with SSR support. It implements:
- Email/Password authentication
- Google OAuth
- Password reset flow
- Role-based access control (student/admin)

### Auth Context (`src/contexts/AuthContext.tsx`)

```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshSession: () => Promise<void>
}
```

### Middleware Protection (`src/middleware.ts`)

The middleware protects routes based on authentication status and user role:

```typescript
// Protected routes (require authentication)
const protectedRoutes = [
  '/dashboard',
  '/my-courses',
  '/profile',
  '/certificates',
  '/checkout',
  '/settings',
]

// Admin routes (require admin role)
if (pathname.startsWith('/admin')) {
  // Check for admin role
}
```

### Auth Flow

```
1. User submits credentials
   ↓
2. supabase.auth.signInWithPassword()
   ↓
3. On success, redirect with window.location.href
   ↓
4. AuthContext.onAuthStateChange() triggers
   ↓
5. Fetch user profile from database
   ↓
6. Set user, profile, isAdmin states
   ↓
7. SecurityProvider checks device/session limits
   ↓
8. User accesses protected content
```

---

## Database Schema

### Tables

#### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (matches auth.users.id) |
| full_name | text | User's full name |
| phone | text | Phone number |
| avatar_url | text | Profile picture URL |
| role | enum | 'student' / 'instructor' / 'admin' |
| is_verified | boolean | Email verification status |
| bio | text | User biography |
| created_at | timestamp | Creation date |
| updated_at | timestamp | Last update |

#### courses
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Course title |
| slug | text | URL-friendly slug |
| description | text | Full description |
| thumbnail_url | text | Course thumbnail |
| price_iqd | integer | Price in Iraqi Dinar |
| discount_price_iqd | integer | Discounted price |
| level | enum | 'beginner' / 'intermediate' / 'advanced' |
| lessons_count | integer | Number of lessons |
| is_published | boolean | Publication status |

#### enrollments
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to profiles |
| course_id | uuid | Foreign key to courses |
| progress_percentage | integer | 0-100 |
| last_lesson_id | uuid | Last watched lesson |
| completed_at | timestamp | Completion date |

#### payments
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to profiles |
| course_id | uuid | Foreign key to courses |
| amount_iqd | integer | Payment amount |
| payment_method | enum | Payment method used |
| status | enum | 'pending' / 'completed' / 'failed' |
| receipt_url | text | Receipt image URL |

#### certificates
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to profiles |
| course_id | uuid | Foreign key to courses |
| certificate_number | text | Unique certificate ID |
| issued_at | timestamp | Issue date |
| pdf_url | text | Certificate PDF URL |

---

## API Routes

### POST /api/coupons/validate
Validates a coupon code for a specific course.

**Request:**
```json
{
  "code": "DISCOUNT20",
  "courseId": "uuid",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "valid": true,
  "coupon": {
    "id": "uuid",
    "code": "DISCOUNT20",
    "discount_type": "percentage",
    "discount_value": 20
  },
  "message": "تم تطبيق الكوبون بنجاح!"
}
```

### GET /api/enrollment/check
Checks if a user is enrolled in a course.

**Query Parameters:**
- `courseId`: Course UUID

**Response:**
```json
{
  "enrolled": true,
  "enrollment": { ... },
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### POST /api/orders
Creates a new order/payment.

**Request:**
```json
{
  "userId": "uuid",
  "courseId": "uuid",
  "amount": 50000,
  "paymentMethod": "zain_cash",
  "receiptUrl": "https://..."
}
```

### POST /api/progress
Updates lesson progress.

**Request:**
```json
{
  "userId": "uuid",
  "lessonId": "uuid",
  "courseId": "uuid",
  "watchedSeconds": 300,
  "totalSeconds": 600,
  "isCompleted": false
}
```

---

## Security Features

### 1. Anti-Piracy Protection
- Disable right-click context menu
- Block keyboard shortcuts (F12, Ctrl+Shift+I, etc.)
- Detect DevTools opening
- Disable text selection on video content
- Disable drag and drop

### 2. Device Fingerprinting
- Generate unique device fingerprint using FingerprintJS
- Limit users to 2 devices maximum
- Track device usage history
- Allow device management from profile

### 3. Session Management
- Single active session per user
- Automatic session invalidation
- Concurrent access detection
- 24-hour session expiry

### 4. Security Headers
```
X-DNS-Prefetch-Control: on
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: [comprehensive policy]
```

---

## Admin Panel

### Dashboard (`/admin`)
- Total users count
- Total courses count
- Total orders and revenue
- Recent orders list

### Course Management (`/admin/courses`)
- Create/Edit/Delete courses
- Manage sections and lessons
- Upload thumbnails and videos
- Set pricing and discounts

### User Management (`/admin/users`)
- View all users
- Change user roles
- View user statistics

### Order Management (`/admin/orders`)
- View pending orders
- Approve/Reject payments
- View receipt images

### Coupon Management (`/admin/coupons`)
- Create discount codes
- Set validity periods
- Track usage

---

## User Dashboard

### My Courses (`/my-courses`)
- View enrolled courses
- Track progress
- Continue learning

### Course Player (`/my-courses/[courseId]/[lessonId]`)
- Secure video player
- Progress tracking
- Lesson navigation

### Profile (`/profile`)
- Edit personal information
- Change password
- Manage devices

### Certificates (`/certificates`)
- View earned certificates
- Download PDF
- Share on LinkedIn

---

## Payment Flow

```
1. User selects course
   ↓
2. User goes to checkout
   ↓
3. User applies coupon (optional)
   ↓
4. User selects payment method
   ↓
5. User uploads receipt
   ↓
6. Order created with 'pending' status
   ↓
7. Admin reviews receipt
   ↓
8. Admin approves/rejects
   ↓
9. If approved:
   - Enrollment created
   - User notified
   - Access granted
```

---

## Deployment

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Build Commands
```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### Vercel Deployment
```bash
# Deploy to Vercel
npx vercel --prod
```

---

## Support

For technical support or bug reports, please contact the development team.

---

*Last Updated: January 2026*
