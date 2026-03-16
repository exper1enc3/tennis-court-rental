from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

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


@router.post("/auth/signup", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
def signup(body: SignUpRequest):
    return UserResponse(
        id=2,
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        role=body.role,
        is_active=True,
        created_at="2026-03-16T10:00:00Z",
    )


@router.post("/auth/signin", response_model=TokenResponse)
def signin(body: SignInRequest):
    if body.email != _HARDCODED_EMAIL or body.password != _HARDCODED_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return TokenResponse(
        access_token="hardcoded.jwt.token",
        token_type="bearer",
        user=_HARDCODED_USER,
    )
