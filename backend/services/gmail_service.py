"""
Gmail API Service for sending emails
"""
import os
import base64
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Any
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

# If modifying these scopes, delete the token.json file
SCOPES = ['https://www.googleapis.com/auth/gmail.send']


class GmailService:
    """Service for sending emails via Gmail API"""
    
    def __init__(self, credentials_path: str = "credentials.json", token_path: str = "token.json"):
        """
        Initialize Gmail service
        
        Args:
            credentials_path: Path to OAuth2 credentials file from Google Cloud Console
            token_path: Path where to store/load the authentication token
        """
        self.credentials_path = Path(credentials_path)
        self.token_path = Path(token_path)
        self.service: Optional[Any] = None  # Gmail API service object
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Gmail API using OAuth2"""
        creds = None
        
        # Load token if it exists
        if self.token_path.exists():
            try:
                creds = Credentials.from_authorized_user_file(str(self.token_path), SCOPES)
            except Exception as e:
                logger.warning(f"Failed to load token: {e}")
                creds = None
        
        # If there are no (valid) credentials, let the user log in
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                    logger.info("Refreshed Gmail credentials")
                except Exception as e:
                    logger.warning(f"Failed to refresh credentials: {e}")
                    creds = None
            
            if not creds:
                if not self.credentials_path.exists():
                    raise FileNotFoundError(
                        f"Gmail credentials file not found at {self.credentials_path}. "
                        "Please download OAuth2 credentials from Google Cloud Console."
                    )
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(self.credentials_path), SCOPES
                )
                creds = flow.run_local_server(port=0)
                logger.info("Successfully authenticated with Gmail")
            
            # Save the credentials for the next run
            with open(self.token_path, 'w') as token:
                token.write(creds.to_json())
        
        # Build the service
        try:
            self.service = build('gmail', 'v1', credentials=creds)
            logger.info("Gmail service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to build Gmail service: {e}")
            raise
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        text: str,
        html: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> dict:
        """
        Send an email via Gmail API
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            text: Plain text body
            html: Optional HTML body
            from_email: Optional sender email (defaults to authenticated account)
        
        Returns:
            dict: Response from Gmail API with message details
        
        Raises:
            HttpError: If the API request fails
            RuntimeError: If Gmail service is not initialized
        """
        if self.service is None:
            raise RuntimeError("Gmail service not initialized. Call _authenticate() first.")
        
        try:
            # Create the email message
            if html:
                message = MIMEMultipart('alternative')
                part1 = MIMEText(text, 'plain')
                part2 = MIMEText(html, 'html')
                message.attach(part1)
                message.attach(part2)
            else:
                message = MIMEText(text, 'plain')
            
            message['To'] = to_email
            message['Subject'] = subject
            if from_email:
                message['From'] = from_email
            
            # Encode the message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # Send the message
            sent_message = self.service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            
            logger.info(f"Email sent successfully to {to_email}. Message ID: {sent_message['id']}")
            return sent_message
            
        except HttpError as error:
            logger.error(f"Failed to send email to {to_email}: {error}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error sending email to {to_email}: {e}")
            raise


# Global instance (lazy initialization)
_gmail_service: Optional[GmailService] = None


def get_gmail_service(credentials_path: str = "credentials.json", token_path: str = "token.json") -> GmailService:
    """
    Get or create the global Gmail service instance
    
    Args:
        credentials_path: Path to OAuth2 credentials file
        token_path: Path to token file
    
    Returns:
        GmailService: The global Gmail service instance
    """
    global _gmail_service
    if _gmail_service is None:
        _gmail_service = GmailService(credentials_path, token_path)
    return _gmail_service
