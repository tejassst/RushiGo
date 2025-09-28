# RushiGo Email Notification System Documentation

## 📧 Overview

RushiGo's email notification system automatically sends deadline reminders to users using Mailgun. The system includes beautiful HTML email templates, automatic scheduling, and comprehensive logging.

## 🚀 Features

### ✅ **Automatic Notifications**
- **Deadline Reminders**: 3 days, 1 day, and same-day notifications
- **Daily Digest**: Morning summary of upcoming and overdue deadlines (8 AM)
- **Overdue Alerts**: Notifications for missed deadlines
- **Smart Deduplication**: Prevents duplicate notifications

### ✅ **Email Templates**
- **Responsive Design**: Mobile-friendly HTML templates
- **Professional Styling**: Clean, modern design with RushiGo branding
- **Multiple Formats**: Both HTML and plain text versions
- **Personalization**: User names, deadline details, and course information

### ✅ **Background Processing**
- **Non-blocking**: Runs in background thread
- **Automatic Scheduling**: Hourly deadline checks, daily digest at 8 AM
- **Error Handling**: Comprehensive error logging and recovery
- **Database Logging**: All notifications tracked in database

## 🛠️ Technical Architecture

### **Core Components**

1. **NotificationService** (`services/notification_service.py`)
   - Main service for sending notifications
   - Handles deadline checking and email generation
   - Database interaction and logging

2. **EmailTemplates** (`services/email_templates.py`)
   - HTML and text email template generation
   - Responsive design with inline CSS
   - Template customization support

3. **Scheduler** (`services/scheduler.py`)
   - Background task scheduling
   - Automatic deadline monitoring
   - Daily digest distribution

4. **API Endpoints** (`routers/notifications.py`)
   - Manual notification triggers
   - Testing endpoints
   - Statistics and monitoring

### **Database Models**

- **User**: User information and preferences
- **Deadline**: Deadline details with completion status
- **Notification**: Notification history and status tracking

## ⚙️ Configuration

### **Environment Variables**

```bash
# Mailgun Configuration
MAILGUN_DOMAIN=sandbox920c0c8a6b6d49f493bc00545ef37db7.mailgun.org
MAILGUN_API_KEY=your-mailgun-private-api-key
FROM_EMAIL=Rushigo <no-reply@your-domain.mailgun.org>

# Database
DATABASE_URL=postgresql://user:pass@host:port/database

# Application
DEBUG=True
API_PREFIX=/api
```

### **Required Dependencies**

```txt
fastapi==0.104.1
sqlalchemy==2.0.23
requests==2.31.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
```

## 📋 API Reference

### **Base URL**
```
http://localhost:8000/api/notifications
```

### **Endpoints**

#### **POST /send-deadline-notifications**
Manually trigger deadline notification check for all users.

**Response:**
```json
{
  "message": "Notification check completed",
  "stats": {
    "approaching_sent": 5,
    "overdue_sent": 2,
    "errors": 0
  }
}
```

#### **POST /send-test-notification/{user_id}**
Send test notification to specific user.

**Parameters:**
- `user_id` (int): Target user ID

**Response:**
```json
{
  "message": "Test notification sent to user@example.com"
}
```

#### **POST /send-daily-digest/{user_id}**
Send daily digest to specific user.

**Parameters:**
- `user_id` (int): Target user ID

**Response:**
```json
{
  "message": "Daily digest sent to user 123"
}
```

#### **GET /statistics**
Get notification system statistics.

**Response:**
```json
{
  "total_notifications": 150,
  "sent_notifications": 145,
  "failed_notifications": 5
}
```

## 🎯 Notification Logic

### **Deadline Reminder Schedule**

| Time Before Deadline | Notification Type | Frequency |
|-----------------------|-------------------|-----------|
| 3 days | Approaching | Once |
| 1 day | Approaching | Once |
| Same day (0-24 hours) | Approaching | Once |
| After deadline | Overdue | Once per day |

### **Daily Digest Schedule**
- **Time**: 8:00 AM daily
- **Content**: Upcoming deadlines (next 7 days) + overdue deadlines
- **Recipients**: All active users with deadlines

### **Deduplication Logic**
- Tracks sent notifications in database
- Prevents duplicate notifications for same deadline on same day
- Resets daily for overdue notifications

## 📧 Email Templates

### **Approaching Deadline**
```
Subject: ⏰ Deadline Reminder: [Deadline Title]

Content:
- Personalized greeting
- Deadline details (title, course, date)
- Days remaining countdown
- Call-to-action to complete task
- Professional footer
```

### **Overdue Deadline**
```
Subject: ⚠️ Overdue: [Deadline Title]

Content:
- Urgent notification styling
- Days overdue count
- Encouragement to complete
- Support information
```

### **Daily Digest**
```
Subject: 📊 Daily Deadline Digest - [Date]

Content:
- Summary of upcoming deadlines (next 7 days)
- List of overdue deadlines
- Priority indicators
- Quick action links
```

## 🧪 Testing

### **Manual Testing**

#### **1. Test Mailgun Connection**
```bash
cd backend
python scripts/simple_mailgun_test.py
```

#### **2. Test Full Notification System**
```bash
python scripts/test_mailgun.py
```

#### **3. Test API Endpoints**
```bash
# Test deadline notifications
curl -X POST "http://localhost:8000/api/notifications/send-deadline-notifications"

# Test user notification
curl -X POST "http://localhost:8000/api/notifications/send-test-notification/1"

# Get statistics
curl -X GET "http://localhost:8000/api/notifications/statistics"
```

### **Test Email Recipients**
For sandbox domain, add authorized recipients in Mailgun dashboard:
- Go to **Sending** → **Authorized Recipients**
- Add and verify test email addresses

## 🚀 Deployment

### **Development Setup**

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your Mailgun credentials
```

3. **Initialize Database**
```bash
python scripts/init_db.py
```

4. **Start Server**
```bash
python main.py
```

### **Production Deployment**

1. **Environment Variables**
   - Set production Mailgun domain
   - Use production database URL
   - Set `DEBUG=False`

2. **Email Domain**
   - Upgrade from sandbox to verified domain
   - Configure DNS records for domain verification
   - Remove authorized recipient restrictions

3. **Monitoring**
   - Monitor notification statistics endpoint
   - Set up error alerting
   - Track email delivery rates

## 🔧 Customization

### **Email Template Customization**

Edit `services/email_templates.py`:

```python
def deadline_approaching_html(self, user_name: str, deadline_title: str, ...):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <!-- Your custom HTML template -->
        <h1 style="color: #your-brand-color;">Custom Subject</h1>
        <!-- ... -->
    </body>
    </html>
    """
```

### **Notification Schedule Customization**

Edit `services/scheduler.py`:

```python
# Change check frequency (currently every hour)
if now.minute == 0:  # Change to now.minute % 30 == 0 for every 30 minutes

# Change daily digest time (currently 8 AM)
if now.hour == 8 and now.minute == 0:  # Change hour to desired time
```

### **Notification Timing Customization**

Edit `services/notification_service.py`:

```python
# Change deadline warning periods (currently 3 days)
Deadline.date <= now + timedelta(days=3)  # Change days value
```

## 📊 Monitoring & Analytics

### **Database Queries**

#### **Notification Statistics**
```sql
-- Total notifications sent
SELECT COUNT(*) FROM notifications WHERE sent = true;

-- Notifications by type
SELECT message, COUNT(*) 
FROM notifications 
WHERE sent = true 
GROUP BY message;

-- Daily notification volume
SELECT DATE(created_at), COUNT(*) 
FROM notifications 
WHERE sent = true 
GROUP BY DATE(created_at);
```

#### **User Engagement**
```sql
-- Users receiving notifications
SELECT COUNT(DISTINCT user_id) 
FROM notifications 
WHERE sent = true;

-- Most active users
SELECT user_id, COUNT(*) as notification_count
FROM notifications 
WHERE sent = true 
GROUP BY user_id 
ORDER BY notification_count DESC;
```

### **System Health Checks**

1. **Email Delivery Rate**
   - Monitor successful vs failed notifications
   - Track Mailgun delivery statistics
   - Set up alerts for high failure rates

2. **Scheduler Health**
   - Verify hourly notifications are running
   - Check daily digest delivery
   - Monitor background process status

3. **Database Performance**
   - Monitor notification table growth
   - Optimize queries for large datasets
   - Archive old notifications

## 🛟 Troubleshooting

### **Common Issues**

#### **Email Not Sending (401 Error)**
```
Problem: Invalid API key
Solution: 
1. Check Mailgun dashboard → Settings → API Keys
2. Copy Private API key (NOT Public)
3. Update MAILGUN_API_KEY in .env
4. Restart application
```

#### **Email Not Received (400 Error)**
```
Problem: Unauthorized recipient (sandbox domain)
Solution:
1. Go to Mailgun dashboard → Sending → Authorized Recipients
2. Add recipient email address
3. Verify email address
4. Test again
```

#### **Scheduler Not Running**
```
Problem: Background notifications not working
Solution:
1. Check server logs for scheduler errors
2. Verify scheduler.start() is called in main.py
3. Check database connection
4. Restart application
```

#### **Database Connection Issues**
```
Problem: Notification logging fails
Solution:
1. Verify DATABASE_URL in .env
2. Check Supabase connection
3. Test database connectivity
4. Check SQLAlchemy configuration
```

### **Debug Commands**

```bash
# Test database connection
python scripts/test_connection.py

# Test Mailgun integration
python scripts/simple_mailgun_test.py

# Check notification logs
grep "notification" logs/app.log

# Verify scheduler status
curl -X GET "http://localhost:8000/api/notifications/statistics"
```

## 📝 Maintenance

### **Regular Tasks**

1. **Weekly**
   - Review notification statistics
   - Check email delivery rates
   - Monitor error logs

2. **Monthly**
   - Archive old notifications
   - Update email templates if needed
   - Review user engagement metrics

3. **Quarterly**
   - Evaluate Mailgun usage and costs
   - Update dependencies
   - Performance optimization

### **Scaling Considerations**

1. **High Volume**
   - Implement email queuing system
   - Add rate limiting for API endpoints
   - Consider email service alternatives

2. **Performance**
   - Database indexing on notification queries
   - Caching for frequent operations
   - Background job processing

3. **Reliability**
   - Email delivery retries
   - Backup notification methods
   - Health monitoring alerts

## 🔐 Security

### **Data Protection**
- Environment variables for sensitive data
- API key rotation procedures
- Database encryption at rest

### **Email Security**
- SPF/DKIM records for domain verification
- Secure email content (no sensitive data)
- Rate limiting to prevent abuse

### **Access Control**
- API endpoint authentication
- User-specific notification access
- Admin-only statistics endpoints

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review error logs in `logs/` directory
3. Test individual components with provided scripts
4. Verify environment configuration

**System Status**: ✅ **OPERATIONAL**
**Last Updated**: 2024
**Version**: 1.0.0