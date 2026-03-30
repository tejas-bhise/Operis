"""
API routes for project health data retrieval.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.project_health import ProjectHealth
from app.core.constants import PROJECTS

router = APIRouter(prefix="/health", tags=["Project Health"])


@router.get("/latest")
def get_latest_health(db: Session = Depends(get_db)):
    """Returns the most recent health record for each of the four monitored projects."""
    result = {}
    for project in PROJECTS:
        record = (
            db.query(ProjectHealth)
            .filter(ProjectHealth.project == project)
            .order_by(ProjectHealth.created_at.desc())
            .first()
        )
        if record:
            result[project] = {
                "score": record.health_score,
                "status": record.status,
                "reason": record.reason,
                "updated_at": record.created_at.isoformat(),
            }
        else:
            result[project] = {
                "score": 85.0,
                "status": "Healthy",
                "reason": "Awaiting first monitoring cycle.",
                "updated_at": None,
            }
    return result