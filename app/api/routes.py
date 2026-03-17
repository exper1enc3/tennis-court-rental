from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.infrastructure.sqlite import get_db
from app.application.handlers import handle_signup, handle_signin, SignUpCommand, SignInCommand

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


_HARDCODED_USER = UserResponse(
    id=1,
    first_name="Max",
    last_name="Loh",
    email="maxloh@example.com",
    role="player",
    is_active=True,
    created_at="2026-03-16T10:00:00Z",
)

_HARDCODED_EMAIL = "maxloh"
_HARDCODED_PASSWORD = "1234"


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
