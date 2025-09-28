#!/usr/bin/env python3
"""
Mailgun configuration debugger and fixer
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_mailgun_auth():
    """Test different Mailgun authentication methods"""
    
    domain = os.getenv('MAILGUN_DOMAIN')
    api_key = os.getenv('MAILGUN_API_KEY')
    
    print("🔧 Mailgun Authentication Debugger")
    print("=" * 50)
    print(f"Domain: {domain}")
    print(f"API Key: {api_key[:20] if api_key else 'None'}... (truncated)")
    
    if not domain or not api_key:
        print("❌ Missing domain or API key in environment variables")
        return False
    
    # Test 1: Check domain status
    print("\n1️⃣ Testing domain access...")
    try:
        resp = requests.get(
            f"https://api.mailgun.net/v3/{domain}",
            auth=("api", api_key),
            timeout=10
        )
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            print("✅ Domain access successful!")
            return True
        elif resp.status_code == 401:
            print("❌ 401 Unauthorized - Invalid API key")
        elif resp.status_code == 404:
            print("❌ 404 Not Found - Domain might not exist or be verified")
        else:
            print(f"❌ Unexpected status: {resp.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    # Test 2: Try to list domains (to see if API key works)
    print("\n2️⃣ Testing API key with domain list...")
    try:
        resp = requests.get(
            "https://api.mailgun.net/v3/domains",
            auth=("api", api_key),
            timeout=10
        )
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            domains = [d['name'] for d in data.get('items', [])]
            print(f"✅ API key works! Available domains: {domains}")
            
            if domain not in domains:
                print(f"⚠️ Your configured domain '{domain}' is not in your account")
                print("Available domains to use:")
                for d in domains:
                    print(f"  - {d}")
            
        elif resp.status_code == 401:
            print("❌ API key is invalid")
        else:
            print(f"❌ Error: {resp.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    return False

def send_test_email():
    """Send a test email with current configuration"""
    
    domain = os.getenv('MAILGUN_DOMAIN')
    api_key = os.getenv('MAILGUN_API_KEY')
    from_email = os.getenv('FROM_EMAIL')
    
    print("\n3️⃣ Attempting to send test email...")
    
    try:
        resp = requests.post(
            f"https://api.mailgun.net/v3/{domain}/messages",
            auth=("api", api_key),
            data={
                "from": from_email,
                "to": "tejast4256@gmail.com",  # Your email
                "subject": "🧪 RushiGo Test Email (Debug Mode)",
                "text": "This is a test email from RushiGo Mailgun debugger. If you receive this, your email configuration is working!"
            },
            timeout=10
        )
        
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            print("✅ Test email sent successfully!")
            print(f"Message ID: {resp.json().get('id')}")
            print("\n📧 Check your inbox (and spam folder) for the test email.")
            return True
        else:
            print(f"❌ Failed to send: {resp.text}")
            
    except Exception as e:
        print(f"❌ Send failed: {e}")
    
    return False

def main():
    print("🚀 RushiGo Mailgun Configuration Debugger")
    print("\n⚠️ Important Notes:")
    print("1. For Mailgun sandbox domains, you must add recipient emails to 'Authorized Recipients'")
    print("2. Go to: https://app.mailgun.com/app/sending/domains")
    print("3. Click on your domain, then 'Settings' -> 'Authorized Recipients'")
    print("4. Add 'tejast4256@gmail.com' to the authorized list")
    
    auth_works = test_mailgun_auth()
    
    if auth_works:
        email_works = send_test_email()
        
        if email_works:
            print("\n🎉 Everything is working! Your email system is ready.")
        else:
            print("\n⚠️ Authentication works but email sending failed.")
            print("Most likely cause: Recipient not in authorized list (for sandbox)")
    else:
        print("\n❌ Authentication issues detected.")
        print("\n🔧 Troubleshooting steps:")
        print("1. Verify your API key from: https://app.mailgun.com/app/account/security/api_keys")
        print("2. Make sure your domain is verified: https://app.mailgun.com/app/sending/domains")
        print("3. For sandbox domains, add recipients to authorized list")

if __name__ == "__main__":
    main()
