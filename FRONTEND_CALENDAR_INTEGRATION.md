# 🎨 Frontend Integration Guide - Google Calendar Sync

This guide shows you how to add Google Calendar integration UI to your RushiGo frontend.

---

## 📋 Overview

Users should be able to:

1. ✅ **Toggle calendar sync** on/off in their settings
2. 📊 **View sync status** (enabled/disabled)
3. 🔄 **Sync all existing deadlines** to calendar
4. 📥 **Import events from calendar** as deadlines
5. 👀 **See visual indicators** that deadlines are synced

---

## 🎯 User Settings Page

### Option 1: Simple Toggle

Add this to your user settings/profile page:

```tsx
// src/components/CalendarSyncToggle.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Your auth context

interface CalendarPreferences {
  calendar_sync_enabled: boolean;
  calendar_id: string;
  message?: string;
}

export function CalendarSyncToggle() {
  const { token } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current preferences
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/users/me/calendar-preferences', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: CalendarPreferences = await response.json();
        setIsEnabled(data.calendar_sync_enabled);
      }
    } catch (err) {
      console.error('Failed to fetch calendar preferences:', err);
    }
  };

  const toggleSync = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/me/calendar-preferences', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calendar_sync_enabled: !isEnabled,
          calendar_id: 'primary',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsEnabled(data.calendar_sync_enabled);

        // Show success message
        alert(data.message);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update preferences');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Failed to toggle calendar sync:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="calendar-sync-setting">
      <div className="setting-header">
        <h3>📅 Google Calendar Integration</h3>
        <p className="setting-description">
          Automatically sync your deadlines with Google Calendar
        </p>
      </div>

      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={toggleSync}
          disabled={isLoading}
        />
        <span className="toggle-slider"></span>
        <span className="toggle-label">
          {isEnabled ? '✅ Sync Enabled' : '⭕ Sync Disabled'}
        </span>
      </label>

      {error && <div className="error-message">⚠️ {error}</div>}

      {isEnabled && (
        <div className="sync-info">
          <p>✨ Your deadlines will automatically appear in Google Calendar!</p>
        </div>
      )}
    </div>
  );
}
```

### CSS for Toggle Switch

```css
/* src/components/CalendarSyncToggle.css */
.calendar-sync-setting {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.setting-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.setting-description {
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.toggle-switch {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.toggle-switch input[type='checkbox'] {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 50px;
  height: 26px;
  background: #ccc;
  border-radius: 26px;
  transition: background 0.3s;
  margin-right: 12px;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-switch input[type='checkbox']:checked + .toggle-slider {
  background: #4caf50;
}

.toggle-switch input[type='checkbox']:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-switch input[type='checkbox']:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-label {
  font-weight: 500;
  font-size: 14px;
}

.error-message {
  margin-top: 12px;
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 14px;
}

.sync-info {
  margin-top: 12px;
  padding: 12px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 6px;
  font-size: 14px;
}
```

---

## 🔄 Sync All Button

Add a button to sync all existing deadlines:

```tsx
// src/components/SyncAllButton.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function SyncAllButton() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const syncAll = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/calendar/sync-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Synced ${data.synced_count} deadlines to calendar!`);
      } else {
        const error = await response.json();
        setResult(`❌ ${error.detail}`);
      }
    } catch (err) {
      setResult('❌ Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sync-all-section">
      <button onClick={syncAll} disabled={isLoading} className="btn-sync-all">
        {isLoading ? <>🔄 Syncing...</> : <>🔄 Sync All to Calendar</>}
      </button>

      {result && (
        <div
          className={`result-message ${result.includes('✅') ? 'success' : 'error'}`}
        >
          {result}
        </div>
      )}

      <p className="hint-text">
        This will create calendar events for all your unsynced deadlines
      </p>
    </div>
  );
}
```

---

## 📥 Import from Calendar Button

Allow users to import their calendar events:

```tsx
// src/components/ImportFromCalendarButton.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function ImportFromCalendarButton({
  onImportComplete,
}: {
  onImportComplete?: () => void;
}) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [daysAhead, setDaysAhead] = useState(30);
  const [result, setResult] = useState<string | null>(null);

  const importEvents = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/calendar/import?days_ahead=${daysAhead}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Imported ${data.imported_count} events from calendar!`);

        // Refresh deadlines list
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        const error = await response.json();
        setResult(`❌ ${error.detail}`);
      }
    } catch (err) {
      setResult('❌ Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="import-section">
      <div className="import-controls">
        <label>
          Import events from the next
          <input
            type="number"
            value={daysAhead}
            onChange={(e) => setDaysAhead(Number(e.target.value))}
            min="1"
            max="365"
            className="days-input"
          />
          days
        </label>

        <button
          onClick={importEvents}
          disabled={isLoading}
          className="btn-import"
        >
          {isLoading ? <>📥 Importing...</> : <>📥 Import from Calendar</>}
        </button>
      </div>

      {result && (
        <div
          className={`result-message ${result.includes('✅') ? 'success' : 'error'}`}
        >
          {result}
        </div>
      )}

      <p className="hint-text">
        This will create RushiGo deadlines from your Google Calendar events
      </p>
    </div>
  );
}
```

---

## 🎨 Complete Settings Page

Put it all together:

```tsx
// src/pages/Settings.tsx
import { CalendarSyncToggle } from '../components/CalendarSyncToggle';
import { SyncAllButton } from '../components/SyncAllButton';
import { ImportFromCalendarButton } from '../components/ImportFromCalendarButton';

export function Settings() {
  const handleImportComplete = () => {
    // Refresh your deadlines list
    window.location.reload(); // Or use your state management
  };

  return (
    <div className="settings-page">
      <h1>⚙️ Settings</h1>

      {/* Calendar Integration Section */}
      <section className="settings-section">
        <h2>📅 Google Calendar Integration</h2>

        {/* Enable/Disable Toggle */}
        <CalendarSyncToggle />

        {/* Sync All Button */}
        <div className="action-card">
          <h3>🔄 Sync Existing Deadlines</h3>
          <p>Create calendar events for deadlines you've already added</p>
          <SyncAllButton />
        </div>

        {/* Import Button */}
        <div className="action-card">
          <h3>📥 Import from Calendar</h3>
          <p>Turn your calendar events into RushiGo deadlines</p>
          <ImportFromCalendarButton onImportComplete={handleImportComplete} />
        </div>
      </section>

      {/* Other settings sections... */}
    </div>
  );
}
```

---

## 👀 Visual Indicators on Deadlines

Show sync status on each deadline:

```tsx
// src/components/DeadlineCard.tsx
interface DeadlineCardProps {
  deadline: {
    id: number;
    title: string;
    date: string;
    calendar_synced: boolean;
    calendar_event_id: string | null;
    // ... other fields
  };
}

export function DeadlineCard({ deadline }: DeadlineCardProps) {
  return (
    <div className="deadline-card">
      <div className="deadline-header">
        <h3>{deadline.title}</h3>
        {deadline.calendar_synced && (
          <span className="calendar-badge" title="Synced with Google Calendar">
            📅✓
          </span>
        )}
      </div>

      {/* Rest of deadline card */}
    </div>
  );
}
```

```css
.calendar-badge {
  background: #4caf50;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: help;
}
```

---

## 🔔 Toast Notifications

Show feedback when calendar operations happen:

```tsx
// src/utils/toast.ts
export const toast = {
  success: (message: string) => {
    // Use your toast library (react-toastify, sonner, etc.)
    console.log('✅', message);
  },
  error: (message: string) => {
    console.error('❌', message);
  },
  info: (message: string) => {
    console.info('ℹ️', message);
  },
};

// In your components:
const toggleSync = async () => {
  // ... toggle logic

  if (response.ok) {
    toast.success(
      'Calendar sync enabled! Your deadlines will now appear in Google Calendar.',
    );
  } else {
    toast.error('Failed to enable calendar sync. Please try again.');
  }
};
```

---

## 📱 Mobile-Friendly Design

Make sure it works on mobile:

```css
/* Responsive styles */
@media (max-width: 768px) {
  .calendar-sync-setting {
    padding: 16px;
  }

  .setting-header h3 {
    font-size: 16px;
  }

  .toggle-label {
    font-size: 13px;
  }

  .action-card {
    padding: 16px;
  }

  .days-input {
    width: 60px;
    margin: 0 8px;
  }

  .btn-sync-all,
  .btn-import {
    width: 100%;
    margin-top: 12px;
  }
}
```

---

## 🎯 Complete Feature List for Frontend

### User Settings Page

- [ ] Calendar sync toggle (enable/disable)
- [ ] Sync status indicator
- [ ] "Sync All" button
- [ ] "Import from Calendar" button
- [ ] Error handling and feedback
- [ ] Loading states

### Deadlines List

- [ ] Visual indicator for synced deadlines (📅✓ badge)
- [ ] Option to unsync individual deadlines
- [ ] Sync status in deadline details

### Optional Enhancements

- [ ] Calendar sync onboarding tutorial
- [ ] Sync history/logs
- [ ] Manual sync button per deadline
- [ ] Calendar preview widget
- [ ] Sync conflict resolution UI

---

## 📊 API Endpoints Summary

```typescript
// Get calendar preferences
GET /api/users/me/calendar-preferences
Response: {
  calendar_sync_enabled: boolean,
  calendar_id: string,
  message: string
}

// Update calendar preferences
PUT /api/users/me/calendar-preferences
Body: {
  calendar_sync_enabled?: boolean,
  calendar_id?: string
}
Response: {
  message: string,
  calendar_sync_enabled: boolean,
  calendar_id: string
}

// Sync all deadlines
POST /api/calendar/sync-all
Response: {
  message: string,
  synced_count: number,
  total_unsynced: number,
  errors?: Array<{deadline_id: number, title: string, error: string}>
}

// Import from calendar
POST /api/calendar/import?days_ahead=30
Response: {
  message: string,
  imported_count: number,
  skipped_count: number,
  total_events: number
}

// Unsync specific deadline
DELETE /api/calendar/unsync/{deadline_id}?delete_from_calendar=false
Response: {
  message: string,
  deleted_from_calendar: boolean
}
```

---

## 🚀 Implementation Checklist

1. **Backend (Already Done! ✅)**
   - [x] Calendar service
   - [x] API endpoints
   - [x] User preferences schema
   - [x] Automatic sync on create/update/delete

2. **Frontend (Your Turn! 📝)**
   - [ ] Add CalendarSyncToggle component
   - [ ] Add SyncAllButton component
   - [ ] Add ImportFromCalendarButton component
   - [ ] Update Settings page
   - [ ] Add sync indicators to deadline cards
   - [ ] Add toast notifications
   - [ ] Test on mobile devices

3. **Testing**
   - [ ] Enable sync and create a deadline
   - [ ] Verify it appears in Google Calendar
   - [ ] Update deadline and check calendar
   - [ ] Delete deadline and verify calendar removal
   - [ ] Test sync-all functionality
   - [ ] Test import functionality
   - [ ] Test disable sync

---

## 💡 User Experience Tips

1. **First-Time Setup**
   - Show a modal/tutorial when user first enables calendar sync
   - Explain what will happen (browser window for auth)
   - Highlight benefits (never miss a deadline!)

2. **Feedback**
   - Always show loading states
   - Provide clear success/error messages
   - Use toast notifications for quick feedback

3. **Visual Indicators**
   - Make it obvious which deadlines are synced
   - Use color coding (green = synced, grey = not synced)
   - Show sync timestamp ("Last synced 5 mins ago")

4. **Help & Support**
   - Add a "Learn More" link to documentation
   - Include troubleshooting tips in UI
   - Provide clear error messages with solutions

---

## 🎨 Example Full Settings Component

```tsx
// src/components/CalendarSettings.tsx
import React, { useState, useEffect } from 'react';
import './CalendarSettings.css';

export function CalendarSettings() {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const response = await fetch('/api/users/me/calendar-preferences', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    setSyncEnabled(data.calendar_sync_enabled);
  };

  const toggleSync = async () => {
    setLoading(true);
    const response = await fetch('/api/users/me/calendar-preferences', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ calendar_sync_enabled: !syncEnabled }),
    });

    if (response.ok) {
      const data = await response.json();
      setSyncEnabled(data.calendar_sync_enabled);
    }
    setLoading(false);
  };

  return (
    <div className="calendar-settings-card">
      <div className="card-icon">📅</div>
      <h2>Google Calendar Sync</h2>
      <p className="description">
        Automatically sync your deadlines with Google Calendar to see them
        everywhere
      </p>

      <button
        onClick={toggleSync}
        disabled={loading}
        className={`sync-button ${syncEnabled ? 'enabled' : 'disabled'}`}
      >
        {loading
          ? '⏳ Updating...'
          : syncEnabled
            ? '✅ Sync Enabled'
            : '⭕ Enable Sync'}
      </button>

      {syncEnabled && (
        <div className="sync-actions">
          <p className="success-message">
            ✨ Your deadlines are synced with Google Calendar!
          </p>
          <div className="action-buttons">
            <button className="btn-secondary">🔄 Sync All</button>
            <button className="btn-secondary">📥 Import</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

**Ready to implement! 🚀**

Use these components as templates and customize them to match your app's design system.
