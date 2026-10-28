"""Appointment booking, cancellation, advisor consultations, and admin statistics.

Implements:
- Transaction-safe slot booking using row-level locking (SELECT ... FOR UPDATE)
- Partial unique booking constraint verification
- Safe slot release upon cancellation while preserving booking history
- Strict BOLA/IDOR prevention across customer, advisor, and admin roles
"""

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_role, verify_csrf
from app.db.session import get_db
from app.models.app_data import Booking, User
from app.models.source_data import Advisor, AdvisorSlot
from app.schemas.advisory import (
    AdminStatsResponse,
    BookingResponse,
    CreateBookingRequest,
    UpdateConsultationRequest,
)

router = APIRouter(prefix="/api/v1", tags=["Bookings & Consultations"])


def _build_booking_response(booking: Booking, db: Session) -> BookingResponse:
    """Helper to populate customer, advisor, and slot datetime details."""
    customer = db.query(User).filter(User.id == booking.user_id).first()
    advisor = db.query(Advisor).filter(Advisor.advisor_id == booking.advisor_id).first()
    slot = db.query(AdvisorSlot).filter(AdvisorSlot.slot_id == booking.slot_id).first()

    return BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        customer_name=customer.full_name if customer else "Customer",
        customer_email=customer.email if customer else None,
        slot_id=booking.slot_id,
        advisor_id=booking.advisor_id,
        advisor_name=advisor.advisor_name if advisor else booking.advisor_id,
        consultation_mode=booking.consultation_mode,
        slot_start=slot.slot_start if slot else None,
        slot_end=slot.slot_end if slot else None,
        assessment_summary=booking.assessment_summary,
        status=booking.status,
        advisor_notes=booking.advisor_notes,
        created_at=booking.created_at,
    )


# ── Customer Booking Endpoints ──


@router.post(
    "/bookings",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Book a consultation slot (Customer only)",
)
def create_booking(
    req: CreateBookingRequest,
    user: User = Depends(require_role("customer")),
    _csrf: None = Depends(verify_csrf),
    db: Session = Depends(get_db),
):
    """Transaction-safe booking using SELECT FOR UPDATE on advisor_slots.

    Ensures two concurrent requests for the same slot result in exactly one booking.
    """
    mode_clean = req.consultation_mode.strip().lower()

    # 1. Acquire row lock on target slot
    slot = (
        db.query(AdvisorSlot)
        .filter(AdvisorSlot.slot_id == req.slot_id.strip())
        .with_for_update()
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Slot '{req.slot_id}' not found.",
        )

    if slot.status != "available":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This consultation slot is already booked or unavailable.",
        )

    # 2. Verify advisor supports the requested consultation mode
    advisor = db.query(Advisor).filter(Advisor.advisor_id == slot.advisor_id).first()
    if not advisor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Advisor '{slot.advisor_id}' not found.",
        )

    supported_modes = [
        m.strip().lower() for m in advisor.consultation_modes.split(";") if m.strip()
    ]
    if mode_clean not in supported_modes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Advisor '{advisor.advisor_name}' does not support mode '{mode_clean}'. Supported: {supported_modes}.",
        )

    # 3. Mark slot booked and insert booking record
    slot.status = "booked"
    new_booking = Booking(
        user_id=user.id,
        slot_id=slot.slot_id,
        advisor_id=slot.advisor_id,
        consultation_mode=mode_clean,
        assessment_summary=req.assessment_summary,
        status="confirmed",
        advisor_notes=None,
    )
    db.add(new_booking)

    try:
        db.commit()
        db.refresh(new_booking)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict: this slot was already confirmed for another booking.",
        )

    return _build_booking_response(new_booking, db)


@router.get(
    "/bookings/my",
    response_model=List[BookingResponse],
    summary="Get current customer's consultation bookings",
)
def get_my_bookings(
    user: User = Depends(require_role("customer")),
    db: Session = Depends(get_db),
):
    """Retrieve all bookings belonging strictly to the authenticated customer."""
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return [_build_booking_response(b, db) for b in bookings]


@router.post(
    "/bookings/{booking_id}/cancel",
    response_model=BookingResponse,
    summary="Cancel a booking and release the slot",
)
def cancel_booking(
    booking_id: uuid.UUID,
    user: User = Depends(require_role("customer", "admin")),
    _csrf: None = Depends(verify_csrf),
    db: Session = Depends(get_db),
):
    """Cancel booking with IDOR verification and transactional slot release.

    Releases the slot back to 'available' while preserving the booking record in 'cancelled' state.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found.",
        )

    # IDOR / BOLA authorization check: customers can only cancel their own bookings
    if user.role == "customer" and booking.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to cancel another customer's booking.",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled.",
        )

    if booking.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a completed consultation.",
        )

    # Release slot back to 'available' with row lock
    slot = (
        db.query(AdvisorSlot)
        .filter(AdvisorSlot.slot_id == booking.slot_id)
        .with_for_update()
        .first()
    )
    if slot:
        slot.status = "available"

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    return _build_booking_response(booking, db)


# ── Advisor Consultation Portal Endpoints ──


@router.get(
    "/advisor/consultations",
    response_model=List[BookingResponse],
    summary="List consultations assigned to the logged-in advisor",
)
def get_advisor_consultations(
    user: User = Depends(require_role("advisor")),
    db: Session = Depends(get_db),
):
    """Retrieve all bookings assigned strictly to the logged-in advisor."""
    if not user.advisor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Advisor account has no linked advisor dataset ID.",
        )

    bookings = (
        db.query(Booking)
        .filter(Booking.advisor_id == user.advisor_id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return [_build_booking_response(b, db) for b in bookings]


@router.patch(
    "/advisor/consultations/{booking_id}",
    response_model=BookingResponse,
    summary="Update consultation status and notes (Advisor only)",
)
def update_advisor_consultation(
    booking_id: uuid.UUID,
    req: UpdateConsultationRequest,
    user: User = Depends(require_role("advisor")),
    _csrf: None = Depends(verify_csrf),
    db: Session = Depends(get_db),
):
    """Advisor updates consultation status (completed/cancelled) and records notes.

    Enforces BOLA: advisor can only update consultations assigned to them.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found.",
        )

    if booking.advisor_id != user.advisor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: consultation is assigned to another advisor.",
        )

    if req.status:
        if req.status not in ("completed", "cancelled", "confirmed"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{req.status}'. Permitted: 'completed', 'cancelled', 'confirmed'.",
            )
        booking.status = req.status
        # If advisor cancelled, release the slot
        if req.status == "cancelled":
            slot = (
                db.query(AdvisorSlot)
                .filter(AdvisorSlot.slot_id == booking.slot_id)
                .with_for_update()
                .first()
            )
            if slot:
                slot.status = "available"

    if req.advisor_notes is not None:
        booking.advisor_notes = req.advisor_notes.strip()

    db.commit()
    db.refresh(booking)

    return _build_booking_response(booking, db)


# ── Admin Dashboard Endpoints ──


@router.get(
    "/admin/stats",
    response_model=AdminStatsResponse,
    summary="Platform operational metrics (Admin only)",
)
def get_admin_stats(
    _admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Aggregate platform analytics across bookings, slot utilization, and advisors."""
    total_bookings = db.query(func.count(Booking.id)).scalar() or 0
    confirmed_bookings = (
        db.query(func.count(Booking.id)).filter(Booking.status == "confirmed").scalar() or 0
    )
    completed_bookings = (
        db.query(func.count(Booking.id)).filter(Booking.status == "completed").scalar() or 0
    )
    cancelled_bookings = (
        db.query(func.count(Booking.id)).filter(Booking.status == "cancelled").scalar() or 0
    )

    total_advisors = db.query(func.count(Advisor.advisor_id)).scalar() or 0
    total_slots = db.query(func.count(AdvisorSlot.slot_id)).scalar() or 0
    available_slots = (
        db.query(func.count(AdvisorSlot.slot_id))
        .filter(AdvisorSlot.status == "available")
        .scalar()
        or 0
    )
    booked_slots = (
        db.query(func.count(AdvisorSlot.slot_id))
        .filter(AdvisorSlot.status == "booked")
        .scalar()
        or 0
    )

    utilization = (
        round((booked_slots / total_slots) * 100, 1) if total_slots > 0 else 0.0
    )

    # Mode breakdown
    mode_counts = (
        db.query(Booking.consultation_mode, func.count(Booking.id))
        .group_by(Booking.consultation_mode)
        .all()
    )
    bookings_by_mode = {mode: count for mode, count in mode_counts}

    return AdminStatsResponse(
        total_bookings=total_bookings,
        confirmed_bookings=confirmed_bookings,
        completed_bookings=completed_bookings,
        cancelled_bookings=cancelled_bookings,
        total_advisors=total_advisors,
        total_slots=total_slots,
        available_slots=available_slots,
        booked_slots=booked_slots,
        slot_utilization_pct=utilization,
        bookings_by_mode=bookings_by_mode,
    )


@router.get(
    "/admin/bookings",
    response_model=List[BookingResponse],
    summary="All operational bookings (Admin only)",
)
def list_admin_bookings(
    _admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """List operational consultations for platform monitoring."""
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).limit(100).all()
    return [_build_booking_response(b, db) for b in bookings]
