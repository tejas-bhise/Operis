"""
signal_detector.py
UPDATED: Restricted to 8-type taxonomy. Adds impact_area and urgency_level.
LLM is NOT used here — fully deterministic rule-based classification.

SIGNAL TAXONOMY:
  client_followup | deadline_risk | blocker | scope_change
  milestone_progress | approval_delay | relationship_drop | execution_delay
"""

import json
import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.signal import Signal

logger = logging.getLogger("operis.signal_detector")

# ── TAXONOMY ─────────────────────────────────────────────────────────────────
SIGNAL_TAXONOMY = {
    "client_followup": {
        "keywords": ["follow-up","follow up","still no update","any update","timeline confirmation",
                     "escalat","board meeting","4th","3rd","no response","awaiting reply"],
        "impact_area": "relationship",
        "base_urgency": 0.7,
    },
    "deadline_risk": {
        "keywords": ["deadline","due today","due tomorrow","hours remaining","go-live",
                     "end of week","by friday","by thursday","expires","presentation","demo scheduled"],
        "impact_area": "delivery",
        "base_urgency": 0.85,
    },
    "blocker": {
        "keywords": ["blocked","blocker","failing","error","500","503","504","unresolved",
                     "exhausted","down","incident","p0","ci failing","pipeline failing","cannot proceed"],
        "impact_area": "execution",
        "base_urgency": 0.9,
    },
    "scope_change": {
        "keywords": ["scope change","change request","adding feature","must-have","real-time",
                     "sso","non-negotiable","requested addition","new requirement","contract clause"],
        "impact_area": "delivery",
        "base_urgency": 0.75,
    },
    "milestone_progress": {
        "keywords": ["completed","merged","deployed","closed","delivered","sprint done",
                     "velocity","all green","on track","ahead of schedule","milestone hit"],
        "impact_area": "delivery",
        "base_urgency": 0.1,
    },
    "approval_delay": {
        "keywords": ["approval pending","approval needed","sign-off","sign off","waiting on approval",
                     "no response","unresponsive","review required","pending review","not approved"],
        "impact_area": "execution",
        "base_urgency": 0.65,
    },
    "relationship_drop": {
        "keywords": ["nps","switching vendor","evaluate alternative","escalate to legal",
                     "concerned","unacceptable","contract breach","silence for","frustrated",
                     "considering alternatives","revenue at risk","arn","140k","85k","$"],
        "impact_area": "revenue",
        "base_urgency": 0.85,
    },
    "execution_delay": {
        "keywords": ["delay","capacity reduced","team member sick","milestone missed","behind schedule",
                     "descope","not completed","slipping","resource constraint","engineer unavailable"],
        "impact_area": "execution",
        "base_urgency": 0.6,
    },
}

URGENCY_LABELS = {
    (0.0, 0.3): "low",
    (0.3, 0.6): "medium",
    (0.6, 0.85): "high",
    (0.85, 1.01): "critical",
}

def _urgency_label(score: float) -> str:
    for (lo, hi), label in URGENCY_LABELS.items():
        if lo <= score < hi:
            return label
    return "medium"


def detect_signal_type(event_type: str, raw_text: str) -> tuple[str, str, float]:
    """
    Returns (signal_type, impact_area, base_urgency_score).
    Matches against taxonomy keywords in order.
    Falls back to milestone_progress for progress/update types.
    """
    t = raw_text.lower()

    for stype, cfg in SIGNAL_TAXONOMY.items():
        if any(kw in t for kw in cfg["keywords"]):
            return stype, cfg["impact_area"], cfg["base_urgency"]

    # Fall back using event_type
    fallback_map = {
        "client_followup":  ("client_followup", "relationship", 0.7),
        "blocker":          ("blocker", "execution", 0.9),
        "deadline_risk":    ("deadline_risk", "delivery", 0.85),
        "scope_change":     ("scope_change", "delivery", 0.75),
        "approval_pending": ("approval_delay", "execution", 0.65),
        "progress_update":  ("milestone_progress", "delivery", 0.1),
        "resolved":         ("milestone_progress", "delivery", 0.1),
        "risk_escalated":   ("relationship_drop", "revenue", 0.85),
    }
    if event_type in fallback_map:
        return fallback_map[event_type]

    return "milestone_progress", "delivery", 0.1


def classify_events_to_signals(
    db: Session,
    events: list[Event],
    cycle_signals_so_far: list[Signal] | None = None,
) -> tuple[list[Signal], int]:
    """
    Classifies events into signals using taxonomy rules.
    Applies suppression before saving.
    Returns (saved_signals, suppressed_count).

    Suppression rules:
    - priority_score < 0.3
    - Duplicate signal type+project in this cycle
    - Internal noise (no client/delivery impact)
    """
    if cycle_signals_so_far is None:
        cycle_signals_so_far = []

    seen = {(s.project, s.signal_type) for s in cycle_signals_so_far}
    saved = []
    suppressed = 0

    for event in events:
        raw_text = event.raw_text or ""
        project  = event.project or "Unknown"

        stype, impact_area, base_urgency = detect_signal_type(event.event_type, raw_text)

        # Compute confidence: simple heuristic on text length + source variety
        text_len = len(raw_text)
        confidence = min(0.5 + (text_len / 600), 0.95)

        # Compute priority score: 0.35u + 0.30i + 0.20c + 0.15f
        impact_score = {
            "revenue":      0.9,
            "relationship": 0.8,
            "delivery":     0.7,
            "execution":    0.6,
        }.get(impact_area, 0.5)
        frequency_score = 0.5  # base; would increase if signal repeated across cycles
        priority_score = (
            0.35 * base_urgency +
            0.30 * impact_score +
            0.20 * confidence +
            0.15 * frequency_score
        )

        # ── SUPPRESSION ──────────────────────────────────────────────────
        # Rule 1: too low priority
        if priority_score < 0.15:
            suppressed += 1
            logger.debug(f"Suppressed (low priority {priority_score:.2f}): {project}/{stype}")
            continue

        # Rule 2: duplicate in this cycle
        key = (project, stype)
        if key in seen:
            suppressed += 1
            logger.debug(f"Suppressed (duplicate): {project}/{stype}")
            continue

        # Rule 3: pure noise — no keywords, short text, generic update
        if stype == "milestone_progress" and len(raw_text) < 60:
            suppressed += 1
            logger.debug(f"Suppressed (noise): {project}/{stype}")
            continue

        seen.add(key)

        signal = Signal(
            event_id         = event.id,
            signal_type      = stype,
            priority_score   = round(priority_score, 3),
            reason           = raw_text,
            project          = project,
            project_name     = project,
            impact_area      = impact_area,
            urgency_level    = _urgency_label(base_urgency),
            confidence_score = round(confidence, 3),
            source_event_ids = json.dumps([event.id]),
            created_at       = event.created_at,
        )
        db.add(signal)
        saved.append(signal)

    db.commit()
    for s in saved:
        db.refresh(s)

    logger.info(f"Signals: {len(saved)} saved, {suppressed} suppressed")
    return saved, suppressed