from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from db.database import Base

class Deadline(Base):
    __tablename__="deadlines"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    description = Column(String(1000), nullable=True)
    course = Column(String(100), index=True, nullable=True)  # Course/Subject name
    date = Column(DateTime(timezone=True), nullable=False)
    priority = Column(String(10), index=True, nullable=False, default="medium")  # low, medium, high
    estimated_hours = Column(Integer, nullable=True, default=0)
    completed = Column(Boolean, nullable=False, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)  # Optional team assignment
    
    # Google Calendar integration
    calendar_event_id = Column(String(255), nullable=True, index=True)  # Google Calendar event ID
    calendar_synced = Column(Boolean, nullable=False, default=False)  # Whether synced with calendar
    
    user = relationship("User", back_populates="deadlines")
    team = relationship("Team", back_populates="deadlines")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

