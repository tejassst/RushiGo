"""
Background task schedulers for deadline notifications and temp scan cleanup
"""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional
import threading

from services.notification_service import get_notification_service

logger = logging.getLogger(__name__)

# --- Notification Scheduler ---

class NotificationScheduler:
    def __init__(self):
        self.running = False
        self.task: Optional[asyncio.Task] = None
        self.thread: Optional[threading.Thread] = None
        self.last_deadline_check = None
        self.last_digest_check = None
    
    def start(self):
        if self.running:
            logger.warning("Notification scheduler already running")
            return
        self.running = True
        self.thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.thread.start()
        logger.info("Notification scheduler started")
    
    def stop(self):
        self.running = False
        if self.task and not self.task.done():
            self.task.cancel()
        logger.info("Notification scheduler stopped")
    
    def _run_scheduler(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self._scheduler_loop())
        except Exception as e:
            logger.error(f"Notification scheduler error: {e}")
        finally:
            loop.close()
    
    async def _scheduler_loop(self):
        logger.info("Notification scheduler loop started")
        while self.running:
            try:
                now = datetime.now()
                current_minute = now.replace(second=0, microsecond=0)
                # Every 5 minutes
                if now.minute % 5 == 0 and self.last_deadline_check != current_minute:
                    logger.info(f"Running deadline notification check at {now.strftime('%H:%M:%S')}")
                    self.last_deadline_check = current_minute
                    notification_service = get_notification_service()
                    stats = notification_service.check_and_send_deadline_notifications()
                    logger.info(f"Notification stats: {stats}")
                # Daily digest at 8 AM
                if now.hour == 8 and now.minute == 0 and self.last_digest_check != current_minute:
                    logger.info(f"Running daily digest notifications at {now.strftime('%H:%M:%S')}")
                    self.last_digest_check = current_minute
                    await self._send_daily_digests()
                await asyncio.sleep(60)
            except Exception as e:
                logger.error(f"Error in notification scheduler loop: {e}")
                await asyncio.sleep(60)
    
    async def _send_daily_digests(self):
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

notification_scheduler = NotificationScheduler()

# --- Temp Scan Cleanup Scheduler ---

def cleanup_expired_scans():
    """Delete expired temporary scans"""
    from db.database import SessionLocal
    from models.temp_scan import TempScan
    db = SessionLocal()
    try:
        expired = db.query(TempScan).filter(TempScan.expires_at < datetime.now(timezone.utc)).all()
        count = len(expired)
        for scan in expired:
            db.delete(scan)
        db.commit()
        if count > 0:
            logger.info(f"Cleaned up {count} expired temp scans")
    except Exception as e:
        logger.error(f"Error cleaning up temp scans: {e}")
        db.rollback()
    finally:
        db.close()

def start_cleanup_scheduler():
    """Start the background scheduler for temp scan cleanup"""
    import schedule
    import time

    def run_scheduler():
        schedule.every().hour.do(cleanup_expired_scans)
        while True:
            schedule.run_pending()
            time.sleep(60)

    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    logger.info("Temp scan cleanup scheduler started")

def stop_cleanup_scheduler():
    logger.info("Temp scan cleanup scheduler stopped (manual stop not implemented)")