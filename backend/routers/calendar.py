"""
Calendar API routes
"""
import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials

from db.database import get_db
from models import User, Deadline
from services.calendar_service import get_calendar_service
from routers.user import get_current_user
from core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/calendar",
    tags=["calendar"]
)

# OAuth 2.0 scopes for Google Calendar
SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
]


@router.get("/connect")
async def initiate_calendar_oauth(
    token: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiate OAuth flow for user to connect their Google Calendar
    
    Redirects user directly to Google OAuth consent screen
    
    Accepts authentication via:
    1. Authorization header (preferred)
    2. token query parameter (for popup windows)
    """
    try:
        # If token provided in query param, validate it
        if token and not current_user:
            from auth.oauth2 import SECRET_KEY, ALGORITHM
            from jose import jwt, JWTError
            
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                email = payload.get("sub")
                if email:
                    current_user = db.query(User).filter(User.email == email).first()
            except JWTError as e:
                logger.error(f"Invalid token in query param: {e}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token"
                )
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Build client config from environment variables
        client_id = settings.GOOGLE_CLIENT_ID or os.getenv('GOOGLE_CLIENT_ID')
        client_secret = settings.GOOGLE_CLIENT_SECRET or os.getenv('GOOGLE_CLIENT_SECRET')
        backend_url = settings.BACKEND_URL or os.getenv('BACKEND_URL', 'http://localhost:8000')
        
        if not client_id or not client_secret:
            logger.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server configuration error: Missing Google OAuth credentials"
            )
        
        client_config = {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [f"{backend_url}{settings.API_PREFIX}/calendar/callback"]
            }
        }
        
        # Create flow from client config
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=f"{backend_url}{settings.API_PREFIX}/calendar/callback"
        )
        
        # Generate authorization URL with user ID in state
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',  # Force consent screen to get refresh token
            state=str(current_user.id)  # Pass user ID to callback
        )
        
        logger.info(f"Generated OAuth URL for user {current_user.id}, redirect_uri: {flow.redirect_uri}")
        
        # Redirect directly to Google OAuth
        return RedirectResponse(url=authorization_url)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to initiate OAuth: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate calendar connection: {str(e)}"
        )


@router.get("/callback")
async def calendar_oauth_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    OAuth callback endpoint - Google redirects here after user authorizes
    
    Exchanges authorization code for access token and stores in user's account
    """
    try:
        # Check if user denied access
        if error:
            logger.warning(f"OAuth authorization denied: {error}")
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/?calendar_error=access_denied",
                status_code=status.HTTP_302_FOUND
            )
        
        # Check if code and state are present
        if not code or not state:
            logger.error(f"OAuth callback missing required parameters - code: {bool(code)}, state: {bool(state)}")
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/?calendar_error=invalid_callback",
                status_code=status.HTTP_302_FOUND
            )
        
        # Get user from state parameter
        try:
            user_id = int(state)
        except ValueError:
            logger.error(f"Invalid state parameter: {state}")
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/?calendar_error=invalid_state",
                status_code=status.HTTP_302_FOUND
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            logger.error(f"User {user_id} not found in OAuth callback")
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/?calendar_error=user_not_found",
                status_code=status.HTTP_302_FOUND
            )
        
        # Build client config from environment variables
        client_id = settings.GOOGLE_CLIENT_ID or os.getenv('GOOGLE_CLIENT_ID')
        client_secret = settings.GOOGLE_CLIENT_SECRET or os.getenv('GOOGLE_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            logger.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET")
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/?calendar_error=server_config",
                status_code=status.HTTP_302_FOUND
            )
        
        client_config = {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [f"{settings.BACKEND_URL}{settings.API_PREFIX}/calendar/callback"]
            }
        }
        
        # Create flow from client config
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=f"{settings.BACKEND_URL}{settings.API_PREFIX}/calendar/callback"
        )
        
        logger.info(f"Exchanging OAuth code for tokens, user_id: {user_id}")
        
        # Exchange authorization code for tokens
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Store tokens in user's account
        setattr(user, 'calendar_token', credentials.token)
        setattr(user, 'calendar_refresh_token', credentials.refresh_token)
        setattr(user, 'calendar_token_expiry', credentials.expiry)
        setattr(user, 'calendar_sync_enabled', True)  # Auto-enable sync on connection
        
        db.commit()
        
        logger.info(f"Calendar connected successfully for user {user_id}")
        
        # Redirect back to frontend with success message
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/?calendar_connected=true",
            status_code=status.HTTP_302_FOUND
        )
        
    except Exception as e:
        logger.error(f"OAuth callback failed: {e}", exc_info=True)
        # Redirect to frontend with error
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/?calendar_error=server_error&message={str(e)[:100]}",
            status_code=status.HTTP_302_FOUND
        )


@router.post("/disconnect")
async def disconnect_calendar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disconnect user's Google Calendar
    
    Removes stored OAuth tokens and disables calendar sync
    """
    try:
        setattr(current_user, 'calendar_token', None)
        setattr(current_user, 'calendar_refresh_token', None)
        setattr(current_user, 'calendar_token_expiry', None)
        setattr(current_user, 'calendar_sync_enabled', False)
        
        db.commit()
        
        logger.info(f"Calendar disconnected for user {current_user.id}")
        
        return {
            "message": "Calendar disconnected successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to disconnect calendar: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disconnect calendar: {str(e)}"
        )


@router.get("/status")
async def get_calendar_status(
    current_user: User = Depends(get_current_user)
):
    """
    Check if user has connected their Google Calendar
    
    Returns connection status and token expiry
    """
    has_token = getattr(current_user, 'calendar_token', None) is not None
    has_refresh_token = getattr(current_user, 'calendar_refresh_token', None) is not None
    is_connected = has_token and has_refresh_token
    
    return {
        "connected": is_connected,
        "sync_enabled": getattr(current_user, 'calendar_sync_enabled', False),
        "calendar_id": getattr(current_user, 'calendar_id', None) or "primary"
    }


@router.post("/enable")
async def enable_calendar_sync(
    calendar_id: Optional[str] = "primary",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enable Google Calendar sync for the user
    
    This will sync all future deadlines to Google Calendar automatically.
    """
    try:
        # Test calendar connection
        calendar_service = get_calendar_service()
        
        # Update user preferences
        setattr(current_user, 'calendar_sync_enabled', True)
        setattr(current_user, 'calendar_id', calendar_id)
        db.commit()
        
        logger.info(f"Enabled calendar sync for user {current_user.id}")
        
        return {
            "message": "Calendar sync enabled successfully",
            "calendar_id": calendar_id
        }
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Calendar credentials not found. Please set up Google Calendar API first."
        )
    except Exception as e:
        logger.error(f"Failed to enable calendar sync: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enable calendar sync: {str(e)}"
        )


@router.post("/disable")
async def disable_calendar_sync(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disable Google Calendar sync for the user
    
    Existing synced events will remain in your calendar.
    """
    setattr(current_user, 'calendar_sync_enabled', False)
    db.commit()
    
    logger.info(f"Disabled calendar sync for user {current_user.id}")
    
    return {
        "message": "Calendar sync disabled successfully"
    }


@router.get("/status")
async def get_calendar_sync_status(
    current_user: User = Depends(get_current_user)
):
    """
    Get current calendar sync status
    """
    return {
        "enabled": current_user.calendar_sync_enabled,
        "calendar_id": current_user.calendar_id or "primary"
    }


@router.post("/sync-all")
async def sync_all_deadlines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync all existing deadlines to Google Calendar
    
    This will create calendar events for all deadlines that aren't already synced.
    """
    try:
        if not getattr(current_user, 'calendar_sync_enabled', False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Calendar sync is not enabled. Enable it first."
            )
        
        calendar_service = get_calendar_service()
        calendar_id = getattr(current_user, 'calendar_id', None) or "primary"
        
        # Get all unsynced deadlines for the user
        unsynced_deadlines = db.query(Deadline).filter(
            Deadline.user_id == current_user.id,
            Deadline.calendar_synced == False,
            Deadline.completed == False
        ).all()
        
        synced_count = 0
        errors = []
        
        for deadline in unsynced_deadlines:
            try:
                # Create calendar event
                event = calendar_service.create_event(
                    title=str(getattr(deadline, 'title')),
                    description=str(getattr(deadline, 'description', '') or ''),
                    start_datetime=getattr(deadline, 'date'),
                    estimated_hours=getattr(deadline, 'estimated_hours', None),
                    course=getattr(deadline, 'course', None),
                    priority=str(getattr(deadline, 'priority')),
                    calendar_id=str(calendar_id)
                )
                
                # Update deadline with calendar event ID
                setattr(deadline, 'calendar_event_id', event.get('id'))
                setattr(deadline, 'calendar_synced', True)
                synced_count += 1
                
            except Exception as e:
                logger.error(f"Failed to sync deadline {deadline.id}: {e}")
                errors.append({
                    "deadline_id": deadline.id,
                    "title": deadline.title,
                    "error": str(e)
                })
        
        db.commit()
        
        return {
            "message": f"Synced {synced_count} deadlines to calendar",
            "synced_count": synced_count,
            "total_unsynced": len(unsynced_deadlines),
            "errors": errors if errors else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to sync deadlines: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync deadlines: {str(e)}"
        )


@router.post("/import")
async def import_from_calendar(
    days_ahead: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Import events from Google Calendar as deadlines
    
    This will create deadlines from your calendar events.
    
    Args:
        days_ahead: Number of days ahead to import (default: 30)
    """
    try:
        if not getattr(current_user, 'calendar_sync_enabled', False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Calendar sync is not enabled. Enable it first."
            )
        
        calendar_service = get_calendar_service()
        calendar_id = getattr(current_user, 'calendar_id', None) or "primary"
        
        # Get upcoming events
        time_min = datetime.utcnow()
        time_max = time_min + timedelta(days=days_ahead)
        
        events = calendar_service.get_upcoming_events(
            time_min=time_min,
            time_max=time_max,
            calendar_id=calendar_id
        )
        
        imported_count = 0
        skipped_count = 0
        
        for event in events:
            event_id = event.get('id')
            
            # Skip if already imported
            existing = db.query(Deadline).filter(
                Deadline.calendar_event_id == event_id
            ).first()
            
            if existing:
                skipped_count += 1
                continue
            
            # Extract event details
            summary = event.get('summary', 'Untitled Event')
            description = event.get('description', '')
            
            # Get start time
            start = event.get('start', {})
            start_datetime = start.get('dateTime') or start.get('date')
            
            if not start_datetime:
                continue
            
            # Parse datetime
            if 'T' in start_datetime:
                deadline_date = datetime.fromisoformat(start_datetime.replace('Z', '+00:00'))
            else:
                deadline_date = datetime.strptime(start_datetime, '%Y-%m-%d')
            
            # Calculate estimated hours from duration
            end = event.get('end', {})
            end_datetime = end.get('dateTime') or end.get('date')
            estimated_hours = 1  # Default
            
            if end_datetime and 'T' in end_datetime:
                end_dt = datetime.fromisoformat(end_datetime.replace('Z', '+00:00'))
                duration = end_dt - deadline_date
                estimated_hours = max(1, int(duration.total_seconds() / 3600))
            
            # Create deadline
            new_deadline = Deadline(
                title=summary,
                description=description,
                date=deadline_date,
                estimated_hours=estimated_hours,
                priority="medium",  # Default priority
                user_id=current_user.id,
                calendar_event_id=event_id,
                calendar_synced=True
            )
            
            db.add(new_deadline)
            imported_count += 1
        
        db.commit()
        
        return {
            "message": f"Imported {imported_count} events from calendar",
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "total_events": len(events)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to import from calendar: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import from calendar: {str(e)}"
        )


@router.delete("/unsync/{deadline_id}")
async def unsync_deadline(
    deadline_id: int,
    delete_from_calendar: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove calendar sync for a specific deadline
    
    Args:
        deadline_id: ID of the deadline
        delete_from_calendar: Whether to also delete the event from Google Calendar
    """
    try:
        deadline = db.query(Deadline).filter(
            Deadline.id == deadline_id,
            Deadline.user_id == current_user.id
        ).first()
        
        if not deadline:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deadline not found"
            )
        
        if not getattr(deadline, 'calendar_synced', False):
            return {
                "message": "Deadline is not synced with calendar"
            }
        
        # Delete from calendar if requested
        if delete_from_calendar and getattr(deadline, 'calendar_event_id', None):
            calendar_service = get_calendar_service()
            calendar_id = getattr(current_user, 'calendar_id', None) or "primary"
            calendar_service.delete_event(
                event_id=str(getattr(deadline, 'calendar_event_id')),
                calendar_id=str(calendar_id)
            )
        
        # Update deadline
        setattr(deadline, 'calendar_event_id', None)
        setattr(deadline, 'calendar_synced', False)
        db.commit()
        
        return {
            "message": "Deadline unsynced from calendar",
            "deleted_from_calendar": delete_from_calendar
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to unsync deadline: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unsync deadline: {str(e)}"
        )
