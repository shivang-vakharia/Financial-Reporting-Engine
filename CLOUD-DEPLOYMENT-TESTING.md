# Cloud Deployment Testing Guide

After deploying to Vercel + Render + NeonDB, use this guide to verify everything works correctly.

**Estimated Testing Time**: 30-45 minutes

---

## Pre-Testing Setup

### Gather Information

Before testing, collect these URLs:

- [ ] Vercel Frontend URL: `https://your-app.vercel.app`
- [ ] Render Backend URL: `https://your-app.onrender.com`
- [ ] NeonDB Connection String: (saved from setup)
- [ ] Test Account Credentials: (or create a test user)

### Browser Setup

```bash
# Open browser with 3 tabs:
Tab 1: Vercel frontend (https://your-app.vercel.app)
Tab 2: Render logs (https://dashboard.render.com/web/your-service/logs)
Tab 3: NeonDB console (https://console.neon.tech) for SQL queries
```

---

## Test Suite 1: Service Availability

### 1.1 Verify Backend Health

```bash
# Terminal
curl -i https://your-app.onrender.com/health

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: application/json
# {"status":"ok","timestamp":"2024-01-15T10:30:45.123Z"}
```

**Pass Criteria**: ✅ Returns 200 OK with status: "ok"

**If Fails** (common causes):
- Render service still deploying → wait 2-3 minutes
- Render service asleep (free tier) → takes 30s to wake → retry
- Database connection error → check NeonDB credentials in Render env

### 1.2 Verify Frontend Loads

```bash
# Browser: Tab 1
# Navigate to: https://your-app.vercel.app
# (or just open that URL)

# Expected:
# - Landing page loads immediately
# - No 404 errors
# - "Login" and "Signup" buttons visible
# - Page is styled (colors, layout correct)
```

**Pass Criteria**: ✅ Landing page fully renders, buttons interactive

**If Fails** (common causes):
- Vercel still deploying → wait 1-2 minutes → refresh
- Browser cache → Ctrl+Shift+Delete (clear cache) → refresh
- JavaScript errors → F12 → Console tab → check for red errors

### 1.3 Check Browser Console for Errors

```bash
# Browser: Tab 1 (frontend)
# Press: F12
# Click: Console tab
# Look for:
# - RED ERROR messages (bad - investigate)
# - Yellow WARN messages (usually ok)
# - All other messages (informational)

# Filter out noise:
# - Ignore: "Failed to load resource" for .map files
# - Ignore: Extensions warnings
# - Look for: API endpoint errors (404, CORS, etc.)
```

**Pass Criteria**: ✅ No red error messages related to API or auth

**If Fails**:
- See specific error message in console
- CORS errors → verify `WEB_ORIGIN` in Render
- 404 errors → verify `VITE_API_URL` in Vercel

---

## Test Suite 2: Authentication Flow

### 2.1 Attempt Login (Should Fail with Bad Credentials)

```bash
# Browser: Tab 1
# Click: "Login" button
# In modal, enter:
#   Email: test@example.com
#   Password: wrongpassword
# Click: "Sign In"

# Expected:
# - API call made to: https://your-app.onrender.com/auth/login
# - Response: 401 Unauthorized
# - Modal shows: "Invalid credentials" (or similar error)
# - No page reload
```

**Pass Criteria**: ✅ Auth endpoint reachable, returns 401 on bad password

**If Fails**:
- Browser console shows 404 → `VITE_API_URL` wrong
- Browser console shows CORS error → `WEB_ORIGIN` wrong
- Render logs show error → check database connection

### 2.2 Create Demo Company (Optional)

If you have valid test credentials:

```bash
# Browser: Tab 1
# If logged in, go to: Companies section
# Click: "Add Company"
# Enter: "Test Company - [timestamp]"
# Click: Create

# Check:
# - Company appears in list
# - Render logs show: no errors
# - NeonDB SQL shows company in table
```

**Pass Criteria**: ✅ Company created and visible

### 2.3 Check NeonDB for User Data

```bash
# Browser: Tab 3 (NeonDB console)
# Click: "SQL Editor"
# Run: SELECT * FROM companies LIMIT 5;

# Expected: 
# - If no companies: that's ok (empty database)
# - If companies appear: means database working
# - If error: database not initialized
```

**Pass Criteria**: ✅ Query runs successfully (even if empty)

---

## Test Suite 3: File Upload & Processing

### 3.1 Prepare Test File

```bash
# You should have test files in: samples/
# Pick one: sample-fy-2024-25-standalone-*.xlsx

# Or create new trial balance with:
# - 10-20 ledger accounts
# - Typical GL account names (Cash, AR, AP, etc.)
# - Debit/credit balances that balance
```

### 3.2 Upload Trial Balance

```bash
# Browser: Tab 1
# Ensure logged in
# Go to: Company → Reporting Periods
# Create period if needed
# Click: "Upload Trial Balance"
# Select file: sample Excel
# Click: Upload

# Expected:
# - File processes (may take 10-30s on free tier)
# - Progress indicator shows processing
# - After completion: Summary shows mapping results
# - Unmapped entries listed (if any)
```

**Pass Criteria**: ✅ File uploads and processes without error

**If Fails**:
- Browser console shows error → check Render logs
- Upload hangs >1 minute → Render may be cold-starting (normal, wait)
- File size error → file >50MB (free tier limit)
- Database error → check NeonDB connection

### 3.3 Verify Data in NeonDB

```bash
# Browser: Tab 3 (NeonDB)
# Run: SELECT COUNT(*) FROM ledger_entries;

# Expected:
# - count = number of rows in Excel (e.g., 20)
# - If 0: upload didn't process → check logs

# Run: SELECT * FROM mapping_results LIMIT 5;
# Expected:
# - Shows mapped/unmapped status
# - confidence_score shows mapping quality
```

**Pass Criteria**: ✅ Ledger entries and mapping results in database

---

## Test Suite 4: Report Generation

### 4.1 Map Unmapped Entries (If Any)

```bash
# Browser: Tab 1
# In app: Check for unmapped entries
# If found:
# - Click dropdown for first unmapped entry
# - Select a mapping category
# - Click: Save

# Expected:
# - Entry mapped without page refresh
# - Dropdown updates to show selection
# - Render logs show: mapping update success
```

**Pass Criteria**: ✅ Mapping updates work

### 4.2 Generate Report

```bash
# Browser: Tab 1
# Click: "Generate Report"
# Wait for processing (30 seconds to 2 minutes, depending on data size)

# Expected:
# - Progress shows
# - Report downloads automatically (check browser Downloads folder)
# - File name: something like "report-[date].xlsx"
# - File size: >100 KB

# Check file:
# - Can open in Excel
# - Contains financial statements
# - Data matches trial balance
```

**Pass Criteria**: ✅ Report generates and downloads

**If Fails**:
- Takes >5 minutes → Render cold-starting (normal) or database slow
- Error after 30 seconds → check Render logs for timeout
- File won't download → check browser download permissions
- File corrupted → might be API error → check logs

### 4.3 Verify Report Quality

```bash
# Desktop: Open downloaded report in Excel

# Check sheets (should have):
[ ] Financial Results
[ ] Assets and Liabilities
[ ] Cash Flow
[ ] Changes in Equity
[ ] Notes
[ ] XBRL Mapping
[ ] Unmapped Ledgers (if any)

# Verify data:
[ ] Trial balance totals match uploaded file
[ ] All accounts are mapped to appropriate categories
[ ] Comparative periods (if provided) show correctly
[ ] Numbers are accurate (no corruption)
```

**Pass Criteria**: ✅ Report contains all expected sheets with correct data

---

## Test Suite 5: Data Persistence

### 5.1 Logout & Login

```bash
# Browser: Tab 1
# Click: Settings
# Click: Logout

# Expected:
# - Taken back to login page
# - Session cleared

# Login again with same credentials
# Expected:
# - Company list still shows
# - Report history still visible
# - All data persisted
```

**Pass Criteria**: ✅ Data persists across login sessions

### 5.2 Hard Refresh

```bash
# Browser: Tab 1
# Press: Ctrl+Shift+R (hard refresh, clear cache)
# Wait for page to reload

# Expected:
# - Page still works
# - If logged in before: session maintained (or re-login)
# - All company/report data still accessible
```

**Pass Criteria**: ✅ Cache cleared, app still functional

---

## Test Suite 6: Performance & Load Testing

### 6.1 Backend Response Time

```bash
# Terminal
# Run 5 times (log response times):
time curl https://your-app.onrender.com/health

# Expected:
# First request: 0.5-1.5 seconds (cold start if Render sleeping)
# Subsequent requests: 0.1-0.3 seconds (normal)

# If consistently >1 second:
# - Render tier upgrade might help
# - Or database query optimization needed
```

**Pass Criteria**: ✅ First request <2s, subsequent <0.5s

### 6.2 File Upload Performance

```bash
# Browser: Developer Tools (F12)
# Network tab (watch timing as you upload)

# Upload medium-sized trial balance (50+ accounts)
# Watch request timeline

# Expected:
# - Request sent: 1-2 seconds
# - Processing: 10-30 seconds (depends on file size)
# - Total: <60 seconds

# If >60 seconds:
# - Render may be underpowered
# - Or database needs optimization
# - Free tier limitation
```

**Pass Criteria**: ✅ Upload + processing <60 seconds

---

## Test Suite 7: Database Scaling

### 7.1 Check Storage Usage

```bash
# Browser: Tab 3 (NeonDB dashboard)
# Click: Project → Storage

# Expected:
# Usage: <100 MB for test data
# Database size healthy: <1 GB (free tier: 3 GB max)

# If approaching limits:
# - Archive old reports
# - Clean up test data: DELETE FROM trial_balances WHERE ...;
# - Monitor growth
```

**Pass Criteria**: ✅ Storage <1 GB

### 7.2 Check Connection Pool

```bash
# Browser: Tab 3 (NeonDB)
# Click: Project → Connection Pool

# Expected:
# Active connections: <5 (free tier: 10 max)
# No errors in pool status

# If errors:
# - May need to add pooling config
# - Render + frontend might need optimization
```

**Pass Criteria**: ✅ Connections stable, <10 active

---

## Test Suite 8: Error Handling

### 8.1 Test with Invalid File

```bash
# Browser: Tab 1
# Try uploading non-Excel file (.txt, .pdf, etc.)

# Expected:
# - File rejected immediately
# - Error message: "Only Excel files are supported"
# - No backend error, graceful handling
```

**Pass Criteria**: ✅ Invalid file rejected gracefully

### 8.2 Test Large File

```bash
# Create or find Excel file >50 MB
# Try uploading

# Expected:
# - File rejected or upload fails
# - Error message: "File size limit exceeded"
# - No server crash
```

**Pass Criteria**: ✅ Large file handled gracefully

### 8.3 Test Network Disconnection

```bash
# Browser: Tab 1
# Open DevTools (F12) → Network tab
# Set throttling to: "Offline"
# Try clicking an action (login, generate report, etc.)

# Expected:
# - Request fails gracefully
# - User sees loading spinner or timeout message
# - No white screen or crash

# Re-enable network
# Action completes
```

**Pass Criteria**: ✅ Offline handling works

---

## Test Suite 9: Cross-Platform Testing (Optional)

### 9.1 Mobile Browser

```bash
# Visit on mobile phone:
https://your-app.vercel.app

# Expected:
# - Page responsive (not just zoomed out)
# - Buttons clickable without zooming
# - Layout adjusts to mobile width
# - All features work (upload, generate, etc.)
```

**Pass Criteria**: ✅ Mobile version responsive

### 9.2 Different Browser

```bash
# Test in Chrome, Firefox, Safari, Edge
# Expected:
# - All browsers work identically
# - No console errors
# - Styling consistent
```

**Pass Criteria**: ✅ Cross-browser compatible

---

## Final Verification Checklist

- [ ] Backend health endpoint responds (200 OK)
- [ ] Frontend landing page loads
- [ ] Auth modal works (login attempt)
- [ ] File upload processes successfully
- [ ] Report generates and downloads
- [ ] Data persists in NeonDB
- [ ] Performance acceptable (<60s total workflows)
- [ ] Error handling graceful
- [ ] CORS working between Vercel & Render
- [ ] Database schema complete

---

## Performance Baseline

Document these metrics for future comparison:

```
Landing page load: ___ ms
API health check: ___ ms
File upload (50 accounts): ___ seconds
Report generation: ___ seconds
Database query response: ___ ms
Total workflow (login → upload → report): ___ seconds
```

---

## Troubleshooting Reference

| Symptom | Quick Fix |
|---------|-----------|
| 404 errors from frontend | Update `VITE_API_URL` in Vercel, redeploy |
| CORS errors | Update `WEB_ORIGIN` in Render, redeploy |
| Database errors | Verify `DATABASE_URL` in Render (check SSL mode) |
| Slow uploads | Render free tier cold-starting; wait 30s |
| File won't download | Clear browser cache, retry |
| Company data missing | Check NeonDB initialization (run init-neondb.sql) |
| Service won't start | Check Render logs for startup errors |

---

## Post-Testing Actions

1. **Document Results**: Keep this checklist for future reference
2. **Share URL**: Provide users with `https://your-app.vercel.app`
3. **Set Up Monitoring**: 
   - Check Render logs weekly
   - Monitor NeonDB storage growth
4. **Plan Maintenance**: 
   - Keep backend warm (keep-alive pings every 15 min)
   - Archive reports monthly
   - Update dependencies quarterly

---

## Next Steps

✅ **All tests passed?**
- Notify stakeholders of successful deployment
- Plan next sprint improvements
- Set up monitoring alerts

❌ **Tests failed?**
- Review troubleshooting section
- Check platform documentation
- Review Render/NeonDB/Vercel logs
- Consider upgrading from free tier

---

**Total Testing Time**: 30-45 minutes
**Complexity**: Medium (some manual verification required)
**Frequency**: After each deployment

Good luck! 🚀
