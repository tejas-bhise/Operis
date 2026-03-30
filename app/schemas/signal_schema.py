from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SignalOut(BaseModel):
    id: int
    event_id: Optional[int] = None
    signal_type: str
    priority_score: float
    reason: str
    project: str
    created_at: datetime

    model_config = {"from_attributes": True}
