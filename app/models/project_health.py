"""
ORM model for per-project health scores stored at each monitoring cycle.
Enables the timeline to show health evolution across time.
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Text
from datetime import datetime, timezone
from app.db.base import Base


class ProjectHealth(Base):
    __tablename__ = "project_health"

    id = Column(Integer, primary_key=True, index=True)
    project = Column(String(100), nullable=False, index=True)
    health_score = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)
    reason = Column(Text, nullable=False)
    digest_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)