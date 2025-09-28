#!/usr/bin/env python3
"""
Supabase setup helper script
This script helps you configure your Supabase connection
"""

print("🚀 Supabase Setup Helper")
print("=" * 50)

print("\n📋 Your Supabase Project Details:")
print("Project URL: https://opgyxfjpmqcornsfelgb.supabase.co")
print("Project Ref: opgyxfjpmqcornsfelgb")
print("API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ3l4ZmpwbXFjb3Juc2ZlbGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjU3NTYsImV4cCI6MjA3NDY0MTc1Nn0.tKPD21FeGk9lX-J1Xh_R_gKAD_6mO8edgXcvhkwz6b4")

print("\n🔐 To Complete Setup:")
print("1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/opgyxfjpmqcornsfelgb")
print("2. Click 'Settings' > 'Database' in the left sidebar")
print("3. Find the 'Connection string' section")
print("4. Copy the 'Connection pooling' string (it should start with 'postgresql://')")
print("5. Replace the DATABASE_URL in your .env file with that string")

print("\n📝 The connection string should look like:")
print("postgresql://postgres.opgyxfjpmqcornsfelgb:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres")

print("\n⚠️  Important:")
print("- Replace [YOUR-PASSWORD] with the password you set when creating the project")
print("- Use the 'Connection pooling' URL, not the direct connection URL")
print("- The pooling URL uses port 6543, not 5432")

print("\n🧪 After updating your .env file, test the connection:")
print("python scripts/test_connection.py")

print("\n🏗️  Then initialize your database:")
print("python scripts/init_db.py")
