# Email Notifications: Service Account vs Per-User OAuth

## 🤔 Your Question

> "Why does it only work when I approve on Google with a browser window? I want the same thing to pop up on RushiGo so that users can approve receiving emails."

## 📖 Understanding the Two Approaches

### ❌ Approach 1: Per-User OAuth (What you're thinking)

Each user authenticates with their own Gmail account to send/receive emails.

**How it would work:**

1. User signs up on RushiGo
2. User clicks "Enable Email Notifications"
3. Google OAuth popup appears in RushiGo
4. User signs in with THEIR Gmail account
5. RushiGo stores token for that user
6. Emails are sent from their own Gmail

**Why this is BAD:**

- ❌ Users MUST have Gmail accounts
- ❌ Complex Google Cloud setup for every user
- ❌ Each user has separate 500 email/day quota
- ❌ Managing thousands of OAuth tokens
- ❌ Tokens expire and need renewal
- ❌ Poor user experience (too much friction)
- ❌ Security nightmare (storing many tokens)

### ✅ Approach 2: Service Account (Industry Standard)

One dedicated email account sends notifications to all users.

**How it works:**

1. RushiGo has one Gmail: `reminder.rushigo@gmail.com`
2. ONE TIME: You authenticate this account (the popup you saw)
3. Users sign up with ANY email (Gmail, Yahoo, Outlook, etc.)
4. Users toggle "Email notifications" ON/OFF in RushiGo settings
5. RushiGo sends emails FROM reminder.rushigo@gmail.com TO users
6. No Google popup for users - just a simple toggle

**Why this is GOOD:**

- ✅ Users can use ANY email provider
- ✅ One-time setup (you already did it!)
- ✅ Simple user experience (just a checkbox)
- ✅ One quota pool (500/day or unlimited with Workspace)
- ✅ Professional sender identity
- ✅ Easy to manage and secure
- ✅ Industry standard (used by Gmail, Slack, GitHub, etc.)

## 🎯 Recommended Solution

### What You Should Do:

1. **Use reminder.rushigo@gmail.com as service account** (follow SWITCH_TO_REMINDER_EMAIL.md)
2. **Add email preference toggle in User Settings** (no Google OAuth needed)
3. **Users control notifications through RushiGo, not Google**

### User Experience:

```
┌─────────────────────────────────┐
│   RushiGo - User Settings       │
├─────────────────────────────────┤
│                                 │
│ Email: user@example.com        │
│                                 │
│ Notifications                   │
│ ☑ Email notifications          │
│   Receive deadline reminders    │
│   via email                     │
│                                 │
│ [Save Changes]                  │
│                                 │
└─────────────────────────────────┘
```

**No Google popup, no OAuth, just a simple checkbox!**

## 📧 How Emails Will Look

**From:** RushiGo Notifications <reminder.rushigo@gmail.com>
**To:** user@example.com
**Subject:** ⏰ Deadline Reminder: Quiz 1

```
Hi John,

This is a reminder about your upcoming deadline:

📚 Course: Physics 101
📝 Title: Quiz 1
📅 Due: December 27, 2025 at 2:00 PM
⏳ Time Left: 1 day

Good luck!

---
RushiGo Team
Unsubscribe from these emails in your account settings
```

## 🔧 Implementation Plan

### Phase 1: Switch Email Account (Do This Now)

Follow: `SWITCH_TO_REMINDER_EMAIL.md`

- [ ] Set up reminder.rushigo@gmail.com in Google Cloud
- [ ] Download new credentials.json
- [ ] Authenticate and generate token.json
- [ ] Test sending emails

### Phase 2: Add User Preferences (Future Enhancement)

Add a field to User model:

```python
email_notifications_enabled = Column(Boolean, default=True)
```

Update notification service:

```python
if user.email_notifications_enabled:
    send_email(to=user.email, ...)
```

Add settings page in frontend:

```tsx
<Switch
  checked={emailNotifications}
  onChange={handleToggle}
  label="Receive email notifications"
/>
```

### Phase 3: Unsubscribe Link (Best Practice)

Add unsubscribe link to emails:

```python
html_body += f"""
<p style="font-size: 12px; color: #666;">
  <a href="{FRONTEND_URL}/settings?tab=notifications">
    Manage notification preferences
  </a>
</p>
"""
```

## 🆚 Comparison Table

| Feature           | Per-User OAuth         | Service Account   |
| ----------------- | ---------------------- | ----------------- |
| User Setup        | Complex (Google OAuth) | Simple (checkbox) |
| Email Provider    | Gmail only             | Any provider      |
| Quota             | 500/user/day           | 500/day total\*   |
| Token Management  | One per user           | One total         |
| Security Risk     | High (many tokens)     | Low (one token)   |
| Professional      | No                     | Yes               |
| Industry Standard | No                     | Yes               |
| Maintenance       | High                   | Low               |

\*Can be increased to unlimited with Google Workspace

## 🚀 Quick Start

**To switch to reminder.rushigo@gmail.com right now:**

1. Follow the guide in `SWITCH_TO_REMINDER_EMAIL.md`
2. You'll do the Google OAuth popup ONE TIME
3. After that, users never see any Google auth
4. Users just receive emails from reminder.rushigo@gmail.com

**To add user opt-in/out later:**

1. Add `email_notifications_enabled` field to User model
2. Create settings page in frontend
3. Check this field before sending emails
4. Add unsubscribe link to emails

## ❓ FAQ

**Q: Can users choose to not receive emails?**
A: Yes! Add a toggle in RushiGo settings (no Google involved)

**Q: Do users need Gmail accounts?**
A: No! They can use ANY email (Outlook, Yahoo, etc.)

**Q: Is this how other apps work?**
A: Yes! Gmail, Slack, GitHub, etc. all use service accounts

**Q: What about the Google popup?**
A: You see it ONCE when setting up the service account. Users never see it.

**Q: Is this secure?**
A: Yes! More secure than managing tokens for every user

**Q: What if reminder.rushigo@gmail.com gets compromised?**
A: Just revoke the token and generate a new one

## 📞 Next Steps

1. **Read:** `SWITCH_TO_REMINDER_EMAIL.md`
2. **Do:** Set up reminder.rushigo@gmail.com as service account
3. **Test:** Send emails from the new account
4. **Later:** Add user preference toggles in settings

You're already 90% done! Just need to switch the email account and you're good to go! 🎉
