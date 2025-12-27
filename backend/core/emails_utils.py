# email_utils.py
# Name: Email Utility
# Description: Sends emails using Gmail API
# Preconditions:
#   - Gmail OAuth2 credentials must be set up (credentials.json)
#   - User must authenticate on first run (creates token.json)
# Postconditions:
#   - Email is sent to the specified recipient via authenticated Gmail account
from dotenv import load_dotenv
load_dotenv()  # loads all vars from .env into os.environ
import os
import logging
from typing import Optional

from services.gmail_service import get_gmail_service

logger = logging.getLogger(__name__)

# Optional: Set a default FROM_EMAIL for display name
FROM_EMAIL = os.getenv("FROM_EMAIL", "RushiGo Notifications")

def send_email(to_email: str, subject: str, text: str, html: Optional[str] = None):
    """
    Send an email using Gmail API.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        text: Plain text body
        html: Optional HTML body
    
    Returns:
        dict: Response from Gmail API with message details
    
    Raises:
        Exception: If email sending fails
    """
    try:
        gmail_service = get_gmail_service()
        result = gmail_service.send_email(
            to_email=to_email,
            subject=subject,
            text=text,
            html=html,
            from_email=FROM_EMAIL
        )
        logger.info(f"Email sent to {to_email}: {subject}")
        return result
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        raise
