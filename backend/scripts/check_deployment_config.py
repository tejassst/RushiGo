#!/usr/bin/env python3
"""
Environment Configuration Checker for RushiGo Backend
Validates all required environment variables before deployment
"""
import os
import sys
from pathlib import Path

def check_env_var(var_name: str, required: bool = True) -> bool:
    """Check if an environment variable is set"""
    value = os.getenv(var_name)
    
    if not value:
        if required:
            print(f"❌ MISSING (Required): {var_name}")
            return False
        else:
            print(f"⚠️  OPTIONAL (Not Set): {var_name}")
            return True
    else:
        # Mask sensitive values
        if any(keyword in var_name.upper() for keyword in ['KEY', 'SECRET', 'PASSWORD', 'TOKEN']):
            display_value = value[:8] + "..." if len(value) > 8 else "***"
        else:
            display_value = value
        print(f"✅ {var_name}={display_value}")
        return True

def check_file_exists(file_path: str) -> bool:
    """Check if a required file exists"""
    if Path(file_path).exists():
        print(f"✅ File exists: {file_path}")
        return True
    else:
        print(f"❌ File missing: {file_path}")
        return False

def main():
    print("=" * 60)
    print("🔍 RushiGo Backend Environment Configuration Check")
    print("=" * 60)
    print()
    
    all_checks_passed = True
    
    # Required environment variables
    print("📋 Checking Required Environment Variables...")
    print("-" * 60)
    
    required_vars = [
        "DATABASE_URL",
        "GEMINI_API_KEY",
    ]
    
    for var in required_vars:
        if not check_env_var(var, required=True):
            all_checks_passed = False
    
    print()
    
    # Optional but recommended environment variables
    print("📋 Checking Optional Environment Variables...")
    print("-" * 60)
    
    optional_vars = [
        "ALLOWED_ORIGINS",
        "DEBUG",
        "FROM_EMAIL",
        "GMAIL_CREDENTIALS_PATH",
        "GMAIL_TOKEN_PATH",
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY",
    ]
    
    for var in optional_vars:
        check_env_var(var, required=False)
    
    print()
    
    # Check for required files (Gmail API)
    print("📄 Checking Required Files...")
    print("-" * 60)
    
    gmail_creds_path = os.getenv("GMAIL_CREDENTIALS_PATH", "credentials.json")
    gmail_token_path = os.getenv("GMAIL_TOKEN_PATH", "token.json")
    
    if not check_file_exists(gmail_creds_path):
        print(f"   → Run Gmail setup: python scripts/test_gmail.py")
        all_checks_passed = False
    
    if not check_file_exists(gmail_token_path):
        print(f"   → Authenticate Gmail: python scripts/test_gmail.py")
        all_checks_passed = False
    
    print()
    
    # Database URL validation
    print("🗄️  Validating Database Configuration...")
    print("-" * 60)
    
    db_url = os.getenv("DATABASE_URL", "")
    if db_url:
        if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
            print("✅ Using PostgreSQL database")
        elif db_url.startswith("sqlite:///"):
            print("⚠️  Using SQLite (not recommended for production)")
        else:
            print("❌ Invalid DATABASE_URL format")
            all_checks_passed = False
    
    print()
    
    # CORS validation
    print("🌐 Validating CORS Configuration...")
    print("-" * 60)
    
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
    if allowed_origins:
        if allowed_origins == "*":
            print("⚠️  CORS set to '*' (allow all origins)")
            print("   → This is fine for development but should be restricted in production")
        else:
            origins = [o.strip() for o in allowed_origins.split(",")]
            print(f"✅ CORS configured for {len(origins)} origin(s):")
            for origin in origins:
                print(f"   - {origin}")
    else:
        print("⚠️  CORS not configured (will use defaults)")
    
    print()
    print("=" * 60)
    
    if all_checks_passed:
        print("✅ All checks passed! Your environment is configured correctly.")
        print("🚀 Ready to deploy!")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above before deploying.")
        print()
        print("💡 Tips:")
        print("   1. Copy .env.example to .env: cp .env.example .env")
        print("   2. Fill in all required values in .env")
        print("   3. Set up Gmail API credentials (see GMAIL_SETUP.md)")
        print("   4. Run this script again to verify")
        return 1

if __name__ == "__main__":
    # Load .env file if it exists
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        print("⚠️  python-dotenv not installed, reading from system environment only")
        print()
    
    sys.exit(main())
