#!/usr/bin/env python3
"""
Simple Mailgun test script - exact format from Mailgun docs
"""
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def send_simple_message():
    """Send a simple test message using Mailgun"""
    
    api_key = os.getenv('MAILGUN_API_KEY')
    domain = os.getenv('MAILGUN_DOMAIN')
    from_email = os.getenv('FROM_EMAIL')
    
    print(f"🔑 API Key: {api_key[:20]}..." if api_key else "❌ API Key not found!")
    print(f"🌐 Domain: {domain}")
    print(f"📧 From Email: {from_email}")
    print()
    
    url = f"https://api.mailgun.net/v3/{domain}/messages"
    print(f"📡 Request URL: {url}")
    
    return requests.post(
        url,
        auth=("api", api_key),
        data={
            "from": from_email,
            "to": "ttpvt01@gmail.com",  # Your authorized recipient
            "subject": "🎯 RushiGo Email Test - Success!",
            "text": "Testing Mailgun integration! Your RushiGo email notifications are working! 🎉\n\nThis confirms:\n✅ API key is valid\n✅ Domain is configured\n✅ Email sending is functional\n\nYour deadline notification system is ready!",
            "html": """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #4CAF50; text-align: center;">🎯 RushiGo Email Test Success!</h2>
                    
                    <p>Great news! Your Mailgun integration is working perfectly!</p>
                    
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin: 0; color: #2e7d32;">✅ What This Confirms:</h3>
                        <ul style="margin: 10px 0;">
                            <li>API key is valid and authenticated</li>
                            <li>Domain is properly configured</li>
                            <li>Email sending is functional</li>
                            <li>RushiGo notification system is ready!</li>
                        </ul>
                    </div>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <strong>Your deadline notification system is now live! 🚀</strong>
                    </p>
                    
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px; text-align: center;">
                        This email was sent from your RushiGo application using Mailgun
                    </p>
                </div>
            </body>
            </html>
            """
        }
    )

if __name__ == "__main__":
    print("🧪 Testing RushiGo Mailgun Integration...")
    print("=" * 50)
    
    try:
        response = send_simple_message()
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response: {response.text}")
        print()
        
        if response.status_code == 200:
            result = response.json()
            print("🎉 SUCCESS! Email sent successfully!")
            print(f"📧 Message ID: {result.get('id', 'N/A')}")
            print("📬 Check ttpvt01@gmail.com for the test email!")
            print("\n✅ Your RushiGo notification system is ready to use!")
        elif response.status_code == 401:
            print("❌ AUTHENTICATION FAILED!")
            print("🔑 Issue: Invalid API key")
            print("💡 Solution: Double-check your Mailgun Private API key")
        elif response.status_code == 400:
            print("❌ BAD REQUEST!")
            print("📧 Issue: Email configuration problem")
            print("💡 Solution: Add ttpvt01@gmail.com as authorized recipient in Mailgun dashboard")
        else:
            print("❌ FAILED! Unexpected error.")
            
    except Exception as e:
        print(f"❌ Network/Connection Error: {e}")
        print("💡 Check your internet connection and try again.")