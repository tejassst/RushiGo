#!/usr/bin/env python3
"""
Refresh the Gmail API token
"""
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import json

def refresh_token():
    """Refresh the expired Gmail token"""
    try:
        # Load the token
        creds = Credentials.from_authorized_user_file('token.json')
        
        # Check if refresh is needed
        if creds and creds.expired and creds.refresh_token:
            print('🔄 Token expired, refreshing...')
            creds.refresh(Request())
            
            # Save the refreshed token
            with open('token.json', 'w') as token_file:
                token_file.write(creds.to_json())
            
            print('✅ Token refreshed successfully!')
            
            # Show new token data
            with open('token.json', 'r') as f:
                token_data = json.load(f)
                print(f'📅 New expiry: {token_data.get("expiry")}')
                
            return True
        else:
            print('ℹ️  Token is still valid or cannot be refreshed')
            return False
            
    except Exception as e:
        print(f'❌ Error refreshing token: {e}')
        return False

if __name__ == '__main__':
    refresh_token()
