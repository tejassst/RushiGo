"""
Google Calendar API Service for syncing deadlines
"""
import os
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

# Scopes: Read and write calendar events
SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
]


class CalendarService:
    """Service for managing Google Calendar events"""
    
    def __init__(self, credentials_path: str = "credentials.json", token_path: str = "token.json"):
        """
        Initialize Calendar service
        
        Args:
            credentials_path: Path to OAuth2 credentials file
            token_path: Path where to store/load the authentication token
        """
        self.credentials_path = Path(credentials_path.strip())
        self.token_path = Path(token_path.strip())
        self.service: Any = None  # Will be set in _authenticate
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Google Calendar API using OAuth2"""
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
                    logger.info("Refreshed Calendar credentials")
                    try:
                        with open(self.token_path, 'w') as token:
                            token.write(creds.to_json())
                        logger.info("Saved refreshed token")
                    except (OSError, IOError) as e:
                        logger.warning(f"Could not save refreshed token: {e}")
                except Exception as e:
                    logger.error(f"Failed to refresh credentials: {e}")
                    raise RuntimeError(f"Calendar token expired and refresh failed: {e}")
            
            if not creds or not creds.valid:
                if not self.credentials_path.exists():
                    raise FileNotFoundError(
                        f"Calendar credentials file not found at {self.credentials_path}. "
                        "Please use the same credentials.json from Gmail setup."
                    )
                
                # Run local OAuth flow
                try:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        str(self.credentials_path), SCOPES
                    )
                    creds = flow.run_local_server(port=0)
                    
                    # Save the credentials for next run
                    with open(self.token_path, 'w') as token:
                        token.write(creds.to_json())
                    logger.info("Created new Calendar token")
                except Exception as e:
                    logger.error(f"Authentication failed: {e}")
                    raise
        
        # Build the service
        try:
            self.service = build('calendar', 'v3', credentials=creds)
            logger.info("Calendar service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to build Calendar service: {e}")
            raise
    
    def create_event(
        self,
        title: str,
        description: str,
        start_datetime: datetime,
        end_datetime: Optional[datetime] = None,
        estimated_hours: Optional[int] = None,
        course: Optional[str] = None,
        priority: str = "medium",
        calendar_id: str = "primary"
    ) -> Dict[str, Any]:
        """
        Create a calendar event for a deadline
        
        Args:
            title: Event title (deadline title)
            description: Event description
            start_datetime: Deadline date/time
            end_datetime: Optional end time (defaults to start_datetime + estimated_hours)
            estimated_hours: Estimated time to complete (used if end_datetime not provided)
            course: Course/subject name
            priority: Priority level (low, medium, high)
            calendar_id: Calendar to create event in (default: primary)
        
        Returns:
            Created event data including event ID
        """
        try:
            # Calculate end time if not provided
            if not end_datetime:
                if estimated_hours and estimated_hours > 0:
                    end_datetime = start_datetime + timedelta(hours=estimated_hours)
                else:
                    # Default: 1 hour duration
                    end_datetime = start_datetime + timedelta(hours=1)
            
            # Build description with course and priority
            full_description = description or ""
            if course:
                full_description = f"Course: {course}\n\n{full_description}"
            if priority:
                priority_emoji = {"low": "🟢", "medium": "🟡", "high": "🔴"}.get(priority, "⚪")
                full_description = f"{priority_emoji} Priority: {priority.upper()}\n{full_description}"
            
            # Create event
            event = {
                'summary': title,
                'description': full_description,
                'start': {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': 'UTC',
                },
                'colorId': self._get_color_for_priority(priority),
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                        {'method': 'popup', 'minutes': 60},  # 1 hour before
                    ],
                },
            }
            
            created_event = self.service.events().insert(
                calendarId=calendar_id,
                body=event
            ).execute()
            
            logger.info(f"Created calendar event: {created_event.get('id')}")
            return created_event
            
        except HttpError as e:
            logger.error(f"Failed to create calendar event: {e}")
            raise
    
    def update_event(
        self,
        event_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        start_datetime: Optional[datetime] = None,
        end_datetime: Optional[datetime] = None,
        estimated_hours: Optional[int] = None,
        course: Optional[str] = None,
        priority: Optional[str] = None,
        completed: Optional[bool] = None,
        calendar_id: str = "primary"
    ) -> Dict[str, Any]:
        """
        Update an existing calendar event
        
        Args:
            event_id: Google Calendar event ID
            title: New title
            description: New description
            start_datetime: New start time
            end_datetime: New end time
            estimated_hours: New estimated hours
            course: New course name
            priority: New priority
            completed: Mark as completed (strikes through title)
            calendar_id: Calendar ID
        
        Returns:
            Updated event data
        """
        try:
            # Get existing event
            event = self.service.events().get(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            
            # Update fields if provided
            if title is not None:
                event['summary'] = f"✓ {title}" if completed else title
            
            if description is not None or course is not None or priority is not None:
                full_description = description or event.get('description', '')
                if course:
                    full_description = f"Course: {course}\n\n{full_description}"
                if priority:
                    priority_emoji = {"low": "🟢", "medium": "🟡", "high": "🔴"}.get(priority, "⚪")
                    full_description = f"{priority_emoji} Priority: {priority.upper()}\n{full_description}"
                event['description'] = full_description
            
            if start_datetime is not None:
                event['start'] = {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': 'UTC',
                }
            
            if end_datetime is not None:
                event['end'] = {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': 'UTC',
                }
            elif estimated_hours is not None and start_datetime is not None:
                event['end'] = {
                    'dateTime': (start_datetime + timedelta(hours=estimated_hours)).isoformat(),
                    'timeZone': 'UTC',
                }
            
            if priority is not None:
                event['colorId'] = self._get_color_for_priority(priority)
            
            # Update the event
            updated_event = self.service.events().update(
                calendarId=calendar_id,
                eventId=event_id,
                body=event
            ).execute()
            
            logger.info(f"Updated calendar event: {event_id}")
            return updated_event
            
        except HttpError as e:
            logger.error(f"Failed to update calendar event: {e}")
            raise
    
    def delete_event(self, event_id: str, calendar_id: str = "primary") -> bool:
        """
        Delete a calendar event
        
        Args:
            event_id: Google Calendar event ID
            calendar_id: Calendar ID
        
        Returns:
            True if successful
        """
        try:
            self.service.events().delete(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            
            logger.info(f"Deleted calendar event: {event_id}")
            return True
            
        except HttpError as e:
            logger.error(f"Failed to delete calendar event: {e}")
            return False
    
    def get_upcoming_events(
        self,
        max_results: int = 100,
        time_min: Optional[datetime] = None,
        time_max: Optional[datetime] = None,
        calendar_id: str = "primary"
    ) -> List[Dict[str, Any]]:
        """
        Get upcoming calendar events
        
        Args:
            max_results: Maximum number of events to return
            time_min: Start time range (default: now)
            time_max: End time range (default: 1 year from now)
            calendar_id: Calendar ID
        
        Returns:
            List of event data
        """
        try:
            if not time_min:
                time_min = datetime.utcnow()
            if not time_max:
                time_max = datetime.utcnow() + timedelta(days=365)
            
            events_result = self.service.events().list(
                calendarId=calendar_id,
                timeMin=time_min.isoformat() + 'Z',
                timeMax=time_max.isoformat() + 'Z',
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            logger.info(f"Retrieved {len(events)} calendar events")
            return events
            
        except HttpError as e:
            logger.error(f"Failed to get calendar events: {e}")
            return []
    
    def _get_color_for_priority(self, priority: str) -> str:
        """
        Get Google Calendar color ID for priority level
        
        Args:
            priority: Priority level (low, medium, high)
        
        Returns:
            Color ID string
        """
        color_map = {
            "low": "2",    # Green
            "medium": "5",  # Yellow
            "high": "11",   # Red
        }
        return color_map.get(priority.lower(), "5")  # Default to yellow


# Global instance (lazy initialization)
_calendar_service: Optional[CalendarService] = None
_calendar_service_paths: Optional[tuple] = None


def get_calendar_service(
    credentials_path: str = "credentials.json",
    token_path: str = "token_calendar.json"
) -> CalendarService:
    """
    Get or create a global CalendarService instance
    
    Args:
        credentials_path: Path to OAuth2 credentials
        token_path: Path to token file (separate from Gmail token)
    
    Returns:
        CalendarService instance
    """
    global _calendar_service, _calendar_service_paths
    
    # Check if we need to create a new instance
    paths = (credentials_path, token_path)
    if _calendar_service is None or _calendar_service_paths != paths:
        _calendar_service = CalendarService(credentials_path, token_path)
        _calendar_service_paths = paths
    
    return _calendar_service
