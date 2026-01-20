#!/usr/bin/env python3
"""
Database migration: Add per-user OAuth token fields for Google Calendar
"""
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text, inspect
from db.database import engine


def check_column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def migrate_user_calendar_tokens():
    """Add per-user calendar OAuth token fields"""
    print("🔄 Adding per-user calendar OAuth token fields...")
    print("=" * 70)
    
    with engine.connect() as conn:
        print("\n📊 Checking 'users' table...")
        
        # Add calendar_token column
        if not check_column_exists('users', 'calendar_token'):
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN calendar_token TEXT
            """))
            print("   ✅ Added 'calendar_token' column (TEXT)")
        else:
            print("   ⏭️  'calendar_token' column already exists")
        
        # Add calendar_refresh_token column
        if not check_column_exists('users', 'calendar_refresh_token'):
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN calendar_refresh_token VARCHAR(512)
            """))
            print("   ✅ Added 'calendar_refresh_token' column (VARCHAR)")
        else:
            print("   ⏭️  'calendar_refresh_token' column already exists")
        
        # Add calendar_token_expiry column
        if not check_column_exists('users', 'calendar_token_expiry'):
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN calendar_token_expiry TIMESTAMP WITH TIME ZONE
            """))
            print("   ✅ Added 'calendar_token_expiry' column (TIMESTAMP)")
        else:
            print("   ⏭️  'calendar_token_expiry' column already exists")
        
        conn.commit()
    
    print("\n" + "=" * 70)
    print("✅ Migration completed successfully!")
    print("\n📝 New columns added to 'users' table:")
    print("   - calendar_token (TEXT) - User's OAuth access token")
    print("   - calendar_refresh_token (VARCHAR) - User's refresh token")
    print("   - calendar_token_expiry (TIMESTAMP) - Token expiration time")
    print("\n🚀 Users can now connect their own Google Calendar!")
    print("=" * 70)


if __name__ == "__main__":
    try:
        migrate_user_calendar_tokens()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
