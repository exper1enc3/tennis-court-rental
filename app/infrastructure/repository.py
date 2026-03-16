from __future__ import annotations

from typing import Generic, Optional, TypeVar

from sqlalchemy.orm import Session

from app.infrastructure.models import UserModel

ModelT = TypeVar("ModelT")


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
        role: str = "player",
        is_active: bool = True,
    ) -> UserModel:
        user = UserModel(
            first_name=first_name,
            last_name=last_name,
            email=email,
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
# user = repo.create(cmd.first_name, cmd.last_name, cmd.email, role="player")
#
# # signin use case:
# user = repo.get_by_email(cmd.email)
# if user is None or not user.is_active:
#     raise ValueError("Invalid credentials or inactive user")
