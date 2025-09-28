#!/usr/bin/env python3
"""
Database initialization script for Supabase PostgreSQL
Run this after setting up your Supabase project to create all tables
"""

import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import engine, Base
from models.user import User
from models.deadline import Deadline
from models.team import Team
from models.membership import Membership
from models.notifications import Notification

def init_database():
    """Initialize database with all tables"""
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("\nTables created:")
        print("- users")
        print("- deadlines") 
        print("- teams")
        print("- memberships")
        print("- notifications")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        return False
    return True

if __name__ == "__main__":
    init_database()
