"""
Handles persistence and retrieval of raw events from the database.
"""

from sqlalchemy.orm import Session
from datetime import datetime
from app.models.event import Event


def save_event(db: Session, event_data: dict) -> Event:
    """Persists a generated event to the database and returns the ORM instance."""
    event = Event(**event_data)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_events_since(db: Session, since: datetime) -> list[Event]:
    """Returns all events created at or after the given UTC timestamp, ordered ascending."""
    return (
        db.query(Event)
        .filter(Event.created_at >= since)
        .order_by(Event.created_at.asc())
        .all()
    )


def get_recent_events(db: Session, limit: int = 50) -> list[Event]:
    """Returns the most recent N events ordered descending by creation time."""
    return (
        db.query(Event)
        .order_by(Event.created_at.desc())
        .limit(limit)
        .all()
    )