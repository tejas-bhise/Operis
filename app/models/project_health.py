from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.db.base import Base
from datetime import datetime, timezone


class ProjectHealth(Base):
    __tablename__ = "project_health"

    id           = Column(Integer, primary_key=True, index=True)
    project      = Column(String, nullable=False)
    health_score = Column(Float, nullable=False, default=50.0)   # 0–100 scale
    status       = Column(String, nullable=False, default="Healthy")
    reason       = Column(Text, nullable=True)
    digest_id    = Column(Integer, nullable=True)
    created_at   = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at   = Column(DateTime(timezone=True), nullable=True)