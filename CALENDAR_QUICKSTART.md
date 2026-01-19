# 🚀 Quick Start: Google Calendar Integration

Get RushiGo synced with Google Calendar in **5 minutes**!

---

## ✅ Prerequisites

- You've already set up Gmail API (you have `credentials.json`)
- RushiGo backend is running
- You have a Google account

---

## 📝 Step-by-Step Setup

### 1. Enable Google Calendar API (1 minute)

```bash
# Open Google Cloud Console
# https://console.cloud.google.com/

# Select your "RushiGo" project
# Go to: APIs & Services → Library
# Search: "Google Calendar API"
# Click: ENABLE
```

✅ Done! You can use the same `credentials.json` from Gmail.

### 2. Run Database Migration (30 seconds)

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend
python scripts/migrate_calendar.py
```

Expected output:

```
✅ Database migration completed successfully!
```

### 3. Test the Integration (1 minute)

```bash
python scripts/test_calendar.py
```

This will:

- Create a test event in your calendar
- Update it
- Delete it
- Confirm everything works

### 4. Enable Calendar Sync (30 seconds)

**Using curl:**

```bash
# Replace YOUR_TOKEN with your actual auth token
curl -X POST "http://localhost:8000/api/calendar/enable" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Or add to your frontend:**

```tsx
// Add a toggle in user settings
const enableSync = async () => {
  await fetch('/api/calendar/enable', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
};
```

### 5. Sync Your Existing Deadlines (30 seconds)

```bash
curl -X POST "http://localhost:8000/api/calendar/sync-all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎉 You're Done!

Now when you:

- **Create a deadline** → It appears in Google Calendar
- **Update a deadline** → Calendar event updates too
- **Delete a deadline** → Calendar event is removed
- **Mark as complete** → Event gets ✓ in title

---

## 🎨 What It Looks Like

**In your Google Calendar:**

```
🔴 CS101 Final Project
   High Priority | Computer Science 101
   Due: Jan 25, 2026, 6:00 PM
   Duration: 3 hours

🟡 Math Homework
   Medium Priority | Mathematics 201
   Due: Jan 22, 2026, 11:59 PM
   Duration: 2 hours

🟢 ✓ Read Chapter 5
   Low Priority | History 101
   Due: Jan 20, 2026, 9:00 AM
   COMPLETED ✓
```

---

## 📚 More Features

Want to do more? Check out the full guide:

```bash
cat GOOGLE_CALENDAR_INTEGRATION.md
```

Features include:

- Import events FROM calendar
- Unsync specific deadlines
- Use custom calendars
- And more!

---

## 🆘 Troubleshooting

**Browser doesn't open?**

- Look for a URL in the terminal
- Copy and paste it into your browser

**"Access blocked"?**

- Click "Advanced" → "Go to RushiGo (unsafe)"
- Normal for development apps

**Calendar events not showing?**

- Check sync status: `curl http://localhost:8000/api/calendar/status`
- Make sure you enabled calendar API in Google Cloud
- Check server logs for errors

---

## ⚡ Quick Commands

```bash
# Check sync status
curl http://localhost:8000/api/calendar/status -H "Authorization: Bearer TOKEN"

# Sync all deadlines
curl -X POST http://localhost:8000/api/calendar/sync-all -H "Authorization: Bearer TOKEN"

# Import from calendar
curl -X POST http://localhost:8000/api/calendar/import -H "Authorization: Bearer TOKEN"

# Disable sync
curl -X POST http://localhost:8000/api/calendar/disable -H "Authorization: Bearer TOKEN"
```

---

**That's it! Your deadlines are now synced with Google Calendar! 🎊**

View them anywhere:

- 📱 Google Calendar mobile app
- 💻 calendar.google.com
- 🖥️ Desktop calendar apps
- 🎯 RushiGo dashboard

Never miss a deadline! 🚀
