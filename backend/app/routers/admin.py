from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.authz import require_role
# [Andrii sprint: PIIEncryptor import inserted here]
from app.database import get_db
from app.deps import get_current_user
from app.event_log import EventLogger
from app.models import Booking, Permission, Policy, Role, RoleBinding, RolePermission, User
from app.replay import replay_events
from app.schemas import (
    EventReplayResponse,
    Message,
    PermissionCreateRequest,
    PermissionResponse,
    PolicyRequest,
    PolicyResponse,
    RoleBindingRequest,
    RoleCreateRequest,
    RoleResponse,
    UserCreateRequest,
    UserProjection,
    UserUpdateRequest,
)
from app.security import hash_password

router = APIRouter(prefix="/api/admin")
event_logger = EventLogger()
# [Andrii sprint: encryptor instance inserted here]

def _admin_only(user: User) -> None:
    require_role(user, "admin")

@router.get("/users", response_model=list[UserProjection])
def list_users(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[UserProjection]:
    _admin_only(user)
    return list(db.scalars(select(User).order_by(User.id.asc())))

@router.post("/users", response_model=UserProjection, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserProjection:
    _admin_only(user)
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
    model = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role=payload.role,
# [Andrii sprint: phone encryption field inserted here]
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    event_logger.append("admin.user_created", user.id, {"target_user_id": model.id})
    return model

@router.patch("/users/{user_id}", response_model=UserProjection)
def update_user(
    user_id: int,
    payload: UserUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProjection:
    _admin_only(user)
    model = db.get(User, user_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    changes = payload.model_dump(exclude_unset=True)
# [Andrii sprint: PII encryption modification logic inserted here]
    for key, value in changes.items():
        setattr(model, key, value)
    db.commit()
    db.refresh(model)
    event_logger.append("admin.user_updated", user.id, {"target_user_id": model.id})
    return model

@router.delete("/users/{user_id}", response_model=Message)
def delete_user(user_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Message:
    _admin_only(user)
    model = db.get(User, user_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(model)
    db.commit()
    event_logger.append("admin.user_deleted", user.id, {"target_user_id": user_id})
    return Message(message="User deleted.")


def _admin_only(user: User) -> None:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")


@router.post("/event-log/replay", response_model=EventReplayResponse)
def replay_event_log(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EventReplayResponse:
    _admin_only(user)

    ok, _ = event_logger.verify_chain()

    if not ok:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Event log integrity check failed",
        )

    count = replay_events(event_logger.path, db)

    event_logger.append("event_log.replayed", user.id, {"events_replayed": count})

    return EventReplayResponse(ok=True, events_replayed=count)
# [Andrii sprint: RBAC endpoints inserted here]
# [Ulia sprint: list_all_bookings inserted here]
# [Masik sprint: replay_event_log inserted here]