# Cloud Deployment Quick Start (5-10 minutes overview)

**For detailed steps, see**: `VERCEL-RENDER-NEONDB-DEPLOYMENT.md`

## What You're Deploying

| Component | Platform | Cost | Status |
|-----------|----------|------|--------|
| Frontend (React) | Vercel | Free | ✅ |
| Backend (Node.js) | Render | Free | ✅ |
| Database (PostgreSQL) | NeonDB | Free | ✅ |

## Three Services to Deploy

### 1️⃣ NeonDB (Database) - 5 minutes

```bash
# 1. Go to https://neon.tech → Sign up
# 2. Create project "financial-reporting-engine"
# 3. Get CONNECTION STRING

# 4. Initialize schema
# - Open NeonDB SQL Editor in dashboard
# - Copy & paste contents of scripts/init-neondb.sql
# - Run it

# 5. Save DATABASE_URL for next step
```

### 2️⃣ Render (Backend) - 5 minutes

```bash
# 1. Go to https://render.com → Sign up
# 2. Click "New +" → "Web Service"
# 3. Choose repo: Financial-Reporting-Engine
# 4. Configure:
#    - Build: npm ci && npm run build:api || npm run build
#    - Start: npm start

# 5. Add Environment Variables:
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...  # from NeonDB
JWT_SECRET=your-secret-32-chars
WEB_ORIGIN=http://localhost:3000  # Will update later
STORAGE_DRIVER=postgresql
LOG_LEVEL=info

# 6. Deploy (auto starts)
# 7. Get RENDER_URL from dashboard (https://your-app.onrender.com)
```

### 3️⃣ Vercel (Frontend) - 5 minutes

```bash
# 1. Go to https://vercel.com → Sign up
# 2. Click "Add New" → "Project"
# 3. Choose repo: Financial-Reporting-Engine
# 4. Configure:
#    - Framework: Vite
#    - Root: apps/web
#    - Build: npm run build
#    - Output: dist

# 5. Add Environment Variables:
VITE_API_URL=https://your-app.onrender.com  # from Render

# 6. Deploy (auto starts)
# 7. Get VERCEL_URL from dashboard (https://your-app.vercel.app)
```

### 4️⃣ Link Services Together - 2 minutes

```bash
# Update Render with Vercel URL:
# 1. Render dashboard → Your service → Environment
# 2. Change WEB_ORIGIN=http://localhost:3000
#    to    WEB_ORIGIN=https://your-app.vercel.app
# 3. Save (auto redeploys)

# Done! ✅
```

## Verify It Works

```bash
# Test health
curl https://your-app.onrender.com/health

# Open in browser
# https://your-app.vercel.app
```

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Frontend shows 404 errors | Update `VITE_API_URL` in Vercel, redeploy |
| API shows 404 | Update `WEB_ORIGIN` in Render, redeploy |
| Database connection fails | Check `DATABASE_URL` in Render (typos, ssl mode) |
| Service won't start | Check Render logs, verify JWT_SECRET is 32+ chars |
| Cold start on Render | Free tier sleeps after 15 min, takes 30s to wake |

## Free Tier Limits

- **NeonDB**: 3 GB storage, 10 concurrent connections
- **Render**: 0.5 GB RAM, 0.5 GB storage, auto-sleeps after 15 min inactivity
- **Vercel**: 100 GB bandwidth/month (very generous)

## Maintenance

```bash
# Monitor these:
curl https://your-app.onrender.com/health  # Keep backend warm
# Check NeonDB storage usage
# Monitor error logs on Render
```

## Emergency Contacts

- **NeonDB support**: https://neon.tech/docs
- **Render support**: https://render.com/docs
- **Vercel support**: https://vercel.com/docs

---

**Total deployment time**: ~20 minutes
**Monthly cost**: $0 (with free tier limits)

For detailed instructions, see `VERCEL-RENDER-NEONDB-DEPLOYMENT.md`
