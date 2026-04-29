from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.models import Court, Permission, Role, User
from app.routers import api_router
from app.security import hash_password

from fastapi import FastAPI

from app.routers import admin, bookings, courts, dashboard

settings = get_settings()
app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_schema()
    _seed_defaults()


def _ensure_schema() -> None:
    with engine.begin() as connection:
        columns = {row[1] for row in connection.execute(text("PRAGMA table_info(courts)"))}
        if "opening_time" not in columns:
            connection.execute(text("ALTER TABLE courts ADD COLUMN opening_time VARCHAR(5) DEFAULT '07:00' NOT NULL"))
        if "closing_time" not in columns:
            connection.execute(text("ALTER TABLE courts ADD COLUMN closing_time VARCHAR(5) DEFAULT '22:00' NOT NULL"))


def _seed_defaults() -> None:
    db: Session = SessionLocal()
    try:
        superuser = db.scalar(select(User).where(User.email == settings.superuser_email))
        if superuser is None:
            superuser = User(
                email=settings.superuser_email,
                full_name="System Superuser",
                password_hash=hash_password(settings.superuser_password),
                role="superuser",
                must_change_password=True,
            )
            db.add(superuser)
            db.flush()
        for role_name in ["guest", "user", "moderator", "admin", "superuser"]:
            if db.scalar(select(Role).where(Role.name == role_name)) is None:
                db.add(Role(name=role_name))
        defaults = [
            "courts:create",
            "courts:update",
            "courts:delete",
            "bookings:hold",
            "bookings:confirm",
            "bookings:cancel",
            "notifications:send_email",
            "event_log:replay",
        ]
        for permission in defaults:
            if db.scalar(select(Permission).where(Permission.name == permission)) is None:
                db.add(Permission(name=permission))
        sample_courts = [
            {
                "name": "Center Court Pechersk",
                "city": "Kyiv",
                "district": "Pechersk",
                "address": "Main Street 1",
                "surface": "Clay",
                "price_per_hour": 800,
                "opening_time": "07:00",
                "closing_time": "22:00",
                "latitude": "50.436",
                "longitude": "30.538",
            },
            {
                "name": "Riverside Tennis Club",
                "city": "Kyiv",
                "district": "Podil",
                "address": "Naberezhna 24",
                "surface": "Hard",
                "price_per_hour": 650,
                "opening_time": "06:30",
                "closing_time": "23:00",
                "latitude": "50.468",
                "longitude": "30.515",
            },
            {
                "name": "Urban Rally Arena",
                "city": "Kyiv",
                "district": "Obolon",
                "address": "Sportyvna 8",
                "surface": "Hard",
                "price_per_hour": 720,
                "opening_time": "08:00",
                "closing_time": "21:30",
                "latitude": "50.505",
                "longitude": "30.498",
            },
        ]
        for court_data in sample_courts:
            if db.scalar(select(Court).where(Court.name == court_data["name"])) is None:
                db.add(Court(**court_data, owner_id=superuser.id))
        db.commit()
    finally:
        db.close()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router())

app = FastAPI(title="Tennis Court Rental API")

app.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
app.include_router(courts.router, prefix="/courts", tags=["Courts"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])


@app.get("/")
def root():
    return {"status": "ok"}