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

# [Andrii sprint: _naive, _minutes, _inside_working_hours helpers inserted here]

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


def ensure_court_owner_or_admin(user: User, owner_id: str) -> None:
    if user.role != "admin" and user.id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


@router.patch("/{court_id}", response_model=CourtResponse)
def update_court(
    court_id: str,
    payload: CourtUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CourtResponse:
    court = db.get(Court, court_id)

    if court is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Court not found")

    ensure_court_owner_or_admin(user, court.owner_id)

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(court, key, value)

    db.commit()
    db.refresh(court)

    event_logger.append("court.updated", user.id, {"court_id": court.id})

    return court
# [Masik sprint: update_court inserted here]
# [Vlad sprint: delete_court inserted here]
# [Andrii sprint: get_availability inserted here]