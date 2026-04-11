# Slimmer Down Now

A production-grade SaaS application for personalized waist-loss coaching. Provides users with AI-ready personalized daily diet and workout plans, progress tracking, and adaptive recommendations.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for local database)
- PostgreSQL 15+ and Redis 7+ (or use Docker)

### Local Setup

1. **Clone and install dependencies:**

```bash
git clone <repo-url>
cd slimmer-down-now
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env.local
# Edit .env.local with your local values (or keep defaults for Docker)
```

3. **Start local infrastructure (PostgreSQL + Redis):**

```bash
npm run docker:up
# Wait for containers to be healthy (~10 seconds)
```

4. **Initialize database:**

```bash
npx prisma migrate deploy
npm run db:seed
```

5. **Start development server:**

```bash
npm run dev
```

Visit `http://localhost:3000` and you'll be redirected to signup or dashboard if logged in.

### Database Development

```bash
# View database in Prisma Studio
npm run db:studio

# Create a new migration after schema changes
npm run db:migrate -- --name "description_of_change"

# Seed database with templates
npm run db:seed

# Push schema changes to dev database without migration
npm run db:push
```

### Stop Local Infrastructure

```bash
npm run docker:down
```

---

## 📋 Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 + React 18 + TypeScript |
| **UI Framework** | Tailwind CSS + shadcn/ui |
| **Backend API** | Next.js API Routes |
| **Database** | PostgreSQL 15 + Prisma ORM |
| **Authentication** | NextAuth.js v5 |
| **Sessions** | Redis (session store) + Secure HTTP-only cookies |
| **Background Jobs** | Bull + Redis |
| **Payments** | Stripe |
| **Email** | Resend |
| **Analytics** | PostHog |
| **Error Tracking** | Sentry |
| **Hosting** | Vercel (frontend) + AWS RDS (database) |

### Project Structure

```
slimmer-down-now/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth routes (signup, login, reset)
│   ├── (app)/                     # Protected app routes
│   │   ├── dashboard/
│   │   ├── onboarding/
│   │   ├── plan/
│   │   ├── checkin/
│   │   ├── progress/
│   │   ├── settings/
│   │   ├── billing/
│   │   └── admin/
│   ├── api/                       # API routes
│   │   ├── auth/
│   │   ├── users/
│   │   ├── plans/
│   │   ├── checkins/
│   │   ├── progress/
│   │   ├── subscriptions/
│   │   └── admin/
│   ├── layout.tsx
│   └── page.tsx
├── components/                    # React components
│   ├── auth/
│   ├── dashboard/
│   ├── plan/
│   ├── checkin/
│   ├── progress/
│   ├── settings/
│   ├── billing/
│   └── ui/                        # shadcn/ui components
├── lib/                           # Core business logic
│   ├── db/                        # Prisma client
│   ├── services/                  # Business logic services
│   │   ├── recommendationEngine.ts
│   │   ├── mealSelector.ts
│   │   ├── workoutSelector.ts
│   │   └── ...
│   ├── validations/               # Zod schemas
│   ├── utils/                     # Utilities
│   │   ├── errors.ts
│   │   ├── constants.ts
│   │   └── ...
│   ├── env.ts                     # Environment validation
│   └── middleware.ts              # Auth middleware
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Database seeding
├── styles/
│   └── globals.css                # Global styles
├── types/                         # TypeScript types
├── public/                        # Static assets
├── .github/
│   └── workflows/                 # CI/CD
├── docker-compose.yml             # Local dev environment
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── .env.example
└── package.json
```

---

## 📚 API Documentation

### Base URL

- **Local:** `http://localhost:3000/api`
- **Staging:** `https://staging.app.com/api`
- **Production:** `https://app.com/api`

### Authentication Endpoints

```
POST /auth/signup
  Body: { email, password, confirmPassword }
  Response: { userId, token, user }

POST /auth/login
  Body: { email, password }
  Response: { token, user }

POST /auth/logout
  Response: { message }

GET /auth/session
  Response: { user, subscription }

POST /auth/password-reset
  Body: { email }

POST /auth/password-reset-confirm
  Body: { token, newPassword }
```

### User Profile

```
POST /users/onboarding
  Body: { firstName, lastName, heightCm, ... }
  Auth: Required

PUT /users/profile
  Body: { partial profile fields }
  Auth: Required

GET /users/me
  Auth: Required
```

### Plans & Recommendations

```
GET /plans/today
  Auth: Required
  Cache: 1 hour

POST /plans/generate
  Auth: Required

GET /plans?startDate=...&endDate=...
  Auth: Required
```

### Daily Check-In

```
POST /checkins
  Body: { sleepHours, stressLevel, energyLevel, ... }
  Auth: Required

GET /checkins?days=7
  Auth: Required

GET /checkins/today
  Auth: Required
```

### Progress Tracking

```
GET /progress
  Auth: Required

GET /progress/dashboard
  Auth: Required
```

### Subscriptions

```
GET /subscriptions/status
  Auth: Required

POST /subscriptions/checkout
  Body: { plan }
  Auth: Required

GET /subscriptions/portal
  Auth: Required

POST /subscriptions/webhook
  Auth: Stripe signature verification
```

### Admin

```
GET /admin/users
  Auth: Admin only

GET /admin/analytics
  Auth: Admin only

GET /admin/feature-flags
  Auth: Admin only

PUT /admin/feature-flags/:name
  Auth: Admin only
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

### Test Structure

```
__tests__/
├── unit/
│   └── lib/services/recommendationEngine.test.ts
├── integration/
│   ├── api/auth.test.ts
│   ├── api/plans.test.ts
│   └── ...
└── e2e/
    └── signup-onboard.spec.ts
```

---

## 🚢 Deployment

### Staging Deployment

```bash
git push origin feature-branch:staging
# Vercel automatically deploys on push to staging
# Database automatically mirrors production schema

# Test critical flows on staging.app.com
# Check logs and metrics
```

### Production Deployment

```bash
# 1. Ensure all tests pass
npm run test
npm run lint
npm run build

# 2. Create PR, request review, merge to main
git merge --squash feature-branch
git push origin main

# 3. Vercel auto-deploys to production
# 4. Monitor with Sentry + PostHog

# If needed, rollback
vercel rollback
```

### Environment Variables (Production)

Set in Vercel dashboard under Settings → Environment Variables:

```
DATABASE_URL = postgresql://...
REDIS_URL = redis://...
NEXTAUTH_SECRET = (generate: openssl rand -base64 32)
NEXTAUTH_URL = https://app.com
STRIPE_PUBLIC_KEY = pk_live_...
STRIPE_SECRET_KEY = sk_live_...
STRIPE_WEBHOOK_SECRET = whsec_...
RESEND_API_KEY = re_...
POSTHOG_API_KEY = phc_...
SENTRY_DSN = https://...
```

### Database Migrations (Production)

```bash
# Apply pending migrations in production
npx prisma migrate deploy

# If a migration fails, check Prisma docs for recovery
```

---

## 📊 Key Metrics & KPIs

### Primary Metrics

- **Signups:** New users per day
- **Trial Conversion:** % converting from trial to paid by day 7
- **Waist Reduction:** Average inches lost per user per month
- **Adherence:** % of daily plans completed
- **Retention:** 7-day, 30-day active users
- **Churn Rate:** % of paying users canceling per month
- **MRR:** Monthly recurring revenue

### Dashboard Access

- **PostHog:** https://app.posthog.com (product analytics)
- **Stripe:** https://dashboard.stripe.com (payments)
- **Vercel:** https://vercel.com (deployments)
- **Sentry:** https://sentry.io (error tracking)
- **Prisma Studio:** `npm run db:studio` (database browser)

---

## 🔒 Security

### Best Practices Implemented

- ✅ Passwords hashed with bcrypt
- ✅ Sessions stored in secure HTTP-only cookies
- ✅ JWT validation on protected API routes
- ✅ Rate limiting on auth endpoints
- ✅ HTTPS only in production
- ✅ Secrets in environment variables (never in code)
- ✅ Zod validation on all inputs
- ✅ CORS properly configured
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CSRF protection (NextAuth default)

### Not HIPAA Covered

This app is a wellness tool, not a medical provider. No HIPAA compliance is required unless medical features are added in the future.

---

## 🛠️ Debugging

### View Logs

```bash
# Vercel production logs
vercel logs

# Local development logs
npm run dev   # Logs appear in terminal

# Database logs
npm run db:studio
```

### Common Issues

**Database connection fails:**
```bash
# Check Docker containers
docker ps

# Restart containers
npm run docker:down && npm run docker:up

# Verify DATABASE_URL in .env.local
```

**NextAuth session not persisting:**
```bash
# Clear browser cookies
# Restart dev server
npm run dev

# Check NEXTAUTH_SECRET is set
```

**Build fails:**
```bash
npm run type-check    # Check for TS errors
npm run lint          # Check for linting errors
npm run build         # Full build
```

---

## 📝 Development Workflow

### Before Starting Work

```bash
git pull origin main
npm install   # In case deps changed
npm run dev   # Start local server
```

### Making Changes

```bash
# Create feature branch
git checkout -b feature/description

# Make changes, test locally
npm run test
npm run lint

# Commit with meaningful message
git commit -m "feat: add waist tracking"

# Push and create PR
git push origin feature/description
# Open PR in GitHub
```

### PR Review Checklist

- [ ] Tests pass
- [ ] No linting errors
- [ ] Code is readable
- [ ] No console.logs left in code
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Performance acceptable

---

## 🗺️ Roadmap

### Phase 1: Foundation (Complete)
- ✅ Project scaffold
- ✅ Database schema
- ✅ Environment setup

### Phase 2: Auth + Onboarding (Next)
- [ ] Signup / Login flows
- [ ] Onboarding form
- [ ] Initial recommendation generation

### Phase 3: Daily Plans
- [ ] Plan generation engine
- [ ] Meal selector
- [ ] Workout selector

### Phase 4: Check-In & Progress
- [ ] Check-in form
- [ ] Progress dashboard
- [ ] Trend charts

### Phase 5: Subscriptions
- [ ] Stripe integration
- [ ] Checkout flow
- [ ] Webhook handling

### Phase 6: Polish & Launch
- [ ] Admin dashboard
- [ ] Analytics setup
- [ ] Security audit
- [ ] Soft launch to beta users

---

## 📞 Support

For questions or issues:
1. Check this README
2. Check GitHub Issues
3. Review Prisma docs: https://www.prisma.io/docs/
4. Review Next.js docs: https://nextjs.org/docs
5. Contact team

---

## 📄 License

Private - Proprietary

---

## 🙋 Contributing

1. Create a feature branch from `main`
2. Follow the development workflow above
3. Request review when ready
4. Deploy to staging first
5. After approval, deploy to production

---

**Last Updated:** April 2026  
**Maintainers:** Engineering Team
