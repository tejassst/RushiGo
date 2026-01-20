# OAuth Debugging Checklist

## Issue: Calendar Connect Still Shows Black Page

### Step 1: Check Render Environment Variables

Go to **Render Dashboard** → Your Backend Service → **Environment** tab

Verify these are set:

```
✅ BACKEND_URL = https://rushigo-backend.onrender.com
✅ FRONTEND_URL = https://rushigo.netlify.app (or your actual frontend URL)
✅ GOOGLE_CLIENT_ID = 517835372372-xxxxx.apps.googleusercontent.com
✅ GOOGLE_CLIENT_SECRET = GOCSPX-xxxxx
```

**Important:**
- `BACKEND_URL` should NOT have `/api` at the end
- Should be exactly: `https://rushigo-backend.onrender.com`

### Step 2: Check Render Deployment Status

1. Go to **Render Dashboard** → Your Service → **Events** tab
2. Look for recent "Deploy succeeded" message
3. Check the commit SHA matches your latest push: `88be638` or `927bb30`
4. If deployment is still in progress, wait for it to complete

### Step 3: Check Backend Logs

1. Go to **Render Dashboard** → Your Service → **Logs** tab
2. Click "Connect Google Calendar" on your site
3. Watch logs for:
   ```
   INFO: Generated OAuth URL for user X, redirect_uri: https://rushigo-backend.onrender.com/api/calendar/callback
   ```
4. Look for any errors like:
   - `Failed to initiate OAuth`
   - `KeyError: 'GOOGLE_CLIENT_ID'`
   - `redirect_uri_mismatch`

### Step 4: Check Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, verify you have:
   ```
   https://rushigo-backend.onrender.com/api/calendar/callback
   ```
4. If missing, add it and click **Save**

### Step 5: Test Locally

Let's verify the code works locally first:

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend

# Set environment variables for local testing
export BACKEND_URL="http://localhost:8000"
export FRONTEND_URL="http://localhost:5174"
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"

# Start backend
.venv/bin/python3 -m uvicorn main:app --reload
```

Then in another terminal:
```bash
cd /home/tejast/Documents/Projects/rushiGo/frontend
npm run dev
```

Try the OAuth flow locally. If it works locally but not in production, it's an environment variable issue.

### Step 6: Manual API Test

Test the backend directly:

1. Get your auth token from browser localStorage
2. Run this curl command (replace TOKEN):

```bash
curl -X GET "https://rushigo-backend.onrender.com/api/calendar/connect" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -v
```

**Expected response:**
- Should return HTTP 307 redirect
- Location header should be: `https://accounts.google.com/o/oauth2/auth?...`

**If you see:**
- JSON response: Backend not using latest code
- 500 error: Environment variables missing
- 401 error: Token invalid/expired

### Step 7: Check Frontend API URL

Open browser console on your frontend:

```javascript
// Check what URL the frontend is using
console.log(import.meta.env.VITE_API_URL);
```

Should be: `https://rushigo-backend.onrender.com/api`

If it's wrong, update your Netlify environment variable:
```
VITE_API_URL = https://rushigo-backend.onrender.com/api
```

### Step 8: Common Issues & Solutions

#### Issue: "Black page with 'not authenticated'"
**Cause:** Backend can't create OAuth flow
**Solution:** Check `BACKEND_URL` and Google credentials in Render

#### Issue: "redirect_uri_mismatch error"
**Cause:** Google Cloud redirect URI doesn't match code
**Solution:** Add exact URI to Google Cloud Console

#### Issue: Backend logs show "KeyError: 'GOOGLE_CLIENT_ID'"
**Cause:** Environment variable not set
**Solution:** Add in Render environment variables

#### Issue: "Module 'google_auth_oauthlib' not found"
**Cause:** Dependencies not installed
**Solution:** Check `requirements.txt` includes `google-auth-oauthlib`

#### Issue: Still redirects to old broken URL
**Cause:** Browser cache or deployment not complete
**Solution:** 
1. Hard refresh (Ctrl+Shift+R)
2. Try incognito mode
3. Wait for Render deployment to complete

### Step 9: Nuclear Option - Force Redeploy

If Render deployment seems stuck:

1. Go to Render Dashboard → Your Service
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment to complete
4. Try OAuth flow again

### Step 10: Verify Database Migration

The backend needs the new columns. Check if migration ran:

```bash
# SSH into Render (if possible) or check logs for:
# "Added column: calendar_token"
# "Added column: calendar_refresh_token"  
# "Added column: calendar_token_expiry"
```

If migration didn't run, it might fail silently. Check Render logs during deployment.

## Quick Debug Commands

```bash
# Check if backend is using new code
curl https://rushigo-backend.onrender.com/api/calendar/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return: {"connected": false, "sync_enabled": false, ...}
# If returns different format, old code is still running
```

## What Should Happen (Working Flow)

1. User clicks "Connect Google Calendar"
2. Frontend opens popup to: `https://rushigo-backend.onrender.com/api/calendar/connect`
3. Backend logs: `Generated OAuth URL for user X`
4. Backend returns 307 redirect to Google
5. Google shows consent screen
6. User clicks "Allow"
7. Google redirects to: `https://rushigo-backend.onrender.com/api/calendar/callback?code=...&state=USER_ID`
8. Backend exchanges code for tokens
9. Backend stores in database
10. Backend redirects to: `https://your-frontend.netlify.app/?calendar_connected=true`
11. Frontend popup closes
12. Frontend shows "Connected ✓"

## If Still Broken

Share these with me:
1. Screenshot of black page
2. Render logs when clicking connect button
3. Screenshot of Render environment variables (blur secrets)
4. Screenshot of Google Cloud redirect URIs
5. Browser console errors (F12 → Console tab)

Then we can debug further!
