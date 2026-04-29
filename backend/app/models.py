from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="user", index=True)
    # [Andrii sprint: phone_encrypted PII field inserted here]
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Court(Base):
    __tablename__ = "courts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(120), index=True)
    district: Mapped[str] = mapped_column(String(120), index=True)
    address: Mapped[str] = mapped_column(String(255))
    surface: Mapped[str] = mapped_column(String(80))
    price_per_hour: Mapped[int] = mapped_column(Integer)
    opening_time: Mapped[str] = mapped_column(String(5), default="07:00")
    closing_time: Mapped[str] = mapped_column(String(5), default="22:00")
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    latitude: Mapped[str | None] = mapped_column(String(40), nullable=True)
    longitude: Mapped[str | None] = mapped_column(String(40), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

# [Vlad sprint: Booking class inserted here]
class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "court_id", name="uq_favorite_user_court"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    court_id: Mapped[str] = mapped_column(ForeignKey("courts.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

# [Andrii sprint: Review, Role, Permission, RolePermission, Policy, RoleBinding classes inserted here]