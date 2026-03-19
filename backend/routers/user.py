from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import timedelta

# Use pbkdf2_sha256 instead of bcrypt to avoid 72-byte password limitation
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

from db.database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, UserUpdate, CalendarPreferencesUpdate
from auth.oauth2 import create_access_token, get_current_user
from services.calendar_service import get_calendar_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    

    # Hash the password
    hashed_password = pwd_context.hash(user.password)
    
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        calendar_sync_enabled=True  # Enable calendar sync by default for new users
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Important: form_data.username contains the email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(days=7)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_update.email and user_update.email != current_user.email:
        if db.query(User).filter(User.email == user_update.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    if user_update.username and user_update.username != current_user.username:
        if db.query(User).filter(User.username == user_update.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    for key, value in user_update.dict(exclude_unset=True).items():
        if key == "password" and value:
            value = pwd_context.hash(value)
            setattr(current_user, "hashed_password", value)
        else:
            setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/calendar-preferences")
async def get_calendar_preferences(
    current_user: User = Depends(get_current_user)
):
    """
    Get user's Google Calendar sync preferences
    """
    sync_enabled = getattr(current_user, 'calendar_sync_enabled', False)
    calendar_id = getattr(current_user, 'calendar_id', None) or "primary"
    
    return {
        "calendar_sync_enabled": sync_enabled,
        "calendar_id": calendar_id,
        "message": "Calendar sync is " + ("enabled" if sync_enabled else "disabled")
    }


@router.put("/me/calendar-preferences")
async def update_calendar_preferences(
    preferences: CalendarPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user's Google Calendar sync preferences
    
    This endpoint allows users to:
    - Enable or disable calendar sync
    - Change which calendar to sync to (default: "primary")
    
    When enabling calendar sync for the first time, all existing deadlines will be synced.
    """
    try:
        # Track previous sync state
        was_enabled = getattr(current_user, 'calendar_sync_enabled', False)
        
        # If enabling calendar sync, verify calendar API access
        if preferences.calendar_sync_enabled is True and not was_enabled:
            # Check if user has OAuth tokens (per-user calendar)
            if getattr(current_user, 'calendar_token', None):
                try:
                    from services.calendar_service import get_calendar_service_for_user
                    get_calendar_service_for_user(current_user)
                except ValueError as e:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=str(e)
                    )
            else:
                # Test with global calendar service
                try:
                    calendar_service = get_calendar_service()
                except FileNotFoundError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Google Calendar API is not set up. Please contact administrator to enable Calendar API in Google Cloud Console."
                    )
                except Exception as e:
                    logger.error(f"Failed to initialize calendar service: {e}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to connect to Google Calendar: {str(e)}"
                    )
        
        # Update preferences
        if preferences.calendar_sync_enabled is not None:
            setattr(current_user, 'calendar_sync_enabled', preferences.calendar_sync_enabled)
        
        if preferences.calendar_id is not None:
            setattr(current_user, 'calendar_id', preferences.calendar_id)
        
        db.commit()
        
        # If enabling sync for the first time, sync all existing deadlines
        synced_count = 0
        errors = []
        
        if preferences.calendar_sync_enabled is True and not was_enabled:
            logger.info(f"Calendar sync just enabled for user {current_user.id}. Syncing existing deadlines...")
            
            try:
                # Get calendar service for the user
                from services.calendar_service import get_calendar_service_for_user
                try:
                    calendar_service = get_calendar_service_for_user(current_user)
                except ValueError:
                    # Fall back to global service if user doesn't have OAuth tokens
                    calendar_service = get_calendar_service()
                
                calendar_id = getattr(current_user, 'calendar_id', None) or "primary"
                
                # Get all unsynced deadlines for the user
                from models.deadline import Deadline
                unsynced_deadlines = db.query(Deadline).filter(
                    Deadline.user_id == current_user.id,
                    Deadline.calendar_synced == False,
                    Deadline.completed == False
                ).all()
                
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
                            calendar_id=calendar_id
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
                logger.info(f"Synced {synced_count} existing deadlines for user {current_user.id}")
                
            except Exception as e:
                logger.error(f"Failed to sync deadlines when enabling calendar: {e}")
                # Don't fail the preference update, but log the error
        
        db.refresh(current_user)
        
        response = {
            "message": "Calendar preferences updated successfully",
            "calendar_sync_enabled": current_user.calendar_sync_enabled,
            "calendar_id": current_user.calendar_id or "primary"
        }
        
        # Add sync results if deadlines were synced
        if preferences.calendar_sync_enabled is True and not was_enabled:
            response["synced_count"] = synced_count
            if synced_count > 0:
                response["message"] += f" - {synced_count} existing deadlines synced to calendar"
            if errors:
                response["sync_errors"] = errors
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update calendar preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preferences: {str(e)}"
        )


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()
    return