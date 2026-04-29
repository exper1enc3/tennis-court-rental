import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from app.config import get_settings


class EventLogger:
    def __init__(self) -> None:
        settings = get_settings()
        self.path: Path = settings.event_log_path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self.path.write_text("", encoding="utf-8")

# [Vlad sprint: _last_hash method inserted here]

    def append(self, event_type: str, actor_id: int | None, payload: dict[str, Any]) -> dict[str, Any]:
        event = {
            "event_id": str(uuid4()),
            "event_type": event_type,
            "actor_id": actor_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "payload": payload,
# [Vlad sprint: prev_hash field inserted here]
        }
# [Vlad sprint: hash digest generation inserted here]

        with self.path.open("a", encoding="utf-8") as stream:
            stream.write(json.dumps(event, ensure_ascii=True) + "\n")
        return event

# [Vlad sprint: verify_chain method inserted here]