# 📅 Google Calendar Integration Guide

## Overview

RushiGo now supports **two-way synchronization** with Google Calendar! Your deadlines automatically appear in your calendar, and you can import calendar events as deadlines.

---

## ✨ Features

- **🔄 Automatic Sync**: Deadlines are automatically synced to Google Calendar when created
- **📝 Smart Updates**: Changes to deadlines update the corresponding calendar events
- **🗑️ Clean Deletion**: Deleting a deadline removes it from your calendar too
- **📥 Import Events**: Import your existing calendar events as RushiGo deadlines
- **🎨 Color-Coded**: Events are color-coded by priority (🔴 High, 🟡 Medium, 🟢 Low)
- **⏰ Smart Reminders**: Calendar events include email and popup reminders
- **✅ Completion Tracking**: Completed deadlines are marked with ✓ in calendar

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable Google Calendar API

You already have Gmail API set up, so this is easy!

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing "RushiGo" project
3. Go to **"APIs & Services"** → **"Library"**
4. Search for **"Google Calendar API"**
5. Click **"ENABLE"**

That's it! You can use the same `credentials.json` from Gmail setup.

### Step 2: Update Scopes

The calendar integration uses a separate token file (`token_calendar.json`) to avoid conflicts with Gmail. When you first enable calendar sync, you'll be prompted to authorize again with calendar permissions.

### Step 3: Run Database Migration

The integration adds new columns to your database:

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend

# Backup your database first
cp database.db database.db.backup

# Apply migrations (automatic on next server start)
python -c "from db.database import create_tables; create_tables()"
```

### Step 4: Start the Server

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend
./start_server.fish
```

---

## 📖 How to Use

### Enable Calendar Sync

**Option 1: Via API**

```bash
curl -X POST "http://localhost:8000/api/calendar/enable" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Option 2: Via Frontend (Coming Soon)**

Add a toggle in your user settings!

### Check Sync Status

```bash
curl "http://localhost:8000/api/calendar/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Sync All Existing Deadlines

```bash
curl -X POST "http://localhost:8000/api/calendar/sync-all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Import from Calendar

Import your calendar events from the next 30 days:

```bash
curl -X POST "http://localhost:8000/api/calendar/import?days_ahead=30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Disable Calendar Sync

```bash
curl -X POST "http://localhost:8000/api/calendar/disable" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 API Endpoints

### Calendar Management

| Method | Endpoint                             | Description                       |
| ------ | ------------------------------------ | --------------------------------- |
| POST   | `/api/calendar/enable`               | Enable calendar sync for user     |
| POST   | `/api/calendar/disable`              | Disable calendar sync             |
| GET    | `/api/calendar/status`               | Get sync status                   |
| POST   | `/api/calendar/sync-all`             | Sync all existing deadlines       |
| POST   | `/api/calendar/import`               | Import events from calendar       |
| DELETE | `/api/calendar/unsync/{deadline_id}` | Remove sync for specific deadline |

### Automatic Sync Behavior

When calendar sync is **enabled**, these happen automatically:

- **Creating a deadline** → Creates calendar event
- **Updating a deadline** → Updates calendar event
- **Deleting a deadline** → Deletes calendar event
- **Marking as complete** → Adds ✓ to event title

---

## 🎨 Calendar Event Details

### Event Structure

Each deadline creates a calendar event with:

- **Title**: Deadline title (with ✓ if completed)
- **Description**:
  - Priority indicator (🔴/🟡/🟢)
  - Course name
  - Deadline description
- **Start Time**: Deadline date/time
- **End Time**: Start + estimated hours (or +1 hour default)
- **Color**: Based on priority
  - 🔴 Red = High priority
  - 🟡 Yellow = Medium priority
  - 🟢 Green = Low priority
- **Reminders**:
  - Email: 1 day before
  - Popup: 1 hour before

### Example Event

```
Title: CS101 Final Project ✓

Description:
🔴 Priority: HIGH
Course: Computer Science 101

Implement a full-stack web application with
React and FastAPI...

Time: Jan 20, 2026, 11:59 PM - Jan 21, 2026, 2:59 AM
```

---

## 🔐 Authentication & Security

### Token Files

- **`credentials.json`**: OAuth2 credentials (shared with Gmail)
- **`token.json`**: Gmail API token
- **`token_calendar.json`**: Calendar API token (separate)

### Why Separate Tokens?

Using separate tokens for Gmail and Calendar prevents scope conflicts and allows independent refresh cycles.

### Permissions Required

The Calendar API requires these scopes:

```python
SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
]
```

This allows RushiGo to:

- ✅ Create, read, update, and delete events
- ✅ Access your primary calendar
- ✅ Create events in custom calendars (if specified)
- ❌ Does NOT access other Google services

---

## 💡 Usage Examples

### Example 1: Enable and Sync

```python
import requests

BASE_URL = "http://localhost:8000/api"
TOKEN = "your_auth_token"

# Enable calendar sync
response = requests.post(
    f"{BASE_URL}/calendar/enable",
    headers={"Authorization": f"Bearer {TOKEN}"}
)
print(response.json())
# {"message": "Calendar sync enabled successfully", "calendar_id": "primary"}

# Sync all existing deadlines
response = requests.post(
    f"{BASE_URL}/calendar/sync-all",
    headers={"Authorization": f"Bearer {TOKEN}"}
)
print(response.json())
# {"message": "Synced 5 deadlines to calendar", "synced_count": 5, ...}
```

### Example 2: Create Deadline (Auto-Syncs)

```python
# Create a deadline
deadline_data = {
    "title": "Math Homework",
    "description": "Chapter 5 problems",
    "date": "2026-01-25T18:00:00Z",
    "priority": "high",
    "estimated_hours": 3,
    "course": "Mathematics 201"
}

response = requests.post(
    f"{BASE_URL}/deadlines/create",
    headers={"Authorization": f"Bearer {TOKEN}"},
    json=deadline_data
)

# Deadline is automatically synced to calendar if sync is enabled!
```

### Example 3: Import from Calendar

```python
# Import events from the next 60 days
response = requests.post(
    f"{BASE_URL}/calendar/import?days_ahead=60",
    headers={"Authorization": f"Bearer {TOKEN}"}
)

print(response.json())
# {
#   "message": "Imported 12 events from calendar",
#   "imported_count": 12,
#   "skipped_count": 3,
#   "total_events": 15
# }
```

---

## 🎯 Frontend Integration Ideas

### User Settings Toggle

```tsx
import { useState } from 'react';

function CalendarSettings() {
  const [syncEnabled, setSyncEnabled] = useState(false);

  const toggleSync = async () => {
    const endpoint = syncEnabled
      ? '/api/calendar/disable'
      : '/api/calendar/enable';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setSyncEnabled(!syncEnabled);
    }
  };

  return (
    <div className="settings-card">
      <h3>📅 Google Calendar Sync</h3>
      <label>
        <input type="checkbox" checked={syncEnabled} onChange={toggleSync} />
        Automatically sync deadlines to Google Calendar
      </label>
    </div>
  );
}
```

### Sync All Button

```tsx
function SyncAllButton() {
  const syncAll = async () => {
    const response = await fetch('/api/calendar/sync-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    alert(`Synced ${data.synced_count} deadlines to calendar!`);
  };

  return (
    <button onClick={syncAll} className="btn-primary">
      🔄 Sync All to Calendar
    </button>
  );
}
```

### Import from Calendar Button

```tsx
function ImportButton() {
  const importEvents = async () => {
    const response = await fetch('/api/calendar/import?days_ahead=30', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    alert(`Imported ${data.imported_count} events from calendar!`);
    // Refresh deadlines list
  };

  return (
    <button onClick={importEvents} className="btn-secondary">
      📥 Import from Calendar
    </button>
  );
}
```

---

## 🐛 Troubleshooting

### "Calendar credentials not found"

**Solution**: You need to enable Google Calendar API:

1. Go to Google Cloud Console
2. Enable "Google Calendar API"
3. Use the same `credentials.json` from Gmail setup

### "Token expired"

**Solution**: Delete `token_calendar.json` and re-authenticate:

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend
rm token_calendar.json
# Next API call will trigger re-authentication
```

### "Access blocked: RushiGo hasn't been verified"

**Solution**: Click "Advanced" → "Go to RushiGo (unsafe)"

- Normal for development apps
- Only you need to authorize (test user)

### Calendar events not syncing

**Check these**:

1. Is calendar sync enabled? Check `/api/calendar/status`
2. Are deadlines marked as `calendar_synced`? Check the database
3. Check server logs for errors
4. Verify `token_calendar.json` exists

### Duplicate events

If you see duplicate events in calendar:

1. Disable calendar sync
2. Manually delete duplicate events
3. Re-enable sync
4. Run `/api/calendar/sync-all` to re-sync

---

## 📊 Database Schema Changes

### User Model

```python
class User(Base):
    # ...existing fields...

    # New calendar fields
    calendar_sync_enabled = Column(Boolean, default=False)
    calendar_id = Column(String(255), nullable=True)  # default: "primary"
```

### Deadline Model

```python
class Deadline(Base):
    # ...existing fields...

    # New calendar fields
    calendar_event_id = Column(String(255), nullable=True, index=True)
    calendar_synced = Column(Boolean, nullable=False, default=False)
```

---

## 🔄 Migration Script

If you need to manually update the database:

```python
# scripts/add_calendar_columns.py
from sqlalchemy import text
from db.database import engine

with engine.connect() as conn:
    # Add User columns
    conn.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS calendar_sync_enabled BOOLEAN DEFAULT FALSE
    """))
    conn.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS calendar_id VARCHAR(255)
    """))

    # Add Deadline columns
    conn.execute(text("""
        ALTER TABLE deadlines
        ADD COLUMN IF NOT EXISTS calendar_event_id VARCHAR(255)
    """))
    conn.execute(text("""
        ALTER TABLE deadlines
        ADD COLUMN IF NOT EXISTS calendar_synced BOOLEAN DEFAULT FALSE
    """))

    # Create index for faster lookups
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_calendar_event_id
        ON deadlines(calendar_event_id)
    """))

    conn.commit()
    print("✅ Calendar columns added successfully!")
```

Run it:

```bash
python scripts/add_calendar_columns.py
```

---

## 🚀 Production Deployment

### Environment Variables

No new environment variables needed! The calendar service uses the same credentials as Gmail.

### Render Deployment

1. **Upload token_calendar.json** to Render Secret Files (after first auth locally)
2. **Or** set `CALENDAR_CREDENTIALS_PATH` and `CALENDAR_TOKEN_PATH` if needed

### Token Refresh

The calendar service automatically refreshes expired tokens, just like Gmail.

---

## 📈 Rate Limits

Google Calendar API limits:

- **Quota**: 1,000,000 requests/day
- **Queries per 100 seconds**: 50,000
- **Queries per 100 seconds per user**: 500

For RushiGo's use case (creating/updating/deleting events), you're unlikely to hit these limits. Even with 100 users creating 10 deadlines each per day = 1,000 requests (well under the limit).

---

## 🎓 Best Practices

1. **Enable sync early**: Turn on calendar sync when you start using RushiGo
2. **Sync periodically**: Run `/api/calendar/sync-all` after importing deadlines from documents
3. **Import once**: Use `/api/calendar/import` once to pull in existing events
4. **Don't duplicate**: If a deadline is already synced, don't manually create a duplicate calendar event
5. **Clean up**: If you disable sync, decide if you want to keep or delete synced events

---

## 🆘 Support

If you encounter issues:

1. Check the server logs: `tail -f backend/logs/app.log`
2. Review this guide's troubleshooting section
3. Test with `scripts/test_calendar.py` (create this script for testing)
4. Open an issue on GitHub

---

## 🎉 What's Next?

Potential future enhancements:

- [ ] Multiple calendar support (work, personal, school)
- [ ] Custom calendar selection per deadline
- [ ] Bi-directional sync (detect calendar changes)
- [ ] Share team deadlines to shared calendars
- [ ] Calendar view in frontend (full calendar widget)
- [ ] Recurring deadline support
- [ ] Time zone conversion

---

## 📝 Testing

Create a test script to verify the integration:

```python
# scripts/test_calendar.py
from services.calendar_service import get_calendar_service
from datetime import datetime, timedelta

def test_calendar():
    print("🧪 Testing Google Calendar integration...")

    # Initialize service
    calendar = get_calendar_service()
    print("✅ Calendar service initialized")

    # Create a test event
    event = calendar.create_event(
        title="RushiGo Test Event",
        description="This is a test from RushiGo",
        start_datetime=datetime.utcnow() + timedelta(days=1),
        priority="high",
        course="Test Course"
    )
    print(f"✅ Created event: {event.get('id')}")

    # Update the event
    calendar.update_event(
        event_id=event.get('id'),
        title="RushiGo Test Event (Updated)",
        completed=True
    )
    print("✅ Updated event")

    # Delete the event
    calendar.delete_event(event.get('id'))
    print("✅ Deleted event")

    print("\n🎉 All tests passed!")

if __name__ == "__main__":
    test_calendar()
```

Run it:

```bash
python scripts/test_calendar.py
```

---

## 📚 Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth2 for Installed Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Calendar API Python Quickstart](https://developers.google.com/calendar/api/quickstart/python)
- [Event Resource](https://developers.google.com/calendar/api/v3/reference/events)

---

**Happy Syncing! 🎯📅**

Never miss a deadline - see them everywhere, in RushiGo AND your calendar!
