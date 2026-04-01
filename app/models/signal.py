from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime


class Signal(Base):
    __tablename__ = "signals"

    id               = Column(Integer, primary_key=True, index=True)
    event_id         = Column(Integer, ForeignKey("events.id"), nullable=False)  # ← ForeignKey added
    signal_type      = Column(String(50), nullable=False)
    priority_score   = Column(Float, nullable=False)
    reason           = Column(Text, nullable=False)
    project          = Column(String(100), nullable=False)
    created_at       = Column(DateTime, default=datetime.utcnow)

    # Business impact fields
    impact_area      = Column(String(50), nullable=True)
    urgency_level    = Column(String(20), nullable=True)
    confidence_score = Column(Float, nullable=True)
    source_event_ids = Column(Text, nullable=True)

    # Legacy columns — kept for backward compat
    project_name     = Column(Text, nullable=True)
    value            = Column(Text, nullable=True)
    unit             = Column(Text, nullable=True)
    severity         = Column(Text, nullable=True)

    event = relationship("Event", back_populates="signals", foreign_keys=[event_id])