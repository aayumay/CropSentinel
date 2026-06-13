"""
Database session management and engine configuration.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Adjust URL format if necessary to use the psycopg driver (v3)
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Configure SQLAlchemy engine and session factory
if DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True  # Helps handle database restarts/idle timeout disconnections
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    engine = None
    SessionLocal = None

Base = declarative_base()

def get_db():
    """
    Database session generator dependency.
    """
    if SessionLocal is None:
        raise ValueError("DATABASE_URL environment variable is not set or engine is unconfigured.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_connection() -> bool:
    """
    Runs a simple query to verify database connectivity.
    Returns True if successful, False otherwise.
    """
    if engine is None:
        print("Database engine is not configured (DATABASE_URL is missing).")
        return False
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Database connection verification failed: {e}")
        return False
