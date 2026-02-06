# Fix Google Calendar OAuth Error 400: redirect_uri_mismatch

## The Problem

You're getting `Error 400: redirect_uri_mismatch` because the redirect URI your app is using doesn't match what's configured in Google Cloud Console.

## Where the Redirect URI is Built

In your code (`backend/routers/calendar.py`), the redirect URI is:

```python
redirect_uri = f"{backend_url}{settings.API_PREFIX}/calendar/callback"
```

Example values:

- **Production**: `https://rushigo-backend-517835372372.us-central1.run.app/api/calendar/callback`
- **Local**: `http://localhost:8000/api/calendar/callback`

## Fix Steps

### Step 1: Check Your Current BACKEND_URL

Run this command to see what redirect URI your app is using:

```bash
# Check your production deployment
curl https://rushigo-backend-517835372372.us-central1.run.app/api/calendar/debug-env

# Or check locally
curl http://localhost:8000/api/calendar/debug-env
```

This will show you:

- The redirect URI being used
- Whether Google credentials are configured
- Backend and Frontend URLs

### Step 2: Go to Google Cloud Console

1. **Visit**: https://console.cloud.google.com/
2. **Select your project** (the one with your OAuth credentials)
3. **Go to**: APIs & Services > Credentials
4. **Click on** your OAuth 2.0 Client ID (the one you're using)

### Step 3: Add the Redirect URI

In the "Authorized redirect URIs" section, you need to add:

#### For Production (Google Cloud Run):

```
https://rushigo-backend-517835372372.us-central1.run.app/api/calendar/callback
```

#### For Local Development:

```
http://localhost:8000/api/calendar/callback
```

**Important**: You can have BOTH configured at the same time. Just click "Add URI" for each one.

### Step 4: Save Changes

1. Click **"SAVE"** at the bottom of the page
2. **Wait 5-10 minutes** for changes to propagate through Google's systems

### Step 5: Verify Your Environment Variables

Make sure these are set correctly in your production environment:

```bash
# Production (Google Cloud Run / Render / etc.)
BACKEND_URL=https://rushigo-backend-517835372372.us-central1.run.app
FRONTEND_URL=https://your-frontend-url.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

To set these in Google Cloud Run:

```bash
gcloud run services update rushigo-backend \
  --update-env-vars BACKEND_URL=https://rushigo-backend-517835372372.us-central1.run.app,FRONTEND_URL=https://your-frontend-url.com \
  --region us-central1
```

### Step 6: Test Again

1. **Clear your browser cache** or use Incognito mode
2. Try connecting your calendar again
3. The OAuth flow should work now

## Common Issues

### Issue 1: Still Getting the Error After Adding URI

**Solution**: Wait 5-10 minutes for Google's changes to propagate, then try in Incognito mode.

### Issue 2: Multiple Redirect URIs Needed

If you have multiple environments (dev, staging, production), add ALL of them:

```
http://localhost:8000/api/calendar/callback
https://staging.yourapp.com/api/calendar/callback
https://rushigo-backend-517835372372.us-central1.run.app/api/calendar/callback
```

### Issue 3: Wrong Client ID/Secret

Make sure you're using the **same** OAuth Client ID for both Gmail and Calendar APIs. You don't need separate ones.

### Issue 4: Authorized JavaScript Origins

You might also need to add Authorized JavaScript Origins:

```
https://rushigo-backend-517835372372.us-central1.run.app
http://localhost:8000
```

## Quick Check Script

Save this as `test_calendar_oauth.sh`:

```bash
#!/bin/bash

echo "=== Calendar OAuth Configuration Check ==="
echo ""

# Check local
echo "LOCAL BACKEND:"
curl -s http://localhost:8000/api/calendar/debug-env | jq '.'
echo ""

# Check production
echo "PRODUCTION BACKEND:"
curl -s https://rushigo-backend-517835372372.us-central1.run.app/api/calendar/debug-env | jq '.'
echo ""

echo "=== Next Steps ==="
echo "1. Copy the redirect_uri shown above"
echo "2. Add it to Google Cloud Console > APIs & Services > Credentials"
echo "3. Add to 'Authorized redirect URIs' section"
echo "4. Save and wait 5-10 minutes"
echo "5. Try calendar connection again"
```

Run it:

```bash
chmod +x test_calendar_oauth.sh
./test_calendar_oauth.sh
```

## Expected Configuration in Google Cloud Console

### Authorized Redirect URIs:

- ✅ `https://rushigo-backend-517835372372.us-central1.run.app/api/calendar/callback`
- ✅ `http://localhost:8000/api/calendar/callback`

### Authorized JavaScript Origins:

- ✅ `https://rushigo-backend-517835372372.us-central1.run.app`
- ✅ `http://localhost:8000`

### Application Type:

- ✅ Should be "Web application"

## Still Not Working?

If you're still getting the error:

1. **Check the exact error message** - Copy the full error URL
2. **Compare URIs carefully** - They must match EXACTLY (https vs http, trailing slashes, etc.)
3. **Check for typos** in environment variables
4. **Verify the OAuth client** - Make sure you're editing the correct OAuth Client ID
5. **Check browser console** - Look for additional error messages

Run this to see the exact redirect URI being used:

```bash
# Get your access token first
TOKEN="your-access-token-here"

# Test the connect endpoint
curl -H "Authorization: Bearer $TOKEN" \
  -v \
  http://localhost:8000/api/calendar/connect \
  2>&1 | grep "redirect_uri"
```

The output will show the exact redirect_uri parameter being sent to Google.
