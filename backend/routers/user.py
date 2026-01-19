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
        hashed_password=hashed_password
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
    """
    try:
        # If enabling calendar sync, verify calendar API access
        current_sync_enabled = getattr(current_user, 'calendar_sync_enabled', False)
        if preferences.calendar_sync_enabled is True and not current_sync_enabled:
            try:
                # Test calendar connection by initializing service
                calendar_service = get_calendar_service()
                logger.info(f"Calendar service initialized for user {current_user.id}")
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
        db.refresh(current_user)
        
        return {
            "message": "Calendar preferences updated successfully",
            "calendar_sync_enabled": current_user.calendar_sync_enabled,
            "calendar_id": current_user.calendar_id or "primary"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update calendar preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preferences: {str(e)}"
        )
