from sqlalchemy import Column, Integer, Boolean, DateTime, Text
from app.db.base import Base
from datetime import datetime


class MonitoringCycle(Base):
    __tablename__ = "monitoring_cycles"

    id                      = Column(Integer, primary_key=True, index=True)
    started_at              = Column(DateTime, default=datetime.utcnow)
    completed_at            = Column(DateTime, nullable=True)
    events_processed        = Column(Integer, nullable=True)
    signals_generated       = Column(Integer, nullable=True)
    digest_id               = Column(Integer, nullable=True)
    interval_label          = Column(Text, nullable=True)
    is_successful           = Column(Boolean, nullable=True)
    suppressed_signal_count = Column(Integer, nullable=True, default=0)
    sample_id               = Column(Text, nullable=True)