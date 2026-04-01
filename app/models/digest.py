"""
digest.py
Digest model — matches actual DB schema exactly.
All LLM output is stored as a single JSON string in `content`.
No extra columns needed — everything is parsed from content at read time.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from app.db.base import Base
from datetime import datetime


class Digest(Base):
    __tablename__ = "digests"

    id         = Column(Integer, primary_key=True, index=True)
    content    = Column(Text,    nullable=True)   # full LLM JSON string
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    sample_id  = Column(String,  nullable=True)