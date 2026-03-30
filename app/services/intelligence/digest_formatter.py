import json
import logging
from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.models.digest import Digest

logger = logging.getLogger("operis.formatter")


def save_digest(digest: dict, health_report: dict = None) -> bool:
    project_health=digest.get("project_health", []),   # ← add this
    db = SessionLocal()
    try:
        row = Digest(
            summary=digest.get("summary", ""),
            decision_count=digest.get("decision_count", 0),
            risk_count=digest.get("risk_count", 0),
            decisions=digest.get("decisions", []),
            risks=digest.get("risks", []),
            changes=digest.get("changes", []),
            stable_summary=digest.get("stable_summary", ""),
            actions=json.dumps(digest.get("decisions", [])),
            changes_summary=digest.get("stable_summary", ""),
            health_report=health_report or {},
            snapshot={},
            interval_label="30 minutes",
            created_at=datetime.now(timezone.utc)
        )
        db.add(row)
        db.commit()
        logger.info("Digest saved successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to save digest: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def get_latest_digest() -> dict:
    
    db = SessionLocal()
    try:
        row = (
            db.query(Digest)
            .order_by(Digest.created_at.desc())
            .first()
        )
        if not row:
            return _empty_digest()

        return {
            "project_health": row.project_health or [],         # ← add this
            "summary": row.summary,
            "decision_count": row.decision_count,
            "risk_count": row.risk_count,
            "decisions": _parse(row.decisions),
            "risks": _parse(row.risks),
            "changes": _parse(row.changes),
            "stable_summary": row.stable_summary,
            "created_at": str(row.created_at)
            
        }
    except Exception as e:
        logger.error(f"Failed to fetch digest: {e}")
        return _empty_digest()
    finally:
        db.close()


def _parse(val):
    if not val:
        return []
    if isinstance(val, list):
        return val
    try:
        return json.loads(val)
    except Exception:
        return []


def _empty_digest():
    return {
        "summary": "Monitoring active — first digest will appear shortly.",
        "decision_count": 0,
        "risk_count": 0,
        "decisions": [],
        "risks": [],
        "changes": [],
        "stable_summary": "Monitoring active — stability data loading.",
        "created_at": None
    }