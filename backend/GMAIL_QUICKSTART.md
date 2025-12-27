# Quick Start: Gmail API for RushiGo

## What Changed?

Your notification system now uses **Gmail API** instead of Mailgun to send deadline reminder emails.

## Benefits

✅ **Free** - No cost for sending emails  
✅ **Reliable** - Direct Gmail integration  
✅ **No recipient limits** - Send to anyone  
✅ **Your own Gmail** - Professional and familiar

## Setup Steps (5 minutes)

### 1. Get Gmail Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "Gmail API"
4. Create OAuth2 credentials:
   - Type: "Desktop app"
   - Name: "RushiGo Backend"
5. Download credentials as `credentials.json`
6. Move to: `/home/tejast/Documents/Projects/rushiGo/backend/credentials.json`

**Detailed guide**: See `GMAIL_SETUP.md` for step-by-step instructions with screenshots.

### 2. Install Dependencies

Already done! ✅ The required packages are installed:

- `google-auth-oauthlib`
- `google-auth-httplib2`
- `google-api-python-client`

### 3. Authenticate (First Time Only)

When you first send an email, a browser will open:

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend
python scripts/test_gmail.py
```

1. Browser opens automatically
2. Log in with your Gmail account
3. Click "Allow" to grant permissions
4. `token.json` is created automatically
5. Done! Future emails work automatically

### 4. Test Email Sending

```bash
python scripts/test_gmail.py
```

Enter your email when prompted, and you'll receive a test email!

## What Was Removed

- ❌ Mailgun API dependency
- ❌ Mailgun domain/API key configuration
- ❌ Sandbox recipient verification
- ❌ `requests` library for email

## What Was Added

- ✅ Gmail API service (`services/gmail_service.py`)
- ✅ OAuth2 authentication
- ✅ Automatic token refresh
- ✅ HTML & plain text email support

## File Changes

### Modified Files:

- `core/emails_utils.py` - Now uses Gmail API
- `core/config.py` - Gmail settings instead of Mailgun
- `.env` - Updated with Gmail configuration
- `pyproject.toml` - Added Google packages
- `.gitignore` - Added Gmail credentials

### New Files:

- `services/gmail_service.py` - Gmail API integration
- `GMAIL_SETUP.md` - Detailed setup guide
- `scripts/test_gmail.py` - Test script

### Will Be Created:

- `credentials.json` - You download this from Google Cloud Console
- `token.json` - Auto-generated on first authentication

## Configuration (.env)

Your `.env` now has:

```env
# Gmail API Configuration
GMAIL_CREDENTIALS_PATH=credentials.json
GMAIL_TOKEN_PATH=token.json
FROM_EMAIL=RushiGo Notifications
```

## Security

🔒 **Protected files** (in `.gitignore`):

- `credentials.json` - OAuth2 client secret
- `token.json` - Your authentication token

**Never commit these to git!**

## How Notification System Works

Nothing changed in how you use it:

```python
from core.emails_utils import send_email

# Works exactly the same!
send_email(
    to_email="user@example.com",
    subject="Deadline Reminder",
    text="Your deadline is approaching!",
    html="<h1>Deadline Reminder</h1>"
)
```

The notification service (`services/notification_service.py`) works unchanged!

## Troubleshooting

### "credentials.json not found"

→ Download OAuth2 credentials from Google Cloud Console  
→ Place in `backend/` directory

### "Browser doesn't open for authentication"

→ Run: `python scripts/test_gmail.py`  
→ Follow the URL printed in terminal

### "Access blocked: RushiGo hasn't been verified"

→ Click "Advanced" → "Go to RushiGo (unsafe)"  
→ Normal for development/testing

### "Token expired"

→ Delete `token.json`  
→ Run the app again to re-authenticate

## Next Steps

1. **Download credentials.json** from Google Cloud Console
2. **Run test**: `python scripts/test_gmail.py`
3. **Start server**: `./start_server.fish`
4. **Create deadlines** in your app
5. **Get email notifications** automatically!

## Support

- 📖 Detailed guide: `GMAIL_SETUP.md`
- 🔗 Gmail API docs: https://developers.google.com/gmail/api
- 🐍 Python quickstart: https://developers.google.com/gmail/api/quickstart/python

---

**Ready to set up?** Follow step 1 above to download `credentials.json` from Google Cloud Console!
