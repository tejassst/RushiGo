"""
Notification service for deadline reminders using Mailgun
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from core.emails_utils import send_email
from services.email_templates import EmailTemplates
from models.user import User
from models.deadline import Deadline
from models.notifications import Notification
from db.database import SessionLocal

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self):
        self.email_templates = EmailTemplates()
    
    def get_db(self) -> Session:
        """Get database session"""
        return SessionLocal()
    
    def send_deadline_notification(self, user: User, deadline: Deadline, notification_type: str = "approaching", time_label: Optional[str] = None) -> bool:
        """Send email notification for a specific deadline"""
        try:
            now = datetime.now(timezone.utc)
            
            # Safely extract values from SQLAlchemy objects
            user_name = getattr(user, 'username', None) or "User"
            user_email = getattr(user, 'email', None) or ""
            deadline_title = getattr(deadline, 'title', None) or "Untitled"
            deadline_course = getattr(deadline, 'course', None) or "General"
            deadline_date = getattr(deadline, 'date', None) or now
            
            # Ensure all values are proper types
            user_name = str(user_name)
            user_email = str(user_email)
            deadline_title = str(deadline_title)
            deadline_course = str(deadline_course)
            
            if notification_type == "approaching":
                # Use time_label if provided, otherwise calculate days left
                if time_label:
                    time_description = time_label
                else:
                    days_left = (deadline_date - now).days
                    if days_left < 0:
                        days_left = 0
                    time_description = f"{days_left} day{'s' if days_left != 1 else ''}"
                
                subject = f"⏰ Deadline in {time_description}: {deadline_title}"
                text_body = self.email_templates.deadline_approaching_text(
                    user_name=user_name,
                    deadline_title=deadline_title,
                    deadline_date=deadline_date,
                    days_left=(deadline_date - now).days,
                    course=deadline_course
                )
                html_body = self.email_templates.deadline_approaching_html(
                    user_name=user_name,
                    deadline_title=deadline_title,
                    deadline_date=deadline_date,
                    days_left=(deadline_date - now).days,
                    course=deadline_course
                )
                
            elif notification_type == "overdue":
                days_overdue = (now - deadline_date).days
                subject = f"⚠️ Overdue: {deadline_title}"
                text_body = self.email_templates.deadline_overdue_text(
                    user_name=user_name,
                    deadline_title=deadline_title,
                    deadline_date=deadline_date,
                    days_overdue=days_overdue,
                    course=deadline_course
                )
                html_body = None  # You can create an HTML version if needed
            
            else:
                logger.error(f"Unknown notification type: {notification_type}")
                return False
            
            # Send email
            send_email(
                to_email=user_email,
                subject=subject,
                text=text_body,
                html=html_body
            )
            
            logger.info(f"Sent {notification_type} notification to {user_email} for deadline: {deadline_title}")
            return True
            
        except Exception as e:
            # Safe error logging
            user_email_safe = getattr(user, 'email', 'unknown') if user else 'unknown'
            logger.error(f"Failed to send notification to {user_email_safe}: {str(e)}")
            return False
    
    def check_and_send_deadline_notifications(self) -> Dict[str, int]:
        """Check all deadlines and send appropriate notifications"""
        db = self.get_db()
        stats = {
            "approaching_sent": 0,
            "overdue_sent": 0,
            "errors": 0
        }
        
        try:
            now = datetime.now(timezone.utc)
            
            # Get approaching deadlines (within 3 days)
            approaching_deadlines = db.query(Deadline).options(
                joinedload(Deadline.user)
            ).join(User).filter(
                and_(
                    Deadline.completed.is_(False),
                    Deadline.date >= now,
                    Deadline.date <= now + timedelta(days=3),
                    User.is_active.is_(True)
                )
            ).all()
            
            # Find overdue deadlines (not completed)
            overdue_deadlines = db.query(Deadline).options(
                joinedload(Deadline.user)
            ).join(User).filter(
                and_(
                    Deadline.completed.is_(False),
                    Deadline.date < now,
                    User.is_active.is_(True)
                )
            ).all()
            
            # Send approaching deadline notifications
            for deadline in approaching_deadlines:
                # User should be loaded due to joinedload, but double-check
                if deadline.user is None:
                    deadline.user = db.query(User).filter(User.id == deadline.user_id).first()
                
                if deadline.user is None:
                    logger.warning(f"User not found for deadline {deadline.id}")
                    continue
                
                # Calculate time until deadline
                time_until = deadline.date - now
                hours_until = time_until.total_seconds() / 3600
                
                # Determine notification periods that should be sent
                # We check if we're within a 10-minute window of each threshold
                notification_periods = []
                
                # 3 days before (between 71.5 and 72.5 hours before)
                if 71.5 <= hours_until <= 72.5:
                    notification_periods.append("3_days")
                
                # 1 day before (between 23.5 and 24.5 hours before)
                elif 23.5 <= hours_until <= 24.5:
                    notification_periods.append("1_day")
                
                # 1 hour before (between 0.92 and 1.08 hours before - ~55 to 65 minutes)
                elif 0.92 <= hours_until <= 1.08:
                    notification_periods.append("1_hour")
                
                # If no specific threshold matched, skip this deadline
                if not notification_periods:
                    continue
                
                # Check each notification period
                for notification_period in notification_periods:
                    deadline_title_str = str(getattr(deadline, 'title', '') or '')
                    
                    # Check if we already sent this specific notification (ever, not just today)
                    existing_notification = db.query(Notification).filter(
                        and_(
                            Notification.user_id == deadline.user_id,
                            Notification.message.contains(deadline_title_str),
                            Notification.message.contains(notification_period),
                            Notification.sent.is_(True)
                        )
                    ).first()
                    
                    if existing_notification is None:
                        # Determine how long until deadline for email content
                        if notification_period == "3_days":
                            period_label = "3 days"
                        elif notification_period == "1_day":
                            period_label = "1 day"
                        else:
                            period_label = "1 hour"
                        
                        if self.send_deadline_notification(deadline.user, deadline, "approaching", period_label):
                            # Log the notification with the period to enable deduplication
                            notification = Notification(
                                user_id=deadline.user_id,
                                message=f"Approaching deadline notification sent for: {deadline_title_str} ({notification_period})",
                                sent=True,
                                created_at=datetime.now(timezone.utc)
                            )
                            db.add(notification)
                            stats["approaching_sent"] += 1
                            logger.info(f"Sent {period_label} notification for deadline: {deadline_title_str}")
                        else:
                            stats["errors"] += 1
            
            # Send overdue deadline notifications (only once per day)
            for deadline in overdue_deadlines:
                # User should be loaded due to joinedload, but double-check
                if deadline.user is None:
                    deadline.user = db.query(User).filter(User.id == deadline.user_id).first()
                
                if deadline.user is None:
                    logger.warning(f"User not found for deadline {deadline.id}")
                    continue
                
                today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
                deadline_title_str = str(getattr(deadline, 'title', '') or '')
                
                existing_overdue_notification = db.query(Notification).filter(
                    and_(
                        Notification.user_id == deadline.user_id,
                        Notification.message.contains(f"Overdue deadline notification sent for: {deadline_title_str}"),
                        Notification.created_at >= today_start,
                        Notification.sent.is_(True)  # Proper SQLAlchemy boolean check
                    )
                ).first()
                
                if existing_overdue_notification is None:
                    if self.send_deadline_notification(deadline.user, deadline, "overdue"):
                        # Log the notification
                        notification = Notification(
                            user_id=deadline.user_id,
                            message=f"Overdue deadline notification sent for: {deadline_title_str}",
                            sent=True,
                            created_at=datetime.now(timezone.utc)
                        )
                        db.add(notification)
                        stats["overdue_sent"] += 1
                    else:
                        stats["errors"] += 1
            
            db.commit()
            
            logger.info(f"Notification check completed. Stats: {stats}")
            return stats
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error in notification check: {str(e)}")
            stats["errors"] += 1
            return stats
        finally:
            db.close()
    
    def send_daily_digest(self, user_id: int) -> bool:
        """Send daily digest to a specific user"""
        db = self.get_db()
        
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user is None or not getattr(user, 'is_active', False):
                return False
            
            now = datetime.now(timezone.utc)
            
            # Check if digest was already sent today
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            today_date_str = now.strftime('%Y-%m-%d')
            
            logger.info(f"Checking for existing digest for user {user_id} on {today_date_str}")
            
            existing_digest = db.query(Notification).filter(
                and_(
                    Notification.user_id == user_id,
                    Notification.message.contains(f"Daily digest sent for {today_date_str}"),
                    Notification.created_at >= today_start,
                    Notification.sent.is_(True)
                )
            ).first()
            
            if existing_digest is not None:
                logger.info(f"Daily digest already sent to user {user_id} today at {existing_digest.created_at}")
                return True  # Already sent, consider it a success
            
            logger.info(f"No existing digest found, will send new digest to user {user_id}")
            
            # Get upcoming deadlines (next 7 days)
            upcoming_deadlines = db.query(Deadline).filter(
                and_(
                    Deadline.user_id == user_id,
                    Deadline.completed.is_(False),  # Proper SQLAlchemy boolean check
                    Deadline.date > now,
                    Deadline.date <= now + timedelta(days=7)
                )
            ).order_by(Deadline.date).all()
            
            # Get overdue deadlines
            overdue_deadlines = db.query(Deadline).filter(
                and_(
                    Deadline.user_id == user_id,
                    Deadline.completed.is_(False),  # Proper SQLAlchemy boolean check
                    Deadline.date < now
                )
            ).order_by(Deadline.date).all()
            
            if not upcoming_deadlines and not overdue_deadlines:
                # No deadlines to report
                return True
            
            # Prepare data for template
            upcoming_data = []
            for deadline in upcoming_deadlines:
                upcoming_data.append({
                    'title': str(getattr(deadline, 'title', '') or 'Untitled'),
                    'date': getattr(deadline, 'date', now),
                    'course': str(getattr(deadline, 'course', '') or 'General')
                })
            
            overdue_data = []
            for deadline in overdue_deadlines:
                overdue_data.append({
                    'title': str(getattr(deadline, 'title', '') or 'Untitled'),
                    'date': getattr(deadline, 'date', now),
                    'course': str(getattr(deadline, 'course', '') or 'General')
                })
            
            # Ensure user data is strings
            user_name = str(getattr(user, 'username', '') or 'User')
            user_email = str(getattr(user, 'email', '') or '')
            
            # Send digest email
            subject = f"📊 Daily Deadline Digest - {now.strftime('%B %d, %Y')}"
            text_body = self.email_templates.daily_digest_text(
                user_name=user_name,
                upcoming_deadlines=upcoming_data,
                overdue_deadlines=overdue_data
            )
            
            send_email(
                to_email=user_email,
                subject=subject,
                text=text_body
            )
            
            # Log the notification
            notification = Notification(
                user_id=user_id,
                message=f"Daily digest sent for {now.strftime('%Y-%m-%d')}",
                sent=True,
                created_at=now
            )
            db.add(notification)
            db.commit()
            
            logger.info(f"Sent daily digest to {user_email}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to send daily digest to user {user_id}: {str(e)}")
            return False
        finally:
            db.close()


# Global instance - create it properly
def get_notification_service() -> NotificationService:
    """Get the global notification service instance"""
    return NotificationService()
