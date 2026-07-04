# Cloud Deployment Guide: Vercel + NeonDB + Render

This guide walks you through deploying the Financial Reporting Engine on a free-tier cloud stack:
- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Node.js)
- **Database**: NeonDB (PostgreSQL)

**Total Cost**: $0/month with free tiers

**Estimated Deployment Time**: 45-60 minutes

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: NeonDB Setup](#step-1-neondb-setup)
3. [Step 2: Render Backend Deployment](#step-2-render-backend-deployment)
4. [Step 3: Vercel Frontend Deployment](#step-3-vercel-frontend-deployment)
5. [Step 4: Post-Deployment Configuration](#step-4-post-deployment-configuration)
6. [Step 5: Testing & Verification](#step-5-testing--verification)
7. [Free Tier Limitations & Workarounds](#free-tier-limitations--workarounds)
8. [Troubleshooting](#troubleshooting)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub account with `Financial-Reporting-Engine` repository access
- [ ] NeonDB account (free tier signup at https://neon.tech)
- [ ] Render account (free tier signup at https://render.com)
- [ ] Vercel account (free tier signup at https://vercel.com)
- [ ] Git installed locally
- [ ] Node.js 18+ installed locally (for running migrations)

### Quick Account Signup

```bash
# These are already set up, just ensure you're logged in
# and have created projects in each platform
```

---

## Step 1: NeonDB Setup

NeonDB provides a free PostgreSQL database with 3GB storage and branching features.

### 1.1 Create NeonDB Project

1. Go to [neon.tech](https://neon.tech) and sign up with GitHub
2. Click **"Create a new project"**
3. Configure:
   - **Project Name**: `financial-reporting-engine`
   - **Database Name**: `financial_reporting_engine`
   - **Postgres Version**: 16 (latest)
   - **Region**: Choose closest to your users
4. Click **"Create project"**

### 1.2 Get Database Connection String

1. On the NeonDB dashboard, click your project
2. In the top right, click **"Connection"** → **"Connection String"**
3. Copy the connection string (format: `postgresql://user:password@host/dbname`)
4. **IMPORTANT**: Add `?sslmode=require` to the end if not already present

Example:
```
postgresql://neonuser:abc123xyz@ep-tiny-river-12345.us-east-1.neon.tech/financial_reporting_engine?sslmode=require
```

### 1.3 Initialize Database Schema

NeonDB has two options for initialization:

**Option A: Using NeonDB Console (Recommended for first-time)**

1. In NeonDB dashboard, go to **SQL Editor**
2. Copy the contents of `scripts/init-neondb.sql`
3. Paste into the SQL editor
4. Click **"Execute"**
5. You should see output: `CREATE TABLE`, `CREATE INDEX`, etc.

**Option B: Using psql CLI (If you have it installed)**

```bash
# Install psql (PostgreSQL client) if needed
# macOS: brew install postgresql
# Windows: https://www.postgresql.org/download/windows/
# Linux: sudo apt-get install postgresql-client

# Run the initialization script
psql "postgresql://neonuser:password@host/financial_reporting_engine?sslmode=require" < scripts/init-neondb.sql
```

### 1.4 Verify Schema Creation

In NeonDB Console → SQL Editor, run:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- companies
- ledger_entries
- mapping_results
- report_runs
- reporting_periods
- trial_balances

---

## Step 2: Render Backend Deployment

Render provides free tier Node.js hosting with 0.5GB RAM, 0.5GB storage, auto-sleep after 15 min inactivity.

### 2.1 Create Render Web Service

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your GitHub repository: `Financial-Reporting-Engine`
4. Configure:
   - **Name**: `financial-reporting-engine-api`
   - **Environment**: `Node`
   - **Build Command**: 
     ```
     npm ci && npm run build:api || npm run build
     ```
   - **Start Command**: 
     ```
     npm start
     ```
   - **Plan**: Free
5. Click **"Create Web Service"**

### 2.2 Configure Environment Variables

While the service is deploying, add environment variables:

1. In Render dashboard → Your service → **Environment**
2. Add the following variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `4000` | Default port |
| `DATABASE_URL` | `postgresql://...` | Paste from NeonDB step 1.2 |
| `JWT_SECRET` | `<generate-strong-secret>` | Min 32 chars, use: `openssl rand -hex 32` |
| `WEB_ORIGIN` | `https://your-app.vercel.app` | Set after Vercel deployment |
| `STORAGE_DRIVER` | `postgresql` | Use DB for persistence |
| `LOG_LEVEL` | `info` | Use `debug` for troubleshooting |

**Generate JWT_SECRET**:
```bash
# macOS/Linux
openssl rand -hex 32

# Windows (PowerShell)
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 | ForEach-Object { [byte]$_ })))

# Or use online generator: https://generate-random.org/encryption-keys/base64
```

### 2.3 Wait for Deployment

Render will:
1. Clone your repository
2. Install dependencies (`npm ci`)
3. Build the app (`npm run build`)
4. Start the service (`npm start`)

Check the **Logs** tab to monitor deployment. Deployment typically takes 3-5 minutes.

### 2.4 Get Render Backend URL

After successful deployment:
1. In Render dashboard, find your service
2. Copy the **URL** at the top (format: `https://your-app.onrender.com`)
3. Save this for Step 3 and Step 4

### 2.5 Test Backend Health

```bash
# Test health endpoint (no auth required)
curl https://your-app.onrender.com/health

# Response should be:
# {"status":"ok","timestamp":"2024-01-15T10:30:45.123Z"}
```

If you get `404` or connection error:
- Service might still be deploying → wait 2-3 minutes
- Check **Logs** for error messages
- Verify `JWT_SECRET` is exactly 32+ characters (no spaces)

---

## Step 3: Vercel Frontend Deployment

Vercel is optimized for React/Vite with automatic deployments on push.

### 3.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find `Financial-Reporting-Engine` repository
4. Click **"Import"**
5. Configure:
   - **Project Name**: `financial-reporting-engine`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Add Environment Variables

1. In Vercel dashboard → Project → **Settings** → **Environment Variables**
2. Add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-app.onrender.com` |

**Note**: This should be your Render backend URL from Step 2.4

### 3.3 Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. You'll see a progress bar

Deployment typically takes 1-2 minutes.

### 3.4 Get Vercel Frontend URL

After deployment:
1. On success screen, copy the **Production URL** (format: `https://your-app.vercel.app`)
2. This is your application's public URL

### 3.5 Update Backend CORS

Now update Render with your Vercel URL:

1. Go to [render.com](https://render.com) → Your service
2. Go to **Environment** tab
3. Edit `WEB_ORIGIN` and set it to: `https://your-app.vercel.app`
4. Click **"Save"**
5. Service will redeploy automatically (~2 min)

---

## Step 4: Post-Deployment Configuration

### 4.1 Test Cross-Origin Requests

```bash
# Test frontend can reach backend
curl -X GET https://your-app.onrender.com/health \
  -H "Origin: https://your-app.vercel.app"

# Should return 200 with health status
```

### 4.2 Verify Database Connection

In your frontend, create a test company:

1. Go to `https://your-app.vercel.app`
2. Login with demo credentials
3. Create a new company
4. Verify in NeonDB:

```bash
# SSH into NeonDB or use SQL Editor in dashboard
psql "your-connection-string"

# Then run:
SELECT * FROM companies;

# Should show your newly created company
```

### 4.3 Enable Persistent Render Dyno (Prevent Cold Starts)

**Note**: The free tier will auto-sleep after 15 minutes of inactivity. To mitigate:

1. **Option A (Best for testing)**: Visit your app every 15 minutes to keep it warm
2. **Option B (Paid)**: Upgrade to Render's $7/month starter plan for always-on

For production, consider upgrading Render plan.

### 4.4 Set Up Render Auto-Deploy on Push

Render already has this enabled! Every push to `main` branch will auto-deploy.

To change deploy trigger:
1. Render dashboard → Your service → **Settings**
2. Under "Auto-Deploy", select branch for deployments (default: `main`)

---

## Step 5: Testing & Verification

### 5.1 Full Application Flow Test

```bash
# 1. Test landing page loads
curl https://your-app.vercel.app

# 2. Test backend health
curl https://your-app.onrender.com/health

# 3. Test database connection (from backend logs)
# Check Render → Logs for database connection messages

# 4. Login in browser and upload trial balance
# Verify file is processed (may take 30-60s on free tier)

# 5. Verify data in NeonDB
# Check `trial_balances` table has your upload
```

### 5.2 Test File Uploads

1. In frontend, create a company
2. Create a reporting period
3. Upload a trial balance Excel file
4. Check Render logs for processing

**Expected**: File uploads to `apps/api/storage/uploads/` on Render, processed into database

### 5.3 Test Report Generation

1. Map some unmapped entries (if any)
2. Click "Generate Report"
3. Verify report downloads
4. Check Render logs for no errors

---

## Free Tier Limitations & Workarounds

### NeonDB Free Tier Limits

| Limitation | Details | Workaround |
|-----------|---------|-----------|
| Storage | 3 GB | Monitor usage; archive old reports |
| Compute | 0.5 vCPU | Add connection pooling |
| Concurrent connections | 10 | Use PgBouncer (built-in on NeonDB) |
| Branches | Unlimited | Use for dev/staging |

**Connection String with pooling**:
```
postgresql://user:pass@ep-host/dbname?sslmode=require&pool=true
```

### Render Free Tier Limits

| Limitation | Details | Impact | Workaround |
|-----------|---------|--------|-----------|
| Auto-sleep | 15 min inactivity | Cold start (~30s) | Keep app warm with requests |
| Memory | 0.5 GB | Slower processing | N/A for current app size |
| Storage | 0.5 GB | Small uploads only | Use external storage (S3) if needed |
| Bandwidth | 100 GB/month | Plenty for testing | Monitor if scaling |

**Keep Render Warm** (add to your monitoring):
```bash
# Run every 14 minutes (cron job or script)
curl https://your-app.onrender.com/health
```

### Vercel Free Tier Limits

Vercel free tier has generous limits:
- **Deployments**: Unlimited
- **Bandwidth**: 100 GB/month
- **Domains**: Unlimited
- **Functions**: Yes (edge functions limited)

Generally no issues with current app size.

---

## Troubleshooting

### Issue: 404 Errors in Frontend When Calling API

**Symptoms**: Browser console shows `404 POST https://your-app.onrender.com/...`

**Causes & Solutions**:

1. **`WEB_ORIGIN` not updated in Render**
   - Update Render env var: `WEB_ORIGIN=https://your-app.vercel.app`
   - Redeploy Render service
   - Wait 2-3 minutes for new version

2. **Vercel still using old API URL**
   - Update `VITE_API_URL` in Vercel environment
   - Redeploy Vercel project
   - Clear browser cache (Ctrl+Shift+Delete)

3. **API endpoint path wrong**
   - Check frontend code for correct API paths
   - Verify backend routes in `apps/api/src/index.js`

### Issue: Database Connection Error on Render

**Symptoms**: Render logs show `ECONNREFUSED` or `ENOTFOUND`

**Causes & Solutions**:

1. **`DATABASE_URL` malformed**
   - Copy fresh from NeonDB dashboard
   - Ensure `?sslmode=require` is at the end
   - No extra spaces

2. **NeonDB project not initialized**
   - Verify schema exists: `SELECT * FROM companies;`
   - If empty, run `scripts/init-neondb.sql` again

3. **Connection limit reached**
   - NeonDB free: 10 concurrent connections max
   - Render might use multiple: check Render → Environment → add `PGBOUNCER_MIN_POOL_SIZE=0`

### Issue: File Upload Fails

**Symptoms**: Upload button doesn't respond, or file disappears

**Causes & Solutions**:

1. **File too large (>50MB)**
   - Free tier limit: 50 MB
   - Compress Excel file or split data

2. **Disk full on Render**
   - Render free: 0.5 GB storage
   - Check `apps/api/storage/` size
   - Delete old uploads if needed

3. **Permissions issue**
   - Ensure `apps/api/storage/` exists and is writable
   - Check logs: `npm run logs:api`

### Issue: Report Generation Hangs

**Symptoms**: Clicking "Generate Report" does nothing, or takes >5 minutes

**Causes & Solutions**:

1. **Render auto-sleep, causing cold start**
   - First request wakes up service (~30s)
   - Subsequent requests process normally
   - Keep service warm by visiting every 15 min

2. **Memory limit hit**
   - Free tier: 0.5 GB
   - Large trial balances (>100k rows) may exhaust memory
   - Reduce file size or upgrade Render plan

3. **Database query timeout**
   - NeonDB timeout: 5 minutes
   - Very large reports may exceed
   - Optimize queries or upgrade database

### Debug Mode

Enable verbose logging:

```bash
# For Render backend
# Update environment: LOG_LEVEL=debug
# Redeploy and check logs
```

```bash
# For frontend (development)
# Check browser console (F12 → Console tab)
# Look for API errors
```

---

## Monitoring & Maintenance

### Weekly Maintenance Checklist

- [ ] Check Render logs for errors
- [ ] Verify NeonDB storage usage (should be <2 GB)
- [ ] Test application end-to-end
- [ ] Monitor Vercel deployment status
- [ ] Check for updates to dependencies

### Useful Commands

```bash
# Check Render service status
curl https://your-app.onrender.com/health

# View recent Render logs (via dashboard)
# Render → Service → Logs tab

# Export data from NeonDB
psql "connection-string" -c "COPY (SELECT * FROM companies) TO STDOUT CSV;"

# Backup NeonDB (runs daily automatically)
# Check NeonDB dashboard → Backups tab
```

### Scaling Checklist (If Free Tier Limits Reached)

**When to upgrade**:
- NeonDB: Storage approaching 3 GB
- Render: Frequent memory errors in logs
- Vercel: Exceeding 100 GB bandwidth/month

**Recommended paid tiers**:
- **NeonDB Pro**: $19/month (unlimited compute, 50 GB storage)
- **Render**: $7-20/month (depending on plan)
- **Vercel**: Pro $20/month (but free tier should suffice)

---

## Next Steps

1. ✅ Complete all 5 deployment steps above
2. ✅ Run testing & verification suite
3. ✅ Share Vercel URL with users
4. 📊 Monitor application for first week
5. 🔒 Set up security monitoring (logs, alerts)
6. 📈 Plan scaling strategy if usage grows

---

## Quick Reference URLs

| Service | URL |
|---------|-----|
| Dashboard | https://dashboard.neon.tech |
| Database | `postgresql://...` (from NeonDB) |
| Backend | https://your-app.onrender.com |
| Frontend | https://your-app.vercel.app |
| GitHub | https://github.com/shivang-vakharia/Financial-Reporting-Engine |

---

## Support Resources

- **NeonDB Docs**: https://neon.tech/docs
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/16/

---

**Deployment complete!** 🚀 Your application is now live on production cloud infrastructure.
