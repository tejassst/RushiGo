"""
Background task scheduler for deadline notifications
"""
import asyncio
import logging
from datetime import datetime, time
from typing import Optional
import threading

from services.notification_service import get_notification_service

logger = logging.getLogger(__name__)


class NotificationScheduler:
    def __init__(self):
        self.running = False
        self.task: Optional[asyncio.Task] = None
        self.thread: Optional[threading.Thread] = None
    
    def start(self):
        """Start the notification scheduler"""
        if self.running:
            logger.warning("Scheduler already running")
            return
        
        self.running = True
        # Run scheduler in a separate thread to not block the main application
        self.thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.thread.start()
        logger.info("Notification scheduler started")
    
    def stop(self):
        """Stop the notification scheduler"""
        self.running = False
        if self.task and not self.task.done():
            self.task.cancel()
        logger.info("Notification scheduler stopped")
    
    def _run_scheduler(self):
        """Run the scheduler in a separate event loop"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self._scheduler_loop())
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
        finally:
            loop.close()
    
    async def _scheduler_loop(self):
        """Main scheduler loop"""
        logger.info("Notification scheduler loop started")
        
        while self.running:
            try:
                now = datetime.now()
                
                # Check every hour for approaching/overdue deadlines
                if now.minute == 0:  # Run at the top of every hour
                    logger.info("Running hourly deadline notification check")
                    notification_service = get_notification_service()
                    stats = notification_service.check_and_send_deadline_notifications()
                    logger.info(f"Notification stats: {stats}")
                
                # Send daily digest at 8 AM
                if now.hour == 8 and now.minute == 0:
                    logger.info("Running daily digest notifications")
                    await self._send_daily_digests()
                
                # Sleep for 60 seconds before next check
                await asyncio.sleep(60)
                
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                await asyncio.sleep(60)  # Continue after error
    
    async def _send_daily_digests(self):
        """Send daily digests to all active users"""
        try:
            from db.database import SessionLocal
            from models.user import User
            
            db = SessionLocal()
            try:
                active_users = db.query(User).filter(User.is_active.is_(True)).all()
                
                notification_service = get_notification_service()
                for user in active_users:
                    try:
                        user_id_raw = getattr(user, 'id', None)
                        if user_id_raw is not None:
                            user_id = int(user_id_raw)
                            notification_service.send_daily_digest(user_id)
                    except Exception as e:
                        user_id_safe = getattr(user, 'id', 'unknown')
                        logger.error(f"Failed to send daily digest to user {user_id_safe}: {e}")
                
                logger.info(f"Sent daily digests to {len(active_users)} users")
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error sending daily digests: {e}")


# Global scheduler instance
scheduler = NotificationScheduler()


def start_scheduler():
    """Start the notification scheduler"""
    scheduler.start()


def stop_scheduler():
    """Stop the notification scheduler"""
    scheduler.stop()
