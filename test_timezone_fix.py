#!/usr/bin/env python3
"""
Quick test to verify TempScan timezone handling
"""
from datetime import datetime, timedelta, timezone

# Simulate the old (broken) way
old_expires = datetime.utcnow() + timedelta(hours=1)
old_now = datetime.utcnow()
print("OLD (BROKEN) WAY:")
print(f"  expires_at: {old_expires} (type: {type(old_expires)}, tzinfo: {old_expires.tzinfo})")
print(f"  now:        {old_now} (type: {type(old_now)}, tzinfo: {old_now.tzinfo})")
print(f"  Comparison: {old_expires > old_now}")
print()

# Simulate the new (fixed) way
new_expires = datetime.now(timezone.utc) + timedelta(hours=1)
new_now = datetime.now(timezone.utc)
print("NEW (FIXED) WAY:")
print(f"  expires_at: {new_expires} (type: {type(new_expires)}, tzinfo: {new_expires.tzinfo})")
print(f"  now:        {new_now} (type: {type(new_now)}, tzinfo: {new_now.tzinfo})")
print(f"  Comparison: {new_expires > new_now}")
print()

# Show the issue
print("ISSUE:")
print("  SQLAlchemy DateTime(timezone=True) expects timezone-aware datetimes")
print("  datetime.utcnow() returns naive datetime (tzinfo=None)")
print("  This can cause comparison failures or unexpected behavior")
print()
print("SOLUTION:")
print("  Use datetime.now(timezone.utc) which returns timezone-aware datetime")
