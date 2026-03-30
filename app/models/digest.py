from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from datetime import datetime, timezone
from app.db.base import Base

class Digest(Base):
    __tablename__ = "digests"

    id = Column(Integer, primary_key=True, index=True)
    summary = Column(Text, nullable=False, default="")
    actions = Column(Text, nullable=False, default="")
    health_report = Column(JSON, nullable=True)
    changes_summary = Column(Text, nullable=True, default="")
    risk_count = Column(Integer, default=0)
    decision_count = Column(Integer, default=0)
    progress_count = Column(Integer, default=0)
    interval_label = Column(String(50), default="30 minutes")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    snapshot = Column(JSON, nullable=True)
    decisions = Column(JSON, nullable=True)
    risks = Column(JSON, nullable=True)
    changes = Column(JSON, nullable=True)
    stable_summary = Column(Text, nullable=True, default="")
    project_health = Column(JSON, nullable=True)     # ← new column