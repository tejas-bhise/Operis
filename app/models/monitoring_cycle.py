"""
ORM model for monitoring cycle metadata.
Each scheduler run creates one record for audit and timeline tracking.
"""

from sqlalchemy import Column, Integer, DateTime, Boolean, Text
from datetime import datetime, timezone
from app.db.base import Base


class MonitoringCycle(Base):
    __tablename__ = "monitoring_cycles"

    id = Column(Integer, primary_key=True, index=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    events_processed = Column(Integer, default=0)
    signals_generated = Column(Integer, default=0)
    digest_id = Column(Integer, nullable=True)
    interval_label = Column(Text, nullable=True)
    is_successful = Column(Boolean, default=True)