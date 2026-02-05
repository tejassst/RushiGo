from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from db.database import Base

class TempScan(Base):
    __tablename__ = "temp_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    temp_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, nullable=False)
    deadlines_json = Column(Text, nullable=False)  # JSON string of deadlines
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)