# Implementation Checklist

## Phase 0: Foundation & Setup ✅ COMPLETE

- [x] Repository initialized with Next.js 14
- [x] TypeScript configured (strict mode)
- [x] ESLint + Prettier configured
- [x] Tailwind CSS + PostCSS configured
- [x] Environment variables schema (Zod validation)
- [x] Prisma ORM setup with PostgreSQL schema
- [x] Docker Compose for local dev (PostgreSQL + Redis)
- [x] GitHub Actions CI/CD pipeline
- [x] Comprehensive README with setup instructions
- [x] Core utilities (errors, constants, calculations)
- [x] Database client singleton
- [x] Middleware for route protection
- [x] Landing page with basic UI

## Phase 1: Authentication & Onboarding 🔄 NEXT

### Authentication (Days 4-5)
- [ ] NextAuth.js v5 configuration
  - [ ] Email/password strategy
  - [ ] Prisma adapter
  - [ ] JWT configuration
  - [ ] Session cookie setup
- [ ] Signup endpoint + validation
  - [ ] Email uniqueness check
  - [ ] Password hashing
  - [ ] Verification email (optional for MVP)
  - [ ] Create initial subscription (free trial)
- [ ] Login endpoint
  - [ ] Email + password validation
  - [ ] Return JWT + user data
  - [ ] Track login audit log
- [ ] Password reset flow
  - [ ] Reset request endpoint (email verification)
  - [ ] Reset confirmation endpoint
  - [ ] Rate limiting (3 per hour)
  - [ ] Token expiry (30 minutes)
- [ ] Logout endpoint
  - [ ] Session termination
  - [ ] Audit log entry
- [ ] Session routes
  - [ ] GET /auth/session endpoint
  - [ ] Middleware to verify JWT

### UI Components (Days 4-6)
- [ ] SignupForm component
  - [ ] Email input with validation
  - [ ] Password input with strength indicator
  - [ ] Confirm password validation
  - [ ] Submit button with loading state
  - [ ] Error messages display
  - [ ] Link to login
- [ ] LoginForm component
  - [ ] Email input
  - [ ] Password input
  - [ ] "Remember me" checkbox (optional)
  - [ ] "Forgot password" link
  - [ ] Submit button with loading state
- [ ] PasswordResetForm component
- [ ] Page layouts
  - [ ] /signup page
  - [ ] /login page
  - [ ] /password-reset page
  - [ ] /password-reset-confirm page

### Onboarding Flow (Days 5-7)
- [ ] Onboarding schema + validation
- [ ] Multi-step form component
  - [ ] Step 1: Personal info (name, age, sex, height)
  - [ ] Step 2: Current metrics (weight, waist circumference)
  - [ ] Step 3: Activity & fitness level
  - [ ] Step 4: Preferences (diet, allergies, workout location)
  - [ ] Step 5: Goals (target waist, timeline, motivation)
  - [ ] Review step with summary
- [ ] Initial recommendation calculation
  - [ ] TDEE calculation
  - [ ] Calorie target
  - [ ] Macro targets
  - [ ] Step goal
  - [ ] Hydration goal
- [ ] Onboarding endpoint
  - [ ] Validate all data
  - [ ] Create UserProfile
  - [ ] Create Goal
  - [ ] Create initial BodyMetrics
  - [ ] Create first DailyPlan
  - [ ] Mark subscription as active
  - [ ] Return recommendation summary
- [ ] Dashboard placeholder
  - [ ] Show onboarding completion status
  - [ ] Display initial recommendation

### Testing (Days 6-7)
- [ ] Unit tests for auth validation schemas
- [ ] Integration tests for auth endpoints
  - [ ] Signup creates user + subscription
  - [ ] Login returns valid token
  - [ ] Password reset flow works
- [ ] E2E test: signup → onboarding → dashboard
- [ ] Security tests
  - [ ] Password reset token expires
  - [ ] Rate limiting works
  - [ ] Weak passwords rejected
  - [ ] SQL injection prevented

### Database Seeds
- [ ] Admin user creation script
- [ ] Test user creation script

**Deliverable:** Users can sign up, complete onboarding, receive initial plan recommendation

---

## Phase 2: Daily Plan & Recommendation Engine 🔄 (AFTER PHASE 1)

### Recommendation Engine (Days 8-9)
- [ ] Meal selector algorithm
  - [ ] Filter meals by calorie range
  - [ ] Avoid repetition (previous meals)
  - [ ] Respect dietary preferences
  - [ ] Calculate snack portions
- [ ] Workout selector algorithm
  - [ ] Filter by fitness level
  - [ ] Consider location (home/gym/both)
  - [ ] Respect time constraints
  - [ ] Filter by soreness/energy levels
- [ ] Adaptation logic
  - [ ] Progression when adhering well
  - [ ] Maintenance when moderate
  - [ ] Recovery focus when stressed/sore
- [ ] Unit tests for calculations
  - [ ] BMR calculation accuracy
  - [ ] TDEE multipliers correct
  - [ ] Macro distribution correct

### Meal & Workout Templates (Days 8-9)
- [ ] Seed 50-100 meal templates
  - [ ] Breakfast options (15+ meals)
  - [ ] Lunch options (20+ meals)
  - [ ] Dinner options (20+ meals)
  - [ ] Snack options (10+ snacks)
  - [ ] Various dietary styles
  - [ ] Different calorie ranges
- [ ] Seed 20-30 workout templates
  - [ ] Strength workouts (beginner/intermediate/advanced)
  - [ ] Cardio workouts
  - [ ] Mobility/recovery workouts
  - [ ] For home and gym

### Daily Plan Generation (Days 9-10)
- [ ] Generate daily plans scheduled job (8 PM daily)
  - [ ] Query all active users
  - [ ] Get user profile + current subscription status
  - [ ] Select meals based on preferences
  - [ ] Select workout based on state
  - [ ] Calculate coaching tip
  - [ ] Store in DailyPlan table
  - [ ] Cache in Redis (24 hours)
- [ ] GET /api/plans/today endpoint
  - [ ] Return today's plan
  - [ ] Cache hits reduce DB load
  - [ ] Include macro breakdown
  - [ ] Include meal details
  - [ ] Include workout details
- [ ] POST /api/plans/generate endpoint
  - [ ] On-demand plan generation
  - [ ] For a specific date
  - [ ] For testing purposes
- [ ] GET /api/plans endpoint
  - [ ] List plans for date range
  - [ ] Pagination support

### UI Components (Days 10-11)
- [ ] DailyPlanCard component
  - [ ] Display today's meals
  - [ ] Display macros breakdown (pie chart)
  - [ ] Display workout details
  - [ ] Display step goal
  - [ ] Display coaching tip
- [ ] MealDisplay component
  - [ ] Show meal name
  - [ ] Show calories + macros
  - [ ] Show prep time
  - [ ] Show ingredients (expandable)
  - [ ] Show instructions
- [ ] WorkoutDisplay component
  - [ ] Show workout name
  - [ ] Show duration
  - [ ] Show exercises list
  - [ ] Show difficulty level
- [ ] MacroBreakdown chart (Recharts)
- [ ] Dashboard enhanced
  - [ ] Show plan summary
  - [ ] Show yesterday's adherence
  - [ ] Show this week's progress preview

### Testing (Days 10-11)
- [ ] Unit tests for meal selector
- [ ] Unit tests for workout selector
- [ ] Integration tests for plan generation
- [ ] E2E test: logged in user views daily plan

**Deliverable:** Users see personalized daily meal plan + workout plan

---

## Phase 3: Daily Check-In & Progress Tracking 🔄 (AFTER PHASE 2)

### Check-In Collection (Days 12-13)
- [ ] POST /api/checkins endpoint
  - [ ] Validate check-in data
  - [ ] Store DailyCheckIn record
  - [ ] Update latest BodyMetrics if provided
  - [ ] Return check-in summary
- [ ] Check-in schema + validation (Zod)
  - [ ] Sleep hours (0-24)
  - [ ] Stress level (1-10)
  - [ ] Energy level (1-10)
  - [ ] Soreness level (1-10)
  - [ ] Bloating level (1-10)
  - [ ] Steps completed
  - [ ] Diet adherence (0-1)
  - [ ] Workout adherence (0-1)
  - [ ] Optional: weight, waist measurement
  - [ ] Optional: notes

### Check-In UI (Days 12-13)
- [ ] CheckInForm component
  - [ ] Slider inputs for 1-10 scales
  - [ ] Number input for steps
  - [ ] Percentage input for adherence
  - [ ] Optional weight/waist inputs
  - [ ] Notes textarea
  - [ ] Submit with loading
- [ ] CheckInReview component
  - [ ] Show submitted data summary
  - [ ] Show next check-in reminder
  - [ ] Show encouragement message

### Progress Calculation (Days 13-14)
- [ ] Calculate weekly progress snapshots
  - [ ] Average sleep/stress/energy from 7 check-ins
  - [ ] Waist trend (current vs. 1 week ago)
  - [ ] Weight trend
  - [ ] Adherence score (weighted diet + workout)
  - [ ] Projected goal date based on trend
  - [ ] Calculate trend direction (losing/maintaining/gaining)
- [ ] Scheduled job: Create weekly snapshots (Sunday night)

### Progress Dashboard (Days 14-15)
- [ ] GET /api/progress endpoint
  - [ ] Current metrics
  - [ ] Waist/weight history (30d, 90d)
  - [ ] Projected goal date
  - [ ] Adherence streak
  - [ ] Weekly snapshots
- [ ] Progress page layout
  - [ ] Key metrics cards (waist change, % to goal, days to goal)
  - [ ] Waist trend chart (Recharts line chart)
  - [ ] Weight trend chart
  - [ ] Adherence history
  - [ ] Weekly progress table
  - [ ] Projection card (estimated goal date)
- [ ] ProgressChart component
  - [ ] Line chart for trends
  - [ ] 30-day and 90-day views
  - [ ] Tooltip with exact values
  - [ ] Loading skeleton
- [ ] ProgressCard component
  - [ ] Metric name + value
  - [ ] Change indicator (↑/↓/→)
  - [ ] Color coding (green/red/neutral)

### Testing (Days 14-15)
- [ ] Unit tests for adherence calculation
- [ ] Unit tests for projection calculation
- [ ] Integration tests for check-in API
- [ ] E2E test: create check-in → view progress

**Deliverable:** Users can track daily metrics and view progress trends

---

## Phase 4: Subscriptions & Billing 🔄 (AFTER PHASE 3)

### Stripe Setup (Days 16-17)
- [ ] Create Stripe account + API keys
- [ ] Create subscription products/prices in Stripe
  - [ ] Monthly plan ($9.99/month)
  - [ ] Annual plan ($99/year)
- [ ] Set up Stripe webhook endpoint
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed

### Subscription Logic (Days 16-17)
- [ ] POST /api/subscriptions/checkout
  - [ ] Create Stripe customer
  - [ ] Create checkout session
  - [ ] Return session URL
  - [ ] Handle existing subscriptions
- [ ] POST /api/subscriptions/webhook
  - [ ] Verify Stripe signature
  - [ ] Update Subscription record
  - [ ] Handle trial conversion
  - [ ] Handle cancellations
  - [ ] Send confirmation emails
- [ ] GET /api/subscriptions/status
  - [ ] Return user's subscription status
  - [ ] Show trial days remaining
  - [ ] Show renewal date
  - [ ] Show plan type

### Entitlement Logic (Days 17-18)
- [ ] Middleware to check subscription status
  - [ ] Allow free trial (7 days)
  - [ ] Allow active subscriptions
  - [ ] Block expired trials → redirect to billing
  - [ ] Block cancelled subs → redirect to billing
- [ ] Endpoint that requires entitlement
  - [ ] /api/plans/generate
  - [ ] /api/checkins

### UI & Flow (Days 17-18)
- [ ] BillingPage component
  - [ ] Show current subscription status
  - [ ] Show trial days remaining
  - [ ] Show plan details
  - [ ] Show next billing date
- [ ] UpgradeCard component
  - [ ] Pricing table (free trial vs. monthly vs. annual)
  - [ ] Feature comparison
  - [ ] Call-to-action buttons
- [ ] CheckoutFlow
  - [ ] Stripe Checkout modal (not custom form)
  - [ ] Success page after checkout
  - [ ] Success email from Resend
- [ ] Billing portal link
  - [ ] GET /api/subscriptions/portal
  - [ ] Redirect to Stripe portal

### Testing (Days 17-18)
- [ ] Unit tests for subscription logic
- [ ] Integration tests for Stripe webhook
- [ ] E2E test: trial conversion to paid

**Deliverable:** Free trial users can upgrade to paid subscriptions

---

## Phase 5: Notifications & Email 🔄 (AFTER PHASE 4)

### Email Setup (Days 19-20)
- [ ] Resend account + API key
- [ ] Email templates
  - [ ] Welcome email
  - [ ] Daily plan summary
  - [ ] Weekly progress summary
  - [ ] Trial ending reminder (1 day)
  - [ ] Password reset email
  - [ ] Subscription confirmation

### Notification Job Scheduling (Days 19-20)
- [ ] Scheduled job: Daily plan reminders (8 AM)
  - [ ] Get users with notification enabled
  - [ ] Send daily plan email via Resend
  - [ ] Track send success/failure
- [ ] Scheduled job: Weekly summaries (Sunday 7 PM)
  - [ ] Get users with weekly summary enabled
  - [ ] Aggregate week's progress
  - [ ] Send summary email
- [ ] Scheduled job: Trial expiring alerts
  - [ ] Get users with trial expiring in 1 day
  - [ ] Send final offer email
  - [ ] Update audit log

### Notification Preferences (Days 19-20)
- [ ] GET /api/users/preferences
  - [ ] Return notification settings
- [ ] PUT /api/users/preferences
  - [ ] Update notification times/frequency
- [ ] UI: Notification preferences page
  - [ ] Toggle daily reminders
  - [ ] Toggle weekly summaries
  - [ ] Set reminder times
  - [ ] Set frequency (immediate/daily/weekly)
  - [ ] Unsubscribe links in emails

### Testing (Days 19-20)
- [ ] Integration tests for email sending
- [ ] Test email templates render correctly
- [ ] E2E: receive daily reminder email

**Deliverable:** Users receive personalized notifications

---

## Phase 6: Admin Dashboard 🔄 (AFTER PHASE 5)

### Admin Authentication (Days 21-22)
- [ ] AdminUser model (separate from User)
- [ ] Admin login endpoint
- [ ] Admin route protection middleware
- [ ] Admin auth UI pages

### Analytics Endpoints (Days 21-22)
- [ ] GET /api/admin/analytics
  - [ ] Total users
  - [ ] Active users (7d, 30d)
  - [ ] New signups (today, this week, this month)
  - [ ] Trial conversions
  - [ ] Churn rate
  - [ ] MRR, revenue
  - [ ] Top users by adherence
  - [ ] Average metrics (waist loss, adherence)

### User Management (Days 21-22)
- [ ] GET /api/admin/users?limit=50&offset=0&search=...
  - [ ] List users with search
  - [ ] Pagination
  - [ ] Show subscription status
  - [ ] Show creation date
- [ ] GET /api/admin/users/:userId
  - [ ] Full user profile
  - [ ] Subscription history
  - [ ] Check-in history
  - [ ] Plan history

### Feature Flags (Days 21-22)
- [ ] GET /api/admin/feature-flags
  - [ ] List all flags
- [ ] PUT /api/admin/feature-flags/:name
  - [ ] Toggle enable/disable
  - [ ] Set rollout percentage
- [ ] UI components
  - [ ] FeatureFlagList
  - [ ] FeatureFlagToggle

### Admin Dashboard UI (Days 21-22)
- [ ] AdminPage
  - [ ] KPI cards (users, MRR, conversions, churn)
  - [ ] Charts (signups over time, revenue over time)
  - [ ] Recent activity feed
- [ ] UsersPage
  - [ ] User table with search/filter
  - [ ] User details modal
- [ ] AnalyticsPage
  - [ ] Detailed analytics charts
- [ ] FeatureFlagsPage
  - [ ] List and toggle flags

**Deliverable:** Admin can view metrics and manage features

---

## Phase 7: Testing & QA 🔄 (AFTER PHASE 6)

### Test Coverage Goals
- [ ] Business logic: 90%+ coverage
- [ ] API routes: 80%+ coverage
- [ ] Components: 60%+ coverage

### Unit Tests
- [ ] recommendationEngine.test.ts
- [ ] calculation utilities tests
- [ ] error handling tests

### Integration Tests
- [ ] Auth flow tests
- [ ] Plan generation tests
- [ ] Check-in tests
- [ ] Subscription tests

### E2E Tests
- [ ] Full signup → onboarding → plan view flow
- [ ] Check-in → progress tracking flow
- [ ] Trial to paid conversion flow

### Performance Testing
- [ ] Load test with 100 concurrent users
- [ ] Plan generation with 10,000 users
- [ ] Dashboard load time < 2s

### Security Audit
- [ ] SQL injection tests
- [ ] XSS vulnerability scan
- [ ] Rate limiting verification
- [ ] Auth token validation

### Accessibility Audit
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

**Deliverable:** Comprehensive test suite with high coverage

---

## Phase 8: Production Hardening 🔄 (AFTER PHASE 7)

### Monitoring & Logging
- [ ] Sentry integration + alerts
  - [ ] Error rate > 1%
  - [ ] Critical errors
  - [ ] Performance degradation
- [ ] PostHog analytics
  - [ ] Event tracking for all user actions
  - [ ] Funnel analysis
  - [ ] Conversion tracking
- [ ] Database monitoring
  - [ ] Query performance
  - [ ] Connection pool status
  - [ ] Backup verification

### Security Hardening
- [ ] Rate limiting on all endpoints
- [ ] CORS properly configured
- [ ] CSP headers
- [ ] HTTPS enforced
- [ ] Secrets rotation process
- [ ] Database encryption at rest
- [ ] Audit logging for sensitive actions

### Performance Optimization
- [ ] Image optimization
- [ ] Code splitting
- [ ] CSS/JS minification
- [ ] API response caching (Redis)
- [ ] Database query optimization
- [ ] CDN setup for static assets

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Deployment guide
- [ ] Runbook for common issues
- [ ] Architecture decisions log (ADR)

### Legal & Compliance
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Disclaimers in app
- [ ] GDPR compliance (data export/delete)
- [ ] Cookie consent (if needed)

**Deliverable:** Production-ready, secure, monitored system

---

## Phase 9: Soft Launch 🔄 (FINAL)

### Pre-Launch
- [ ] Final security review
- [ ] Performance baseline established
- [ ] Support process documented
- [ ] On-call rotation setup

### Soft Launch (Limited Users)
- [ ] Invite 100-500 beta users
- [ ] Monitor error rates and performance
- [ ] Gather user feedback
- [ ] Fix critical bugs

### Launch Criteria
- ✅ 1+ new signups per day
- ✅ 30%+ first check-in rate
- ✅ 15%+ trial to paid conversion by day 7
- ✅ 0 critical errors in first week
- ✅ Average waist loss trend positive
- ✅ Database backups working
- ✅ Monitoring alerts functioning

### Post-Launch
- [ ] Daily standup reviewing metrics
- [ ] Weekly bug triage
- [ ] Iterate on feedback
- [ ] Plan Phase 2 features

**Deliverable:** Live product with paying users

---

## Ongoing Maintenance

- [ ] Security patches
- [ ] Dependency updates
- [ ] Performance monitoring
- [ ] User support
- [ ] Feature iteration based on data
- [ ] Infrastructure scaling as needed

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Database down | Automated RDS backups, 30-day retention, test restore quarterly |
| Auth bypass | Security review, penetration testing before launch |
| Payment processing failure | Stripe webhook retries, manual reconciliation process |
| High user acquisition overwhelming system | Load testing, auto-scaling on Vercel + RDS, rate limiting |
| Poor data privacy | Encrypt sensitive data, audit logs, GDPR export/delete |
| User churn from poor UX | User testing, analytics tracking, iterate on feedback |
| API rate limit exhaustion | Implement rate limiting, monitor usage patterns |
| Recommendation engine not working | Deterministic rules + fallback logic, monitor adherence metrics |

---

**Total Implementation Time: ~4-5 weeks for MVP launch**

Last updated: April 11, 2026
