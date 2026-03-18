from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

from app.application.authz_service import hash_password, verify_password, generate_token
from app.infrastructure.repository import UserRepository
from app.infrastructure.event_store import EventStore


@dataclass
class SignUpCommand:
    first_name: str
    last_name: str
    email: str
    password: str
    role: str = "player"


@dataclass
class SignInCommand:
    email: str
    password: str


@dataclass
class AuthResult:
    access_token: str
    token_type: str
    user_id: int
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    created_at: str


def handle_signup(cmd: SignUpCommand, db: Session) -> AuthResult:
    repo = UserRepository(db)
    event_store = EventStore()

    if repo.get_by_email(cmd.email):
        raise ValueError("This email address is already registered")

    password_hash = hash_password(cmd.password)

    user = repo.create(
        first_name=cmd.first_name,
        last_name=cmd.last_name,
        email=cmd.email,
        password_hash=password_hash,
        role=cmd.role,
    )

    event_store.append({
        "id": str(uuid4()),
        "event_type": "user_signed_up",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "user_id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "is_active": True,
            "created_at": user.created_at.isoformat(),
            "password_hash": user.password_hash,
        },
    })

    token = generate_token(user_id=user.id, role=user.role)

    return AuthResult(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at.isoformat(),
    )


def handle_signin(cmd: SignInCommand, db: Session) -> AuthResult:
    repo = UserRepository(db)
    event_store = EventStore()

    user = repo.get_by_email(cmd.email)
    if user is None or not user.is_active:
        raise ValueError("Invalid email or password")

    if not verify_password(cmd.password, user.password_hash):
        raise ValueError("Invalid email or password")

    event_store.append({
        "id": str(uuid4()),
        "event_type": "user_signed_in",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "user_id": user.id,
            "email": user.email,
        },
    })

    token = generate_token(user_id=user.id, role=user.role)

    return AuthResult(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at.isoformat(),
    )