from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.authz import ensure_owner_or_admin
# [Andrii sprint: PIIEncryptor import inserted here]
from app.database import get_db
from app.deps import get_current_user
from app.event_log import EventLogger
from app.models import Booking, Favorite, Review, User
from app.schemas import (
    FavoriteRequest,
    FavoriteResponse,
    Message,
    ModeratorMessageRequest,
    ProfileSelf,
    ProfileUpdateRequest,
    ReviewCreateRequest,
    ReviewResponse,
    ReviewUpdateRequest,
)

router = APIRouter(prefix="/api/me")
event_logger = EventLogger()
# [Andrii sprint: encryptor instance inserted here]

@router.get("/bookings", response_model=list[dict])
def my_bookings(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    bookings = list(db.scalars(select(Booking).where(Booking.user_id == user.id).order_by(Booking.starts_at.desc())))
    return [
        {
            "id": b.id,
            "court_id": b.court_id,
            "court_name": b.court.name if b.court else b.court_id,
            "status": b.status,
            "starts_at": b.starts_at,
            "ends_at": b.ends_at,
            "total_price": b.total_price,
        }
        for b in bookings
    ]

@router.get("/bookings/{booking_id}", response_model=dict)
def booking_detail(booking_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    ensure_owner_or_admin(user, booking.user_id)
    reviews = list(db.scalars(select(Review).where(Review.court_id == booking.court_id).order_by(Review.created_at.desc()).limit(5)))
    return {
        "id": booking.id,
        "court_id": booking.court_id,
        "court_name": booking.court.name if booking.court else booking.court_id,
        "court_address": booking.court.address if booking.court else "",
        "court_surface": booking.court.surface if booking.court else "",
        "status": booking.status,
        "starts_at": booking.starts_at,
        "ends_at": booking.ends_at,
        "total_price": booking.total_price,
        "reviews": [
            {
                "id": review.id,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at,
            }
            for review in reviews
        ],
    }

@router.get("/profile", response_model=ProfileSelf)
def profile(user: User = Depends(get_current_user)) -> ProfileSelf:
    return ProfileSelf(
        email=user.email,
        full_name=user.full_name,
        role=user.role,
# [Andrii sprint: phone decrypting inserted here]
    )

@router.patch("/profile", response_model=ProfileSelf)
def update_profile(
    payload: ProfileUpdateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ProfileSelf:
    if payload.full_name is not None:
        user.full_name = payload.full_name
# [Andrii sprint: phone encrypting inserted here]
    db.commit()
    event_logger.append("profile.updated", user.id, {})
    return profile(user)

@router.post("/profile/request-data-deletion", response_model=Message)
def request_data_deletion(user: User = Depends(get_current_user)) -> Message:
    event_logger.append("profile.data_deletion_requested", user.id, {})
    return Message(message="Data deletion request has been accepted.")

@router.post("/moderator-message", response_model=Message)
def message_moderator(payload: ModeratorMessageRequest, user: User = Depends(get_current_user)) -> Message:
    event_logger.append(
        "moderator.message_sent",
        user.id,
        {
            "booking_id": payload.booking_id,
            "court_id": payload.court_id,
            "subject": payload.subject,
            "message": payload.message,
        },
    )
    return Message(message="Message sent to moderator.")

# [Ulia sprint: favorites endpoints inserted here]
# [Andrii sprint: reviews endpoints inserted here]