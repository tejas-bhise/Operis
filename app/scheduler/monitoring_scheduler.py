"""
APScheduler background engine for Operis.
"""

import json
import logging
from datetime import datetime, timezone, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.db.session import SessionLocal

from app.services.event_pipeline.event_generator import generate_event
from app.services.event_pipeline.event_store import save_event
from app.services.signal_pipeline.signal_classifier import classify_and_store_signals

from app.services.intelligence.health_engine import calculate_all_projects_health
from app.services.intelligence.change_detector import detect_changes
from app.services.intelligence.digest_generator import generate_full_digest
from app.services.intelligence.digest_formatter import save_digest

from app.models.digest import Digest
from app.models.project_health import ProjectHealth
from app.models.monitoring_cycle import MonitoringCycle

from app.core.constants import INTERVAL_OPTIONS


logger = logging.getLogger("operis.scheduler")

scheduler = BackgroundScheduler(timezone="UTC")

_current_interval_label: str = "30 minutes"
_current_interval_minutes: int = 30


# ------------------------------------------------------------------
# EVENT GENERATION
# ------------------------------------------------------------------

def event_generation_job():
    db = SessionLocal()
    try:
        event_data = generate_event()
        save_event(db, event_data)
        logger.debug(f"[EVENT] {event_data['project']} | {event_data['event_type']}")
    except Exception as e:
        logger.error(f"[EVENT] Generation failed: {e}")
    finally:
        db.close()


# ------------------------------------------------------------------
# MAIN MONITORING CYCLE
# ------------------------------------------------------------------

def monitoring_cycle_job():
    global _current_interval_label, _current_interval_minutes

    db = SessionLocal()
    cycle_start = datetime.now(timezone.utc)
    cycle = None

    try:
        cycle = MonitoringCycle(
            started_at=cycle_start,
            interval_label=_current_interval_label,
        )
        db.add(cycle)
        db.commit()
        db.refresh(cycle)

        window_start = cycle_start - timedelta(minutes=_current_interval_minutes)

        from app.models.event import Event
        from app.models.signal import Signal

        # Classify unprocessed events
        unclassified_events = (
            db.query(Event)
            .outerjoin(Signal, Event.id == Signal.event_id)
            .filter(
                Event.created_at >= window_start,
                Signal.id == None,
            )
            .all()
        )

        new_signals = []
        if unclassified_events:
            new_signals = classify_and_store_signals(db, unclassified_events)

        all_window_signals = (
            db.query(Signal)
            .filter(Signal.created_at >= window_start)
            .order_by(Signal.priority_score.desc())
            .all()
        )

        if not all_window_signals:
            logger.info("[CYCLE] no signals in window")
            cycle.is_successful = True
            cycle.completed_at = datetime.now(timezone.utc)
            db.commit()
            return

        # --------------------------------------------------
        # HEALTH + CHANGE DETECTION
        # --------------------------------------------------

        health_data = calculate_all_projects_health(db, window_start)

        previous_digest = (
            db.query(Digest)
            .order_by(Digest.created_at.desc())
            .first()
        )

        changes = detect_changes(all_window_signals, previous_digest)

        # --------------------------------------------------
        # LLM DIGEST
        # --------------------------------------------------

        try:
            llm_output = generate_full_digest()
            logger.info("[CYCLE] Gemini digest generated successfully")
        except Exception as llm_err:
            logger.warning(f"[CYCLE] Gemini failed, using rule-based fallback: {llm_err}")
            llm_output = _rule_based_digest(
                all_window_signals,
                health_data,
                _current_interval_label
            )

        # --------------------------------------------------
        # BUILD HEALTH REPORT
        # --------------------------------------------------

        health_report = {
            h["project"]: {
                "score": h["score"],
                "status": h["status"]
            }
            for h in health_data
        }

        # --------------------------------------------------
        # SAVE DIGEST
        # Digest model uses JSON columns — pass Python objects directly, no json.dumps
        # --------------------------------------------------

        digest = Digest(
            summary=llm_output.get("summary", ""),
            decision_count=llm_output.get(
                "decision_count",
                changes["current_counts"].get("decision_required", 0)
            ),
            risk_count=llm_output.get("risk_count", changes["total_risks"]),
            progress_count=changes["current_counts"].get("progress", 0),
            decisions=llm_output.get("decisions", []),
            risks=llm_output.get("risks", []),
            changes=llm_output.get("changes", []),
            stable_summary=llm_output.get("stable_summary", ""),
            actions=json.dumps(llm_output.get("decisions", [])),  # Text column → needs string
            changes_summary=llm_output.get("stable_summary", ""),
            health_report=health_report,                          # JSON column → dict OK
            interval_label=_current_interval_label,
            snapshot={},                                          # JSON column → dict OK
        )

        db.add(digest)
        db.commit()
        db.refresh(digest)

        # also persist via formatter for /digest/latest endpoint
        save_digest(llm_output, health_report=health_report)

        # --------------------------------------------------
        # SAVE PROJECT HEALTH
        # --------------------------------------------------

        for h in health_data:
            ph = ProjectHealth(
                project=h["project"],
                health_score=h["score"],
                status=h["status"],
                reason=h.get("reason", h["status"]),
                digest_id=digest.id,
            )
            db.add(ph)

        cycle.completed_at = datetime.now(timezone.utc)
        cycle.events_processed = len(unclassified_events)
        cycle.signals_generated = len(new_signals)
        cycle.digest_id = digest.id
        cycle.is_successful = True

        db.commit()

        logger.info(
            f"[CYCLE] complete | window={_current_interval_label} | "
            f"signals={len(all_window_signals)} | digest_id={digest.id} | "
            f"decisions={llm_output.get('decision_count', 0)} | "
            f"risks={llm_output.get('risk_count', 0)}"
        )

    except Exception as e:
        logger.error(f"[CYCLE] failed: {e}", exc_info=True)
        db.rollback()
        try:
            if cycle:
                cycle.is_successful = False
                cycle.completed_at = datetime.now(timezone.utc)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


# ------------------------------------------------------------------
# RULE-BASED FALLBACK (when Gemini quota is exhausted)
# ------------------------------------------------------------------

def _rule_based_digest(signals, health_data, interval_label):
    risks = [s for s in signals if s.signal_type in ("blocker", "client_risk", "risk")]
    decisions = [s for s in signals if s.signal_type == "decision_required"]
    progress = [s for s in signals if s.signal_type == "progress"]
    deadlines = [s for s in signals if s.signal_type == "deadline_risk"]
    projects = list({s.project for s in signals})

    summary = (
        f"{len(decisions)} decision(s) and {len(risks)} risk(s) detected across "
        f"{', '.join(projects)} in the last {interval_label}."
    )

    # Deduplicate by project — one insight per project per type
    seen_decision_projects = set()
    decision_items = []
    for s in decisions:
        if s.project not in seen_decision_projects:
            seen_decision_projects.add(s.project)
            decision_items.append({
                "title": f"{s.project} — action required",
                "description": s.reason,
                "impact": "Requires founder review to unblock progress.",
                "action": "Review situation and confirm next step."
            })

    seen_risk_projects = set()
    risk_items = []
    for s in risks:
        if s.project not in seen_risk_projects:
            seen_risk_projects.add(s.project)
            risk_items.append({
                "title": f"{s.project} — {s.signal_type.replace('_', ' ')}",
                "description": s.reason,
                "impact": "Active blocker — phase progression paused until resolved.",
                "action": "Assign owner or escalate to client immediately."
            })

    seen = set()
    change_items = []
    for s in signals[:8]:
        if s.project not in seen:
            seen.add(s.project)
            change_items.append({
                "type": "update",
                "description": f"{s.project}: {s.reason}"
            })

    stable_projects = [h["project"] for h in health_data if h["status"] == "Healthy"]

    return {
        "summary": summary,
        "decision_count": len(decision_items),
        "risk_count": len(risk_items),
        "decisions": decision_items,
        "risks": risk_items,
        "changes": change_items,
        "stable_projects": stable_projects,
        "stable_summary": (
            f"{len(stable_projects)} project(s) progressing normally with no intervention required."
            if stable_projects else
            "All projects have active signals requiring attention."
        )
    }


# ------------------------------------------------------------------
# SCHEDULER CONTROL
# ------------------------------------------------------------------

def start_scheduler():
    scheduler.add_job(
        event_generation_job,
        trigger=IntervalTrigger(seconds=12),
        id="event_generation",
        replace_existing=True,
        jitter=3,
    )

    scheduler.add_job(
        monitoring_cycle_job,
        trigger=IntervalTrigger(minutes=5),
        id="monitoring_cycle",
        replace_existing=True,
        jitter=10,
    )

    if not scheduler.running:
        scheduler.start()

    logger.info("[SCHEDULER] started — event generation and monitoring active")


def update_monitor_interval(interval_label: str):
    global _current_interval_label, _current_interval_minutes
    minutes = INTERVAL_OPTIONS.get(interval_label, 30)
    _current_interval_label = interval_label
    _current_interval_minutes = minutes
    logger.info(f"[SCHEDULER] interval updated to {interval_label} ({minutes} mins)")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("[SCHEDULER] stopped")


def get_scheduler_status():
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "next_run": str(job.next_run_time),
        })
    return {
        "running": scheduler.running,
        "interval": _current_interval_label,
        "minutes": _current_interval_minutes,
        "jobs": jobs,
    }