# Render Backend Deployment Checklist

Quick step-by-step for backend provisioning and configuration.

## Prerequisites

- [ ] Completed NeonDB setup (have DATABASE_URL ready)
- [ ] GitHub account with access to `shivang-vakharia/Financial-Reporting-Engine`
- [ ] Generated JWT_SECRET (32+ chars): Saved securely

## Account & Service Creation

- [ ] Create Render account at https://render.com (GitHub auth recommended)
- [ ] Click "New +" → "Web Service"
- [ ] Connected GitHub repository: `Financial-Reporting-Engine`
- [ ] Configured service:
  - [ ] Name: `financial-reporting-engine-api`
  - [ ] Environment: Node
  - [ ] Build Command: `npm ci && npm run build:api || npm run build`
  - [ ] Start Command: `npm start`
  - [ ] Plan: Free (auto-sleep after 15 min)
- [ ] Service created (status shows in dashboard)

## Wait for Initial Deployment

- [ ] Deployment started (green progress indicator)
- [ ] Waited for build to complete (~3-5 minutes)
- [ ] Checked Logs tab:
  - [ ] No critical errors
  - [ ] Shows "Listening on port 4000"
  - [ ] Database connection successful

## Environment Variables Configuration

- [ ] Navigated to Service → Environment
- [ ] Added all required variables:
  - [ ] `NODE_ENV` = `production`
  - [ ] `PORT` = `4000`
  - [ ] `DATABASE_URL` = (paste from NeonDB)
  - [ ] `JWT_SECRET` = (your 32-char secret)
  - [ ] `WEB_ORIGIN` = `http://localhost:3000` (temporary, will update later)
  - [ ] `STORAGE_DRIVER` = `postgresql`
  - [ ] `LOG_LEVEL` = `info`
- [ ] Clicked "Save" (triggers redeployment)
- [ ] Waited for redeployment to complete (~2 minutes)

## Get Render URL

- [ ] Deployment successful (status: "Live")
- [ ] Copied service URL: (format: `https://your-app.onrender.com`)
- [ ] Saved URL for Vercel configuration

## Verify Deployment

- [ ] Tested health endpoint: `curl https://your-app.onrender.com/health`
- [ ] Response: `{"status":"ok","timestamp":"..."}`
- [ ] Service is responding to requests
- [ ] Checked logs for any errors

## Database Connection Verification

- [ ] Logs show: "Database connected successfully" or similar
- [ ] If error:
  - [ ] DATABASE_URL is correct (check for typos)
  - [ ] SSL mode is correct (`?sslmode=require`)
  - [ ] NeonDB schema is initialized

## Configure Auto-Deploy

- [ ] Navigated to Service → Settings
- [ ] Under "Auto-Deploy", verified branch is `main`
- [ ] Every push to `main` will trigger automatic redeployment

## Save Configuration

- [ ] Render service URL saved (needed for Vercel)
- [ ] Environment variables documented safely
- [ ] Database connection tested

---

**Next**: Follow Vercel Frontend Deployment checklist
