from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.infrastructure.sqlite import get_db
from app.application.handlers import handle_signup, handle_signin, SignUpCommand, SignInCommand
from typing import Optional
from app.application.handlers import (
    handle_signup, handle_signin, SignUpCommand, SignInCommand,
    handle_get_courts, handle_get_court_by_id, handle_get_cities,
    handle_get_districts, handle_get_current_user,
    GetCourtsQuery, GetCourtByIdQuery, GetDistrictsQuery, GetCurrentUserQuery,
)
from app.application.authz_service import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()


class SignUpRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str = "player"


class SignInRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    is_active: bool
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


@router.get("/health")
def healthcheck():
    return {"status": "ok"}


@router.post("/auth/signup", status_code=status.HTTP_201_CREATED)
def signup(body: SignUpRequest, db: Session = Depends(get_db)):
    result = handle_signup(SignUpCommand(
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        password=body.password,
        role=body.role,
    ), db)
    return result

@router.post("/auth/signin")
def signin(body: SignInRequest, db: Session = Depends(get_db)):
    result = handle_signin(SignInCommand(
        email=body.email,
        password=body.password,
    ), db)
    return result

security = HTTPBearer()


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return payload["user_id"]


@router.get("/courts")
def get_courts(
    city: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return handle_get_courts(GetCourtsQuery(city=city, district=district), db)


@router.get("/courts/{court_id}")
def get_court(court_id: int, db: Session = Depends(get_db)):
    try:
        return handle_get_court_by_id(GetCourtByIdQuery(court_id=court_id), db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    return handle_get_cities(db)


@router.get("/districts")
def get_districts(city: str, db: Session = Depends(get_db)):
    return handle_get_districts(GetDistrictsQuery(city=city), db)


@router.get("/users/me")
def get_me(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    try:
        return handle_get_current_user(GetCurrentUserQuery(user_id=user_id), db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
