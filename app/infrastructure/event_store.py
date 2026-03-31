# TODO: Реалізувати EventStore клас для запису/читання подій з `db/events.jsonl`.
# Мінімальні вимоги для першої версії:
# - append(event): дописує одну подію в кінець файлу (JSONL, append-only)
# - read_all(): читає всі події по порядку
# - read_by_type(event_type): читає події конкретного типу
# - валідація базової структури події (`id`, `event_type`, `timestamp`, `data`)
# - гарантія що існуючі рядки не перезаписуються (тільки append)
#
# Події, які мають з'явитись найближчим часом:
# - `user_signed_up`
# - `user_signed_in`
# - `user_profile_updated`
# - `user_profile_deactivated` (коли `is_active = false`)

# {
#     "id": "123",
#     "event_type": "user_signed_up",
#     "timestamp": "2021-01-01T00:00:00Z",
#     "data": {
#         "user_id": "123",
#         "email": "test@example.com",
#         "first_name": "John",
#         "last_name": "Doe",
#         "role": "user",
#         "is_active": true,
#         "created_at": "2021-01-01T00:00:00Z",
#         "password_hash": "password_hash",
#     }
# }
# TODO: описати окремі event schema для кожного `event_type`, щоб `data` була типізована.


import json
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any
from app.infrastructure.versioning import EventStoreVersioning

EVENTS_FILE = 'db/events.jsonl'

class EventStore:
    def __init__(self, file_path: str = EVENTS_FILE):
        self.file_path = file_path
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        dir_name = os.path.dirname(self.file_path)
        if not os.path.exists(dir_name):
            os.makedirs(dir_name)

        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w') as f:
                pass

    def _validate_event(self, event: Dict[str, Any]) -> bool:
        required_keys = ["id", "event_type", "timestamp", "data"]
        return all(key in event for key in required_keys)

    def append(self, event: Dict[str, Any]) -> None:
        if not self._validate_event(event):
            raise ValueError("The event has an incomplete structure.")
        with open(self.file_path, 'a') as f:
            f.write(json.dumps(event) + "\n")

        _vsn = EventStoreVersioning()
        _vsn.create_snapshot(created_by="system")

    def read_all(self) -> List[Dict[str, Any]]:
        events = []
        with open(self.file_path, 'r') as f:
            for line in f:
                events.append(json.loads(line.strip()))
        return events

    def read_by_type(self, event_type: str) -> List[Dict[str, Any]]:
        events = self.read_all()
        return [event for event in events if event['event_type'] == event_type]

class EventSchemas:
    @staticmethod
    def user_signed_up_data(user_id: str, email: str, first_name: str, last_name: str, role: str, is_active: bool,
                            created_at: str, password_hash: str) -> Dict[str, Any]:
        return {
            "id": str(uuid.uuid4()),
            "event_type": "user_signed_up",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "user_id": user_id,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "role": role,
                "is_active": is_active,
                "created_at": created_at,
                "password_hash": password_hash,
            }
        }

    @staticmethod
    def user_signed_in_data(user_id: str, email: str, timestamp: str) -> Dict[str, Any]:
        return {
            "id": str(uuid.uuid4()),
            "event_type": "user_signed_in",
            "timestamp": timestamp,
            "data": {
                "user_id": user_id,
                "email": email,
            }
        }

    @staticmethod
    def user_profile_updated_data(user_id: str, first_name: str, last_name: str, email: str) -> Dict[str, Any]:
        return {
            "id": str(uuid.uuid4()),
            "event_type": "user_profile_updated",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "user_id": user_id,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
            }
        }

    @staticmethod
    def user_profile_deactivated_data(user_id: str, is_active: bool) -> Dict[str, Any]:
        return {
            "id": str(uuid.uuid4()),
            "event_type": "user_profile_deactivated",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "user_id": user_id,
                "is_active": is_active,
            }
        }

event_store = EventStore()

event = EventSchemas.user_signed_up_data(
    user_id="123",
    email="test@example.com",
    first_name="John",
    last_name="Doe",
    role="user",
    is_active=True,
    created_at="2021-01-01T00:00:00Z",
    password_hash="password_hash"
)

event_store.append(event)

events = event_store.read_all()
print(events)

user_signed_up_events = event_store.read_by_type("user_signed_up")
print(user_signed_up_events)