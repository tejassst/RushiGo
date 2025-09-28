import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from core.config import settings
from routers import user, deadline, team
from db.database import create_tables
from models import User, Deadline, Team, Membership, Notification  # Ensure models are imported

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure database tables exist (create if they don't exist)
try:
    create_tables()
    logger.info("Database tables ensured/created successfully")
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix=settings.API_PREFIX)
app.include_router(deadline.router, prefix=settings.API_PREFIX)
app.include_router(team.router, prefix=settings.API_PREFIX)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
