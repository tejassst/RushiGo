"""
Email templates for deadline notifications
"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class EmailTemplates:
    @staticmethod
    def deadline_approaching_text(user_name: str, deadline_title: str, deadline_date: datetime, days_left: int, course: Optional[str] = None) -> str:
        """Plain text template for deadline approaching notification"""
        course_text = f" for {course}" if course else ""
        
        return f"""
Hi {user_name},

This is a friendly reminder that your deadline{course_text} is approaching:

📋 Deadline: {deadline_title}
📅 Due Date: {deadline_date.strftime('%B %d, %Y at %I:%M %p')}
⏰ Time Remaining: {days_left} day{'s' if days_left != 1 else ''}

Don't forget to complete your task on time!

Best regards,
The RushiGo Team

---
You're receiving this because you have deadline notifications enabled.
To manage your notifications, log into your RushiGo account.
        """.strip()

    @staticmethod
    def deadline_approaching_html(user_name: str, deadline_title: str, deadline_date: datetime, days_left: int, course: Optional[str] = None) -> str:
        """HTML template for deadline approaching notification"""
        course_text = f" for <strong>{course}</strong>" if course else ""
        
        urgency_color = "#ff4444" if days_left <= 1 else "#ff8800" if days_left <= 3 else "#4CAF50"
        
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Deadline Reminder</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
        .content {{ padding: 30px; }}
        .deadline-card {{ background-color: #f8f9ff; border-left: 4px solid {urgency_color}; padding: 20px; margin: 20px 0; border-radius: 0 5px 5px 0; }}
        .days-left {{ color: {urgency_color}; font-size: 24px; font-weight: bold; }}
        .footer {{ background-color: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #6c757d; font-size: 12px; }}
        .btn {{ display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Deadline Reminder</h1>
            <p>Don't let your deadlines slip away!</p>
        </div>
        
        <div class="content">
            <h2>Hi {user_name}! 👋</h2>
            <p>This is a friendly reminder that your deadline{course_text} is approaching:</p>
            
            <div class="deadline-card">
                <h3>📋 {deadline_title}</h3>
                <p><strong>📅 Due Date:</strong> {deadline_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                <p><strong>⏰ Time Remaining:</strong> <span class="days-left">{days_left} day{'s' if days_left != 1 else ''}</span></p>
            </div>
            
            <p>Don't forget to complete your task on time! You've got this! 💪</p>
            
            <a href="http://localhost:3000/deadlines" class="btn">View Your Deadlines</a>
        </div>
        
        <div class="footer">
            <p>You're receiving this because you have deadline notifications enabled.</p>
            <p>To manage your notifications, log into your RushiGo account.</p>
            <p>© 2025 RushiGo Team</p>
        </div>
    </div>
</body>
</html>
        """.strip()

    @staticmethod
    def deadline_overdue_text(user_name: str, deadline_title: str, deadline_date: datetime, days_overdue: int, course: Optional[str] = None) -> str:
        """Plain text template for overdue deadline notification"""
        course_text = f" for {course}" if course else ""
        
        return f"""
Hi {user_name},

Your deadline{course_text} is now overdue:

📋 Deadline: {deadline_title}
📅 Was Due: {deadline_date.strftime('%B %d, %Y at %I:%M %p')}
⚠️ Overdue by: {days_overdue} day{'s' if days_overdue != 1 else ''}

Please complete this task as soon as possible!

Best regards,
The RushiGo Team

---
You're receiving this because you have deadline notifications enabled.
        """.strip()

    @staticmethod
    def daily_digest_text(user_name: str, upcoming_deadlines: list, overdue_deadlines: list) -> str:
        """Daily digest of all upcoming and overdue deadlines"""
        text = f"Hi {user_name},\n\nHere's your daily deadline digest:\n\n"
        
        if upcoming_deadlines:
            text += "📅 UPCOMING DEADLINES:\n"
            for deadline in upcoming_deadlines:
                days_left = (deadline['date'] - datetime.now()).days
                text += f"• {deadline['title']} - Due in {days_left} day{'s' if days_left != 1 else ''}\n"
            text += "\n"
            
        if overdue_deadlines:
            text += "⚠️ OVERDUE DEADLINES:\n"
            for deadline in overdue_deadlines:
                days_overdue = (datetime.now() - deadline['date']).days
                text += f"• {deadline['title']} - {days_overdue} day{'s' if days_overdue != 1 else ''} overdue\n"
            text += "\n"
            
        if not upcoming_deadlines and not overdue_deadlines:
            text += "🎉 Great job! You have no upcoming or overdue deadlines.\n\n"
            
        text += "Stay organized and keep up the great work!\n\nThe RushiGo Team"
        
        return text
