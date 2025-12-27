#!/usr/bin/env python3
"""
Simple test script for Gmail API integration
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.gmail_service import get_gmail_service


def test_gmail():
    """Test Gmail API email sending"""
    print("🧪 Testing Gmail API integration...")
    print("=" * 50)
    
    # Get the Gmail service
    try:
        print("\n1️⃣  Initializing Gmail service...")
        gmail = get_gmail_service()
        print("✅ Gmail service initialized successfully!")
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print("\n📝 Please follow these steps:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Enable Gmail API")
        print("3. Create OAuth2 credentials (Desktop app)")
        print("4. Download credentials.json to the backend/ directory")
        print("\nSee GMAIL_SETUP.md for detailed instructions.")
        return
    except Exception as e:
        print(f"❌ Error initializing Gmail service: {e}")
        return
    
    # Get recipient email
    print("\n2️⃣  Enter test email recipient:")
    to_email = input("   Email address: ").strip()
    
    if not to_email:
        print("❌ No email provided. Exiting.")
        return
    
    # Send test email
    try:
        print(f"\n3️⃣  Sending test email to {to_email}...")
        result = gmail.send_email(
            to_email=to_email,
            subject="🎉 RushiGo Gmail API Test",
            text="Hello! This is a test email from RushiGo.\n\nIf you're seeing this, the Gmail API integration is working correctly!",
            html="""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #4CAF50;">🎉 Success!</h1>
                    <p>Hello! This is a test email from <strong>RushiGo</strong>.</p>
                    <p>If you're seeing this, the Gmail API integration is working correctly!</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 14px;">
                        This is a test of the deadline notification system.
                    </p>
                </body>
            </html>
            """
        )
        
        print(f"✅ Email sent successfully!")
        print(f"   Message ID: {result['id']}")
        print(f"   Thread ID: {result['threadId']}")
        print(f"\n📬 Check {to_email} for the test email!")
        
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return
    
    print("\n" + "=" * 50)
    print("✅ Gmail API test completed successfully!")
    print("\nYou can now use Gmail to send deadline notifications.")


if __name__ == "__main__":
    test_gmail()
