from __future__ import annotations

from typing import Generic, Optional, TypeVar

from sqlalchemy.orm import Session

from app.infrastructure.models import CourtModel, UserModel

ModelT = TypeVar("ModelT")

from app.infrastructure.models import CourtModel


class BaseRepository(Generic[ModelT]):
    """Base repository with shared DB helpers."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def add(self, entity: ModelT) -> ModelT:
        self.db.add(entity)
        return entity

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, entity: ModelT) -> ModelT:
        self.db.refresh(entity)
        return entity

    def commit_and_refresh(self, entity: ModelT) -> ModelT:
        self.commit()
        return self.refresh(entity)


class UserRepository(BaseRepository[UserModel]):
    """User-specific persistence methods."""

    def create(
        self,
        first_name: str,
        last_name: str,
        email: str,
        password_hash: str,
        role: str = "player",
        is_active: bool = True,
    ) -> UserModel:
        user = UserModel(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=password_hash,
            role=role,
            is_active=is_active,
        )
        self.add(user)
        return self.commit_and_refresh(user)

    def get_by_id(self, user_id: int) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def list_active(self) -> list[UserModel]:
        return self.db.query(UserModel).filter(UserModel.is_active.is_(True)).all()

    def deactivate(self, user_id: int) -> Optional[UserModel]:
        user = self.get_by_id(user_id)
        if user is None:
            return None
        user.is_active = False
        return self.commit_and_refresh(user)


# Example usage in business logic (application layer):
# from app.infrastructure.repository import UserRepository
# repo = UserRepository(db_session)
#
# # signup use case:
# if repo.get_by_email(cmd.email):
#     raise ValueError("Email already exists")
# user = repo.create(
#     cmd.first_name,
#     cmd.last_name,
#     cmd.email,
#     password_hash=hash_password(cmd.password),
#     role="player",
# )
#
# # signin use case:
# user = repo.get_by_email(cmd.email)
# if user is None or not user.is_active:
#     raise ValueError("Invalid credentials or inactive user")

class CourtRepository(BaseRepository[CourtModel]):
    """Court-specific persistence methods."""

    def get_all(
        self,
        city: Optional[str] = None,
        district: Optional[str] = None,
    ) -> list[CourtModel]:
        query = self.db.query(CourtModel).filter(CourtModel.is_active.is_(True))
        if city:
            query = query.filter(CourtModel.city == city)
        if district:
            query = query.filter(CourtModel.district == district)
        return query.all()

    def get_by_id(self, court_id: int) -> Optional[CourtModel]:
        return (
            self.db.query(CourtModel)
            .filter(CourtModel.id == court_id, CourtModel.is_active.is_(True))
            .first()
        )

    def get_distinct_cities(self) -> list[str]:
        rows = (
            self.db.query(CourtModel.city)
            .filter(CourtModel.is_active.is_(True))
            .distinct()
            .order_by(CourtModel.city)
            .all()
        )
        return [row.city for row in rows]

    def get_distinct_districts(self, city: str) -> list[str]:
        rows = (
            self.db.query(CourtModel.district)
            .filter(CourtModel.city == city, CourtModel.is_active.is_(True))
            .distinct()
            .order_by(CourtModel.district)
            .all()
        )
        return [row.district for row in rows]
