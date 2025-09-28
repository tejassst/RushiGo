# scripts/test_email.py
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
