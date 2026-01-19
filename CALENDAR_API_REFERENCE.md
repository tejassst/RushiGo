# 📚 Google Calendar API Reference

Quick reference for all calendar-related endpoints in RushiGo.

---

## 🔐 Authentication

All endpoints require Bearer token authentication:

```bash
Authorization: Bearer YOUR_AUTH_TOKEN
```

---

## 👤 User Preferences Endpoints

### Get Calendar Preferences

Get the current user's calendar sync preferences.

```http
GET /api/users/me/calendar-preferences
```

**Response:**

```json
{
  "calendar_sync_enabled": false,
  "calendar_id": "primary",
  "message": "Calendar sync is disabled"
}
```

---

### Update Calendar Preferences

Enable/disable calendar sync or change target calendar.

```http
PUT /api/users/me/calendar-preferences
Content-Type: application/json

{
  "calendar_sync_enabled": true,
  "calendar_id": "primary"
}
```

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `calendar_sync_enabled` | boolean | No | - | Enable or disable calendar sync |
| `calendar_id` | string | No | "primary" | Google Calendar ID to sync to |

**Response:**

```json
{
  "message": "Calendar preferences updated successfully",
  "calendar_sync_enabled": true,
  "calendar_id": "primary"
}
```

**Errors:**

- `400` - Calendar API not set up
- `500` - Failed to connect to Google Calendar

---

## 📅 Calendar Sync Endpoints

### Enable Calendar Sync (Legacy)

**⚠️ Deprecated:** Use `PUT /api/users/me/calendar-preferences` instead.

```http
POST /api/calendar/enable
```

---

### Disable Calendar Sync (Legacy)

**⚠️ Deprecated:** Use `PUT /api/users/me/calendar-preferences` instead.

```http
POST /api/calendar/disable
```

---

### Get Calendar Status (Legacy)

**⚠️ Deprecated:** Use `GET /api/users/me/calendar-preferences` instead.

```http
GET /api/calendar/status
```

---

### Sync All Deadlines

Create calendar events for all unsynced deadlines.

```http
POST /api/calendar/sync-all
```

**Response:**

```json
{
  "message": "Synced 5 deadlines to calendar",
  "synced_count": 5,
  "total_unsynced": 5,
  "errors": null
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `synced_count` | number | Number of deadlines successfully synced |
| `total_unsynced` | number | Total number of unsynced deadlines found |
| `errors` | array | List of errors (null if none) |

**Errors:**

- `400` - Calendar sync not enabled
- `500` - Sync operation failed

---

### Import from Calendar

Import Google Calendar events as RushiGo deadlines.

```http
POST /api/calendar/import?days_ahead=30
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days_ahead` | number | 30 | Number of days to look ahead |

**Response:**

```json
{
  "message": "Imported 12 events from calendar",
  "imported_count": 12,
  "skipped_count": 3,
  "total_events": 15
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `imported_count` | number | Number of events imported |
| `skipped_count` | number | Number of events skipped (already exist) |
| `total_events` | number | Total events found in calendar |

**Errors:**

- `400` - Calendar sync not enabled
- `500` - Import operation failed

---

### Unsync Deadline

Remove calendar sync for a specific deadline.

```http
DELETE /api/calendar/unsync/{deadline_id}?delete_from_calendar=false
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `deadline_id` | number | ID of the deadline to unsync |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `delete_from_calendar` | boolean | false | Also delete the event from Google Calendar |

**Response:**

```json
{
  "message": "Deadline unsynced from calendar",
  "deleted_from_calendar": false
}
```

**Errors:**

- `404` - Deadline not found
- `500` - Unsync operation failed

---

## 📝 Automatic Sync Behavior

When calendar sync is **enabled**, these operations trigger automatic calendar sync:

### Creating a Deadline

```http
POST /api/deadlines/create
Content-Type: application/json

{
  "title": "Math Homework",
  "description": "Chapter 5 problems",
  "date": "2026-01-25T18:00:00Z",
  "priority": "high",
  "estimated_hours": 2,
  "course": "Mathematics 201"
}
```

**Automatic Action:** Creates a Google Calendar event

**Calendar Event Details:**

- Title: "Math Homework"
- Description: "🔴 Priority: HIGH\nCourse: Mathematics 201\n\nChapter 5 problems"
- Start: 2026-01-25T18:00:00Z
- End: 2026-01-25T20:00:00Z (start + estimated_hours)
- Color: Red (high priority)
- Reminders: Email (24h before), Popup (1h before)

---

### Updating a Deadline

```http
PUT /api/deadlines/{deadline_id}
Content-Type: application/json

{
  "title": "Math Homework (Updated)",
  "priority": "medium"
}
```

**Automatic Action:** Updates the corresponding Google Calendar event

---

### Deleting a Deadline

```http
DELETE /api/deadlines/{deadline_id}
```

**Automatic Action:** Deletes the corresponding Google Calendar event

---

### Marking as Complete

```http
PUT /api/deadlines/{deadline_id}
Content-Type: application/json

{
  "completed": true
}
```

**Automatic Action:** Adds "✓" to the calendar event title

---

## 🎨 Calendar Event Format

### Event Title

```
{title}              # Normal
✓ {title}            # Completed
```

### Event Description

```
{priority_emoji} Priority: {PRIORITY}
Course: {course}

{description}
```

Example:

```
🔴 Priority: HIGH
Course: Computer Science 101

Implement a full-stack web application...
```

### Priority Colors

| Priority | Color     | Color ID |
| -------- | --------- | -------- |
| High     | 🔴 Red    | 11       |
| Medium   | 🟡 Yellow | 5        |
| Low      | 🟢 Green  | 2        |

### Reminders

All events include:

- **Email reminder**: 24 hours (1 day) before
- **Popup reminder**: 60 minutes (1 hour) before

---

## 📊 Response Codes

| Code | Description                                              |
| ---- | -------------------------------------------------------- |
| 200  | Success                                                  |
| 201  | Created successfully                                     |
| 204  | Deleted successfully                                     |
| 400  | Bad request (invalid input or calendar sync not enabled) |
| 401  | Unauthorized (invalid or missing token)                  |
| 404  | Resource not found                                       |
| 500  | Internal server error                                    |

---

## 🔍 Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

**Examples:**

```json
{
  "detail": "Calendar sync is not enabled. Enable it first."
}
```

```json
{
  "detail": "Google Calendar API is not set up. Please contact administrator."
}
```

---

## 💡 Usage Examples

### Example 1: Enable Calendar Sync

```bash
# Get current status
curl -X GET "http://localhost:8000/api/users/me/calendar-preferences" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Enable sync
curl -X PUT "http://localhost:8000/api/users/me/calendar-preferences" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"calendar_sync_enabled": true}'

# Sync all existing deadlines
curl -X POST "http://localhost:8000/api/calendar/sync-all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 2: Create Synced Deadline

```bash
# Make sure sync is enabled first
curl -X POST "http://localhost:8000/api/deadlines/create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CS101 Final Project",
    "description": "Complete full-stack application",
    "date": "2026-01-30T23:59:00Z",
    "priority": "high",
    "estimated_hours": 5,
    "course": "Computer Science 101"
  }'

# Deadline is automatically synced to calendar! ✨
```

### Example 3: Import from Calendar

```bash
# Import events from the next 60 days
curl -X POST "http://localhost:8000/api/calendar/import?days_ahead=60" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
# {
#   "message": "Imported 8 events from calendar",
#   "imported_count": 8,
#   "skipped_count": 2,
#   "total_events": 10
# }
```

### Example 4: JavaScript/TypeScript

```typescript
const API_BASE = 'http://localhost:8000/api';
const token = 'YOUR_AUTH_TOKEN';

// Enable calendar sync
async function enableCalendarSync() {
  const response = await fetch(`${API_BASE}/users/me/calendar-preferences`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      calendar_sync_enabled: true,
      calendar_id: 'primary',
    }),
  });

  const data = await response.json();
  console.log(data.message); // "Calendar preferences updated successfully"
}

// Sync all deadlines
async function syncAllDeadlines() {
  const response = await fetch(`${API_BASE}/calendar/sync-all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log(`Synced ${data.synced_count} deadlines!`);
}

// Import from calendar
async function importFromCalendar(days = 30) {
  const response = await fetch(
    `${API_BASE}/calendar/import?days_ahead=${days}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();
  console.log(`Imported ${data.imported_count} events!`);
}
```

---

## 🔒 Security Notes

1. **Token Security**: Always keep your auth token secure
2. **HTTPS**: Use HTTPS in production
3. **Scopes**: Calendar API requires these OAuth scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
4. **Rate Limits**: Google Calendar API has generous limits (unlikely to hit)

---

## 🚦 Rate Limits

Google Calendar API limits:

- **1,000,000 requests/day** (per project)
- **500 requests per 100 seconds** (per user)

RushiGo operations typically use 1-2 requests per action, well under the limits.

---

## 🧪 Testing

```bash
# Test calendar integration
cd backend
python scripts/test_calendar.py

# Check sync status
curl "http://localhost:8000/api/users/me/calendar-preferences" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test complete flow
# 1. Enable sync
# 2. Create deadline
# 3. Check Google Calendar
# 4. Update deadline
# 5. Verify calendar update
```

---

## 📚 Additional Resources

- **Setup Guide**: `CALENDAR_QUICKSTART.md`
- **Complete Documentation**: `GOOGLE_CALENDAR_INTEGRATION.md`
- **Frontend Integration**: `FRONTEND_CALENDAR_INTEGRATION.md`
- **Implementation Details**: `CALENDAR_IMPLEMENTATION.md`

---

## 🆘 Troubleshooting

| Issue                       | Solution                                                                         |
| --------------------------- | -------------------------------------------------------------------------------- |
| "Calendar sync not enabled" | Call `PUT /api/users/me/calendar-preferences` with `calendar_sync_enabled: true` |
| "Calendar API not set up"   | Enable Google Calendar API in Google Cloud Console                               |
| "Unauthorized"              | Check your auth token                                                            |
| Events not appearing        | Verify sync is enabled and check server logs                                     |
| Duplicate events            | Disable sync, delete duplicates, re-enable                                       |

---

**Quick Links:**

- 🚀 [Quick Start Guide](CALENDAR_QUICKSTART.md)
- 🎨 [Frontend Integration](FRONTEND_CALENDAR_INTEGRATION.md)
- 📖 [Complete Guide](GOOGLE_CALENDAR_INTEGRATION.md)
