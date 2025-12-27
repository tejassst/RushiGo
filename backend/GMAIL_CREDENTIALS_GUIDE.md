# Step-by-Step Guide: Getting Gmail API Credentials

This guide will walk you through getting OAuth2 credentials for Gmail API to enable email notifications in RushiGo.

---

## 📋 Prerequisites

- A Google account (Gmail)
- Web browser
- 10 minutes of time

---

## 🎯 Step 1: Go to Google Cloud Console

1. Open your web browser
2. Visit: **https://console.cloud.google.com/**
3. Sign in with your Google account if prompted

---

## 🆕 Step 2: Create a New Project

1. Look at the top-left of the page, near the Google Cloud logo
2. Click on the **project dropdown** (it might say "Select a project" or show a project name)
3. In the popup window, click **"NEW PROJECT"** (top-right corner)

   ![Project dropdown location]

4. Fill in the project details:

   - **Project name**: `RushiGo` (or any name you prefer)
   - **Organization**: Leave as "No organization" (unless you have one)
   - **Location**: Leave default

5. Click **"CREATE"** button
6. Wait 10-20 seconds for the project to be created
7. You'll see a notification when it's ready
8. Click **"SELECT PROJECT"** in the notification, or select it from the project dropdown

---

## 🔌 Step 3: Enable Gmail API

1. Make sure you're in your new "RushiGo" project (check the project name in the top bar)

2. In the left sidebar, click on **"APIs & Services"** → **"Library"**

   Or use the search bar at the top and type "API Library"

3. You'll see a page with many API cards

4. In the search box, type: **"Gmail API"**

5. Click on the **"Gmail API"** card (it has a Gmail icon)

6. On the Gmail API page, click the blue **"ENABLE"** button

7. Wait a few seconds - you'll see "API enabled" confirmation

8. You'll be redirected to the API details page

---

## 🔐 Step 4: Configure OAuth Consent Screen

Before creating credentials, you need to set up the OAuth consent screen (this is what users see when they authorize your app).

1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**

2. Choose user type:

   - Select **"External"** (unless you have a Google Workspace account)
   - Click **"CREATE"**

3. **Fill in App Information** (Page 1):

   **Required fields:**

   - **App name**: `RushiGo`
   - **User support email**: Select your email from dropdown
   - **Developer contact information**: Enter your email

   **Optional fields:** (you can skip these)

   - App logo
   - App domain
   - Authorized domains

   Click **"SAVE AND CONTINUE"**

4. **Scopes** (Page 2):

   - Just click **"SAVE AND CONTINUE"** (we'll set scopes in code)

5. **Test Users** (Page 3):

   - Click **"+ ADD USERS"**
   - Enter your Gmail address (the one you'll use to send emails)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

6. **Summary** (Page 4):
   - Review your settings
   - Click **"BACK TO DASHBOARD"**

✅ OAuth consent screen is now configured!

---

## 🎫 Step 5: Create OAuth2 Credentials

Now we'll create the actual credentials file.

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**

2. At the top of the page, click **"+ CREATE CREDENTIALS"**

3. From the dropdown, select **"OAuth client ID"**

4. Fill in the form:

   - **Application type**: Select **"Desktop app"** from dropdown
   - **Name**: `RushiGo Backend` (or any name you prefer)

5. Click **"CREATE"**

6. A popup will appear: **"OAuth client created"**
   - You'll see your Client ID and Client Secret
   - **DON'T WORRY** - you don't need to copy these manually

---

## ⬇️ Step 6: Download Credentials File

1. In the popup (or if you closed it, find your credentials in the list)

2. Look for the **download button** (⬇️ icon) on the right side

3. Click the **download icon** (looks like a down arrow)

4. A file will be downloaded - it will have a long name like:

   ```
   client_secret_1234567890-abc123xyz.apps.googleusercontent.com.json
   ```

5. **Rename this file** to: `credentials.json`

---

## 📁 Step 7: Move Credentials to Your Project

1. Open your file manager

2. Navigate to your downloaded file (usually in `~/Downloads/`)

3. **Move or copy** `credentials.json` to:

   ```
   /home/tejast/Documents/Projects/rushiGo/backend/credentials.json
   ```

4. **Verify the location:**

   ```bash
   cd /home/tejast/Documents/Projects/rushiGo/backend
   ls -la credentials.json
   ```

   You should see the file listed.

---

## ✅ Step 8: Verify Setup

Run this command to check if the file is in the right place:

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend
cat credentials.json | head -n 5
```

You should see JSON content that starts with:

```json
{
  "installed": {
    "client_id": "...",
    "project_id": "...",
```

✅ **Success!** Your credentials are ready.

---

## 🧪 Step 9: Test Gmail Integration

Now test that everything works:

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend
python scripts/test_gmail.py
```

**What will happen:**

1. Script starts
2. **Browser opens automatically** with Google login
3. Log in with your Gmail account (the one you added as test user)
4. You'll see: "RushiGo wants to access your Google Account"
5. Click **"Continue"** or **"Allow"**
6. You might see: "Google hasn't verified this app"
   - Click **"Advanced"**
   - Click **"Go to RushiGo (unsafe)"**
   - This is normal for development!
7. Grant permissions to send emails
8. Browser shows: "The authentication flow has completed"
9. Return to terminal
10. Enter your email address when prompted
11. **Check your email** - you should receive a test email!

A `token.json` file will be created automatically.

---

## 🎉 Done!

You now have:

- ✅ Google Cloud project created
- ✅ Gmail API enabled
- ✅ OAuth consent screen configured
- ✅ OAuth2 credentials downloaded
- ✅ `credentials.json` in your project
- ✅ Successfully tested email sending
- ✅ `token.json` created for future use

---

## 📝 Important Notes

### Security

- **NEVER** commit `credentials.json` or `token.json` to git
- Both files are already in `.gitignore`
- Keep these files private and secure

### Token Management

- `token.json` is created after first authentication
- Token automatically refreshes when expired
- If you have issues, delete `token.json` and re-authenticate

### Test Users

- While your app is in "Testing" mode, only test users can authenticate
- Add more test users in: OAuth consent screen → Test users
- For public use, you'd need to publish the app (not needed for personal use)

---

## 🆘 Troubleshooting

### "Access blocked: RushiGo hasn't been verified"

**Solution:**

1. Click **"Advanced"** at the bottom
2. Click **"Go to RushiGo (unsafe)"**
3. This is normal - your app is in testing mode

### "Error 400: redirect_uri_mismatch"

**Solution:**

- You might have selected wrong application type
- Delete the credential and create a new one
- Make sure to select **"Desktop app"** not "Web application"

### "Browser doesn't open"

**Solution:**

- Check terminal output for a URL
- Copy and paste the URL into your browser manually

### "credentials.json not found"

**Solution:**

- Check file location: `/home/tejast/Documents/Projects/rushiGo/backend/credentials.json`
- Make sure filename is exactly `credentials.json` (not `credentials.json.txt`)

### "Permission denied"

**Solution:**

- Make sure you added yourself as a test user in OAuth consent screen
- Use the same Gmail account you added as test user

---

## 📚 Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth2 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Python Quickstart](https://developers.google.com/gmail/api/quickstart/python)

---

## 🚀 What's Next?

Now you can:

1. **Start your server:**

   ```bash
   cd /home/tejast/Documents/Projects/rushiGo/backend
   ./start_server.fish
   ```

2. **Create deadlines** in your app

3. **Get automatic email notifications** when deadlines approach!

---

**Need more help?** Check out:

- `GMAIL_QUICKSTART.md` - Quick reference guide
- `GMAIL_SETUP.md` - Alternative detailed guide
- `GMAIL_MIGRATION_SUMMARY.md` - Overview of changes

---

**Happy coding! 🎉**
