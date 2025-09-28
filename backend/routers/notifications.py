"""
Notification endpoints for deadline reminders
"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from services import get_notification_service  # Updated import
from db.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/send-deadline-notifications")
async def send_deadline_notifications():
    """Manually trigger deadline notifications"""
    try:
        notification_service = get_notification_service()  # Updated usage
        stats = notification_service.check_and_send_deadline_notifications()
        return {
            "message": "Notification check completed",
            "stats": stats
        }
    except Exception as e:
        logger.error(f"Error sending notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send notifications")

@router.post("/send-test-notification/{user_id}")
async def send_test_notification(user_id: int, db: Session = Depends(get_db)):
    """Send a test notification to a specific user"""
    try:
        # Get user and their first deadline for testing
        from models.user import User
        from models.deadline import Deadline
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        deadline = db.query(Deadline).filter(
            Deadline.user_id == user_id,
            Deadline.completed.is_(False)
        ).first()
        
        if not deadline:
            raise HTTPException(status_code=404, detail="No active deadlines found for user")
        
        notification_service = get_notification_service()  # Updated usage
        success = notification_service.send_deadline_notification(user, deadline, "approaching")
        
        if success:
            return {"message": f"Test notification sent to {user.email}"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send test notification")
            
    except Exception as e:
        logger.error(f"Error sending test notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send test notification")

@router.post("/send-daily-digest/{user_id}")
async def send_daily_digest(user_id: int):
    """Send daily digest to a specific user"""
    try:
        notification_service = get_notification_service()  # Updated usage
        success = notification_service.send_daily_digest(user_id)
        
        if success:
            return {"message": f"Daily digest sent to user {user_id}"}
        else:
            raise HTTPException(status_code=404, detail="User not found or no deadlines")
            
    except Exception as e:
        logger.error(f"Error sending daily digest: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send daily digest")

@router.get("/statistics")
async def get_notification_statistics(db: Session = Depends(get_db)):
    """Get notification statistics"""
    try:
        from models.notifications import Notification
        from sqlalchemy import func
        
        total_notifications = db.query(func.count(Notification.id)).scalar()
        sent_notifications = db.query(func.count(Notification.id)).filter(
            Notification.sent.is_(True)
        ).scalar()
        
        return {
            "total_notifications": total_notifications or 0,
            "sent_notifications": sent_notifications or 0,
            "failed_notifications": (total_notifications or 0) - (sent_notifications or 0)
        }
        
    except Exception as e:
        logger.error(f"Error getting notification statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get statistics")
