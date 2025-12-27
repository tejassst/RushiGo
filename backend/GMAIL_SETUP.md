# Gmail API Setup Guide

This guide will help you set up Gmail API for sending deadline notification emails from your RushiGo application.

## Why Gmail API?

- **Free**: No cost for sending emails
- **Reliable**: Direct integration with Gmail
- **No recipient limits**: Unlike Mailgun sandbox (which requires verified recipients)
- **Your own Gmail account**: Send from your personal or organization Gmail

## Prerequisites

- A Google account (Gmail)
- Python 3.13+ with pip
- RushiGo backend project

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name it "RushiGo" or any name you prefer
4. Click "Create"

## Step 2: Enable Gmail API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on "Gmail API"
4. Click "Enable"

## Step 3: Create OAuth2 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:

   - Choose "External" (unless you have a Google Workspace)
   - Fill in the required fields:
     - App name: `RushiGo`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Skip "Scopes" (click "Save and Continue")
   - Add yourself as a test user if in testing mode
   - Click "Save and Continue"

4. Create OAuth Client ID:

   - Application type: "Desktop app"
   - Name: "RushiGo Backend"
   - Click "Create"

5. Download the credentials:
   - Click the download button (⬇️) next to your new OAuth client
   - Save the file as `credentials.json`
   - Move it to your backend directory: `/home/tejast/Documents/Projects/rushiGo/backend/credentials.json`

## Step 4: Install Dependencies

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend
source .venv/bin/activate.fish  # or activate.fish for fish shell
pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

Or use uv:

```bash
uv pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

## Step 5: First-Time Authentication

The first time you run the application (or send an email), you'll need to authenticate:

1. Start your server:

   ```bash
   ./start_server.fish
   ```

2. When the app tries to send an email for the first time, a browser window will open
3. Log in with your Gmail account
4. Grant permissions to the RushiGo app
5. A `token.json` file will be created automatically
6. **Important**: Add `token.json` to `.gitignore` (already done)

## Step 6: Test Email Sending

Create a test script:

```python
# test_gmail.py
from services.gmail_service import get_gmail_service

def test_send():
    gmail = get_gmail_service()
    result = gmail.send_email(
        to_email="your-email@gmail.com",  # Replace with your email
        subject="Test from RushiGo",
        text="This is a test email from RushiGo!",
        html="<h1>Test Email</h1><p>This is a test email from RushiGo!</p>"
    )
    print(f"Email sent! Message ID: {result['id']}")

if __name__ == "__main__":
    test_send()
```

Run it:

```bash
python test_gmail.py
```

## File Structure

After setup, you should have:

```
backend/
├── credentials.json     # OAuth2 credentials (DO NOT commit)
├── token.json          # Auth token (auto-generated, DO NOT commit)
├── .env                # Environment variables
├── .gitignore          # Should include credentials.json and token.json
└── services/
    └── gmail_service.py
```

## Security Notes

⚠️ **IMPORTANT**: Never commit these files to git:

- `credentials.json` - Contains your OAuth2 client secret
- `token.json` - Contains your authentication token

These are already in your `.gitignore`.

## Troubleshooting

### "Missing credentials.json"

- Make sure you downloaded the OAuth2 credentials from Google Cloud Console
- Place it in the `backend/` directory
- File must be named exactly `credentials.json`

### "Access blocked: RushiGo hasn't been verified"

- This is normal for testing
- Click "Advanced" → "Go to RushiGo (unsafe)"
- This only happens during development with unverified apps

### Token expired

- Delete `token.json`
- Run the app again
- Re-authenticate in the browser

### Rate limits

- Gmail API has generous limits: 250 quota units per user per second
- Sending an email costs 100 units = ~2.5 emails/second
- Daily limit: 1 billion quota units
- More than enough for deadline notifications!

## Environment Variables

Your `.env` should have:

```env
# Gmail API Configuration
GMAIL_CREDENTIALS_PATH=credentials.json
GMAIL_TOKEN_PATH=token.json
FROM_EMAIL=RushiGo Notifications
```

## How It Works

1. **First Run**: User authenticates via browser, `token.json` is created
2. **Subsequent Runs**: App uses `token.json` for authentication
3. **Token Refresh**: If token expires, it's automatically refreshed
4. **Email Sending**: Uses authenticated Gmail account to send emails

## Production Deployment

For production (e.g., on a server):

1. **Option 1: Service Account** (recommended for servers)

   - Create a service account in Google Cloud Console
   - Download service account key
   - Use service account authentication instead of OAuth2

2. **Option 2: Pre-authenticated Token**
   - Authenticate locally once
   - Copy `token.json` to your server
   - Set file permissions: `chmod 600 token.json`
   - Token will auto-refresh on the server

## Need Help?

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Python Quickstart](https://developers.google.com/gmail/api/quickstart/python)
- [OAuth2 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
