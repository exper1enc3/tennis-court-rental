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
    try:
        result = handle_signin(SignInCommand(
            email=body.email,
            password=body.password,
        ), db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
