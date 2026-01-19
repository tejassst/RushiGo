#!/usr/bin/env python3
"""
Database migration: Add Google Calendar sync columns
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


def add_calendar_columns():
    """Add calendar sync columns to users and deadlines tables"""
    print("🔄 Adding Google Calendar sync columns to database...")
    print("=" * 60)
    
    with engine.connect() as conn:
        # Check and add User columns
        print("\n1️⃣  Updating 'users' table...")
        
        if not check_column_exists('users', 'calendar_sync_enabled'):
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN calendar_sync_enabled BOOLEAN DEFAULT FALSE
            """))
            print("   ✅ Added 'calendar_sync_enabled' column")
        else:
            print("   ⏭️  'calendar_sync_enabled' column already exists")
        
        if not check_column_exists('users', 'calendar_id'):
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN calendar_id VARCHAR(255)
            """))
            print("   ✅ Added 'calendar_id' column")
        else:
            print("   ⏭️  'calendar_id' column already exists")
        
        # Check and add Deadline columns
        print("\n2️⃣  Updating 'deadlines' table...")
        
        if not check_column_exists('deadlines', 'calendar_event_id'):
            conn.execute(text("""
                ALTER TABLE deadlines 
                ADD COLUMN calendar_event_id VARCHAR(255)
            """))
            print("   ✅ Added 'calendar_event_id' column")
        else:
            print("   ⏭️  'calendar_event_id' column already exists")
        
        if not check_column_exists('deadlines', 'calendar_synced'):
            conn.execute(text("""
                ALTER TABLE deadlines 
                ADD COLUMN calendar_synced BOOLEAN DEFAULT FALSE
            """))
            print("   ✅ Added 'calendar_synced' column")
        else:
            print("   ⏭️  'calendar_synced' column already exists")
        
        # Create index for faster lookups
        print("\n3️⃣  Creating indexes...")
        try:
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_calendar_event_id 
                ON deadlines(calendar_event_id)
            """))
            print("   ✅ Created index on 'calendar_event_id'")
        except Exception as e:
            print(f"   ⚠️  Index creation: {e}")
        
        conn.commit()
    
    print("\n" + "=" * 60)
    print("✅ Database migration completed successfully!")
    print("\nNew columns added:")
    print("   users:")
    print("     - calendar_sync_enabled (BOOLEAN)")
    print("     - calendar_id (VARCHAR)")
    print("   deadlines:")
    print("     - calendar_event_id (VARCHAR)")
    print("     - calendar_synced (BOOLEAN)")
    print("\n🚀 Your database is now ready for Google Calendar sync!")


if __name__ == "__main__":
    try:
        add_calendar_columns()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
