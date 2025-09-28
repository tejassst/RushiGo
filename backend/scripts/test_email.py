# scripts/#!/usr/bin/env python3
"""
Test script for Mailgun email notifications
Run this to test if your Mailgun configuration is working
"""

import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from services.email_templates import EmailTemplates
from core.emails_utils import send_email


def test_mailgun_basic():
    """Test basic Mailgun functionality"""
    print("🔧 Testing basic Mailgun email sending...")
    
    try:
        # Test basic email
        send_email(
            to_email="tejast4256@gmail.com",  # Replace with your email
            subject="🧪 RushiGo Test Email",
            text="This is a test email from RushiGo to verify Mailgun is working correctly!"
        )
        print("✅ Basic email sent successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send basic email: {e}")
        return False


def test_deadline_notification():
    """Test deadline notification templates"""
    print("📧 Testing deadline notification templates...")
    
    try:
        templates = EmailTemplates()
        
        # Test approaching deadline
        deadline_date = datetime.now() + timedelta(days=2)
        
        text_body = templates.deadline_approaching_text(
            user_name="Test User",
            deadline_title="Complete Python Assignment",
            deadline_date=deadline_date,
            days_left=2,
            course="Computer Science 101"
        )
        
        html_body = templates.deadline_approaching_html(
            user_name="Test User", 
            deadline_title="Complete Python Assignment",
            deadline_date=deadline_date,
            days_left=2,
            course="Computer Science 101"
        )
        
        # Send test notification
        send_email(
            to_email="tejast4256@gmail.com",  # Replace with your email
            subject="⏰ Test Deadline Notification",
            text=text_body,
            html=html_body
        )
        
        print("✅ Deadline notification sent successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send deadline notification: {e}")
        return False


def test_daily_digest():
    """Test daily digest template"""
    print("📊 Testing daily digest template...")
    
    try:
        templates = EmailTemplates()
        
        # Create test data
        upcoming_deadlines = [
            {
                'title': 'Math Homework',
                'date': datetime.now() + timedelta(days=1),
                'course': 'Mathematics'
            },
            {
                'title': 'Science Project',
                'date': datetime.now() + timedelta(days=3),
                'course': 'Physics'
            }
        ]
        
        overdue_deadlines = [
            {
                'title': 'Essay Submission',
                'date': datetime.now() - timedelta(days=2),
                'course': 'English'
            }
        ]
        
        text_body = templates.daily_digest_text(
            user_name="Test User",
            upcoming_deadlines=upcoming_deadlines,
            overdue_deadlines=overdue_deadlines
        )
        
        send_email(
            to_email="tejast4256@gmail.com",  # Replace with your email
            subject="📊 Test Daily Digest",
            text=text_body
        )
        
        print("✅ Daily digest sent successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send daily digest: {e}")
        return False


def main():
    """Run all email tests"""
    print("🚀 Starting RushiGo Email System Tests")
    print("=" * 50)
    
    results = []
    
    # Test basic functionality
    results.append(test_mailgun_basic())
    
    # Test notification templates
    results.append(test_deadline_notification())
    
    # Test daily digest
    results.append(test_daily_digest())
    
    print("\n" + "=" * 50)
    print("📋 Test Results Summary:")
    print(f"✅ Passed: {sum(results)}")
    print(f"❌ Failed: {len(results) - sum(results)}")
    
    if all(results):
        print("\n🎉 All tests passed! Your email system is ready to go!")
        print("\n📝 Next steps:")
        print("1. Check your email inbox for test messages")
        print("2. Add recipient emails to Mailgun authorized list (for sandbox)")
        print("3. Start using the notification system!")
    else:
        print("\n⚠️ Some tests failed. Please check your Mailgun configuration:")
        print("1. Verify MAILGUN_DOMAIN in .env file")
        print("2. Verify MAILGUN_API_KEY in .env file") 
        print("3. Verify FROM_EMAIL in .env file")
        print("4. For sandbox domain, add your email to authorized recipients")


if __name__ == "__main__":
    main()
from dotenv import load_dotenv
load_dotenv()

from core.emails_utils import send_email

if __name__ == "__main__":
    to = "ttpvt01@gmail.com"   # must be authorized in Mailgun sandbox
    subject = "Rushigo Hackathon Demo — Sandbox"
    text = "This is a sandbox test from Rushigo. Demo ready!"
    html = "<p>This is a <strong>sandbox</strong> test from Rushigo. Demo ready!</p>"

    result = send_email(to, subject, text, html)
    print("Mailgun returned:", result)
