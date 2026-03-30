"""
Calculates per-project health scores using signals within the analysis window.
Numeric scoring is fully algorithmic. Explanation text is delegated to Gemini.
"""

from sqlalchemy.orm import Session
from datetime import datetime
from app.models.signal import Signal
from app.core.constants import (
    PROJECTS, HEALTH_BASELINE, HEALTH_PENALTIES, HEALTH_BONUS,
    HEALTH_HEALTHY_MIN, HEALTH_WARNING_MIN,
    HEALTH_STATUS_HEALTHY, HEALTH_STATUS_WARNING, HEALTH_STATUS_AT_RISK,
)


def calculate_health_score(db: Session, project: str, window_start: datetime) -> dict:
    """
    Computes health score (0–100) for one project using signals within the window.
    Returns: project, score, status, contributing_factors list (used in LLM prompt).
    """
    signals = (
        db.query(Signal)
        .filter(Signal.project == project, Signal.created_at >= window_start)
        .all()
    )

    score = HEALTH_BASELINE
    factors = []

    for sig in signals:
        penalty = HEALTH_PENALTIES.get(sig.signal_type)
        bonus = HEALTH_BONUS.get(sig.signal_type)

        if penalty:
            # Extra penalty for high-urgency deadline (priority boosted above base 6)
            if sig.signal_type == "deadline_risk" and sig.priority_score >= 7:
                score += penalty - 3
            else:
                score += penalty
            factors.append(sig.signal_type)
        elif bonus:
            score += bonus
            factors.append("progress")

    score = round(max(0.0, min(100.0, score)), 1)

    if score >= HEALTH_HEALTHY_MIN:
        status = HEALTH_STATUS_HEALTHY
    elif score >= HEALTH_WARNING_MIN:
        status = HEALTH_STATUS_WARNING
    else:
        status = HEALTH_STATUS_AT_RISK

    unique_factors = list(dict.fromkeys(factors)) if factors else ["no significant signals detected"]

    return {
        "project": project,
        "score": score,
        "status": status,
        "contributing_factors": unique_factors,
    }


def calculate_all_projects_health(db: Session, window_start: datetime) -> list[dict]:
    """Calculates and returns health data for all four monitored projects."""
    return [calculate_health_score(db, project, window_start) for project in PROJECTS]