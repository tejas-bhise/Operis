"""
monitoring_scheduler.py
- Cycle interval: 30 minutes
- Event generation: dataset loader
- Each cycle picks a new random dataset
- LLM called once per dataset change only
- suppressed_signal_count tracked in monitoring_cycles
"""

import logging
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.monitoring_cycle import MonitoringCycle
from app.models.digest import Digest
from app.models.signal import Signal

from app.services.event_pipeline.dataset_loader import pick_random_sample_id, insert_dataset_events
from app.services.signal_pipeline.signal_classifier import classify_and_store_signals
from app.services.intelligence.health_engine import update_project_health
from app.services.intelligence.change_detector import detect_changes
from app.services.intelligence.digest_generator import generate_digest

import json

logger = logging.getLogger("operis.scheduler")
_scheduler = BackgroundScheduler(timezone="UTC")


def run_monitoring_cycle():
    db: Session = SessionLocal()
    cycle = MonitoringCycle(started_at=datetime.now(timezone.utc))
    db.add(cycle)
    db.commit()
    db.refresh(cycle)

    logger.info(f"=== Cycle {cycle.id} started ===")

    try:
        # STEP 1: Load dataset
        sample_id = pick_random_sample_id()
        events = insert_dataset_events(db, sample_id)
        cycle.sample_id = sample_id
        logger.info(f"Dataset: {sample_id} | Events: {len(events)}")

        # STEP 2: Classify → signals + suppression
        previous_signals = (
            db.query(Signal)
            .filter(Signal.project.isnot(None))
            .order_by(Signal.created_at.desc())
            .limit(100)
            .all()
        )
        signals, suppressed_count = classify_and_store_signals(db, events, previous_signals)
        cycle.events_processed        = len(events)
        cycle.signals_generated       = len(signals)
        cycle.suppressed_signal_count = suppressed_count

        # STEP 3: Health
        from app.models.project_health import ProjectHealth
        health_records = update_project_health(db, signals)

        # STEP 4: Change detection
        changes = detect_changes(db, signals, previous_signals)

        # STEP 5: LLM digest
        digest_data = generate_digest(
            db=db,
            signals=signals,
            health_records=health_records,
            changes=changes,
            suppressed_count=suppressed_count,
            sample_id=sample_id,
        )

        # STEP 6: Save digest — ONLY content + sample_id (matches actual DB schema)
        digest = Digest(
            content   = json.dumps(digest_data),
            sample_id = sample_id,
        )
        db.add(digest)
        db.commit()
        db.refresh(digest)

        cycle.digest_id     = digest.id
        cycle.completed_at  = datetime.now(timezone.utc)
        cycle.is_successful = True
        cycle.interval_label = "30min"
        db.commit()

        logger.info(
            f"=== Cycle {cycle.id} complete | "
            f"events={len(events)} signals={len(signals)} "
            f"suppressed={suppressed_count} sample={sample_id} ==="
        )

    except Exception as e:
        logger.error(f"Cycle failed: {e}", exc_info=True)
        try:
            db.rollback()
            cycle.is_successful = False
            cycle.completed_at  = datetime.now(timezone.utc)
            db.commit()
        except Exception as inner:
            logger.error(f"Could not update cycle failure state: {inner}")
    finally:
        db.close()


def start_scheduler():
    if _scheduler.running:
        logger.warning("Scheduler already running")
        return
    _scheduler.add_job(
        run_monitoring_cycle,
        trigger="interval",
        minutes=30,
        id="monitoring_cycle_job",
        replace_existing=True,
        max_instances=1,
    )
    _scheduler.start()
    logger.info("Scheduler started — 30-minute cycle")

    try:
        run_monitoring_cycle()
    except Exception as e:
        logger.error(f"Startup cycle failed: {e}")


def stop_scheduler():
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")


def update_monitor_interval(minutes: int):
    if not _scheduler.running:
        start_scheduler()
    _scheduler.remove_job("monitoring_cycle_job")
    _scheduler.add_job(
        run_monitoring_cycle,
        trigger="interval",
        minutes=minutes,
        id="monitoring_cycle_job",
        replace_existing=True,
        max_instances=1,
    )
    return {"interval_minutes": minutes, "status": "updated"}


def get_scheduler_status():
    return {
        "running":   _scheduler.running,
        "job_count": len(_scheduler.get_jobs()),
        "jobs": [
            {"id": job.id, "next_run": str(job.next_run_time)}
            for job in _scheduler.get_jobs()
        ],
    }


scheduler = _scheduler