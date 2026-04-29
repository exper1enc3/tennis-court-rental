from fastapi import HTTPException, status

from app.models import User


ROLE_LEVEL = {
    "guest": 0,
    "user": 1,
    "moderator": 2,
    "admin": 3,
    "superuser": 4,
}


def require_role(user: User, minimum: str) -> None:
    if ROLE_LEVEL.get(user.role, 0) < ROLE_LEVEL[minimum]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")


def ensure_owner_or_admin(user: User, owner_id: int) -> None:
    if user.id != owner_id and user.role not in {"admin", "superuser"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


def ensure_court_owner_or_admin(user: User, owner_id: int) -> None:
    if user.id != owner_id and user.role not in {"admin", "superuser"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

