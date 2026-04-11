# System Architecture & Design

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           END USERS                                 │
│                    (Web Browser / Mobile Web)                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTPS
                    ┌────────────▼──────────────┐
                    │   VERCEL (Next.js App)    │
                    │  ├─ Frontend (React)      │
                    │  │ ├─ Auth Pages          │
                    │  │ ├─ Dashboard           │
                    │  │ ├─ Plan View           │
                    │  │ ├─ Check-in Form       │
                    │  │ └─ Progress Charts     │
                    │  └─ API Routes (/api/*)   │
                    │     ├─ Auth endpoints    │
                    │     ├─ Plan endpoints    │
                    │     ├─ Check-in endpoints│
                    │     └─ Admin endpoints   │
                    └────────────┬──────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
        ┌───────▼────────┐  ┌────▼────────────┐  │
        │ AWS RDS        │  │ AWS ElastiCache │  │
        │ PostgreSQL     │  │ Redis           │  │
        │ ├─ Users       │  │ ├─ Sessions     │  │
        │ ├─ Plans       │  │ ├─ Cache        │  │
        │ ├─ Check-ins   │  │ └─ Job Queue    │  │
        │ ├─ Meals       │  └────────────────┘  │
        │ ├─ Workouts    │                      │
        │ ├─ Subscriptions│                      │
        │ └─ ...more     │                      │
        └────────────────┘                      │
                                                │
        ┌───────────────────────────────────────┘
        │
    ┌───▼──────┐   ┌───────────┐   ┌──────────┐   ┌─────────┐
    │  Stripe  │   │  Resend   │   │ PostHog  │   │ Sentry  │
    │ Payments │   │  Email    │   │Analytics │   │ Errors  │
    │ & Webhooks   │           │   │          │   │         │
    └──────────┘   └───────────┘   └──────────┘   └─────────┘
```

## Data Flow: User Signup to Daily Plan

```
1. SIGNUP
   User ──(email, password)──→ /api/auth/signup
                              ├─ Validate input
                              ├─ Hash password
                              ├─ Create User record
                              ├─ Create free trial Subscription
                              └─ Return JWT token

2. ONBOARDING
   User ──(profile data)──→ /api/users/onboarding
                            ├─ Validate data
                            ├─ Calculate TDEE
                            ├─ Create UserProfile
                            ├─ Create Goal
                            ├─ Store BodyMetrics
                            ├─ Generate initial DailyPlan
                            └─ Return plan summary

3. DAILY PLAN
   Dashboard ──→ /api/plans/today (cached 24h)
                 ├─ Check cache (Redis)
                 ├─ If miss: select meals for user
                 ├─ Select workout for user
                 ├─ Generate coaching tip
                 ├─ Cache result
                 └─ Return complete plan

4. CHECK-IN
   User ──(sleep, stress, energy...)──→ /api/checkins
                                         ├─ Validate data
                                         ├─ Store DailyCheckIn
                                         ├─ Calculate adherence
                                         ├─ Trigger progress update job
                                         └─ Return summary

5. PROGRESS CALCULATION (nightly)
   Scheduler ──→ ProgressSnapshot Job
                 ├─ Query last 7 check-ins
                 ├─ Calculate averages
                 ├─ Calculate trend
                 ├─ Project goal date
                 ├─ Store ProgressSnapshot
                 └─ Queue email notification
```

## Database Model Relationships

```
USER (center of universe)
├─ UserProfile (1:1)      -- personal & preference data
├─ Goal (1:1)             -- weight loss target
├─ BodyMetrics (1:n)      -- weight/waist history
├─ DailyCheckIn (1:n)     -- daily survey responses
├─ DailyPlan (1:n)        -- recommended plans
│   ├─ MealTemplate (breakfast)  (n:1)
│   ├─ MealTemplate (lunch)      (n:1)
│   ├─ MealTemplate (dinner)     (n:1)
│   └─ WorkoutTemplate           (n:1)
├─ ProgressSnapshot (1:n) -- weekly aggregates
├─ Subscription (1:1)     -- billing status
├─ NotificationPreference (1:1) -- email/push settings
└─ AuditLog (1:n)         -- account activity trail
```

## API Request/Response Cycle

```
CLIENT REQUEST
│
├─ HTTP request (GET/POST/PUT)
├─ Headers: Authorization (JWT), Content-Type
└─ Body: JSON (if applicable)
   │
   ▼
VERCEL (Next.js API Route)
│
├─ Middleware
│  ├─ Parse request
│  ├─ Validate authorization
│  ├─ Extract user from JWT
│  └─ Pass to handler
│
├─ Handler Logic
│  ├─ Validate input (Zod schema)
│  ├─ Check entitlement (subscription status)
│  ├─ Query/modify database
│  └─ Cache results if applicable
│
├─ Response
│  ├─ Success: 200/201 + JSON body
│  └─ Error: 400/401/402/404/500 + error details
│
▼
CLIENT RECEIVES RESPONSE
│
├─ Parse JSON
├─ Update UI
└─ Handle errors
```

## Recommendation Engine Flow

```
GET /api/plans/today (or /api/plans/generate)
│
├─ Load user profile
│  ├─ height, weight, age, sex
│  ├─ activity level
│  └─ dietary preferences
│
├─ Calculate TDEE
│  ├─ BMR (Mifflin-St Jeor formula)
│  ├─ Activity multiplier
│  └─ Calorie deficit for weight loss
│
├─ Calculate macros
│  ├─ Protein target (based on activity)
│  ├─ Carbs (40% of remaining calories)
│  └─ Fats (60% of remaining calories)
│
├─ Select meals
│  ├─ Get previous week's meals (avoid repetition)
│  ├─ Breakfast: find meal ±150 cal from 30% total
│  ├─ Lunch: find meal ±150 cal from 35% total
│  ├─ Dinner: find meal ±150 cal from 35% total
│  └─ Snacks: fill remaining calories
│
├─ Select workout
│  ├─ Get last 7 check-ins
│  ├─ If soreness > 7 or energy < 3: mobility workout
│  ├─ Else if energy > 8: strength workout
│  ├─ Else: mixed/cardio
│  └─ Filter by location + time available
│
├─ Generate coaching tip
│  ├─ Based on adherence (high/medium/low)
│  ├─ Based on mood (sleep, stress, energy)
│  └─ Motivational message
│
└─ Store DailyPlan in database
   ├─ Cache in Redis
   └─ Return to client
```

## Subscription Lifecycle

```
TRIAL → ACTIVE → RENEWS → ACTIVE → ...
  ↓        ↓
EXPIRE  CANCEL
  ↓        ↓
 BLOCK → REQUIRES_PAYMENT

Event Flow:
1. Signup
   └─ Create Subscription (status: trial, trialEndsAt: +7d)

2. Free Trial Active (Days 1-7)
   └─ User has full access to all features

3. Trial Ends
   └─ /api/plans/* endpoints return 402 (Payment Required)
   └─ Redirect to /billing (upgrade page)

4. User Upgrades (Stripe Checkout)
   ├─ Create Stripe Customer
   ├─ Create Checkout Session
   ├─ User pays
   └─ Stripe sends webhook

5. Webhook Received
   ├─ Update Subscription (status: active)
   ├─ Update currentPeriodEnd
   ├─ Send confirmation email
   └─ User gains access again

6. Monthly/Annually
   ├─ Stripe auto-renews
   ├─ Send webhook
   ├─ Update Subscription
   └─ Continue service

7. User Cancels
   ├─ User clicks "Cancel Subscription"
   ├─ Stripe sends webhook
   ├─ Update Subscription (status: cancelled)
   ├─ Schedule feature removal on next renewal
   └─ Allow access until period end
```

## Authentication & Session Flow

```
LOGIN
│
├─ User submits email + password
│
├─ /api/auth/login validates
│  ├─ Find user by email
│  ├─ Compare password hash
│  ├─ Generate JWT token
│  └─ Return token + user data
│
└─ Client stores JWT in secure HTTP-only cookie

SUBSEQUENT REQUESTS
│
├─ Client sends: Cookie: next-auth.session-token=JWT
│
├─ Middleware extracts + validates JWT
│  ├─ Check signature
│  ├─ Check expiry
│  ├─ Extract userId
│  └─ Attach to request
│
└─ Handler can use request.userId for database queries
```

## Background Jobs

```
Bull Queue (Redis-backed job processing)

Daily Plans Generation (8 PM UTC daily)
├─ Query all users with active subscriptions
├─ For each user:
│  ├─ Generate daily plan
│  ├─ Store in database
│  └─ Cache in Redis
└─ Log completion

Daily Reminders (8 AM UTC daily)
├─ Query users with reminders enabled
├─ For each user:
│  ├─ Load today's plan
│  ├─ Render email template
│  ├─ Send via Resend
│  └─ Track success/failure
└─ Retry failed sends

Weekly Summaries (Sunday 7 PM UTC)
├─ Query users with summary preference
├─ For each user:
│  ├─ Load week's check-ins
│  ├─ Calculate progress
│  ├─ Render email template
│  ├─ Send via Resend
│  └─ Track send status
└─ Log metrics

Trial Expiring (daily at 9 AM UTC)
├─ Find users with trial expiring in 24h
├─ For each user:
│  ├─ Render "last chance" email
│  ├─ Send via Resend
│  └─ Track send
└─ Update audit log

Subscription Webhooks (on payment events)
├─ Receive from Stripe
├─ Verify signature
├─ Update Subscription record
├─ Send confirmation email
└─ Log audit entry
```

## Caching Strategy

```
REDIS CACHE LAYERS

1. Session Storage
   Key: next-auth.session-token.{jti}
   TTL: 30 days (matches JWT expiry)
   Use: Fast session validation

2. Daily Plans
   Key: plan:{userId}:{date}
   TTL: 24 hours
   Use: Avoid repeated meal/workout selection

3. User Profile
   Key: profile:{userId}
   TTL: 1 hour
   Use: Avoid repeated database queries

4. Feature Flags
   Key: flags:{flagName}
   TTL: 5 minutes
   Use: Fast feature toggle checks

5. Meal/Workout Templates
   Key: meals:{mealType}:{count}
   TTL: 24 hours
   Use: Avoid repeated queries of all templates

CACHE INVALIDATION STRATEGY
- Explicit: Delete on model updates (POST/PUT/DELETE)
- TTL: Auto-expire after time period
- Manual: Admin can flush via /api/admin/cache/flush
```

## Error Handling Architecture

```
Custom Error Classes
├─ ValidationError (400) -- input validation failed
├─ UnauthorizedError (401) -- not logged in
├─ ForbiddenError (403) -- not permitted (role check)
├─ NotFoundError (404) -- resource doesn't exist
├─ ConflictError (409) -- resource already exists
├─ RateLimitError (429) -- too many requests
├─ PaymentRequiredError (402) -- subscription expired
└─ ApiError (500) -- server error (generic)

Error Response Format
{
  error: {
    code: "ERROR_CODE",
    message: "Human-readable message",
    details: { ... }  // optional, for validation
  }
}

Error Tracking
├─ Sentry captures all errors
├─ Error code helps with debugging
├─ Details field contains validation errors
└─ Never leaks sensitive info (no passwords, no SQL)
```

## Scalability Considerations

### Current MVP (estimated 10K users)
```
Vercel: 1x Function, auto-scaling
RDS: db.t3.micro (1 GB RAM, 1 vCPU)
Redis: cache.t3.micro (0.5 GB)
```

### 100K Users
```
Vercel: Auto-scales (typically 10-20 functions)
RDS: db.t3.small (2 GB RAM, 1 vCPU)
Redis: cache.t3.small (1.37 GB)
Add: Read replica for analytics queries
```

### 1M Users
```
Vercel: Auto-scales (hundreds of functions)
RDS: db.r5.xlarge (32 GB RAM, 4 vCPU)
Redis: cache.r5.large (16 GB)
Add: RDS Proxy for connection pooling
Add: S3 for file storage (progress photos, exports)
Add: CDN (CloudFront) for static assets
Add: API Gateway for rate limiting + WAF
```

### 10M+ Users
```
Multi-region deployment
├─ Vercel: Multi-region with geo-routing
├─ RDS: Primary + read replicas + cross-region backup
├─ Redis: Cluster with sharding
├─ S3: Multi-region replication
└─ Consider: Microservices extraction
    ├─ Recommendation service (can be compute-heavy)
    ├─ Email service (dedicated Lambda functions)
    ├─ Analytics service (event streaming to data lake)
    └─ Auth service (dedicated edge function)
```

## Security Architecture

```
AUTH LAYER
├─ HTTP-only secure cookies (next-auth)
├─ JWT tokens signed with secret
├─ Password hashing (bcrypt)
└─ Password reset token (30 min expiry)

DATA VALIDATION LAYER
├─ Zod schemas on all inputs
├─ Type-safe database queries (Prisma)
└─ Sanitized output (never HTML content)

RATE LIMITING LAYER
├─ 5 signup attempts per 15 min per IP
├─ 5 login attempts per 15 min per email
├─ 3 password reset per hour per email
├─ 100 API calls per min per user
└─ Implement: Upstash Ratelimit

TRANSPORT SECURITY
├─ HTTPS only (Vercel automatic)
├─ CORS (allow own domain only)
├─ CSP headers (prevent XSS)
├─ HSTS (force HTTPS)
└─ X-Content-Type-Options: nosniff

SECRETS MANAGEMENT
├─ All secrets in environment variables
├─ Never in code (caught by pre-commit)
├─ Rotated quarterly
├─ Vercel vs. production different values
└─ Audit logging of secret access
```

---

**Last Updated:** April 11, 2026
