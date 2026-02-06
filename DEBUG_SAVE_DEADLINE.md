# Debug Guide: Scanned Deadlines Not Saving

## Issues Fixed

### 1. **Timezone Mismatch (Critical)**

**Problem:** Using `datetime.utcnow()` (naive) with `DateTime(timezone=True)` column
**Solution:** Changed to `datetime.now(timezone.utc)` for timezone-aware comparisons

### 2. **Missing Error Logging**

**Problem:** Frontend catch block didn't log the actual error details
**Solution:** Added detailed console logging to capture:

- Request payload
- Response status
- Response body
- Error details

### 3. **Backend Logging Enhancement**

**Problem:** Couldn't trace the save flow in backend
**Solution:** Added comprehensive logging at each step

## How to Debug

### Step 1: Check Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Upload a document and wait for scan to complete
4. Click "Save" on a deadline
5. Look for these logs:

```javascript
Saving deadline with data: {
  temp_id: "...",
  selected_keys: ["..."],
  deadline: {...}
}
Response status: 200  // or error code
Response body: {...}  // or error message
```

### Step 2: Check Backend Logs

Look for these log entries:

```
INFO:routers.deadline:Save scanned request - temp_id: ..., selected_keys: [...], user_id: ...
INFO:routers.deadline:All deadlines from temp_scan: [...]
INFO:routers.deadline:Deadlines to save: [...]
INFO:routers.deadline:Successfully saved deadline: ...
INFO:routers.deadline:Save complete - saved X out of Y deadlines
```

### Step 3: Common Issues & Solutions

#### Issue A: "Session expired or not found"

**Symptoms:** 404 error when saving
**Possible Causes:**

1. Timezone mismatch (FIXED ✅)
2. Scan session actually expired (>1 hour old)
3. temp_id mismatch between frontend and backend

**Debug:**

```sql
-- Check if temp_scan exists in database
SELECT * FROM temp_scans WHERE temp_id = 'YOUR_TEMP_ID';
-- Check expiry time
SELECT temp_id, expires_at, NOW() as current_time FROM temp_scans;
```

#### Issue B: "Failed to save deadline" (500 error)

**Symptoms:** Backend error during save
**Possible Causes:**

1. Invalid date format in JSON
2. Missing required fields (title, course, etc.)
3. Database constraint violation

**Debug:**
Check backend logs for full stack trace:

```
ERROR:routers.deadline:Failed to save deadline: <detailed error>
```

#### Issue C: Save succeeds but count is 0

**Symptoms:** Response shows `{"status": "saved", "count": 0}`
**Possible Causes:**

1. \_tempKey mismatch (frontend key doesn't match backend key)
2. selected_keys array is empty or wrong format

**Debug:**
Compare frontend console and backend logs:

```javascript
// Frontend sends:
selected_keys: ["abc-123"]

// Backend receives:
INFO:routers.deadline:Deadlines to save: []  // Empty!
```

#### Issue D: CORS or Authentication Error

**Symptoms:** Network error, 401/403 status
**Possible Causes:**

1. Missing or expired access token
2. CORS headers not set

**Debug:**

1. Check localStorage: `localStorage.getItem("access_token")`
2. Check Network tab > Headers > Authorization header
3. Check response headers for CORS

## Testing Script

Use this to test the save endpoint directly:

```bash
# 1. Get your access token
TOKEN=$(cat ~/.rushigo_token)  # or from localStorage

# 2. Use the test script
./test_save_deadline.sh <TEMP_ID> <TEMP_KEY> $TOKEN
```

Example:

```bash
./test_save_deadline.sh "38568ef2-d78f-4a79-9ab3-625fdd3017ad" "8e237ba9-e926-4b1a-8648-e344328d8f57" "eyJ..."
```

## Expected Flow

### 1. Scan Document ✅

```
POST /api/deadlines/scan-document
↓
Extract text from PDF
↓
Gemini extracts deadlines
↓
Generate _tempKey for each deadline
↓
Store in TempScan table with temp_id
↓
Return {temp_id, deadlines[]}
```

### 2. Save Deadline ✅

```
POST /api/deadlines/save-scanned
Body: {temp_id, selected_keys}
↓
Query TempScan (temp_id + user_id + not expired)
↓
Parse deadlines_json
↓
Filter by selected_keys
↓
Create Deadline records
↓
Return {status, count, deadlines}
```

## Quick Verification

Run these checks:

1. **Frontend sending correct data?**

   ```javascript
   // Should see in console:
   temp_id: 'uuid-here';
   selected_keys: ['uuid-here'];
   ```

2. **Backend receiving data?**

   ```
   INFO:routers.deadline:Save scanned request - temp_id: uuid-here, selected_keys: ['uuid-here']
   ```

3. **TempScan found in database?**

   ```
   INFO:routers.deadline:All deadlines from temp_scan: [{...}, {...}]
   ```

4. **Deadlines filtered correctly?**

   ```
   INFO:routers.deadline:Deadlines to save: [{...}]  // Should have 1 item
   ```

5. **Saved successfully?**
   ```
   INFO:routers.deadline:Successfully saved deadline: 123
   ```

## Next Steps

After applying the fixes:

1. **Restart backend server** to load new code
2. **Hard refresh frontend** (Ctrl+Shift+R) to clear cache
3. **Upload a new document** to get a fresh temp_id
4. **Try saving** and check logs

If still not working, share:

- Frontend console output (all of it)
- Backend logs (from upload to save attempt)
- Browser Network tab (request/response for save-scanned)
