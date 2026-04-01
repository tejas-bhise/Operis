"""
event_generator.py
UPDATED: Delegates to dataset_loader. Random generation removed.
Scheduler calls load_next_dataset() once per 30-min cycle.
"""

import logging
from app.db.session import SessionLocal
from app.services.event_pipeline.dataset_loader import (
    pick_random_sample_id,
    insert_dataset_events,
)

logger = logging.getLogger("operis.event_generator")


def load_next_dataset(sample_id: str | None = None) -> tuple[list, str]:
    """
    Main entry point for scheduler.
    Picks a random dataset (or uses provided sample_id) and inserts events.
    Returns (events, sample_id).
    """
    db = SessionLocal()
    try:
        sid = sample_id or pick_random_sample_id()
        events = insert_dataset_events(db, sid)
        logger.info(f"Dataset loaded: {sid} ({len(events)} events)")
        return events, sid
    finally:
        db.close()