"""
health_engine.py
Computes project health score (0–100) and status from signal portfolio.
health_score is required NOT NULL in DB — always set explicitly.
"""

import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.signal import Signal
from app.models.project_health import ProjectHealth

logger = logging.getLogger("operis.health_engine")

# Signal type → score delta (base 100, subtract bad signals)
HEALTH_WEIGHTS = {
    "blocker":            -30,
    "relationship_drop":  -25,
    "deadline_risk":      -20,
    "client_followup":    -15,
    "scope_change":       -15,
    "approval_delay":     -10,
    "execution_delay":    -10,
    "milestone_progress": +10,
}

def _score_to_status(score: float) -> str:
    if score <= 30:  return "Critical"
    if score <= 50:  return "At Risk"
    if score <= 70:  return "Watch"
    return "Healthy"


def update_project_health(db: Session, signals: list[Signal]) -> list[ProjectHealth]:
    """
    Recomputes health_score (0–100) and status for all projects in current signals.
    Upserts ProjectHealth rows. health_score is always set — never None.
    """
    project_scores: dict[str, float]       = {}
    project_reasons: dict[str, list[str]]  = {}

    for sig in signals:
        proj = sig.project
        weight = HEALTH_WEIGHTS.get(sig.signal_type, 0)
        # Start at 100, apply weights
        project_scores[proj] = project_scores.get(proj, 100.0) + weight
        if sig.signal_type != "milestone_progress":
            project_reasons.setdefault(proj, []).append(sig.signal_type)

    results = []
    now = datetime.now(timezone.utc)

    for project, raw_score in project_scores.items():
        health_score = round(max(0.0, min(100.0, raw_score)), 1)   # clamp 0–100
        status       = _score_to_status(health_score)
        reason_parts = list(set(project_reasons.get(project, [])))
        reason       = ", ".join(reason_parts) if reason_parts else "No critical signals"

        existing = db.query(ProjectHealth).filter_by(project=project).first()
        if existing:
            existing.health_score = health_score
            existing.status       = status
            existing.reason       = reason
            existing.updated_at   = now
            results.append(existing)
        else:
            ph = ProjectHealth(
                project      = project,
                health_score = health_score,   # explicitly set — never None
                status       = status,
                reason       = reason,
                created_at   = now,
            )
            db.add(ph)
            results.append(ph)

    db.commit()
    for r in results:
        db.refresh(r)

    logger.info(f"Health updated: {[(r.project, r.status, r.health_score) for r in results]}")
    return results