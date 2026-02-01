#!/usr/bin/env python3
"""
Refresh the Gmail API token
"""
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
import os
import json

def refresh_or_generate_token():
    """
    Refresh the expired Gmail token, or run OAuth flow if token.json is missing.
    """
    SCOPES = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'openid'
    ]
    creds = None
    token_path = 'token.json'
    creds_path = 'credentials_desktop.json'  # Use desktop credentials for local OAuth
    try:
        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
            if creds and creds.expired and creds.refresh_token:
                print('🔄 Token expired, refreshing...')
                creds.refresh(Request())
                with open(token_path, 'w') as token_file:
                    token_file.write(creds.to_json())
                print('✅ Token refreshed successfully!')
                with open(token_path, 'r') as f:
                    token_data = json.load(f)
                    print(f'📅 New expiry: {token_data.get("expiry")}')
                return True
            else:
                print('ℹ️  Token is still valid or cannot be refreshed')
                return False
        else:
            print('⚠️  token.json not found. Running OAuth flow to generate a new token...')
            if not os.path.exists(creds_path):
                print(f'❌ credentials.json not found at {creds_path}. Cannot proceed.')
                return False
            flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
            creds = flow.run_local_server(port=0)
            with open(token_path, 'w') as token_file:
                token_file.write(creds.to_json())
            print('✅ New token.json generated successfully!')
            with open(token_path, 'r') as f:
                token_data = json.load(f)
                print(f'📅 Expiry: {token_data.get("expiry")}')
            return True
    except Exception as e:
        print(f'❌ Error: {e}')
        return False

if __name__ == '__main__':
    refresh_or_generate_token()
