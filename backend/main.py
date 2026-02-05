import os
print('Contents of /etc/secrets:', os.listdir('/etc/secrets/'))
if os.path.isdir('/etc/secrets/token.json'):
    print('token.json is a directory:', os.listdir('/etc/secrets/token.json'))
else:
    print('token.json is a file')
import logging
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import uuid
import redis
import json

from core.config import settings
from routers import user, deadline, team, notifications
from routers import calendar as calendar_router
from db.database import create_tables
from models import User, Deadline, Team, Membership, Notification  # Ensure models are imported
from services.scheduler import start_scheduler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure database tables exist (create if they don't exist)
try:
    from sqlalchemy import text, inspect
    from db.database import engine
    
    # First, create any missing tables
    create_tables()
    logger.info("Database tables ensured/created successfully")
    
    # Then, add any missing calendar columns (migration)
    with engine.connect() as conn:
        inspector = inspect(engine)
        
        # Check and add User table columns
        user_columns = [col['name'] for col in inspector.get_columns('users')]
        
        if 'calendar_sync_enabled' not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN calendar_sync_enabled BOOLEAN DEFAULT TRUE"))
            conn.commit()
            logger.info("Added calendar_sync_enabled column to users table (default: TRUE)")
        else:
            # Enable calendar sync for all existing users by default
            conn.execute(text("UPDATE users SET calendar_sync_enabled = TRUE WHERE calendar_sync_enabled IS NULL OR calendar_sync_enabled = FALSE"))
            conn.commit()
            logger.info("Enabled calendar sync for all existing users")
        
        if 'calendar_id' not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN calendar_id VARCHAR(255)"))
            conn.commit()
            logger.info("Added calendar_id column to users table")
        
        # Check and add Deadline table columns
        deadline_columns = [col['name'] for col in inspector.get_columns('deadlines')]
        
        if 'calendar_event_id' not in deadline_columns:
            conn.execute(text("ALTER TABLE deadlines ADD COLUMN calendar_event_id VARCHAR(255)"))
            conn.commit()
            logger.info("Added calendar_event_id column to deadlines table")
        
        if 'calendar_synced' not in deadline_columns:
            conn.execute(text("ALTER TABLE deadlines ADD COLUMN calendar_synced BOOLEAN DEFAULT FALSE"))
            conn.commit()
            logger.info("Added calendar_synced column to deadlines table")
    
    logger.info("Calendar migration completed successfully")
    
except Exception as e:
    logger.error(f"Error ensuring database tables: {str(e)}")
    raise

# Create FastAPI app
app = FastAPI(
    title="RushiGo API",
    description="Backend API for RushiGo - Deadline Management System",
    version="1.0.0",
    debug=settings.DEBUG
)

# Add CORS middleware - MUST be added before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS if settings.ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix=settings.API_PREFIX)
app.include_router(deadline.router, prefix=settings.API_PREFIX)
app.include_router(team.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)

app.include_router(calendar_router.router, prefix=settings.API_PREFIX)


@app.api_route("/health", methods=["GET", "HEAD", "OPTIONS"])
async def health_check():
    """Health check endpoint for monitoring (supports GET, HEAD, and OPTIONS for CORS)"""
    return {
        "status": "healthy",
        "service": "RushiGo API",
        "version": "1.0.0"
    }

@app.api_route(f"{settings.API_PREFIX}/health", methods=["GET", "HEAD", "OPTIONS"])
async def api_health_check():
    """Health check endpoint under API prefix (supports GET, HEAD, and OPTIONS for CORS)"""
    return {
        "status": "healthy",
        "service": "RushiGo API",
        "version": "1.0.0"
    }

@app.on_event("startup")
async def startup_event():
    """Start background services when the app starts"""
    start_scheduler()
    logger.info("Background notification scheduler started")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop background services when the app shuts down"""
    from services.scheduler import stop_scheduler
    stop_scheduler()
    logger.info("Background notification scheduler stopped")

@app.get("/api/test-redis", include_in_schema=True)
async def test_redis_public():
    import redis
    import os
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB = int(os.getenv("REDIS_DB", 0))
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, socket_connect_timeout=5)
        r.ping()
        return {"status": "success", "message": "Connected to Redis!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
