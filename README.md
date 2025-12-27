# 🎯 RushiGo - Smart Deadline Management System

> **Keep your academic goals on track with intelligent deadline reminders and beautiful email notifications.**

## 🌟 Features

### ✅ **Smart Deadline Management**

- Create, track, and organize academic deadlines
- Course-based categorization
- Progress tracking and completion status
- Team collaboration and shared deadlines

### 📧 **Intelligent Email Notifications**

- **Automatic Reminders**: 3 days, 1 day, and same-day notifications
- **Daily Digest**: Morning summary of upcoming and overdue deadlines
- **Beautiful Templates**: Responsive HTML emails with professional design
- **Smart Scheduling**: Background processing with no performance impact

### 🌐 **Modern Tech Stack**

- **Backend**: FastAPI (Python) with SQLAlchemy ORM
- **Database**: PostgreSQL (Supabase Cloud)
- **Email Service**: Mailgun integration
- **Architecture**: RESTful API with automatic documentation

### 🚀 **Production Ready**

- Cloud database with automatic backups
- Comprehensive error handling and logging
- Background task scheduling
- API documentation with Swagger UI

## 🛠️ Quick Start

### **Prerequisites**

- Python 3.8+
- PostgreSQL database (or Supabase account)
- Mailgun account for email notifications

### **Installation**

1. **Clone Repository**

```bash
git clone https://github.com/yourusername/rushiGo.git
cd rushiGo
```

2. **Setup Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure Environment**

```bash
cp .env.example .env
# Edit .env with your credentials (see Configuration section)
```

4. **Initialize Database**

```bash
python scripts/init_db.py
```

5. **Start Server**

```bash
python main.py
```

6. **Access Application**

- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:8000/admin

## ⚙️ Configuration

### **Environment Variables**

Create a `.env` file in the `backend/` directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase (if using)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Mailgun Email Service
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_API_KEY=your-private-api-key
FROM_EMAIL=RushiGo <no-reply@your-domain.mailgun.org>

# Application Settings
DEBUG=True
API_PREFIX=/api
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional: AI Integration
GEMINI_API_KEY=your-gemini-api-key
```

### **Mailgun Setup**

1. **Create Account**: Sign up at [mailgun.com](https://mailgun.com)
2. **Get API Key**: Go to Settings → API Keys → Copy Private API key
3. **Add Domain**: Use sandbox domain for testing
4. **Authorized Recipients**: Add test email addresses for sandbox domain
5. **Test Setup**: Run `python scripts/simple_mailgun_test.py`

### **Database Setup**

#### **Option 1: Supabase (Recommended)**

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Update `DATABASE_URL` in `.env`

#### **Option 2: Local PostgreSQL**

1. Install PostgreSQL locally
2. Create database: `createdb rushigo`
3. Update `DATABASE_URL`: `postgresql://user:pass@localhost:5432/rushigo`

## 📁 Project Structure

```
rushiGo/
├── backend/                    # FastAPI Backend
│   ├── core/                  # Core functionality
│   │   ├── config.py         # Configuration management
│   │   └── emails_utils.py   # Email utilities
│   ├── db/                   # Database layer
│   │   └── database.py       # Database connection
│   ├── models/               # SQLAlchemy models
│   │   ├── user.py          # User model
│   │   ├── deadline.py      # Deadline model
│   │   ├── team.py          # Team model
│   │   └── notifications.py # Notification logs
│   ├── routers/             # API endpoints
│   │   ├── auth.py          # Authentication
│   │   ├── user.py          # User management
│   │   ├── deadline.py      # Deadline CRUD
│   │   └── notifications.py # Notification API
│   ├── services/            # Business logic
│   │   ├── notification_service.py  # Email notifications
│   │   ├── email_templates.py       # Email templates
│   │   └── scheduler.py             # Background tasks
│   ├── scripts/             # Utility scripts
│   │   ├── init_db.py       # Database initialization
│   │   └── test_mailgun.py  # Email testing
│   ├── main.py              # Application entry point
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── docs/                    # Documentation
│   ├── NOTIFICATION_SYSTEM_DOCS.md  # Comprehensive docs
│   ├── API_DOCUMENTATION.md         # API reference
│   └── QUICK_REFERENCE.md           # Developer guide
└── README.md               # This file
```

## 🚀 API Reference

### **Base URL**: `http://localhost:8000/api`

### **Core Endpoints**

#### **Authentication**

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

#### **Deadlines**

- `GET /deadlines` - List user deadlines
- `POST /deadlines` - Create deadline
- `PUT /deadlines/{id}` - Update deadline
- `DELETE /deadlines/{id}` - Delete deadline

#### **Notifications**

- `POST /notifications/send-deadline-notifications` - Manual trigger
- `POST /notifications/send-test-notification/{user_id}` - Test email
- `GET /notifications/statistics` - System stats

### **Interactive Documentation**

Visit `http://localhost:8000/docs` for complete API documentation with interactive testing.

## 📧 Email Notification System

### **Automatic Notifications**

- **Deadline Reminders**: Sent 3 days, 1 day, and same-day before deadlines
- **Daily Digest**: Morning summary at 8 AM with upcoming and overdue items
- **Overdue Alerts**: Daily notifications for missed deadlines

### **Email Templates**

- **Responsive Design**: Mobile-friendly HTML templates
- **Professional Styling**: Clean, modern design with branding
- **Personalization**: User names, deadline details, course information

### **Testing Notifications**

```bash
# Test Mailgun connection
cd backend && python scripts/simple_mailgun_test.py

# Test user notification
curl -X POST "http://localhost:8000/api/notifications/send-test-notification/1"

# Manual notification trigger
curl -X POST "http://localhost:8000/api/notifications/send-deadline-notifications"
```

## 🧪 Development

### **Running Tests**

```bash
# Test email system
python scripts/test_mailgun.py

# Test database connection
python scripts/test_connection.py

# API endpoint testing
curl -X GET "http://localhost:8000/api/notifications/statistics"
```

### **Development Server**

```bash
# Start with auto-reload
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Database Management**

```bash
# Initialize/reset database
python scripts/init_db.py

# Create migration (manual)
# Edit models and restart server - SQLAlchemy auto-creates tables
```

## 🌐 Deployment

### **Development Deployment**

1. Follow Quick Start guide above
2. Use sandbox Mailgun domain
3. Use Supabase free tier
4. Set `DEBUG=True`

### **Production Deployment**

#### **Environment Setup**

```bash
# Production environment variables
DEBUG=False
DATABASE_URL=postgresql://prod-user:pass@prod-host:5432/rushigo
MAILGUN_DOMAIN=mail.yourdomain.com  # Verified domain
ALLOWED_ORIGINS=https://yourdomain.com
```

#### **Database**

- Use production PostgreSQL or Supabase Pro
- Set up automated backups
- Configure connection pooling

#### **Email Service**

- Upgrade from Mailgun sandbox to verified domain
- Configure DNS records (SPF, DKIM)
- Remove authorized recipient restrictions

#### **Server**

- Deploy on cloud platform (Heroku, AWS, DigitalOcean)
- Set up reverse proxy (Nginx)
- Configure SSL certificates
- Set up monitoring and logging

## 📊 Monitoring & Analytics

### **System Health**

```bash
# Check notification statistics
curl -X GET "http://localhost:8000/api/notifications/statistics"

# Database health
python scripts/test_connection.py

# Email delivery test
python scripts/simple_mailgun_test.py
```

### **Performance Metrics**

- **Response Time**: < 2 seconds for API endpoints
- **Email Delivery**: < 5 minutes via Mailgun
- **Database Queries**: Optimized with proper indexing
- **Background Tasks**: Non-blocking notification processing

## 🛟 Troubleshooting

### **Common Issues**

#### **Email Not Sending (401 Error)**

```bash
# Solution: Fix Mailgun API key
1. Check Mailgun dashboard → Settings → API Keys
2. Copy Private API key (NOT Public)
3. Update MAILGUN_API_KEY in .env
4. Restart application
```

#### **Database Connection Failed**

```bash
# Solution: Check database configuration
1. Verify DATABASE_URL in .env
2. Test connection: python scripts/test_connection.py
3. Check Supabase project status
4. Verify credentials and permissions
```

#### **No Email Received**

```bash
# Solution: Check email configuration
1. Verify recipient in Mailgun authorized list (sandbox)
2. Check spam folder
3. Test with: python scripts/simple_mailgun_test.py
4. Check Mailgun delivery logs
```

### **Debug Commands**

```bash
# View server logs
tail -f logs/app.log

# Test individual components
python scripts/simple_mailgun_test.py     # Email
python scripts/test_connection.py        # Database
curl -X GET "http://localhost:8000/health"  # API
```

## 🤝 Contributing

### **Development Workflow**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Create Pull Request

### **Code Standards**

- Follow PEP 8 for Python code
- Add docstrings for all functions
- Include type hints
- Write tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Mailgun** - Email delivery service
- **Supabase** - Open source Firebase alternative
- **Pydantic** - Data validation using Python type hints

## 📞 Support

- **Documentation**: See `docs/` folder for detailed guides
- **API Reference**: Visit `http://localhost:8000/docs`
- **Issues**: Create GitHub issue for bugs or feature requests
- **Email**: Contact team for support

---

**Status**: **Production Ready**  
**Version**: 1.0.0  
**Last Updated**: 2024

Made with ❤️ for students who want to stay on top of their academic goals.
