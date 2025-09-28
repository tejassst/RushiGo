#!/usr/bin/env python3
"""
Test database connection script
"""

import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from sqlalchemy import create_engine, text
    from core.config import settings
    
    print("🔌 Testing Database Connection...")
    print(f"Database URL: {settings.DATABASE_URL[:50]}...")
    
    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    
    # Test connection
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version()"))
        version_row = result.fetchone()
        if version_row:
            version = version_row[0]
            print(f"✅ Connection successful!")
            print(f"PostgreSQL version: {version}")
        else:
            print("✅ Connection successful!")
        
        # Test if we can create a simple table
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS connection_test (
                id SERIAL PRIMARY KEY,
                test_message TEXT
            )
        """))
        
        connection.execute(text("""
            INSERT INTO connection_test (test_message) 
            VALUES ('Connection test successful!')
        """))
        
        result = connection.execute(text("SELECT test_message FROM connection_test LIMIT 1"))
        message_row = result.fetchone()
        if message_row:
            message = message_row[0]
            print(f"✅ Database write test: {message}")
        
        # Clean up
        connection.execute(text("DROP TABLE connection_test"))
        connection.commit()
        
        print("\n🎉 Your Supabase database is ready!")
        print("Run: python scripts/init_db.py")
        
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print("\n🔧 Troubleshooting:")
    print("1. Check your DATABASE_URL in .env file")
    print("2. Make sure you replaced [YOUR-PASSWORD] with your actual password")
    print("3. Verify your Supabase project is active")
    print("4. Check if you're using the correct connection pooling URL")
    
    if "password authentication failed" in str(e):
        print("\n🔐 Password Issue:")
        print("- Double-check your database password")
        print("- Reset password in Supabase Dashboard > Settings > Database")
    
    if "could not connect to server" in str(e):
        print("\n🌐 Network Issue:")
        print("- Check your internet connection")
        print("- Verify the Supabase project URL is correct")
        print("- Make sure you're using the pooling connection (port 6543)")
