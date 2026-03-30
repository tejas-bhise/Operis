"""
API routes for scheduler control and analysis interval management.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.scheduler.monitoring_scheduler import (
    start_scheduler, stop_scheduler,
    update_monitor_interval, get_scheduler_status, scheduler,
)
from app.core.constants import INTERVAL_OPTIONS

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


class IntervalRequest(BaseModel):
    interval_label: str


@router.post("/start")
def start_monitoring():
    """Starts the Operis scheduler if not already running."""
    if not scheduler.running:
        start_scheduler()
        return {"status": "started", "message": "Operis monitoring scheduler is now active"}
    return {"status": "already_running", "message": "Scheduler is already active"}


@router.post("/stop")
def stop_monitoring():
    """Stops the Operis scheduler."""
    stop_scheduler()
    return {"status": "stopped", "message": "Scheduler stopped"}


@router.post("/set-interval")
def set_interval(request: IntervalRequest):
    """
    Updates the analysis time window used during monitoring cycles.
    Does NOT modify scheduler frequency.
    """
    if request.interval_label not in INTERVAL_OPTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid interval. Valid options: {list(INTERVAL_OPTIONS.keys())}",
        )
    update_monitor_interval(request.interval_label)
    return {
        "status": "updated",
        "interval_label": request.interval_label,
        "interval_minutes": INTERVAL_OPTIONS[request.interval_label],
    }


@router.get("/status")
def get_status():
    """Returns scheduler running state, current interval, and job metadata."""
    return get_scheduler_status()