from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.signal import Signal

router = APIRouter()

@router.get("/signals/")
def get_signals(
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db)
):
    try:
        signals = (
            db.query(Signal)
            .order_by(Signal.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": s.id,
                "project_name": s.project_name or s.project or "Unknown",
                "signal_type": s.signal_type or "",
                "value": s.value or "",
                "unit": s.unit or "",
                "severity": s.severity or "low",
                "reason": s.reason or "",
                "priority_score": s.priority_score or 0,
                "created_at": str(s.created_at) if s.created_at else None,
            }
            for s in signals
        ]
    except Exception as e:
        return []   # never let signals crash the whole dashboard