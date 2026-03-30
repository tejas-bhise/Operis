"""
Database session factory for Operis.
Connects to Neon PostgreSQL using DATABASE_URL from environment.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency — yields a database session and ensures it closes after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()