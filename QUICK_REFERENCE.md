# RushiGo Notification System - Quick Reference

## 🚀 Quick Start

### **Setup (3 minutes)**

```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Configure Mailgun
# Edit backend/.env with your Mailgun credentials

# 3. Test email
cd backend && python scripts/simple_mailgun_test.py

# 4. Start server
python main.py
```

### **Test Notifications**

```bash
# Manual trigger
curl -X POST "http://localhost:8000/api/notifications/send-deadline-notifications"

# Test specific user
curl -X POST "http://localhost:8000/api/notifications/send-test-notification/1"

# Get stats
curl -X GET "http://localhost:8000/api/notifications/statistics"
```

## ⚙️ Configuration Checklist

### **Required Environment Variables**

```bash
MAILGUN_DOMAIN=your-domain.mailgun.org          # ✅ Set
MAILGUN_API_KEY=your-private-api-key            # ✅ Set
FROM_EMAIL=YourApp <no-reply@your-domain.org>   # ✅ Set
DATABASE_URL=postgresql://...                   # ✅ Set
```

### **Mailgun Setup**

- [ ] Create Mailgun account
- [ ] Get Private API key (NOT Public)
- [ ] Add authorized recipients (for sandbox)
- [ ] Test with `scripts/simple_mailgun_test.py`

## 📧 Notification Types

| Type             | Trigger                 | Frequency       | Template                 |
| ---------------- | ----------------------- | --------------- | ------------------------ |
| **Approaching**  | 3 days, 1 day, same day | Once per period | `deadline_approaching_*` |
| **Overdue**      | After deadline passes   | Once per day    | `deadline_overdue_*`     |
| **Daily Digest** | 8 AM daily              | Daily           | `daily_digest_*`         |

## 🛠️ Quick Fixes

### **401 Unauthorized**

```bash
# Wrong API key
1. Go to Mailgun → Settings → API Keys
2. Copy Private API key
3. Update MAILGUN_API_KEY in .env
4. Restart server
```

### **400 Bad Request**

```bash
# Unauthorized recipient (sandbox only)
1. Go to Mailgun → Sending → Authorized Recipients
2. Add recipient email
3. Verify email
```

### **No Email Received**

```bash
# Check spam folder
# Verify authorized recipients
# Test with: python scripts/simple_mailgun_test.py
```

## 📁 File Structure

```
backend/
├── services/
│   ├── notification_service.py    # Main notification logic
│   ├── email_templates.py         # HTML/text templates
│   └── scheduler.py               # Background scheduling
├── routers/
│   └── notifications.py           # API endpoints
├── scripts/
│   ├── simple_mailgun_test.py     # Basic email test
│   └── test_mailgun.py            # Comprehensive test
└── models/
    └── notifications.py           # Database model
```

## 🎯 Common Tasks

### **Add New Notification Type**

1. Add template in `email_templates.py`
2. Add logic in `notification_service.py`
3. Update scheduler if needed
4. Test with API endpoint

### **Customize Email Templates**

1. Edit methods in `EmailTemplates` class
2. Update HTML/CSS styling
3. Test with `send-test-notification` endpoint

### **Change Schedule**

1. Edit `scheduler.py`
2. Modify time conditions
3. Restart server

## 🔧 Development Commands

```bash
# Start development server
python main.py

# Test email system
python scripts/simple_mailgun_test.py

# Initialize database
python scripts/init_db.py

# View API docs
# Go to http://localhost:8000/docs
```

## 📊 Monitoring

### **Check System Health**

```bash
# Get notification stats
curl http://localhost:8000/api/notifications/statistics

# Check recent notifications in database
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

### **Debug Issues**

```bash
# Check server logs
tail -f logs/app.log

# Test Mailgun connection
python scripts/simple_mailgun_test.py

# Verify environment
python -c "import os; print(os.getenv('MAILGUN_API_KEY')[:20])"
```

## 🚀 Production Deployment

### **Before Deploy:**

- [ ] Use verified domain (not sandbox)
- [ ] Set production DATABASE_URL
- [ ] Set DEBUG=False
- [ ] Configure proper FROM_EMAIL
- [ ] Test thoroughly

### **After Deploy:**

- [ ] Verify scheduled notifications work
- [ ] Monitor email delivery rates
- [ ] Set up error alerting
- [ ] Test all API endpoints

---

## 🆘 Emergency Fixes

### **Stop All Notifications**

```python
# In scheduler.py, set:
self.running = False
```

### **Reset Notification History**

```sql
-- Clear notification log (BE CAREFUL!)
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';
```

### **Manual Email Send**

```python
from core.emails_utils import send_email
send_email("test@example.com", "Test", "Test message")
```

**Status**: ✅ **READY FOR PRODUCTION**
