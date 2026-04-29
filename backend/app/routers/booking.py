from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.event_log import event_logger
from app.models import Booking, User
from app.schemas import BookingResponse, BookingConfirmRequest, BookingCancelRequest

router = APIRouter()


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _naive(value: datetime) -> datetime:
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


def ensure_owner_or_admin(user: User, owner_id: str) -> None:
    if user.role != "admin" and user.id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


def _has_conflict(
    db: Session,
    court_id: str,
    starts_at: datetime,
    ends_at: datetime,
    exclude_booking_id: str | None = None,
) -> bool:
    query = select(Booking).where(
        Booking.court_id == court_id,
        Booking.status == "confirmed",
        Booking.starts_at < ends_at,
        Booking.ends_at > starts_at,
    )

    if exclude_booking_id is not None:
        query = query.where(Booking.id != exclude_booking_id)

    return db.scalar(query) is not None


@router.post("/confirm", response_model=BookingResponse)
def confirm_hold(
    payload: BookingConfirmRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BookingResponse:
    booking = db.scalar(select(Booking).where(Booking.hold_token == payload.hold_token))

    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hold not found")

    ensure_owner_or_admin(user, booking.user_id)

    if booking.status != "draft_hold":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Hold is not confirmable")

    if booking.held_until is None or _naive(booking.held_until) < _now():
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Hold expired")

    if _has_conflict(db, booking.court_id, booking.starts_at, booking.ends_at, exclude_booking_id=booking.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Booking conflict")

    booking.status = "confirmed"
    booking.hold_token = None
    booking.held_until = None

    db.commit()
    db.refresh(booking)

    event_logger.append("booking.confirmed", user.id, {"booking_id": booking.id})

    return booking


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: str,
    payload: BookingCancelRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BookingResponse:
    booking = db.get(Booking, booking_id)

    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    ensure_owner_or_admin(user, booking.user_id)

    if booking.status in {"cancelled", "completed"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Booking cannot be canceled")

    booking.status = "cancelled"
    booking.canceled_reason = payload.reason
    booking.hold_token = None
    booking.held_until = None

    db.commit()
    db.refresh(booking)

    event_logger.append("booking.cancelled", user.id, {"booking_id": booking.id, "reason": payload.reason})

    return booking