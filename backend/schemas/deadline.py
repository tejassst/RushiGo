from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


class PriorityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class DeadlineBase(BaseModel):
    title: str
    description: Optional[str] = None
    course: Optional[str] = None
    date: datetime
    priority: PriorityLevel = Field(default=PriorityLevel.medium)
    estimated_hours: Optional[float] = Field(default=0.0, ge=0.0)

    @validator('date', pre=True)
    def parse_date(cls, v):
        """Parse date string and handle timezone properly"""
        if isinstance(v, str):
            # Parse ISO format with timezone
            try:
                # This handles: "2024-01-15T14:30:00.000Z" or "2024-01-15T14:30:00+05:30"
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                # Fallback: try without timezone (treat as UTC)
                v = v.replace('Z', '').replace('+00:00', '')
                if 'T' in v:
                    try:
                        return datetime.fromisoformat(v)
                    except ValueError:
                        return datetime.strptime(v, '%Y-%m-%dT%H:%M:%S')
                else:
                    # Date only, add midnight UTC
                    return datetime.fromisoformat(v + 'T00:00:00+00:00')
        return v

    @validator('estimated_hours')
    def validate_hours(cls, v):
        if v is not None and v < 0:
            raise ValueError('Estimated hours cannot be negative')
        return v


class DeadlineCreate(DeadlineBase):
    pass


class DeadlineUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course: Optional[str] = None
    date: Optional[datetime] = None
    priority: Optional[PriorityLevel] = None
    completed: Optional[bool] = None
    estimated_hours: Optional[float] = None


class DeadlineResponse(DeadlineBase):
    id: int
    user_id: int
    completed: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

