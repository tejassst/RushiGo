#!/usr/bin/env python3
"""
Generate environment variable for Google Calendar credentials (for production deployment)
"""
import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def generate_calendar_env():
    """Read token_calendar.json and output as environment variable"""
    token_path = Path(__file__).parent.parent / "token_calendar.json"
    
    if not token_path.exists():
        print("❌ token_calendar.json not found!")
        print(f"   Looking in: {token_path}")
        print("\n💡 Run the app locally first to generate the token file.")
        sys.exit(1)
    
    try:
        with open(token_path, 'r') as f:
            token_data = json.load(f)
        
        # Minify JSON (remove whitespace) for environment variable
        env_value = json.dumps(token_data, separators=(',', ':'))
        
        print("=" * 80)
        print("📋 CALENDAR CREDENTIALS FOR RENDER ENVIRONMENT")
        print("=" * 80)
        print("\n1️⃣  Go to your Render Dashboard:")
        print("   https://dashboard.render.com")
        print("\n2️⃣  Select your backend service")
        print("\n3️⃣  Go to 'Environment' tab")
        print("\n4️⃣  Add this environment variable:")
        print("\n   Variable Name:")
        print("   CALENDAR_CREDENTIALS_JSON")
        print("\n   Variable Value (copy the entire line below):")
        print("   " + "-" * 76)
        print(f"   {env_value}")
        print("   " + "-" * 76)
        print("\n5️⃣  Save and redeploy your service")
        print("\n" + "=" * 80)
        print("✅ After deploying, calendar sync will work in production!")
        print("=" * 80)
        
        # Also save to a file for easy copying
        env_file = Path(__file__).parent.parent / "calendar_credentials.env"
        with open(env_file, 'w') as f:
            f.write(f"CALENDAR_CREDENTIALS_JSON={env_value}\n")
        
        print(f"\n💾 Also saved to: {env_file}")
        print("   (You can copy from this file if needed)\n")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_calendar_env()
