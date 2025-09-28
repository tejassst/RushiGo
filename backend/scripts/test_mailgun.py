#!/usr/bin/env python3
"""
Test script to verify Mailgun email configuration
"""
import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_mailgun_api():
    """Test Mailgun API with current configuration"""
    
    # Get configuration from environment
    api_key = os.getenv('MAILGUN_API_KEY')
    domain = os.getenv('MAILGUN_DOMAIN')
    from_email = os.getenv('FROM_EMAIL')
    
    print("=== Mailgun Configuration Test ===")
    print(f"API Key: {api_key[:20]}..." if api_key else "API Key: NOT SET")
    print(f"Domain: {domain}")
    print(f"From Email: {from_email}")
    print()
    
    if not all([api_key, domain, from_email]):
        print("❌ Missing required Mailgun configuration!")
        return False
    
    # Test email to authorized recipient
    test_recipient = "ttpvt01@gmail.com"  # Your authorized recipient
    
    url = f"https://api.mailgun.net/v3/{domain}/messages"
    
    print(f"🧪 Testing email to: {test_recipient}")
    print(f"📡 API URL: {url}")
    
    try:
        response = requests.post(
            url,
            auth=("api", api_key),
            data={
                "from": from_email,
                "to": test_recipient,
                "subject": "🎯 RushiGo Email Test - Success!",
                "text": """
Hello!

This is a test email from your RushiGo application.

If you're reading this, your Mailgun integration is working perfectly! 🎉

Key Details:
- Domain: sandbox920c0c8a6b6d49f493bc00545ef37db7.mailgun.org  
- API: Mailgun REST API
- Application: RushiGo Deadline Notifications

Your deadline notification system is ready to keep you on track with your goals!

Best regards,
The RushiGo Team
                """.strip(),
                "html": """
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4CAF50;">🎯 RushiGo Email Test - Success!</h2>
        
        <p>Hello!</p>
        
        <p>This is a test email from your <strong>RushiGo</strong> application.</p>
        
        <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>✅ If you're reading this, your Mailgun integration is working perfectly! 🎉</strong></p>
        </div>
        
        <h3>Key Details:</h3>
        <ul>
            <li><strong>Domain:</strong> sandbox920c0c8a6b6d49f493bc00545ef37db7.mailgun.org</li>
            <li><strong>API:</strong> Mailgun REST API</li>
            <li><strong>Application:</strong> RushiGo Deadline Notifications</li>
        </ul>
        
        <p>Your deadline notification system is ready to keep you on track with your goals!</p>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>The RushiGo Team</strong>
        </p>
    </div>
</body>
</html>
                """.strip()
            },
            timeout=10
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS! Email sent successfully!")
            print(f"📧 Message ID: {result.get('id', 'N/A')}")
            print(f"📬 Check {test_recipient} for the test email!")
            return True
        else:
            print(f"❌ FAILED! Status: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
            if response.status_code == 401:
                print("\n🔑 API Key Issue:")
                print("- Check if your API key is correct")
                print("- Make sure you're using the Private API key (not Public)")
                print("- Verify the key has the correct permissions")
            elif response.status_code == 400:
                print(f"\n📧 Email Issue:")
                print(f"- Make sure {test_recipient} is added as an authorized recipient")
                print("- Check your Mailgun dashboard > Sending > Authorized Recipients")
            
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

def suggest_fixes():
    """Suggest potential fixes for common issues"""
    print("\n🔧 Troubleshooting Tips:")
    print()
    print("1. **API Key Issues:**")
    print("   - Go to Mailgun Dashboard > Settings > API Keys")
    print("   - Use the 'Private API key' (starts with 'key-')")
    print("   - Copy the full key including the prefix")
    print()
    print("2. **Recipient Issues:**") 
    print("   - Add ttpvt01@gmail.com to Authorized Recipients")
    print("   - Go to Mailgun Dashboard > Sending > Authorized Recipients")
    print("   - Click 'Authorize' and verify the email")
    print()
    print("3. **Domain Issues:**")
    print("   - Make sure you're using the sandbox domain correctly")
    print("   - Domain: sandbox920c0c8a6b6d49f493bc00545ef37db7.mailgun.org")
    print()
    print("4. **Environment Issues:**")
    print("   - Restart your application after changing .env")
    print("   - Make sure .env is in the correct directory")

if __name__ == "__main__":
    print("🚀 Starting Mailgun Configuration Test...")
    print()
    
    success = test_mailgun_api()
    
    if not success:
        suggest_fixes()
        sys.exit(1)
    else:
        print("\n🎉 Mailgun is configured correctly!")
        print("✅ Your RushiGo email notifications are ready to work!")
        sys.exit(0)