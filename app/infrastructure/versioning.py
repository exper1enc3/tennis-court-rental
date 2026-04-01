from __future__ import annotations

import json
import os
import shutil
from datetime import datetime
from typing import Any, Dict, List, Optional


_BASE_DIR = os.path.join("app", "infrastructure", "db")
EVENTS_FILE = os.path.join(_BASE_DIR, "events.jsonl")
SNAPSHOTS_DIR = os.path.join(_BASE_DIR, "snapshots")
VERSION_META_FILE = os.path.join(_BASE_DIR, "version_meta.json")


def _ensure_dirs() -> None:
    os.makedirs(SNAPSHOTS_DIR, exist_ok=True)
    if not os.path.exists(EVENTS_FILE):
        open(EVENTS_FILE, "w").close()
    if not os.path.exists(VERSION_META_FILE):
        _write_meta({"current_version": 0, "snapshots": []})


def _read_meta() -> Dict[str, Any]:
    with open(VERSION_META_FILE, "r", encoding="utf-8") as fh:
        return json.load(fh)


def _write_meta(meta: Dict[str, Any]) -> None:
    with open(VERSION_META_FILE, "w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)


def _snapshot_path(version: int) -> str:
    return os.path.join(SNAPSHOTS_DIR, f"events_v{version}.jsonl")



class EventStoreVersioning:
    def __init__(
        self,
        events_file: str = EVENTS_FILE,
        snapshots_dir: str = SNAPSHOTS_DIR,
        meta_file: str = VERSION_META_FILE,
    ) -> None:
        self.events_file = events_file
        self.snapshots_dir = snapshots_dir
        self.meta_file = meta_file
        _ensure_dirs()


    def create_snapshot(self, created_by: str = "system") -> Dict[str, Any]:
        meta = _read_meta()
        new_version: int = meta["current_version"] + 1


        event_count = self._count_events()


        dest = _snapshot_path(new_version)
        shutil.copy2(self.events_file, dest)


        snapshot_entry: Dict[str, Any] = {
            "version": new_version,
            "created_at": datetime.now().isoformat(),
            "created_by": created_by,
            "event_count": event_count,
            "snapshot_file": dest,
        }


        meta["current_version"] = new_version
        meta["snapshots"].append(snapshot_entry)
        _write_meta(meta)


        print(
            f"[Versioning] Snapshot v{new_version} created "
            f"({event_count} events) by '{created_by}'."
        )
        return snapshot_entry


    def restore_snapshot(self, version: int) -> None:
        meta = _read_meta()
        available = [s["version"] for s in meta["snapshots"]]


        if version not in available:
            raise ValueError(
                f"Version {version} not found. Available versions: {available}"
            )


        src = _snapshot_path(version)
        if not os.path.exists(src):
            raise FileNotFoundError(
                f"Snapshot file missing on disk: {src}"
            )


        backup_path = self.events_file + ".bak"
        shutil.copy2(self.events_file, backup_path)


        shutil.copy2(src, self.events_file)
        print(
            f"[Versioning] Event log restored to v{version}. "
            f"Previous state backed up to '{backup_path}'."
        )


    def list_snapshots(self) -> List[Dict[str, Any]]:
        return _read_meta().get("snapshots", [])


    def current_version(self) -> int:
        return _read_meta().get("current_version", 0)


    def get_snapshot_info(self, version: int) -> Optional[Dict[str, Any]]:
        for snap in self.list_snapshots():
            if snap["version"] == version:
                return snap
        return None


    def _count_events(self) -> int:
        if not os.path.exists(self.events_file):
            return 0
        with open(self.events_file, "r", encoding="utf-8") as fh:
            return sum(1 for line in fh if line.strip())



def auto_snapshot_hook(
    versioning: EventStoreVersioning,
    created_by: str = "system",
    every_n_events: int = 50,
) -> None:

    vsn_instance = versioning
    count = vsn_instance._count_events()
    if count > 0 and count % every_n_events == 0:
        vsn_instance.create_snapshot(created_by=created_by)