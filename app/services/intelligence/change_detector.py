"""
Detects meaningful delta between current window signals and the previous digest.
Produces structured change data for use in Gemini prompt.
"""

from app.models.digest import Digest


def detect_changes(current_signals: list, previous_digest: Digest | None) -> dict:
    """
    Compares current cycle signal counts against the previous digest.
    Returns a structured dict with change descriptions for the LLM prompt.

    Args:
        current_signals: List of Signal ORM objects from current analysis window.
        previous_digest: Most recent Digest ORM object, or None if first cycle.
    """
    current_counts = {
        "risk": sum(1 for s in current_signals if s.signal_type == "risk"),
        "blocker": sum(1 for s in current_signals if s.signal_type == "blocker"),
        "decision_required": sum(1 for s in current_signals if s.signal_type == "decision_required"),
        "deadline_risk": sum(1 for s in current_signals if s.signal_type == "deadline_risk"),
        "progress": sum(1 for s in current_signals if s.signal_type == "progress"),
        "stable": sum(1 for s in current_signals if s.signal_type == "stable"),
    }
    total_risks = current_counts["risk"] + current_counts["blocker"]

    if not previous_digest:
        return {
            "is_first_cycle": True,
            "current_counts": current_counts,
            "total_risks": total_risks,
            "changes": ["Initial operational baseline established — no prior state to compare"],
        }

    prev_risks = previous_digest.risk_count
    prev_decisions = previous_digest.decision_count
    prev_progress = previous_digest.progress_count

    changes = []

    delta_risk = total_risks - prev_risks
    delta_decision = current_counts["decision_required"] - prev_decisions
    delta_progress = current_counts["progress"] - prev_progress

    if delta_risk > 0:
        changes.append(f"{delta_risk} new risk signal(s) introduced since previous cycle")
    elif delta_risk < 0:
        changes.append(f"{abs(delta_risk)} risk signal(s) resolved or cleared since previous cycle")

    if delta_decision > 0:
        changes.append(f"{delta_decision} new decision dependency detected — pending stakeholder action")
    elif delta_decision < 0:
        changes.append(f"{abs(delta_decision)} pending decision(s) resolved since previous cycle")

    if delta_progress > 0:
        changes.append(f"{delta_progress} additional progress milestone(s) recorded across monitored projects")

    if current_counts["blocker"] > 0:
        changes.append(f"{current_counts['blocker']} active blocker(s) present — requires immediate investigation")

    if not changes:
        changes.append("Operational state consistent with previous monitoring cycle — no significant delta detected")

    return {
        "is_first_cycle": False,
        "current_counts": current_counts,
        "total_risks": total_risks,
        "changes": changes,
    }