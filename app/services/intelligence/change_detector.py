"""
change_detector.py
UPDATED: Tracks signal-level changes between cycles for decision context.
Change types: new | resolved | escalated | progress | dependency
"""

import logging
from sqlalchemy.orm import Session
from app.models.signal import Signal

logger = logging.getLogger("operis.change_detector")

CHANGE_TYPE_PRIORITY = {
    "escalated":  5,
    "new":        4,
    "dependency": 3,
    "progress":   2,
    "resolved":   1,
}


def detect_changes(
    db: Session,
    current_signals: list[Signal],
    previous_signals: list[Signal],
) -> list[dict]:
    """
    Compares current vs previous cycle signals.
    Returns list of change dicts for LLM context.
    """
    current_map  = {(s.project, s.signal_type): s for s in current_signals}
    previous_map = {(s.project, s.signal_type): s for s in previous_signals}

    changes = []

    for key, sig in current_map.items():
        project, stype = key
        if key not in previous_map:
            changes.append({
                "project":     project,
                "change_type": "new",
                "signal_type": stype,
                "description": f"New {stype} signal detected for {project}.",
            })
        else:
            prev = previous_map[key]
            if sig.priority_score > prev.priority_score + 0.1:
                changes.append({
                    "project":     project,
                    "change_type": "escalated",
                    "signal_type": stype,
                    "description": f"{stype} on {project} escalated: {prev.priority_score:.2f} → {sig.priority_score:.2f}.",
                })
            elif sig.signal_type == "milestone_progress":
                changes.append({
                    "project":     project,
                    "change_type": "progress",
                    "signal_type": stype,
                    "description": f"Progress update on {project}.",
                })

    for key, sig in previous_map.items():
        project, stype = key
        if key not in current_map and stype != "milestone_progress":
            changes.append({
                "project":     project,
                "change_type": "resolved",
                "signal_type": stype,
                "description": f"{stype} on {project} no longer active — may be resolved.",
            })

    # Sort by priority
    changes.sort(
        key=lambda c: CHANGE_TYPE_PRIORITY.get(c["change_type"], 0),
        reverse=True
    )

    logger.info(f"Change detection: {len(changes)} changes found")
    return changes