"""
signal_classifier.py
UPDATED: Uses classify_events_to_signals from signal_detector.
Priority formula: 0.35*urgency + 0.30*impact + 0.20*confidence + 0.15*frequency
"""

from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.signal import Signal
from app.services.signal_pipeline.signal_detector import classify_events_to_signals


def classify_and_store_signals(
    db: Session,
    events: list[Event],
    existing_cycle_signals: list[Signal] | None = None,
) -> tuple[list[Signal], int]:
    """
    Entry point for scheduler pipeline.
    Returns (signals, suppressed_count).
    """
    return classify_events_to_signals(db, events, existing_cycle_signals)