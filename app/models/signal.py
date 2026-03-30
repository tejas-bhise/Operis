from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Signal(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    project = Column(String, nullable=True)          # DB has "project"
    project_name = Column(Text, nullable=True)       # DB has "project_name"
    signal_type = Column(String, nullable=True)
    value = Column(Text, nullable=True)
    unit = Column(Text, nullable=True)
    severity = Column(Text, default="low")
    reason = Column(Text, nullable=True)
    priority_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    event = relationship("Event", back_populates="signals", foreign_keys=[event_id])