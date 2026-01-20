#!/usr/bin/env python3
"""
Quick script to enable calendar sync for a user.
This updates the database directly.
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from db.database import engine

def enable_calendar_sync(email: str):
    """Enable calendar sync for a specific user"""
    print(f"🔄 Enabling calendar sync for: {email}")
    
    with engine.connect() as conn:
        # Check if user exists
        result = conn.execute(
            text("SELECT id, email, calendar_sync_enabled FROM users WHERE email = :email"),
            {"email": email}
        )
        user = result.fetchone()
        
        if not user:
            print(f"❌ User not found: {email}")
            return False
        
        user_id, user_email, current_status = user
        print(f"📧 Found user: {user_email} (ID: {user_id})")
        print(f"📊 Current calendar sync status: {current_status}")
        
        if current_status:
            print("✅ Calendar sync is already enabled!")
            return True
        
        # Enable calendar sync
        conn.execute(
            text("UPDATE users SET calendar_sync_enabled = TRUE WHERE id = :user_id"),
            {"user_id": user_id}
        )
        conn.commit()
        
        print("✅ Calendar sync ENABLED!")
        print("\n🎉 Next: Create a deadline in RushiGo and it will appear in Google Calendar!")
        return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python enable_calendar_sync.py user@example.com")
        sys.exit(1)
    
    email = sys.argv[1]
    enable_calendar_sync(email)
