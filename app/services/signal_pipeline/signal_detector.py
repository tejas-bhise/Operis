"""
Rule-based signal detection for Operis.
Classifies events into signal types using keyword matching.
LLM is NOT used here — classification is fully deterministic.
"""

from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.models.event import Event
from app.models.signal import Signal


SIGNAL_RULES = {
    "client_risk": [
        "update", "status", "eta", "timeline", "follow up",
        "following up", "waiting", "any updates", "confirm when",
    ],
    "decision_required": [
        "approval", "confirm", "sign off", "sign-off",
        "review required", "waiting for", "confirmation required",
        "approval needed",
    ],
    "progress": [
        "completed", "merged", "deployed", "closed",
        "finished", "achieved", "passed", "approved by",
        "signed off", "ready for",
    ],
    "deadline_risk": [
        "tomorrow", "24 hours", "48 hours", "demo scheduled",
        "deadline", "end of day", "by tomorrow", "presentation",
        "milestone review",
    ],
    "blocker": [
        "blocked", "blocker", "issue", "error", "delay",
        "stall", "halted", "failing", "unresolved", "investigating",
    ],
}

PRIORITY_MAP = {
    "blocker":           9,
    "client_risk":       8,
    "decision_required": 7,
    "deadline_risk":     6,
    "progress":          3,
    "stable":            1,
}


def detect_signal_type(event_type: str, raw_text: str) -> str:
    """
    Determines signal type from event_type and raw_text using keyword rules.
    Called by signal_classifier.py in batch processing pipeline.
    Returns signal type string.
    """
    text_lower = raw_text.lower()
    for signal_type, keywords in SIGNAL_RULES.items():
        if any(kw in text_lower for kw in keywords):
            return signal_type
    return "stable"


def classify_event(event: Event) -> dict:
    """
    Applies keyword rules to a full Event ORM object.
    Returns dict with signal_type, priority_score, and reason.
    Used for single-event classification outside the batch pipeline.
    """
    signal_type = detect_signal_type(event.event_type, event.raw_text)
    return {
        "signal_type":    signal_type,
        "priority_score": PRIORITY_MAP.get(signal_type, 1),
        "reason":         event.raw_text,
    }


def process_event_to_signal(event: Event) -> Signal:
    """
    Classifies a single event and saves the resulting signal to the database.
    Returns the saved Signal object.
    """
    result = classify_event(event)

    db = SessionLocal()
    try:
        signal = Signal(
            event_id=event.id,
            signal_type=result["signal_type"],
            priority_score=result["priority_score"],
            reason=result["reason"],
            project=event.project,
            created_at=datetime.now(timezone.utc),
        )
        db.add(signal)
        db.commit()
        db.refresh(signal)
        return signal
    finally:
        db.close()