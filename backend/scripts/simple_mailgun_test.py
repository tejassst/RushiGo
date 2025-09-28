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
    print(f"Using API Key: {api_key[:20]}..." if api_key else "API Key not found!")
    
    return requests.post(
        "https://api.mailgun.net/v3/sandbox920c0c8a6b6d49f493bc00545ef37db7.mailgun.org/messages",
        auth=("api", api_key),
        data={
            "from": "Rushigo <no-reply@sandbox920c0c8a6b6d49f493bc00545ef37db7.mailgun.org>",
            "to": "ttpvt01@gmail.com",  # Your authorized recipient
            "subject": "Hello from RushiGo!",
            "text": "Testing some Mailgun awesomeness! Your RushiGo email notifications are working! 🎉"
        }
    )

if __name__ == "__main__":
    print("🧪 Sending simple Mailgun test...")
    
    try:
        response = send_simple_message()
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! Check ttpvt01@gmail.com for the test email!")
        else:
            print("❌ FAILED! Check the error above.")
            
    except Exception as e:
        print(f"❌ Error: {e}")