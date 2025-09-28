from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from db.database import Base

class Membership(Base):
    __tablename__ = "memberships"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    role = Column(String, default="member")  # admin / member / viewer
    

    user = relationship("User", back_populates="memberships")
    team = relationship("Team", back_populates="members")
