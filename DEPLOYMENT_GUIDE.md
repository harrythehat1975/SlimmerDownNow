# Deployment Guide

## Overview

This guide covers deploying Slimmer Down Now to production on Vercel + AWS infrastructure.

## Environments

| Environment | URL             | Database       | Deployment                   |
| ----------- | --------------- | -------------- | ---------------------------- |
| Local       | localhost:3000  | Docker (local) | `npm run dev`                |
| Staging     | staging.app.com | AWS RDS (test) | Auto-deploy `staging` branch |
| Production  | app.com         | AWS RDS (prod) | Auto-deploy `main` branch    |

## Prerequisites

- AWS Account with permissions for RDS + ElastiCache
- Vercel Account (linked to GitHub)
- Stripe Account (test keys first)
- Resend Account (for transactional emails)
- PostHog Account (for analytics)
- Sentry Account (for error tracking)
- PostgreSQL 15 knowledge
- Redis 7 knowledge

## Architecture

```
┌─────────────────────────────────────────┐
│ Vercel (Next.js App)                    │
│ ├─ Frontend (React)                     │
│ └─ API Routes (/api/*)                  │
└──────────────┬──────────────────────────┘
               │ HTTPS
         ┌─────┴─────┐
         │           │
    ┌────▼────┐  ┌───▼────┐
    │ AWS RDS │  │AWS Redis│
    │(PostgreSQL) │        │
    └─────────┘  └────────┘
```

## Step 1: AWS Infrastructure Setup

### Create PostgreSQL Database

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier slimmer-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password $(openssl rand -base64 32) \
  --allocated-storage 20 \
  --backup-retention-period 30 \
  --storage-encrypted \
  --publicly-accessible false \
  --db-subnet-group-name default

# Output the master password to a safe location
# Note the Endpoint from the AWS console
```

### Create Redis Cluster

```bash
# Using AWS CLI
aws elasticache create-cache-cluster \
  --cache-cluster-id slimmer-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --engine-version 7.0 \
  --num-cache-nodes 1

# Note the Endpoint
```

### Create Security Groups

```bash
# RDS security group - allow from Vercel + ElastiCache
# Redis security group - allow from Vercel + application

# In AWS Console:
# 1. VPC → Security Groups → Create
# 2. Inbound: Allow 5432 (PostgreSQL) from app IPs
# 3. Inbound: Allow 6379 (Redis) from app IPs
# 4. Outbound: Allow all
```

## Step 2: Vercel Setup

### Initial Deploy

```bash
# 1. Connect GitHub repo to Vercel
# Visit: https://vercel.com/new
# Select GitHub org/repo

# 2. Configure environment variables (see section below)
# 3. Deploy from main branch
```

### Environment Variables (Vercel Dashboard)

Go to **Settings → Environment Variables** and add:

```env
# Core
NODE_ENV=production
NEXTAUTH_URL=https://app.com
NEXTAUTH_SECRET=(generate: openssl rand -base64 32)

# Database
DATABASE_URL=postgresql://postgres:PASSWORD@ENDPOINT:5432/slimmer_prod

# Redis
REDIS_URL=redis://default:PASSWORD@ENDPOINT:6379

# Stripe (get from dashboard.stripe.com)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
STRIPE_MONTHLY_PLAN_ID=price_...
STRIPE_ANNUAL_PLAN_ID=price_...

# Resend (get from resend.com)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@slimmerdownnow.com

# PostHog (get from posthog.com)
POSTHOG_API_KEY=phc_...
POSTHOG_HOST=https://us.posthog.com

# Sentry (get from sentry.io)
SENTRY_DSN=https://...
```

### Set Staging Environment

```bash
# In Vercel dashboard:
# Settings → Environment Variables
# For each variable, set different values for:
# - Production (when branch === main)
# - Preview (when PR or staging branch)
```

## Step 3: Database Migrations

### Initial Schema Deploy

```bash
# Generate Prisma Client
npm install @prisma/client

# Create .env file with production DATABASE_URL
DATABASE_URL="postgresql://postgres:PASSWORD@ENDPOINT:5432/slimmer_prod"

# Deploy schema to production
npx prisma migrate deploy --skip-generate

# Seed initial data (meals, workouts, flags)
npm run db:seed
```

### Ongoing Migrations

```bash
# After schema changes:
# 1. Create migration locally
npm run db:migrate -- --name "add_feature"

# 2. Test migration on staging first
git push origin feature:staging
# Vercel deploys automatically

# 3. Monitor staging for issues
# 4. If OK, merge to main
git merge staging
git push origin main

# 5. Vercel deploys to production
# 6. Migration runs automatically (verify in logs)
```

## Step 4: First Deployment Checklist

Before deploying to production:

```bash
# 1. All tests pass
npm run test
npm run test:cov

# 2. No linting errors
npm run lint

# 3. TypeScript compiles
npm run type-check

# 4. Build succeeds
npm run build

# 5. Environment variables set in Vercel

# 6. Database created + initialized
# Verify: npx prisma db execute --stdin < migration_check.sql

# 7. Redis cluster created + accessible

# 8. Stripe webhooks configured
# POST https://app.com/api/subscriptions/webhook

# 9. Email service working
# Test: Send test email via Resend

# 10. Domain configured
# Update NEXTAUTH_URL if not using vercel.app domain
```

## Step 5: Custom Domain

### Connect Domain (in Vercel)

```
Settings → Domains → Add
- Enter domain name
- Add DNS records
- Wait for verification (can take 24-48 hours)
```

### DNS Records (GoDaddy / Route53 / etc)

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61

(Use Vercel's suggested DNS records)
```

## Step 6: Monitoring & Alerts

### Sentry Setup

```typescript
// In lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

### PostHog Analytics

```typescript
// In lib/posthog.ts
import PostHog from "posthog-node";

export const posthog = new PostHog(process.env.POSTHOG_API_KEY, { host: process.env.POSTHOG_HOST });
```

### Set Up Alerts

- **Sentry:** Alert on any errors in production
- **Vercel:** Alert on failed deployments
- **AWS:** Alert on high CPU/memory usage
- **PostHog:** Dashboard for key metrics

## Step 7: Database Backups

### Automated Backups (AWS RDS)

```bash
# AWS automatically backs up:
# - Daily snapshots (30-day retention)
# - Transaction logs (7 days)

# Verify in AWS Console:
# RDS → Databases → slimmer-prod
# Check "Backup and Recovery" tab
```

### Manual Backup

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier slimmer-prod \
  --db-snapshot-identifier slimmer-prod-manual-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots
```

### Restore from Backup

```bash
# In emergency, restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier slimmer-prod-restore \
  --db-snapshot-identifier slimmer-prod-manual-20260411

# Update DATABASE_URL to point to restored instance
# Run migrations to ensure schema is current
# Test thoroughly before making live
```

## Step 8: Health Checks

### Vercel Health Check

```bash
# Endpoint health check - should return 200
curl https://app.com/api/health

# Expected response:
# { "status": "ok", "timestamp": "...", "environment": "production" }
```

### Database Health

```bash
# Test connection
psql postgresql://postgres:PASSWORD@ENDPOINT:5432/slimmer_prod -c "SELECT version();"

# Check tables exist
psql postgresql://postgres:PASSWORD@ENDPOINT:5432/slimmer_prod -c "\dt"
```

### Redis Health

```bash
# Test connection
redis-cli -h ENDPOINT -p 6379 ping
# Expected: PONG
```

## Step 9: Rollback Strategy

### Quick Rollback (Code Changes)

```bash
# If something breaks:
vercel rollback

# Or manually:
git revert HEAD
git push origin main
# Vercel redeploys automatically
```

### Database Rollback (Failed Migration)

```bash
# If a migration fails:
# 1. Identify which migration failed
npx prisma migrate status

# 2. Resolve the issue (fix schema, etc)

# 3. Re-run migration
npx prisma migrate deploy --skip-generate

# Or revert to previous snapshot:
# AWS RDS → Snapshots → Restore from snapshot
```

## Step 10: Ongoing Maintenance

### Daily

- [ ] Check error rate in Sentry (should be < 1%)
- [ ] Check key metrics in PostHog
- [ ] Verify database backups completed
- [ ] Check for failed subscription webhooks

### Weekly

- [ ] Review performance metrics
- [ ] Check for security alerts
- [ ] Verify deployment logs
- [ ] Review user feedback

### Monthly

- [ ] Review AWS costs
- [ ] Update dependencies
- [ ] Run security audit
- [ ] Plan next features

## Common Issues

### High Database CPU

**Symptom:** App is slow, database CPU > 80%

```bash
# 1. Identify slow queries
# In AWS console: RDS → Performance Insights

# 2. Optimize queries
# Check Prisma queries for N+1 problems

# 3. Add indexes if needed
# In Prisma schema, mark frequently queried fields with @index

# 4. Scale up instance if needed
# AWS: RDS → Modify → choose larger instance class
```

### Redis Connection Errors

**Symptom:** "REDIS_URL connection refused"

```bash
# 1. Check ElastiCache status
aws elasticache describe-cache-clusters

# 2. Verify security group allows your IP
# AWS → Security Groups → Check inbound rules

# 3. Verify connection string
echo $REDIS_URL  # Check format

# 4. Restart cluster if needed
aws elasticache reboot-cache-cluster --cache-cluster-id slimmer-redis
```

### Database Connections Exhausted

**Symptom:** "too many connections" error

```bash
# 1. Check active connections
psql postgresql://... -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# 2. Check Prisma connection pool settings
# lib/db/client.ts - verify pool size

# 3. Use connection pooling (PgBouncer)
# AWS RDS Proxy alternative: cheaper, easier

# 4. Scale up: increase db.max_connections
```

## Security Checklist

- [ ] HTTPS only (enforced in Vercel)
- [ ] Secrets in environment variables (never in code)
- [ ] Database encryption at rest (AWS RDS)
- [ ] Backups encrypted
- [ ] Security groups restrict access
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] No console.logs with sensitive data
- [ ] Audit logging for sensitive actions

## Performance Targets

| Metric                  | Target  |
| ----------------------- | ------- |
| Homepage load time      | < 2s    |
| Dashboard load time     | < 2s    |
| API response time       | < 200ms |
| Database query time     | < 100ms |
| 99th percentile latency | < 1s    |
| Error rate              | < 0.1%  |
| Uptime                  | 99.9%   |

## Scaling Strategy

### When to Scale

**Database:**

- CPU > 80% consistently
- Connections approaching max
- Query response time > 500ms

**Application:**

- Error rate increasing
- Response time degrading
- Vercel Functions timeout

**Redis:**

- Memory usage > 80%
- Eviction rate increasing

### Scaling Steps

```bash
# 1. Monitor and identify bottleneck
# Sentry + PostHog + AWS CloudWatch

# 2. Add indexes to slow queries
# prisma/schema.prisma → add @index

# 3. Enable caching in Redis
# lib/db/client.ts → cache layer

# 4. Scale database instance
# AWS RDS → Modify → larger instance

# 5. Scale application
# Vercel → settings → increase concurrency

# 6. Load test after scaling
# Verify performance improves
```

## Disaster Recovery

### RTO/RPO Targets

- **RTO** (Recovery Time Objective): < 1 hour
- **RPO** (Recovery Point Objective): < 5 minutes

### Recovery Procedures

**Full System Failure:**

```bash
# 1. Restore database from latest snapshot
# AWS RDS → Snapshots → Restore

# 2. Redeploy application
vercel deploy --prod

# 3. Verify all services working
curl https://app.com/api/health

# 4. Test user flows
# - Signup
# - Login
# - View plan
# - Create check-in
```

---

**Last Updated:** April 11, 2026  
**Next Review:** May 11, 2026
