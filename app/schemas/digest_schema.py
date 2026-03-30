from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict, Optional


class DigestOut(BaseModel):
    id: int
    summary: str
    actions: str
    health_report: Dict[str, Any]
    changes_summary: str
    risk_count: int
    decision_count: int
    progress_count: int
    interval_label: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}