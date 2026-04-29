import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import Booking, Court


def replay_events(path: Path, db: Session) -> int:
    if not path.exists():
        return 0
    count = 0
    with path.open("r", encoding="utf-8") as stream:
        for line in stream:
            if not line.strip():
                continue
            event = json.loads(line)
            payload = event.get("payload", {})
            event_type = event.get("event_type")
            if event_type == "court.created":
                court_id = payload.get("court_id")
                if court_id and db.get(Court, court_id) is None:
                    # Replay expects full snapshots eventually; keeping best-effort mode for now.
                    pass
            if event_type == "booking.confirmed":
                booking_id = payload.get("booking_id")
                if booking_id:
                    booking = db.get(Booking, booking_id)
                    if booking:
                        booking.status = "confirmed"
            count += 1
    db.commit()
    return count

