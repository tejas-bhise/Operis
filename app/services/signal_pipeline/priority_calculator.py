"""
Assigns numeric priority scores to classified signals.
Scores are deterministic and based on signal type with contextual adjustments.
Scale: 1 (informational) → 10 (critical).
"""

from app.core.constants import PRIORITY_SCORES


def calculate_priority(signal_type: str, raw_text: str) -> float:
    """
    Returns priority score (1–10) for a signal.
    Applies contextual +1 boost for 24-hour deadline urgency and escalated risk language.
    """
    base = float(PRIORITY_SCORES.get(signal_type, 2))
    text = raw_text.lower()

    if signal_type == "deadline_risk" and any(kw in text for kw in ["24 hours", "tomorrow", "today", "end of day", "eod"]):
        base = min(base + 1.0, 10.0)

    if signal_type == "risk" and any(kw in text for kw in ["escalat", "still waiting", "again", "pending response"]):
        base = min(base + 1.0, 10.0)

    return base