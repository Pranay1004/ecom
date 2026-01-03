# Vercel Deployment Guide

This document covers deploying Eshant Ecommerce to Vercel production.

## Overview

The Eshant platform consists of multiple services:

| Service | Deployment | Status |
|---------|-----------|--------|
| **Next.js Frontend** (`apps/web`) | Vercel | ✅ Recommended |
| **PostgreSQL Database** | Vercel Postgres / External | ✅ Required |
| **Python Geometry Engine** (`apps/engine`) | Render / Railway / AWS Lambda | ⏳ For later |
| **tRPC API** | Next.js API Routes | ✅ Included in web |

## Step 1: Prepare the Repository

Ensure all code is committed and pushed to GitHub:

```bash
git status
git add -A
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Step 2: Connect to Vercel

### Option A: Vercel CLI (Recommended)

```bash
npm i -g vercel
vercel login
cd /Users/pandeyji/Desktop/Eshant_Ecommerce
vercel
```

### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Connect your GitHub account
4. Select `Eshant_Ecommerce` repository
5. Select "Next.js" as framework
6. Click "Deploy"

## Step 3: Configure Environment Variables

In the Vercel dashboard (or via CLI), add these environment variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@your-db-host:5432/eshant"

# API URLs (Next.js will auto-detect, but set explicitly for safety)
NEXT_PUBLIC_API_URL="https://your-vercel-domain.vercel.app"

# Python Engine URL (when deployed)
NEXT_PUBLIC_ENGINE_URL="https://your-engine-domain.onrender.com"
```

### Getting PostgreSQL on Vercel

#### Option 1: Vercel Postgres (Easiest)

```bash
vercel env add DATABASE_URL
# Follow prompts to create a new Vercel Postgres database
```

This automatically creates a `.env.local` file locally.

#### Option 2: External Database Provider

Use Neon, Supabase, or AWS RDS:

```bash
vercel env add DATABASE_URL
# Paste your external connection string
```

## Step 4: Deploy to Vercel

### Automatic Deployment

Every push to `main` triggers automatic deployment:

```bash
git push origin main
# Vercel will detect changes and deploy automatically
```

### Manual Deployment

```bash
vercel --prod
```

### Check Deployment Status

```bash
vercel logs
```

## Step 5: Run Database Migrations

After first deployment, run Prisma migrations on production:

```bash
# Via Vercel CLI
vercel env pull
pnpm prisma db push  # Use with caution in production

# Or via SSH (if using self-hosted DB)
ssh your-server
cd /path/to/ecommerce
pnpm prisma db push
```

## Step 6: Configure Production Database

Create the initial schema:

```bash
pnpm prisma db push
# OR for controlled migrations:
pnpm prisma migrate deploy
```

## Environment Variables Checklist

- [ ] `DATABASE_URL` set to production PostgreSQL
- [ ] `NEXT_PUBLIC_API_URL` set to Vercel domain
- [ ] All secrets stored in Vercel dashboard (not in `.env`)
- [ ] `.env.local` added to `.gitignore` (already done)

## Production Checklist

Before marking as production-ready:

- [ ] All tests passing: `pnpm test`
- [ ] Build succeeds locally: `pnpm build`
- [ ] No console errors in browser dev tools
- [ ] Database migrations applied: `pnpm prisma db push`
- [ ] Environment variables configured in Vercel dashboard
- [ ] Vercel deployment shows "Ready" status
- [ ] Custom domain configured (optional)

## Monitoring

### View Logs

```bash
vercel logs [--tail]  # Real-time streaming
```

### Analytics

Visit your Vercel project dashboard to view:
- Request rate
- Response times
- Error rates
- Deployment history

## Troubleshooting

### Build Fails

Check the build logs in Vercel dashboard:

1. Go to your Vercel project
2. Click "Deployments"
3. Find the failed deployment
4. Click to expand and see full error logs

Common issues:
- Missing environment variables → Add to Vercel dashboard
- Database connection fails → Check `DATABASE_URL` format
- Monorepo not detected → Ensure `package.json` at root with `"workspaces"` field

### Database Connection Errors

```bash
# Test connection locally
vercel env pull
pnpm prisma db push
```

If it fails, check:
- PostgreSQL is running and accessible
- `DATABASE_URL` format is correct: `postgresql://user:pass@host:5432/dbname`
- Firewall/VPN isn't blocking the connection

## Future: Python Engine Deployment

When ready to deploy the geometry engine (`apps/engine`):

**Option 1: Render.com (Recommended)**
```bash
# Push Python engine to Render
# Set NEXT_PUBLIC_ENGINE_URL in Vercel to Render URL
```

**Option 2: Railway.app**
```bash
# Similar setup, different provider
```

**Option 3: AWS Lambda + API Gateway**
```bash
# Serverless option, requires packaging adjustments
```

Update `NEXT_PUBLIC_ENGINE_URL` in Vercel after deploying engine.

## Rollback

To rollback to a previous deployment:

```bash
vercel rollback
```

Or via dashboard:
1. Deployments tab
2. Find previous successful deployment
3. Click three-dot menu → "Redeploy"

## Custom Domain

In Vercel dashboard:
1. Project Settings → Domains
2. Add your domain (e.g., `ecommerce.eshant.io`)
3. Update DNS records as instructed
4. Wait for SSL certificate (usually <5 min)

## Support

- Vercel Docs: https://vercel.com/docs
- tRPC + Vercel: https://trpc.io/docs/deploy/vercel
- Prisma + Vercel: https://www.prisma.io/docs/guides/deploy/vercel
