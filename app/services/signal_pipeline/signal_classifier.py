from sqlalchemy.orm import Session
from app.models.signal import Signal
from app.models.event import Event
from app.services.signal_pipeline.signal_detector import detect_signal_type
from app.services.signal_pipeline.priority_calculator import calculate_priority


def classify_and_store_signals(db: Session, events: list[Event]) -> list[Signal]:
    signals = []
    for event in events:
        raw_text = event.raw_text or ""
        project = event.project or ""

        signal_type = detect_signal_type(event.event_type, raw_text)
        priority_score = calculate_priority(signal_type, raw_text)

        signal = Signal(
            event_id=event.id,
            signal_type=signal_type,
            priority_score=priority_score,
            reason=raw_text,           # real human-readable text → Gemini gets context
            project=project,
            project_name=project,
        )
        db.add(signal)
        signals.append(signal)

    db.commit()
    for s in signals:
        db.refresh(s)

    return signals