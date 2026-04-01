from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime


class Event(Base):
    __tablename__ = "events"

    id         = Column(Integer, primary_key=True, index=True)
    project    = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    raw_text   = Column(Text, nullable=True)
    source     = Column(String, nullable=True)
    sample_id  = Column(String, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    signals = relationship(
        "Signal",
        back_populates="event",
        foreign_keys="[Signal.event_id]"   # ← string reference (avoids circular import)
    )