"""
dataset_loader.py
Loads a JSON dataset from datasets/ and inserts events into the DB.
FIXED: Deletes dependent signals before deleting events (FK constraint order).
"""

import json
import random
import logging
from pathlib import Path
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.signal import Signal

logger = logging.getLogger("operis.dataset_loader")

DATASETS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "datasets"


def list_sample_ids() -> list[str]:
    files = sorted(DATASETS_DIR.glob("sample_*.json"))
    return [f.stem for f in files if not f.stem.startswith("evaluation")]


def load_dataset(sample_id: str) -> dict:
    path = DATASETS_DIR / f"{sample_id}.json"
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")
    with open(path) as f:
        return json.load(f)


def pick_random_sample_id() -> str:
    samples = list_sample_ids()
    if not samples:
        raise RuntimeError("No datasets found in datasets/")
    return random.choice(samples)


def insert_dataset_events(db: Session, sample_id: str) -> list[Event]:
    """
    Loads dataset and inserts all events. Clears previous events for this
    sample_id first — deletes signals before events to respect FK constraints.
    """
    dataset = load_dataset(sample_id)
    raw_events = dataset.get("events", [])

    # ── STEP 1: find existing events for this sample ──────────────────────
    existing_events = db.query(Event).filter(Event.sample_id == sample_id).all()
    existing_event_ids = [e.id for e in existing_events]

    # ── STEP 2: delete signals referencing those events FIRST ─────────────
    if existing_event_ids:
        db.query(Signal).filter(
            Signal.event_id.in_(existing_event_ids)
        ).delete(synchronize_session=False)
        db.flush()   # flush signal deletes before touching events

    # ── STEP 3: now safe to delete events ─────────────────────────────────
    for e in existing_events:
        db.delete(e)
    db.flush()

    # ── STEP 4: insert fresh events ───────────────────────────────────────
    saved = []
    now = datetime.now(timezone.utc)

    for ev in raw_events:
        event = Event(
            project    = ev.get("project", "Unknown"),
            event_type = _infer_event_type(ev.get("text", "")),
            raw_text   = ev.get("text", ""),
            source     = ev.get("source", "unknown"),
            sample_id  = sample_id,
            created_at = now,
        )
        db.add(event)
        saved.append(event)

    db.commit()
    for e in saved:
        db.refresh(e)

    logger.info(f"Loaded {sample_id}: {len(saved)} events inserted")
    return saved


_TYPE_RULES = {
    "client_followup":    ["follow-up","follow up","still no","any update","timeline","escalat","board meeting"],
    "blocker":            ["blocked","blocker","failing","error","500","503","504","unresolved","exhausted","down","incident","p0"],
    "deadline_risk":      ["deadline","due today","due tomorrow","hours remaining","presentation","go-live","end of week","by friday","by thursday","expires","demo scheduled"],
    "scope_change":       ["scope change","adding","additional feature","must-have","real-time","sso","non-negotiable"],
    "approval_delay":     ["approval","pending","sign-off","sign off","waiting on","no response","unresponsive","review required"],
    "milestone_progress": ["completed","merged","deployed","closed","delivered","sprint","velocity","green","on track","ahead of schedule"],
    "relationship_drop":  ["nps","switching vendor","evaluate alternative","legal","contract","escalate to legal","concerned","unacceptable","frustrated","alternatives"],
    "execution_delay":    ["delay","capacity","sick","missed","behind","descope","not completed","slip","resource"],
}

def _infer_event_type(text: str) -> str:
    t = text.lower()
    for etype, keywords in _TYPE_RULES.items():
        if any(k in t for k in keywords):
            return etype
    return "update"