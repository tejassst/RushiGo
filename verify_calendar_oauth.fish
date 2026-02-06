#!/usr/bin/env fish

# Calendar OAuth Fix Verification Script

echo "🔍 Checking Calendar OAuth Configuration..."
echo ""

# Check production
echo "📡 PRODUCTION Backend:"
set prod_response (curl -s https://rushigo-backend-517835372372.us-central1.run.app/api/calendar/debug-env)
echo $prod_response | jq '.'
echo ""

set redirect_uri (echo $prod_response | jq -r '.redirect_uri')
echo "✅ Add this EXACT URI to Google Cloud Console:"
echo "   $redirect_uri"
echo ""

# Check if localhost is running
echo "💻 LOCAL Backend (if running):"
set local_response (curl -s http://localhost:8000/api/calendar/debug-env 2>/dev/null)
if test $status -eq 0
    echo $local_response | jq '.'
    set local_redirect_uri (echo $local_response | jq -r '.redirect_uri')
    echo ""
    echo "✅ For local development, also add:"
    echo "   $local_redirect_uri"
else
    echo "   ⚠️  Local backend not running"
end
echo ""

echo "📋 Google Cloud Console Steps:"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Click on your OAuth 2.0 Client ID"
echo "3. Under 'Authorized redirect URIs', click 'ADD URI'"
echo "4. Add: $redirect_uri"
echo "5. Click 'SAVE'"
echo "6. Wait 5-10 minutes for changes to propagate"
echo "7. Try calendar connection again (use Incognito mode)"
echo ""
