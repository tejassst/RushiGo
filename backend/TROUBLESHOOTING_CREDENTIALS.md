# Troubleshooting: Download OAuth2 Credentials JSON

## Problem: Can't Download credentials.json File

This guide provides multiple methods to get your OAuth2 credentials from Google Cloud Console.

---

## Method 1: Direct Download (Try This First)

### Step-by-Step:

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. **Sign in with reminder.rushigo@gmail.com**
3. Make sure your project "RushiGo Notifications" is selected (top bar)
4. Under **"OAuth 2.0 Client IDs"** section, find your credential
5. Click the **download icon** (⬇️) on the right side
6. File will download as something like: `client_secret_XXXXX.json`
7. Rename it to `credentials.json`

### If download button is missing:

- Try a different browser (Chrome, Firefox, Edge)
- Disable browser extensions (especially ad blockers)
- Try incognito/private mode

---

## Method 2: Copy JSON Manually

If the download button doesn't work, you can copy the JSON directly:

### Step-by-Step:

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on the **name** of your OAuth 2.0 Client ID (e.g., "RushiGo Backend Service")
3. You'll see a screen with:

   - Client ID
   - Client Secret
   - Creation date, etc.

4. **Look for JSON format** or create it manually using this template:

```json
{
  "installed": {
    "client_id": "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com",
    "project_id": "YOUR_PROJECT_ID",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "YOUR_CLIENT_SECRET_HERE",
    "redirect_uris": ["http://localhost"]
  }
}
```

5. **Replace the placeholders:**

   - `YOUR_CLIENT_ID_HERE` → Copy from "Client ID" field
   - `YOUR_CLIENT_SECRET_HERE` → Copy from "Client Secret" field
   - `YOUR_PROJECT_ID` → Your project name (rushigo-notifications or similar)

6. **Save this as `credentials.json`** in the backend folder

### How to create the file:

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend

# Create the file
nano credentials.json

# Or using VS Code
code credentials.json
```

---

## Method 3: View and Copy Existing Credentials

If you already created credentials but can't download them again:

1. In Google Cloud Console → Credentials
2. Click the **name** of your OAuth client
3. You should see a modal/page with the JSON structure
4. Some browsers show a **"DOWNLOAD JSON"** button in the top right
5. If not visible, use Method 2 to manually construct it

---

## Method 4: Create New Credentials

If all else fails, create new credentials:

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **"Desktop app"**
4. Name: **"RushiGo Backend Service 2"**
5. Click **"CREATE"**
6. A popup should appear with:
   - Your client ID
   - Your client secret
   - **"DOWNLOAD JSON"** button

### If popup appears:

- Click **"DOWNLOAD JSON"**
- Save the file
- Rename to `credentials.json`
- Move to backend folder

### If no popup:

- Use Method 2 to manually create the JSON

---

## Verification

Once you have `credentials.json`, verify its format:

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend

# Check if file exists
ls -la credentials.json

# View the contents (make sure it's valid JSON)
cat credentials.json
```

**The file should look like:**

```json
{
  "installed": {
    "client_id": "123456789-abcdefgh.apps.googleusercontent.com",
    "project_id": "rushigo-notifications-123456",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "GOCSPX-abc123def456",
    "redirect_uris": ["http://localhost"]
  }
}
```

---

## Common Issues

### Issue: "Download not working"

**Solution:** Try different browser or incognito mode

### Issue: "File downloads as .txt instead of .json"

**Solution:** Rename the file: `mv client_secret_*.txt credentials.json`

### Issue: "Can't find download button"

**Solution:** Use Method 2 (manual JSON creation)

### Issue: "Invalid JSON format"

**Solution:** Validate JSON at https://jsonlint.com/

---

## Next Steps

Once you have `credentials.json`:

1. **Place it in the backend folder:**

   ```bash
   /home/tejast/Documents/Projects/rushiGo/backend/credentials.json
   ```

2. **Verify it's there:**

   ```bash
   cd /home/tejast/Documents/Projects/rushiGo/backend
   ls -la credentials.json
   ```

3. **Continue with Step 5** in `SWITCH_TO_REMINDER_EMAIL.md`

---

## Still Having Issues?

If you're still stuck, you can:

1. **Share the error message** you're seeing
2. **Take a screenshot** of the Google Cloud Console credentials page
3. **Check browser console** for errors (F12 → Console tab)
4. **Try a different Google account** temporarily to test the download

Need help with any of these methods? Let me know which step is causing the issue!
