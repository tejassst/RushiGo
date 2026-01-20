# Per-User OAuth Calendar Implementation

## ✅ What Was Done

### 1. Database Schema Updates

- Added 3 new columns to `users` table:
  - `calendar_token` (TEXT) - User's OAuth access token
  - `calendar_refresh_token` (VARCHAR 512) - User's refresh token
  - `calendar_token_expiry` (TIMESTAMP WITH TIME ZONE) - Token expiration time
- Migration completed successfully on local Neon database

### 2. Backend Service Layer

- Created `get_calendar_service_for_user(user)` function in `services/calendar_service.py`
- This function:
  - Extracts user's OAuth tokens from database
  - Creates Google Calendar service authenticated as that user
  - Automatically refreshes expired tokens
  - Saves refreshed tokens back to database
  - Raises `ValueError` if user hasn't connected calendar

### 3. OAuth Endpoints (in `routers/calendar.py`)

- **GET `/api/calendar/connect`** - Initiates OAuth flow
  - Generates Google OAuth URL
  - Includes user ID in state parameter
  - Redirects user to Google consent screen
- **GET `/api/calendar/callback`** - Handles OAuth callback
  - Exchanges authorization code for tokens
  - Stores tokens in user's database record
  - Redirects back to frontend with success message
- **POST `/api/calendar/disconnect`** - Disconnects calendar
  - Clears user's OAuth tokens
  - Disables calendar sync

### 4. Deadline Router Updates

Updated `routers/deadline.py` to use per-user calendar service:

- **Create endpoint** (line 66) - Uses `get_calendar_service_for_user(current_user)`
- **Update endpoint** (line 178) - Uses per-user service
- **Delete endpoint** (line 236) - Uses per-user service
- All endpoints now handle `ValueError` when user hasn't connected calendar

### 5. Git Commit

- Commit: `b00153a` - "Implement per-user OAuth for Google Calendar sync"
- Pushed to GitHub: main branch
- Production deployment will auto-trigger on Render

## 🔄 What Happens Next (Automatic)

1. **Render Auto-Deploy**
   - Render will detect the push to main
   - Will automatically redeploy the backend
   - Migration will run automatically on Render's Neon database
   - New OAuth endpoints will be live

2. **Database Migration on Production**
   - The same 3 columns will be added to production database
   - Existing users won't be affected (columns are nullable)

## ⏳ What Needs to Be Done (Manual)

### Frontend Changes Required

1. **Add "Connect Calendar" Button**
   - Location: User Settings or Calendar Settings page
   - Button should open: `${API_URL}/api/calendar/connect`
   - Use a popup window or redirect

   Example code:

   ```typescript
   const connectCalendar = () => {
     const width = 600;
     const height = 700;
     const left = (window.innerWidth - width) / 2;
     const top = (window.innerHeight - height) / 2;

     window.open(
       `${API_URL}/api/calendar/connect`,
       'Google Calendar OAuth',
       `width=${width},height=${height},left=${left},top=${top}`,
     );
   };
   ```

2. **Show Calendar Connection Status**
   - Check if user has `calendar_token` (via API endpoint)
   - Display "Connected ✓" or "Not Connected" badge
   - Show "Disconnect" button when connected

3. **Handle OAuth Callback**
   - Listen for messages from OAuth popup
   - Refresh user settings after successful connection
   - Show success/error notifications

### Testing Flow

1. **User connects their calendar:**
   - User clicks "Connect Calendar" button
   - Redirected to Google OAuth consent screen
   - User authorizes RushiGo to access their calendar
   - Redirected back to frontend with success message

2. **User creates a deadline:**
   - User creates a new deadline with calendar sync enabled
   - Event is created in **user's own Google Calendar**
   - NOT in RushiGo's shared calendar

3. **User updates/deletes deadline:**
   - Changes are synced to **user's calendar**
   - Event is updated/deleted from their calendar

## 🎯 Current Status

- ✅ Backend OAuth implementation complete
- ✅ Database migration complete (local)
- ✅ Deadline router updated to use per-user service
- ✅ Code pushed to GitHub
- 🔄 Production deployment in progress (Render auto-deploy)
- ⏳ Frontend UI needs to be added
- ⏳ End-to-end testing needed

## 🔍 How to Test (After Frontend is Ready)

1. **Create a test user account**
2. **Click "Connect Calendar" button**
3. **Authorize with your personal Google account**
4. **Enable calendar sync in settings**
5. **Create a deadline**
6. **Check your personal Google Calendar** - event should appear there!
7. **Update the deadline** - event should update in your calendar
8. **Delete the deadline** - event should be removed from your calendar

## 🚨 Important Notes

- Old behavior: All events went to RushiGo's calendar (shared token)
- New behavior: Each user's events go to their own calendar (per-user tokens)
- Users MUST connect their calendar before sync will work
- If user hasn't connected, calendar sync will be silently skipped (logged as warning)
- Tokens are automatically refreshed when expired
- Users can disconnect their calendar anytime via `/api/calendar/disconnect`

## 📝 Environment Variables

Production needs these (should already be set):

- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth client secret
- `FRONTEND_URL` - Frontend URL for OAuth redirect
- `CALENDAR_CREDENTIALS_JSON` - JSON string with credentials (fallback)

## 🎉 Benefits

1. **Privacy** - Each user controls their own calendar
2. **Scalability** - No shared token bottleneck
3. **Security** - Users can revoke access anytime via Google account settings
4. **Flexibility** - Each user can choose which Google account to use
5. **Proper OAuth** - Follows Google's recommended OAuth flow
