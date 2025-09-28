# email_utils.py
# Name: Email Utility
# Description: Sends emails using Mailgun API (works with sandbox domain)
# Preconditions:
#   - Environment variables must be set:
#       MAILGUN_DOMAIN, MAILGUN_API_KEY, FROM_EMAIL
#   - Mailgun sandbox domain requires recipients to be verified in Mailgun
# Postconditions:
#   - Email is sent to the specified recipient (if verified)
from dotenv import load_dotenv
load_dotenv()  # loads all vars from .env into os.environ
import os
import requests

MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")  # e.g. sandboxXXX.mailgun.org
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")  # e.g. "Rushigo <no-reply@YOURDOMAIN>"

def send_email(to_email: str, subject: str, text: str, html: str | None = None):
    """Send an email using Mailgun API."""
    if not MAILGUN_DOMAIN or not MAILGUN_API_KEY or not FROM_EMAIL:
        raise ValueError("Missing Mailgun environment variables")

    resp = requests.post(
        f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
        auth=("api", MAILGUN_API_KEY),
        data={
            "from": FROM_EMAIL,
            "to": to_email,
            "subject": subject,
            "text": text,
            **({"html": html} if html else {}),
        },
        timeout=10,
    )

    # Raise error if request failed
    resp.raise_for_status()
    return resp.json()
