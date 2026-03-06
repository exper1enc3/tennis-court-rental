from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.infrastructure.sqlite import Base


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    role = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    is_active = Column(Boolean, nullable=False, default=True, server_default="1")

    bookings = relationship("BookingModel", back_populates="user")


class CourtModel(Base):
    __tablename__ = "courts"
    __table_args__ = (
        Index("idx_courts_city", "city"),
        Index("idx_courts_district", "district"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    surface_type = Column(String, nullable=False)
    city = Column(String, nullable=False)
    district = Column(String, nullable=False)
    address = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    is_active = Column(Boolean, nullable=False, default=True, server_default="1")

    bookings = relationship("BookingModel", back_populates="court")
    hours = relationship("CourtHoursModel", back_populates="court")
    booking_slots = relationship("BookingSlotModel", back_populates="court")


class CourtHoursModel(Base):
    __tablename__ = "court_hours"
    __table_args__ = (
        UniqueConstraint("court_id", "weekday", name="uq_court_hours_court_weekday"),
        CheckConstraint("weekday BETWEEN 0 AND 6", name="ck_court_hours_weekday"),
        CheckConstraint("start_time < end_time", name="ck_court_hours_time_range"),
    )

    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id"), nullable=False, index=True)
    weekday = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True, server_default="1")

    court = relationship("CourtModel", back_populates="hours")


class BookingModel(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint("slot_count >= 2", name="ck_bookings_min_slot_count"),
        CheckConstraint("end_time > start_time", name="ck_bookings_time_range"),
        CheckConstraint(
            "status IN ('active', 'cancelled', 'completed')",
            name="ck_bookings_status",
        ),
        Index("idx_bookings_court_id", "court_id"),
        Index("idx_bookings_user_id", "user_id"),
        Index("idx_bookings_start_time", "start_time"),
        Index("idx_bookings_status", "status"),
    )

    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    slot_count = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="active", server_default="active")
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    cancelled_at = Column(DateTime, nullable=True)

    court = relationship("CourtModel", back_populates="bookings")
    user = relationship("UserModel", back_populates="bookings")
    slots = relationship(
        "BookingSlotModel",
        back_populates="booking",
        cascade="all, delete-orphan",
    )


class BookingSlotModel(Base):
    __tablename__ = "booking_slots"
    __table_args__ = (
        UniqueConstraint("court_id", "slot_start", name="uq_booking_slots_court_slot"),
        UniqueConstraint(
            "booking_id",
            "slot_start",
            name="uq_booking_slots_booking_slot",
        ),
        Index("idx_booking_slots_booking_id", "booking_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    court_id = Column(Integer, ForeignKey("courts.id"), nullable=False)
    slot_start = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    booking = relationship("BookingModel", back_populates="slots")
    court = relationship("CourtModel", back_populates="booking_slots")
