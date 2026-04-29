from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.authz import ensure_court_owner_or_admin, require_role
from app.database import get_db
from app.deps import get_current_user
from app.event_log import EventLogger
from app.models import Booking, Court, User
from app.schemas import AvailabilitySlot, CourtCreate, CourtResponse, CourtUpdate

router = APIRouter(prefix="/api/courts")
event_logger = EventLogger()

def _naive(dt: datetime) -> datetime:
    return dt.replace(tzinfo=None) if dt.tzinfo else dt


def _minutes(value: str) -> int:
    hours, minutes = value.split(":")
    return int(hours) * 60 + int(minutes)


def _inside_working_hours(court: Court, starts_at: datetime, ends_at: datetime) -> bool:
    start_minutes = starts_at.hour * 60 + starts_at.minute
    end_minutes = ends_at.hour * 60 + ends_at.minute
    return start_minutes >= _minutes(court.opening_time) and end_minutes <= _minutes(court.closing_time)

@router.get("", response_model=list[CourtResponse])
def list_courts(
    city: str | None = None, district: str | None = None, db: Session = Depends(get_db)
) -> list[CourtResponse]:
    query = select(Court).where(Court.is_active.is_(True))
    if city:
        query = query.where(Court.city == city)
    if district:
        query = query.where(Court.district == district)
    return list(db.scalars(query))

# [Vlad sprint: create_court inserted here]

@router.get("/{court_id}", response_model=CourtResponse)
def get_court(court_id: str, db: Session = Depends(get_db)) -> CourtResponse:
    court = db.get(Court, court_id)
    if court is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Court not found")
    return court

# [Masik sprint: update_court inserted here]
# [Vlad sprint: delete_court inserted here]


@router.get("/{court_id}/availability", response_model=list[AvailabilitySlot])
def get_availability(
    court_id: str,
    start: datetime = Query(default_factory=lambda: datetime.now(timezone.utc)),
    days: int = 7,
    db: Session = Depends(get_db),
) -> list[AvailabilitySlot]:
    court = db.get(Court, court_id)
    if court is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Court not found")
    start = _naive(start)
    now = _naive(datetime.now(timezone.utc))
    window_end = start + timedelta(days=max(1, min(days, 7)))
    bookings = list(
        db.scalars(
            select(Booking).where(
                and_(Booking.court_id == court_id, Booking.starts_at < window_end, Booking.ends_at > start)
            )
        )
    )
    slots: list[AvailabilitySlot] = []
    cursor = start
    while cursor < window_end:
        slot_end = cursor + timedelta(minutes=30)
        state = "free"
        if slot_end <= now:
            state = "past"
        if not _inside_working_hours(court, cursor, slot_end):
            state = "disabled"
        for booking in bookings:
            if _naive(booking.starts_at) < slot_end and _naive(booking.ends_at) > cursor:
                state = "held" if booking.status == "draft_hold" else "booked"
                break
        slots.append(AvailabilitySlot(starts_at=cursor, ends_at=slot_end, state=state))
        cursor = slot_end
    return slots
