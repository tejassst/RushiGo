#!/bin/bash

# OAuth Debug Test Script
# This script helps diagnose OAuth issues in production

echo "🔍 OAuth Debug Test - RushiGo Calendar"
echo "======================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://rushigo-backend.onrender.com"
API_URL="$BACKEND_URL/api"

echo "📡 Testing Backend Endpoints..."
echo ""

# Test 1: Backend Health
echo -e "${YELLOW}Test 1: Backend Health Check${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ Backend is responding (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Backend not responding (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 2: Calendar Status Endpoint (requires auth)
echo -e "${YELLOW}Test 2: Calendar Status Endpoint${NC}"
echo "URL: $API_URL/calendar/status"
echo "Note: This will fail with 401 if not authenticated - that's expected"
curl -s "$API_URL/calendar/status" | head -20
echo ""
echo ""

# Test 3: Calendar Connect Endpoint (requires auth)
echo -e "${YELLOW}Test 3: Calendar Connect Endpoint${NC}"
echo "URL: $API_URL/calendar/connect"
echo "Note: This should redirect or show 401 error"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "$API_URL/calendar/connect")
echo "HTTP Response Code: $HTTP_CODE"
if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Endpoint requires authentication (expected)${NC}"
elif [ "$HTTP_CODE" = "307" ]; then
    echo -e "${GREEN}✓ Endpoint redirecting (might work with token)${NC}"
else
    echo -e "${YELLOW}⚠ Unexpected response code${NC}"
fi
echo ""

# Test 4: Check if callback endpoint exists
echo -e "${YELLOW}Test 4: Calendar Callback Endpoint${NC}"
echo "URL: $API_URL/calendar/callback"
echo "Testing with no parameters (should redirect to frontend with error)..."
RESPONSE=$(curl -s -L "$API_URL/calendar/callback")
echo "Response preview:"
echo "$RESPONSE" | head -5
echo ""

# Test 5: Check Render Logs (manual)
echo -e "${YELLOW}Test 5: Manual Checks Needed${NC}"
echo ""
echo "You need to manually verify in Render Dashboard:"
echo ""
echo "1. Environment Variables:"
echo "   - Go to: https://dashboard.render.com/"
echo "   - Select: rushigo-backend service"
echo "   - Click: Environment tab"
echo "   - Verify these exist:"
echo "     ✓ BACKEND_URL = https://rushigo-backend.onrender.com"
echo "     ✓ FRONTEND_URL = <your frontend URL>"
echo "     ✓ GOOGLE_CLIENT_ID = 517835372372-..."
echo "     ✓ GOOGLE_CLIENT_SECRET = GOCSPX-..."
echo ""
echo "2. Deployment Status:"
echo "   - Go to: Events tab"
echo "   - Check: Latest deploy succeeded"
echo "   - Verify: Commit SHA is b91932b or later"
echo ""
echo "3. Runtime Logs:"
echo "   - Go to: Logs tab"
echo "   - Try connecting calendar in your app"
echo "   - Look for: 'Generated OAuth URL for user X'"
echo "   - Look for: Any error messages"
echo ""

# Test 6: Google Cloud Console
echo -e "${YELLOW}Test 6: Google Cloud Console Verification${NC}"
echo ""
echo "Verify in Google Cloud Console:"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Click on your OAuth 2.0 Client ID"
echo "3. Under 'Authorized redirect URIs', you should have:"
echo "   ✓ https://rushigo-backend.onrender.com/api/calendar/callback"
echo "   ✓ http://localhost:8000/api/calendar/callback (for local dev)"
echo ""

# Test 7: Frontend Check
echo -e "${YELLOW}Test 7: Frontend Verification${NC}"
echo ""
echo "Open your browser console (F12) on your site and run:"
echo ""
echo "  // Check API URL"
echo "  console.log(import.meta.env.VITE_API_URL);"
echo "  // Should be: https://rushigo-backend.onrender.com/api"
echo ""
echo "  // Check if token exists"
echo "  console.log(localStorage.getItem('access_token'));"
echo "  // Should show a JWT token"
echo ""
echo "  // Check connect URL"
echo "  import { apiClient } from './services/api';"
echo "  console.log(apiClient.getCalendarConnectUrl());"
echo "  // Should include ?token= parameter"
echo ""

# Test 8: Direct OAuth Test
echo -e "${YELLOW}Test 8: OAuth Flow Test${NC}"
echo ""
echo "To test the OAuth flow with your actual token:"
echo ""
echo "1. Open your site in browser"
echo "2. Open Developer Tools (F12)"
echo "3. Go to Application tab → Local Storage"
echo "4. Copy the 'access_token' value"
echo "5. Run this command (replace YOUR_TOKEN):"
echo ""
echo "   curl -L \"$API_URL/calendar/connect?token=YOUR_TOKEN\""
echo ""
echo "   Expected: Should redirect to Google OAuth page"
echo "   Actual error: Look at the response"
echo ""

echo "======================================="
echo -e "${GREEN}Debug script complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Complete manual checks above"
echo "2. Share any error messages you see"
echo "3. Check Render logs while clicking 'Connect Calendar'"
echo ""
