from pydantic import BaseModel
from datetime import datetime


class EventOut(BaseModel):
    id: int
    source: str
    project: str
    event_type: str
    raw_text: str
    created_at: datetime

    model_config = {"from_attributes": True}