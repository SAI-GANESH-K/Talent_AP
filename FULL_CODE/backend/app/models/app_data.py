"""SQLAlchemy models for application-created data.

These tables hold user accounts, assessments, quotes, and bookings.
Financial values use NUMERIC. Booking uses row-level locking via advisor_slots.
"""

import uuid

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class User(Base):
    """Application user accounts — customers, advisors, admins."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="customer",
    )
    # Link advisor users to their advisor record
    advisor_id: Mapped[str | None] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("role IN ('customer', 'advisor', 'admin')", name="ck_user_role"),
    )


class Assessment(Base):
    """Stored customer financial assessments with HLV + Net Needs results."""

    __tablename__ = "assessments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )
    # Validated financial inputs (frozen snapshot)
    input_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    # Assumptions used for this calculation (frozen snapshot)
    assumptions: Mapped[dict] = mapped_column(JSONB, nullable=False)
    # Detailed calculation results
    hlv_result: Mapped[dict] = mapped_column(JSONB, nullable=False)
    net_needs_result: Mapped[dict] = mapped_column(JSONB, nullable=False)
    recommended_gap_inr: Mapped[int] = mapped_column(Numeric(15, 0), nullable=False)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class QuoteScenario(Base):
    """Saved product configuration and premium quote."""

    __tablename__ = "quote_scenarios"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )
    assessment_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("assessments.id")
    )
    product_id: Mapped[str] = mapped_column(String(20), nullable=False)
    # Full configuration: SA, term, riders, mode, etc.
    config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    # Calculated premium breakdown
    result: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Booking(Base):
    """Advisor consultation bookings.

    Transaction safety:
    - Booking acquires a row lock on advisor_slots via SELECT FOR UPDATE
    - Only slots with status='available' can be booked
    - Slot status is updated to 'booked' atomically in the same transaction
    - Cancellation sets booking.status='cancelled' and slot.status='available'
    - Historical booking records are preserved (never deleted)
    - The unique constraint on (slot_id) WHERE status='confirmed' prevents
      double-booking while allowing cancelled bookings to release slots
    """

    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )
    slot_id: Mapped[str] = mapped_column(String(20), nullable=False)
    advisor_id: Mapped[str] = mapped_column(String(20), nullable=False)
    consultation_mode: Mapped[str] = mapped_column(String(10), nullable=False)
    # Assessment summary shared with advisor (with consent)
    assessment_summary: Mapped[dict | None] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="confirmed")
    advisor_notes: Mapped[str | None] = mapped_column(Text)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('confirmed', 'cancelled', 'completed')",
            name="ck_booking_status",
        ),
        # Partial unique index: only one confirmed booking per slot
        # This allows cancelled bookings to exist without blocking re-booking
        # Created via raw DDL in migration since SQLAlchemy doesn't directly
        # support partial unique indexes in __table_args__
    )


class AuditEvent(Base):
    """Privacy-safe audit trail — no raw financial payloads."""

    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_type: Mapped[str | None] = mapped_column(String(30))
    resource_id: Mapped[str | None] = mapped_column(String(50))
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class UserSession(Base):
    """Server-side authenticated customer/advisor/admin sessions."""

    __tablename__ = "user_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    session_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    csrf_token: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at = mapped_column(DateTime(timezone=True), nullable=False)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

