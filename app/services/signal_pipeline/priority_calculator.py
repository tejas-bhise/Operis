"""
priority_calculator.py
UPDATED: Explicit formula implementation.
priority_score = 0.35*urgency + 0.30*impact + 0.20*confidence + 0.15*frequency

All scores normalized 0–1.
"""

URGENCY_SCORES = {
    "client_followup":    0.70,
    "deadline_risk":      0.85,
    "blocker":            0.90,
    "scope_change":       0.75,
    "milestone_progress": 0.10,
    "approval_delay":     0.65,
    "relationship_drop":  0.85,
    "execution_delay":    0.60,
}

IMPACT_SCORES = {
    "revenue":      0.90,
    "relationship": 0.80,
    "delivery":     0.70,
    "execution":    0.60,
}


def calculate_priority(
    signal_type: str,
    raw_text: str,
    impact_area: str = "delivery",
    confidence: float = 0.6,
    frequency: float = 0.5,
) -> float:
    """
    Computes normalized priority score using defined formula.
    Returns float 0.0–1.0 rounded to 3 decimal places.
    """
    urgency   = URGENCY_SCORES.get(signal_type, 0.5)
    impact    = IMPACT_SCORES.get(impact_area, 0.6)

    score = (
        0.35 * urgency +
        0.30 * impact  +
        0.20 * confidence +
        0.15 * frequency
    )
    return round(min(score, 1.0), 3)