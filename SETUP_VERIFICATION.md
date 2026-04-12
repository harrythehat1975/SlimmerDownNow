# Setup Verification Checklist

Use this to verify Phase 0 is complete and you're ready to start Phase 1.

## Pre-Installation

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Git installed (`git --version`)
- [ ] Text editor / IDE ready (VSCode recommended)
- [ ] Terminal open at `/Users/harrykauffman/SlimmerDownNow44`

## Repository Structure

Verify all files exist:

```bash
# Core configuration files
[ -f package.json ] && echo "✓ package.json" || echo "✗ package.json"
[ -f tsconfig.json ] && echo "✓ tsconfig.json" || echo "✗ tsconfig.json"
[ -f .eslintrc.json ] && echo "✓ .eslintrc.json" || echo "✗ .eslintrc.json"
[ -f .prettierrc ] && echo "✓ .prettierrc" || echo "✗ .prettierrc"
[ -f tailwind.config.js ] && echo "✓ tailwind.config.js" || echo "✗ tailwind.config.js"
[ -f next.config.js ] && echo "✓ next.config.js" || echo "✗ next.config.js"
[ -f jest.config.js ] && echo "✓ jest.config.js" || echo "✗ jest.config.js"
[ -f playwright.config.ts ] && echo "✓ playwright.config.ts" || echo "✗ playwright.config.ts"

# Prisma
[ -f prisma/schema.prisma ] && echo "✓ prisma/schema.prisma" || echo "✗ prisma/schema.prisma"

# App files
[ -f app/page.tsx ] && echo "✓ app/page.tsx" || echo "✗ app/page.tsx"
[ -d app/api/auth ] && echo "✓ app/api/auth" || echo "✗ app/api/auth"
[ -d app/api/health ] && echo "✓ app/api/health" || echo "✗ app/api/health"

# Documentation
[ -f README.md ] && echo "✓ README.md" || echo "✗ README.md"
[ -f ARCHITECTURE.md ] && echo "✓ ARCHITECTURE.md" || echo "✗ ARCHITECTURE.md"
[ -f DEPLOYMENT_GUIDE.md ] && echo "✓ DEPLOYMENT_GUIDE.md" || echo "✗ DEPLOYMENT_GUIDE.md"
[ -f IMPLEMENTATION_CHECKLIST.md ] && echo "✓ IMPLEMENTATION_CHECKLIST.md" || echo "✗ IMPLEMENTATION_CHECKLIST.md"
[ -f EXECUTIVE_SUMMARY.md ] && echo "✓ EXECUTIVE_SUMMARY.md" || echo "✗ EXECUTIVE_SUMMARY.md"
```

## Step 1: Install Dependencies

```bash
cd /Users/harrykauffman/SlimmerDownNow44
npm install
```

Expected output: "added XXX packages"

Verify:

- [ ] No errors in console
- [ ] `node_modules/` folder created (~500MB)
- [ ] `.next/` folder does NOT exist yet (created after build)

## Step 2: Create Environment File

```bash
cp .env.example .env.local
```

Verify:

- [ ] `.env.local` file created
- [ ] Contains DATABASE_URL, NEXTAUTH_SECRET, REDIS_URL, etc.
- [ ] No passwords filled in (that's OK for local dev)

## Step 3: Start Docker Infrastructure

```bash
npm run docker:up
```

Wait ~15 seconds for containers to be healthy.

Verify:

- [ ] PostgreSQL container running (`docker ps | grep postgres`)
- [ ] Redis container running (`docker ps | grep redis`)
- [ ] No errors in console

Test connections:

```bash
# Test PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/slimmer_dev -c "SELECT version();"
# Should show: PostgreSQL 15.x

# Test Redis
redis-cli ping
# Should show: PONG
```

## Step 4: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database schema
npx prisma migrate deploy

# Seed with test data
npm run db:seed
```

Verify:

- [ ] Prisma Client generated (no errors)
- [ ] Database schema created (no errors)
- [ ] Seed data inserted (should show "Seed complete!")
- [ ] No SQL errors

Test database:

```bash
npx prisma db execute --stdin <<< "SELECT COUNT(*) as meal_count FROM meal_templates;"
# Should show: 3 meals
```

## Step 5: Type Checking

```bash
npm run type-check
```

Verify:

- [ ] No TypeScript errors
- [ ] Output is clean

If errors: These are expected (files reference modules not installed yet). Proceed anyway.

## Step 6: Linting

```bash
npm run lint
```

Verify:

- [ ] No linting errors
- [ ] Output is clean

## Step 7: Build

```bash
npm run build
```

Wait 30-60 seconds.

Verify:

- [ ] Build succeeds
- [ ] `.next/` folder created (~50MB)
- [ ] No errors in console

## Step 8: Start Development Server

```bash
npm run dev
```

You should see:

```
> slimmer-down-now@0.1.0 dev
> next dev

  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in XXXms
```

Verify:

- [ ] No errors
- [ ] "Ready" message appears
- [ ] Port 3000 is listening

## Step 9: Verify Landing Page

Open browser: `http://localhost:3000`

You should see:

- [ ] Page title: "Slim Down Now"
- [ ] Heading: "Slim Down Now"
- [ ] Subheading about personalized plans
- [ ] Two buttons: "Get Started Free" and "Sign In"
- [ ] Three feature cards below
- [ ] No errors in browser console

If you see this, Phase 0 is **COMPLETE** ✅

## Step 10: Verify API Health Check

```bash
curl http://localhost:3000/api/health
```

You should see JSON response:

```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "development"
}
```

Verify:

- [ ] Response code 200
- [ ] JSON is valid
- [ ] status is "ok"

## Step 11: Database Studio

```bash
npm run db:studio
```

This opens Prisma Studio at `http://localhost:5555` - a GUI for your database.

Verify:

- [ ] Browser opens to `localhost:5555`
- [ ] You can see database tables
- [ ] meal_templates table shows ~3 rows
- [ ] workout_templates table shows ~3 rows
- [ ] feature_flags table shows ~4 rows

Press Ctrl+C to exit.

## Cleanup Commands

```bash
# Stop development server
# (Press Ctrl+C in the terminal)

# Stop Docker containers (keep data)
npm run docker:down

# Remove Docker containers (delete all data)
npm run docker:down && docker volume rm slimmer_postgres_data slimmer_redis_data

# Clean build artifacts
rm -rf .next/ node_modules/ dist/

# Reset database
# (Recreate containers, then npx prisma migrate deploy)
```

## All Green? You're Ready! ✅

If all checkboxes pass, you have:

✅ All files in place  
✅ Dependencies installed  
✅ Environment configured  
✅ Docker running  
✅ Database initialized  
✅ TypeScript compiling  
✅ Linting clean  
✅ Build succeeding  
✅ Dev server running  
✅ Landing page visible  
✅ API responsive  
✅ Database accessible

**You're ready to start Phase 1: Authentication + Onboarding**

## Next Steps

1. **Read these in order:**
   - EXECUTIVE_SUMMARY.md (overview)
   - ARCHITECTURE.md (system design)
   - IMPLEMENTATION_CHECKLIST.md (what to build)

2. **Start Phase 1 (Auth + Onboarding):**
   - Create signup page
   - Create login page
   - Implement NextAuth configuration
   - Implement onboarding form

3. **Estimated time:** 3-4 days for Phase 1

4. **Then:** Deploy to staging and test

---

## Troubleshooting

### "npm install" fails

**Problem:** `Error: EACCES: permission denied`

**Solution:**

```bash
sudo chown -R $(whoami) /Users/harrykauffman/SlimmerDownNow44/node_modules
npm install
```

### Docker containers won't start

**Problem:** `Error: Cannot connect to Docker daemon`

**Solution:**

```bash
# Start Docker Desktop application (macOS)
# Or restart Docker: sudo systemctl restart docker (Linux)
```

### Database connection fails

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**

```bash
# Check containers are running
docker ps

# Restart containers
npm run docker:down
npm run docker:up

# Wait 10 seconds for PostgreSQL to be ready
```

### Prisma migration fails

**Problem:** `Error: Migration XXX failed`

**Solution:**

```bash
# Reset database
npm run docker:down
npm run docker:up

# Wait 10 seconds, then:
npx prisma migrate deploy
```

### Port 3000 already in use

**Problem:** `Error: listen EADDRINUSE :::3000`

**Solution:**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### TypeScript errors about missing modules

**Problem:** `Cannot find module '@prisma/client'`

**Solution:** This is normal before build. Run:

```bash
npm run build
```

If persists:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Success Looks Like

**Terminal output:**

```
npm run dev
> next dev

  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000

 ✓ Ready in XXXms
```

**Browser:**

- Landing page visible
- "Slim Down Now" heading appears
- No console errors (F12 → Console tab)

**Database:**

- `npm run db:studio` opens Prisma Studio
- Tables are visible
- Test data is present

**When all three are working: Phase 0 Complete ✅**

---

**Last Updated:** April 11, 2026  
**Maintenance:** Update after major dependency changes
