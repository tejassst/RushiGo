from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator
import re

class UserBase(BaseModel):
    email: EmailStr
    username: str

    @validator('username')
    def username_validator(cls, v):
        if not re.match("^[a-zA-Z0-9_-]{3,20}$", v):
            raise ValueError('Username must be 3-20 characters long and contain only letters, numbers, underscores, and hyphens')
        return v

class UserCreate(UserBase):
    password: str

    @validator('password')
    def password_validator(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class CalendarPreferencesUpdate(BaseModel):
    calendar_sync_enabled: Optional[bool] = None
    calendar_id: Optional[str] = "primary"

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    calendar_sync_enabled: bool = False
    calendar_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True