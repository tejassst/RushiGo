# 🎯 RushiGo - AI-Powered Deadline Management System

> **Never miss a deadline again with AI document processing and intelligent email reminders.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://rushigo.tsapps.tech)
[![Backend API](https://img.shields.io/badge/API-live-blue)](https://rushigo-backend.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

### 🤖 **AI Document Processing**

- **Upload & Extract**: Upload syllabus PDFs and let AI automatically extract all deadlines
- **Google Gemini Integration**: Powered by advanced LLM for accurate deadline detection
- **Smart Parsing**: Extracts dates, assignments, courses, and descriptions automatically
- **Multiple Formats**: Supports PDF, TXT, and document files

### 📧 **Intelligent Email Notifications**

- **Time-Windowed Reminders**:
  - 3 days before deadline
  - 1 day before deadline
  - 1 hour before deadline
- **Overdue Alerts**: Daily reminders until deadline is completed
- **Gmail API Integration**: Secure OAuth2 authentication
- **Beautiful Templates**: Responsive HTML emails with professional design
- **Timezone-Aware**: Respects UTC with clear timezone display
- **Smart Deduplication**: Each notification sent only once per threshold

### 👥 **Team Collaboration**

- Create and manage teams
- Share deadlines with team members
- Track team progress
- Collaborative deadline management

### � **Modern User Interface**

- **React + TypeScript**: Type-safe, modern frontend
- **Tailwind CSS**: Beautiful, responsive design
- **Real-time Updates**: Instant deadline synchronization
- **Interactive Modals**: Learn about notification system with animated bell icon
- **Dark Mode Ready**: Professional gradient themes

### 🚀 **Production Ready**

- Deployed on Render (Backend) and Vercel (Frontend)
- PostgreSQL database with automatic backups
- Background scheduler for notifications (runs every 5 minutes)
- Comprehensive error handling and logging
- API documentation with Swagger UI

## 🛠️ Quick Start

### **Prerequisites**

- Python 3.8+
- PostgreSQL database (or Supabase account)
- Gmail API credentials for email notifications (see [GMAIL_SETUP.md](backend/GMAIL_SETUP.md))

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

# Gmail API Email Service
GMAIL_CREDENTIALS_PATH=/path/to/credentials.json
GMAIL_TOKEN_PATH=/path/to/token.json
FROM_EMAIL=RushiGo Notifications

# Application Settings
DEBUG=True
API_PREFIX=/api
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# AI Integration
GEMINI_API_KEY=your-gemini-api-key
```

### **Gmail API Setup**

1. **Enable Gmail API**: Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Create OAuth2 Credentials**: Download `credentials.json`
3. **Authenticate**: Run `python scripts/test_gmail.py` to generate `token.json`
4. **Configure Paths**: Set `GMAIL_CREDENTIALS_PATH` and `GMAIL_TOKEN_PATH` in `.env`
5. **Test Setup**: Run `python scripts/test_gmail.py` to verify email sending

For detailed setup instructions, see [GMAIL_SETUP.md](backend/GMAIL_SETUP.md)

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
# Test Gmail API connection
cd backend && python scripts/test_gmail.py

# Test user notification
curl -X POST "http://localhost:8000/api/notifications/send-test-notification/1"

# Manual notification trigger
curl -X POST "http://localhost:8000/api/notifications/send-deadline-notifications"
```

## 🧪 Development

### **Running Tests**

```bash
# Test email system (Gmail API)
python scripts/test_gmail.py

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
2. Set up Gmail API credentials (OAuth2)
3. Use Supabase free tier
4. Set `DEBUG=True`

### **Production Deployment**

#### **Environment Setup**

```bash
# Production environment variables
DEBUG=False
DATABASE_URL=postgresql://prod-user:pass@prod-host:5432/rushigo
GMAIL_CREDENTIALS_PATH=/etc/secrets/credentials.json
GMAIL_TOKEN_PATH=/etc/secrets/token.json
ALLOWED_ORIGINS=https://yourdomain.com
```

#### **Database**

- Use production PostgreSQL or Supabase Pro
- Set up automated backups
- Configure connection pooling

#### **Email Service**

- Upload Gmail API credentials to production server
- Ensure OAuth2 token is properly configured
- Set appropriate file paths for credentials and token

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
python scripts/test_gmail.py
```

### **Performance Metrics**

- **Response Time**: < 2 seconds for API endpoints
- **Email Delivery**: Near-instant via Gmail API
- **Database Queries**: Optimized with proper indexing
- **Background Tasks**: Non-blocking notification processing

## 🛟 Troubleshooting

### **Common Issues**

#### **Email Not Sending (Authentication Error)**

```bash
# Solution: Fix Gmail API credentials
1. Ensure credentials.json is in the correct location
2. Re-authenticate: python scripts/test_gmail.py
3. Check token.json is generated and valid
4. Verify GMAIL_CREDENTIALS_PATH and GMAIL_TOKEN_PATH in .env
5. Restart application
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
# Solution: Check Gmail API configuration
1. Verify Gmail API is enabled in Google Cloud Console
2. Check spam folder
3. Test with: python scripts/test_gmail.py
4. Ensure OAuth2 token hasn't expired (re-authenticate if needed)
5. Verify sending email has Gmail access
```

### **Debug Commands**

```bash
# View server logs
tail -f logs/app.log

# Test individual components
python scripts/test_gmail.py              # Email (Gmail API)
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

## � Deployment

RushiGo is ready to deploy to production! See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment instructions.

### **Quick Deploy**

**Backend** (Render):

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy!

**Frontend** (Vercel):

1. Push code to GitHub
2. Connect repository to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy!

**Required Services**:

- PostgreSQL database (free on Render)
- Gmail API credentials
- Gemini API key

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guide with screenshots and troubleshooting.

## �📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Gmail API** - Email delivery service
- **Supabase** - Open source Firebase alternative (database option)
- **Pydantic** - Data validation using Python type hints
- **React + Vite** - Modern frontend framework and build tool
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support

- **Documentation**: See `docs/` folder for detailed guides
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Reference**: Visit `http://localhost:8000/api/docs`
- **Issues**: Create GitHub issue for bugs or feature requests

---

**Status**: **✅ Production Ready**  
**Version**: 1.0.0  
**Last Updated**: December 2025

Made with ❤️ for students who want to stay on top of their academic goals.
