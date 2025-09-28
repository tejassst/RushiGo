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
    date: datetime
    priority: PriorityLevel = Field(default=PriorityLevel.medium)
    estimated_hours: Optional[float] = Field(default=0.0, ge=0.0)

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
    date: Optional[datetime] = None
    priority: Optional[PriorityLevel] = None
    completed: Optional[bool] = None


class DeadlineResponse(DeadlineBase):
    id: int
    user_id: int
    completed: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

