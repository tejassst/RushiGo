# Switch to reminder.rushigo@gmail.com for Email Notifications

This guide will help you switch from your personal Gmail to `reminder.rushigo@gmail.com` as the dedicated email sender for all RushiGo notifications.

## 🎯 Architecture Overview

**Current Setup (What we'll change):**

- Your personal Gmail account sends emails
- Browser pop-up for OAuth authentication
- Token stored locally

**New Setup (Service Account Pattern):**

- `reminder.rushigo@gmail.com` sends ALL notifications to ALL users
- Users receive emails but don't need to authenticate
- One-time OAuth setup for the service account
- Users can opt-in/out through RushiGo settings (no Google OAuth needed)

## 📋 Prerequisites

- Access to `reminder.rushigo@gmail.com` Gmail account
- Access to Google Cloud Console
- Admin access to the Gmail account

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Sign in with reminder.rushigo@gmail.com**
3. Click **"Select a project"** → **"New Project"**
4. Project name: `RushiGo Notifications`
5. Click **"Create"**

### Step 2: Enable Gmail API

1. In the Google Cloud Console, select your project
2. Go to **"APIs & Services"** → **"Library"**
3. Search for **"Gmail API"**
4. Click **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type
3. Fill in the form:
   - **App name:** RushiGo Notifications
   - **User support email:** reminder.rushigo@gmail.com
   - **Developer contact email:** reminder.rushigo@gmail.com
4. Click **"Save and Continue"**
5. **Scopes:** Skip this for now (click "Save and Continue")
6. **Test users:** Add `reminder.rushigo@gmail.com` as a test user
7. Click **"Save and Continue"**

### Step 4: Create OAuth2 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Desktop app"**
4. Name: **"RushiGo Backend Service"**
5. Click **"Create"**
6. Click **"Download JSON"** (this is your credentials.json)

### Step 5: Set Up in RushiGo Backend

1. **Replace the credentials file:**

   ```bash
   # Backup old credentials (optional)
   mv backend/credentials.json backend/credentials.json.backup

   # Copy the new credentials.json you just downloaded
   # Move it to: backend/credentials.json
   ```

2. **Delete old token:**

   ```bash
   rm backend/token.json
   ```

3. **Update .env file:**
   ```bash
   # In backend/.env
   FROM_EMAIL=reminder.rushigo@gmail.com
   GMAIL_CREDENTIALS_PATH=credentials.json
   GMAIL_TOKEN_PATH=token.json
   ```

### Step 6: Authenticate the Service Account

1. **Run the authentication script:**

   ```bash
   cd backend
   .venv/bin/python -c "from services.gmail_service import get_gmail_service; get_gmail_service()"
   ```

2. **Browser will open automatically**

   - Sign in with `reminder.rushigo@gmail.com`
   - Click **"Continue"** on the warning screen
   - Click **"Allow"** to grant Gmail send permissions
   - You should see: "The authentication flow has completed."

3. **Verify token.json was created:**
   ```bash
   ls -la token.json
   # Should show the file exists
   ```

### Step 7: Test the Setup

1. **Send a test email:**

   ```bash
   cd backend
   .venv/bin/python scripts/test_email.py
   ```

2. **Check reminder.rushigo@gmail.com inbox**

   - You should receive a test email
   - Sent from: reminder.rushigo@gmail.com
   - To: (your configured test email)

3. **Test notifications:**
   ```bash
   cd backend
   .venv/bin/python scripts/test_notification.py
   ```

## 🔐 Security Notes

### What Users See:

- **From:** reminder.rushigo@gmail.com
- **To:** user's email address
- Users receive emails **without any authentication**
- Users never see Google OAuth screens

### Token Security:

- `token.json` contains the refresh token for reminder.rushigo@gmail.com
- Keep this file secure and private
- Add to `.gitignore` (already done)
- In production, store in environment variables or secret manager

## 🎨 User Opt-In/Out (Future Feature)

Instead of Google OAuth for each user, implement in RushiGo settings:

```python
# User model already has notification preferences
class User:
    email_notifications_enabled: bool = True

# Check before sending:
if user.email_notifications_enabled:
    send_email(to=user.email, ...)
```

### Frontend Settings UI (To be implemented):

```tsx
// User Settings Page
<Checkbox
  checked={emailNotificationsEnabled}
  onChange={handleToggle}
  label="Receive deadline reminder emails"
/>
```

## 📊 Gmail API Quotas

**Free Tier Limits (per day):**

- Sending quota: **500 emails/day**
- API requests: **1 billion/day**

**For More Users:**

- Request production status (verified app)
- Or use a paid Google Workspace account (unlimited sending)

## ❌ Why NOT OAuth per User?

**Problems with per-user OAuth:**

1. **Complex Setup:** Every user needs Google Cloud credentials
2. **User Friction:** Users must authenticate with Google
3. **Quota Issues:** Each user has separate quotas
4. **Gmail Required:** Users must have Gmail accounts
5. **Maintenance:** Managing tokens for every user

**Service Account Benefits:**

1. ✅ One-time setup
2. ✅ No user authentication needed
3. ✅ Centralized quota management
4. ✅ Works with any email provider
5. ✅ Professional sender identity

## 🚀 Production Deployment

### For Production (Vercel/Railway/etc):

1. **Store token.json as environment variable:**

   ```bash
   # Convert token.json to base64
   base64 token.json > token.txt

   # Add to environment variables
   GMAIL_TOKEN_BASE64="<content of token.txt>"
   ```

2. **Update gmail_service.py to load from env:**

   ```python
   import base64
   import json
   import os

   # Load token from environment in production
   if os.getenv("GMAIL_TOKEN_BASE64"):
       token_data = base64.b64decode(os.getenv("GMAIL_TOKEN_BASE64"))
       with open(token_path, 'wb') as f:
           f.write(token_data)
   ```

## ✅ Verification Checklist

- [ ] Created Google Cloud Project for reminder.rushigo@gmail.com
- [ ] Enabled Gmail API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth2 credentials
- [ ] Downloaded credentials.json
- [ ] Placed credentials.json in backend/
- [ ] Deleted old token.json
- [ ] Updated .env with FROM_EMAIL=reminder.rushigo@gmail.com
- [ ] Ran authentication and generated new token.json
- [ ] Tested sending email successfully
- [ ] Tested notification system
- [ ] Verified emails are sent from reminder.rushigo@gmail.com

## 🆘 Troubleshooting

### Error: "Access blocked: This app's request is invalid"

- Make sure you added reminder.rushigo@gmail.com as a test user
- Check that you're signed in with the correct Gmail account

### Error: "Token has been expired or revoked"

- Delete token.json and re-authenticate
- Make sure credentials.json is from the correct project

### Emails not being sent

- Check backend logs for errors
- Verify token.json exists and is valid
- Check Gmail API quota in Google Cloud Console

## 📚 Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth 2.0 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Gmail API Quotas](https://developers.google.com/gmail/api/reference/quota)
