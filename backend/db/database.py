from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from core.config import settings

# Configure engine for PostgreSQL with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 

def create_tables():
    Base.metadata.create_all(bind=engine)

def reset_database():
    """Reset database by dropping all tables and recreating them"""
    from sqlalchemy import text
    
    # For PostgreSQL, we need to drop tables in correct order due to foreign keys
    with engine.begin() as connection:
        # Drop tables in reverse dependency order
        connection.execute(text("DROP TABLE IF EXISTS notifications CASCADE"))
        connection.execute(text("DROP TABLE IF EXISTS memberships CASCADE"))
        connection.execute(text("DROP TABLE IF EXISTS deadlines CASCADE"))
        connection.execute(text("DROP TABLE IF EXISTS teams CASCADE"))
        connection.execute(text("DROP TABLE IF EXISTS users CASCADE"))
    
    # Recreate all tables
    Base.metadata.create_all(bind=engine)