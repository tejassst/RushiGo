"""
Test script to manually trigger notification check
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from services.notification_service import NotificationService
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def test_notifications():
    """Test the notification service"""
    logger.info("Starting notification test...")
    
    try:
        # Create notification service
        notification_service = NotificationService()
        
        # Run notification check
        logger.info("Running notification check...")
        stats = notification_service.check_and_send_deadline_notifications()
        
        # Display results
        logger.info("=" * 50)
        logger.info("NOTIFICATION TEST RESULTS")
        logger.info("=" * 50)
        logger.info(f"Approaching notifications sent: {stats['approaching_sent']}")
        logger.info(f"Overdue notifications sent: {stats['overdue_sent']}")
        logger.info(f"Errors encountered: {stats['errors']}")
        logger.info("=" * 50)
        
        if stats['approaching_sent'] > 0 or stats['overdue_sent'] > 0:
            logger.info("✅ SUCCESS: Notifications were sent!")
        elif stats['errors'] > 0:
            logger.error("❌ ERROR: Some notifications failed to send")
        else:
            logger.info("ℹ️  INFO: No notifications needed at this time")
            logger.info("   (No deadlines in notification windows: 3 days, 1 day, same day, 1 hour, or overdue)")
        
    except Exception as e:
        logger.error(f"❌ Test failed with error: {str(e)}", exc_info=True)

if __name__ == "__main__":
    test_notifications()
