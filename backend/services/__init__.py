"""
Services package for RushiGo backend
"""

from .notification_service import NotificationService, get_notification_service
from .email_templates import EmailTemplates

__all__ = [
    "NotificationService",
    "get_notification_service", 
    "EmailTemplates"
]