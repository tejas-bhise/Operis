import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.digest import Digest

router = APIRouter()

def safe_parse(value, fallback):
    if not value:
        return fallback
    if isinstance(value, (list, dict)):
        return value
    try:
        return json.loads(value)
    except Exception:
        # Handle Python set-style string: {"item1","item2"}
        if isinstance(value, str) and value.startswith("{"):
            try:
                items = value.strip("{}").split('","')
                return [i.strip('"') for i in items if i.strip('"')]
            except Exception:
                return fallback
        return fallback

@router.get("/digest/latest")
def get_latest_digest(db: Session = Depends(get_db)):
    digest = db.query(Digest).order_by(Digest.created_at.desc()).first()
    if not digest:
        return {
            "summary": "No digest available yet. System is warming up...",
            "actions": [],
            "decisions": [],
            "risks": [],
            "changes": [],
            "stable_summary": "",
            "snapshot": {},
            "risk_count": 0,
            "decision_count": 0,
            "created_at": None
        }
    return {
        "summary": digest.summary or "",
        "actions": safe_parse(digest.actions, []),
        "decisions": safe_parse(digest.decisions, []),
        "risks": safe_parse(digest.risks, []),
        "changes": safe_parse(digest.changes, []),
        "stable_summary": digest.stable_summary or "",
        "snapshot": safe_parse(digest.snapshot, {}),
        "risk_count": digest.risk_count or 0,
        "decision_count": digest.decision_count or 0,
        "created_at": str(digest.created_at) if digest.created_at else None,
    }

@router.get("/digest/timeline")
def get_timeline(db: Session = Depends(get_db)):
    digests = db.query(Digest).order_by(Digest.created_at.desc()).limit(20).all()
    return [
        {
            "id": d.id,
            "created_at": str(d.created_at),
            "risk_count": d.risk_count or 0,
            "decision_count": d.decision_count or 0,
            "summary": d.summary or "",
        }
        for d in digests
    ]