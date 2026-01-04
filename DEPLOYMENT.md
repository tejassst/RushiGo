# 🚀 RushiGo Deployment Guide

This guide will walk you through deploying RushiGo to production using Render (backend) and Vercel/Netlify (frontend).

## 📋 Pre-Deployment Checklist

### Required Services & Accounts

- [ ] GitHub repository (for deployment)
- [ ] Render account (for backend hosting)
- [ ] Vercel or Netlify account (for frontend hosting)
- [ ] PostgreSQL database (Render provides free PostgreSQL or use Supabase)
- [ ] Gmail API credentials (for email notifications)
- [ ] Gemini API key (for document scanning)

---

## 🔧 Part 1: Backend Deployment (Render)

### Step 1: Setup Gmail API Credentials

1. **Follow the Gmail setup guide** in `backend/GMAIL_SETUP.md`
2. **Get your credentials**:

   - Download `credentials.json` from Google Cloud Console
   - Generate `token.json` by running the auth script locally

3. **Important**: You'll need to encode these files for environment variables:
   ```bash
   cd backend
   cat credentials.json | base64 > credentials.json.b64
   cat token.json | base64 > token.json.b64
   ```

### Step 2: Prepare Database

#### Option A: Use Render PostgreSQL (Recommended - Free)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `rushigo-db`
   - Plan: Free
   - Region: Oregon (or closest to you)
4. Click "Create Database"
5. Copy the **Internal Database URL** (starts with `postgresql://`)

#### Option B: Use Supabase

1. Create project at [Supabase](https://supabase.com/)
2. Go to Settings → Database
3. Copy the **Connection String** (URI format)

### Step 3: Deploy Backend on Render

1. **Connect GitHub Repository**:

   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the `rushiGo` repository

2. **Configure Web Service**:

   - **Name**: `rushigo-backend`
   - **Region**: Oregon (or closest)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (render.yaml handles this)
   - **Runtime**: Python 3
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

3. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable":

   ```bash
   # Required
   DATABASE_URL=<your-postgres-connection-string>
   GEMINI_API_KEY=<your-gemini-api-key>

   # Email Configuration
   FROM_EMAIL=reminder.rushigo@gmail.com
   GMAIL_CREDENTIALS_PATH=credentials.json
   GMAIL_TOKEN_PATH=token.json

   # CORS (update after frontend deployment)
   ALLOWED_ORIGINS=*

   # Other
   DEBUG=False
   PYTHON_VERSION=3.13.1
   ```

4. **Upload Gmail Credentials** (Two Options):

   **Option A: Using Secret Files (Recommended)**

   - In Render Dashboard → Your Service → Environment
   - Click "Secret Files"
   - Add File: `credentials.json` (paste the contents)
   - Add File: `token.json` (paste the contents)

   **Option B: Using Base64 Environment Variables**

   - Add environment variables:
     ```bash
     GMAIL_CREDENTIALS_BASE64=<contents of credentials.json.b64>
     GMAIL_TOKEN_BASE64=<contents of token.json.b64>
     ```
   - Modify `backend/services/gmail_service.py` to decode these on startup

5. **Deploy**:

   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your backend URL will be: `https://rushigo-backend.onrender.com`

6. **Verify Deployment**:
   - Visit `https://rushigo-backend.onrender.com/api/docs`
   - You should see the Swagger UI documentation

---

## 🎨 Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Create environment file**:

   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Update `.env`**:

   ```bash
   VITE_API_URL=https://rushigo-backend.onrender.com/api
   ```

3. **Test locally** (optional):
   ```bash
   npm install
   npm run build
   npm run preview
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional):

   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard**:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variables**:

   - In Project Settings → Environment Variables
   - Add:
     ```bash
     VITE_API_URL=https://rushigo-backend.onrender.com/api
     ```

4. **Deploy**:
   - Click "Deploy"
   - Your frontend URL will be: `https://rushigo.vercel.app`

### Step 3: Update CORS Settings

1. **Update Backend Environment Variables**:

   - Go to Render Dashboard → Your Service → Environment
   - Update `ALLOWED_ORIGINS`:
     ```bash
     ALLOWED_ORIGINS=https://rushigo.vercel.app,https://www.rushigo.vercel.app
     ```

2. **Redeploy Backend**:
   - Render will automatically redeploy when you save environment variables

---

## 🔐 Part 3: Database Setup

### Initialize Database Tables

Your database tables are automatically created on first startup thanks to:

```python
# backend/main.py
create_tables()  # This runs on app startup
```

### Verify Database:

1. **Connect to your database**:

   ```bash
   psql <your-database-url>
   ```

2. **Check tables**:

   ```sql
   \dt
   -- Should show: users, deadlines, teams, memberships, notifications
   ```

3. **Create first user** (via API):
   - Go to `https://rushigo.vercel.app`
   - Click "Sign Up"
   - Create your account

---

## 🧪 Part 4: Testing Deployment

### Backend Tests

1. **API Health Check**:

   ```bash
   curl https://rushigo-backend.onrender.com/api/docs
   ```

2. **Register a User**:

   ```bash
   curl -X POST https://rushigo-backend.onrender.com/api/users/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "username": "testuser",
       "password": "testpass123"
     }'
   ```

3. **Test Email Notifications**:
   - Create a deadline in the future
   - Wait for notification times (or use the notification API endpoint)

### Frontend Tests

1. **Visit your site**: `https://rushigo.vercel.app`
2. **Test authentication**: Sign up / Login
3. **Test features**:
   - Create deadline
   - Upload document
   - Create team
   - Invite members

---

## 📊 Part 5: Monitoring & Logs

### Render Logs

1. Go to Render Dashboard → Your Service
2. Click "Logs" tab
3. Monitor for errors:
   ```
   INFO:     Application startup complete
   INFO:     Background notification scheduler started
   ```

### Check Email Notifications

1. **View notification logs**:

   - Check Render logs for: `"Sent daily digest to..."`
   - Check Gmail API send logs

2. **Verify scheduler is running**:
   ```
   INFO:services.scheduler:Notification scheduler loop started
   INFO:services.scheduler:Running deadline notification check
   ```

---

## 🔄 Part 6: Continuous Deployment

### Auto-Deploy on Git Push

Both Render and Vercel support auto-deployment:

1. **Render**: Automatically deploys on push to `main` branch
2. **Vercel**: Automatically deploys on push to `main` branch

### Manual Deployment

**Render**:

- Go to Dashboard → Your Service → "Manual Deploy" → "Deploy latest commit"

**Vercel**:

```bash
cd frontend
vercel --prod
```

---

## 🐛 Troubleshooting

### Backend Issues

#### Gmail API Errors

```
Error: invalid_grant - Token has been expired or revoked
```

**Solution**: Re-authenticate and upload new `token.json`

#### Database Connection Errors

```
sqlalchemy.exc.OperationalError: connection refused
```

**Solution**:

- Check `DATABASE_URL` is set correctly
- Ensure database is running
- Use **Internal Database URL** from Render (not External)

#### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Update `ALLOWED_ORIGINS` to include your frontend URL

### Frontend Issues

#### API Connection Failed

```
Failed to fetch
```

**Solution**:

- Check `VITE_API_URL` is set correctly
- Verify backend is running: visit `/api/docs`
- Check browser console for errors

#### Build Failures

```
Command "npm run build" exited with 1
```

**Solution**:

- Check TypeScript errors: `npm run lint`
- Ensure all dependencies installed: `npm install`

---

## 📝 Post-Deployment Checklist

- [ ] Backend API accessible at `/api/docs`
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Deadline creation works
- [ ] Document upload works
- [ ] Team creation works
- [ ] Email notifications sending
- [ ] Scheduler running (check logs every 5 minutes)
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Gmail API working
- [ ] Database tables created

---

## 🎯 Production Best Practices

### Security

1. **Never commit**:

   - `.env` files
   - `credentials.json`
   - `token.json`
   - API keys

2. **Use environment variables** for all sensitive data

3. **Enable HTTPS** (both Render and Vercel provide this automatically)

4. **Limit CORS** to your specific domain (not `*`)

### Performance

1. **Enable caching** in production
2. **Use CDN** for static assets (Vercel handles this)
3. **Monitor API response times** in Render logs
4. **Optimize database queries** (add indexes if needed)

### Monitoring

1. **Set up alerts** in Render:

   - Dashboard → Your Service → Alerts
   - Configure email notifications for errors

2. **Monitor logs regularly**:
   - Check for failed email sends
   - Watch for database errors
   - Monitor scheduler execution

### Backup

1. **Render PostgreSQL**:

   - Free tier: No automatic backups
   - Paid tier: Daily backups enabled

2. **Manual backup**:
   ```bash
   pg_dump <database-url> > backup.sql
   ```

---

## 🚀 Scaling (Paid Plans)

When your app grows:

1. **Render**: Upgrade to Starter ($7/month)

   - 512MB RAM
   - Always-on (no cold starts)
   - Automatic daily backups

2. **Vercel**: Pro plan ($20/month)

   - More build minutes
   - Better analytics
   - Priority support

3. **Database**: Upgrade to Render Standard ($20/month)
   - 10GB storage
   - Daily backups
   - Better performance

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Gmail API Docs**: https://developers.google.com/gmail/api

---

**🎉 Congratulations! Your RushiGo app is now live!**

Share your app: `https://rushigo.vercel.app`
