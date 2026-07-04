# Vercel Frontend Deployment Checklist

Quick step-by-step for frontend provisioning and configuration.

## Prerequisites

- [ ] Completed NeonDB setup
- [ ] Completed Render backend deployment (have Render URL ready)
- [ ] GitHub account with access to `shivang-vakharia/Financial-Reporting-Engine`

## Account & Project Creation

- [ ] Create Vercel account at https://vercel.com (GitHub auth recommended)
- [ ] Click "Add New..." → "Project"
- [ ] Selected repository: `Financial-Reporting-Engine`
- [ ] Clicked "Import"

## Project Configuration

- [ ] Project Name: `financial-reporting-engine`
- [ ] Framework Preset: `Vite`
- [ ] Root Directory: `apps/web`
- [ ] Build Command: `npm run build` (should be auto-detected)
- [ ] Output Directory: `dist` (should be auto-detected)
- [ ] Install Command: `npm ci` (should be auto-detected)
- [ ] Environment: Production
- [ ] Clicked "Deploy"

## Wait for Initial Deployment

- [ ] Deployment started (progress bar showing)
- [ ] Waited for build to complete (~1-2 minutes)
- [ ] Checked build logs:
  - [ ] No critical errors
  - [ ] Build completed successfully
  - [ ] Shows "Production deployment ready"

## Get Vercel URL

- [ ] Deployment successful (status: "Ready")
- [ ] Copied Production URL: (format: `https://your-app.vercel.app`)
- [ ] Saved URL for later reference

## Add Environment Variables

- [ ] Navigated to Project → Settings → Environment Variables
- [ ] Added `VITE_API_URL`:
  - [ ] Key: `VITE_API_URL`
  - [ ] Value: (Render URL from previous checklist, e.g., `https://your-app.onrender.com`)
  - [ ] Environments: Production, Preview, Development
- [ ] Clicked "Save"

## Trigger Redeployment with Env Vars

- [ ] Navigated to Deployments tab
- [ ] Clicked "Redeploy" on the current deployment
- [ ] Selected "Use existing code"
- [ ] Clicked "Redeploy"
- [ ] Waited for redeployment (~1-2 minutes)

## Verify Frontend Loads

- [ ] Opened Production URL in browser: `https://your-app.vercel.app`
- [ ] Landing page loads successfully
- [ ] No console errors (F12 → Console tab)
- [ ] Can click "Login" button without errors

## Test Backend Connectivity

- [ ] Clicked "Login" button
- [ ] Attempted to login (any credentials to test connectivity)
- [ ] Check browser console (F12) for API call errors:
  - [ ] Should see: `POST https://your-app.onrender.com/...`
  - [ ] If 404: Update `VITE_API_URL` and redeploy
  - [ ] If CORS error: Update `WEB_ORIGIN` on Render

## Update Render with Vercel URL

- [ ] Went to Render dashboard → Your service
- [ ] Navigated to Environment tab
- [ ] Updated `WEB_ORIGIN`:
  - [ ] Old value: `http://localhost:3000`
  - [ ] New value: (your Vercel URL, e.g., `https://your-app.vercel.app`)
- [ ] Clicked "Save" (triggers redeployment)
- [ ] Waited for Render redeployment (~2 minutes)

## Final CORS Test

- [ ] Clicked login again in Vercel app
- [ ] Check browser console:
  - [ ] No more 404 or CORS errors
  - [ ] API requests should go through
- [ ] Try actual login with test credentials
- [ ] If successful, CORS is configured correctly

## Configure Auto-Deploy

- [ ] Navigated to Project → Settings → Git
- [ ] Verified "Deploy on push" is enabled
- [ ] Every push to `main` branch will trigger redeployment automatically

## Save Configuration

- [ ] Vercel URL saved: `https://your-app.vercel.app`
- [ ] Render backend URL confirmed working
- [ ] Environment variables documented

---

**Next**: Run full end-to-end testing
