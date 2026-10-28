"""Advisory discovery and slot availability endpoints for CoverWise Phase 4.

Discovers advisors and available slots backed by official dataset records.
Supports filtering by supported languages, specialisations, modes, and dates.
"""

from datetime import datetime, time
from typing import List, Optional
import zoneinfo
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.source_data import Advisor, AdvisorSlot
from app.schemas.advisory import AdvisorDetailResponse, AdvisorSlotResponse

router = APIRouter(prefix="/api/v1/advisors", tags=["Advisory"])

IST = zoneinfo.ZoneInfo("Asia/Calcutta")


@router.get(
    "",
    response_model=List[AdvisorDetailResponse],
    summary="List and filter verified financial advisors",
)
def list_advisors(
    language: Optional[str] = Query(None, description="e.g. Telugu, Hindi, Tamil, Kannada, English"),
    specialisation: Optional[str] = Query(None, description="e.g. retirement_planning, term_protection"),
    mode: Optional[str] = Query(None, description="video, phone, chat"),
    date: Optional[str] = Query(None, description="Filter advisors with available slots on YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """List advisors from official dataset with real-time available slot counts."""
    query = db.query(Advisor)

    if language:
        # Semicolon separated, case-insensitive match
        query = query.filter(Advisor.languages.ilike(f"%{language.strip()}%"))

    if specialisation:
        query = query.filter(Advisor.specialisations.ilike(f"%{specialisation.strip()}%"))

    if mode:
        query = query.filter(Advisor.consultation_modes.ilike(f"%{mode.strip()}%"))

    advisors = query.order_by(Advisor.rating.desc(), Advisor.review_count.desc()).all()

    # Calculate available slot counts per advisor
    slot_counts_query = (
        db.query(AdvisorSlot.advisor_id, func.count(AdvisorSlot.slot_id))
        .filter(AdvisorSlot.status == "available")
    )

    if date:
        try:
            target_date = datetime.strptime(date.strip(), "%Y-%m-%d").date()
            start_dt = datetime.combine(target_date, time.min).replace(tzinfo=IST)
            end_dt = datetime.combine(target_date, time.max).replace(tzinfo=IST)
            slot_counts_query = slot_counts_query.filter(
                AdvisorSlot.slot_start >= start_dt,
                AdvisorSlot.slot_start <= end_dt,
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Expected YYYY-MM-DD.",
            )

    slot_counts = dict(slot_counts_query.group_by(AdvisorSlot.advisor_id).all())

    results: List[AdvisorDetailResponse] = []
    for adv in advisors:
        avail_count = slot_counts.get(adv.advisor_id, 0)
        # If user filtered by date, only include advisors who actually have available slots on that date
        if date and avail_count == 0:
            continue

        results.append(
            AdvisorDetailResponse(
                advisor_id=adv.advisor_id,
                advisor_name=adv.advisor_name,
                email=adv.email,
                languages=[l.strip() for l in adv.languages.split(";") if l.strip()],
                specialisations=[s.strip() for s in adv.specialisations.split(";") if s.strip()],
                consultation_modes=[m.strip() for m in adv.consultation_modes.split(";") if m.strip()],
                years_experience=adv.years_experience,
                rating=float(adv.rating),
                review_count=adv.review_count,
                working_days=adv.working_days,
                shift_start=adv.shift_start,
                shift_end=adv.shift_end,
                available_slot_count=avail_count,
            )
        )

    return results


@router.get(
    "/{advisor_id}",
    response_model=AdvisorDetailResponse,
    summary="Get single advisor profile",
)
def get_advisor(
    advisor_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve full advisor profile by dataset identifier."""
    adv = db.query(Advisor).filter(Advisor.advisor_id == advisor_id).first()
    if not adv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Advisor '{advisor_id}' not found.",
        )

    avail_count = (
        db.query(func.count(AdvisorSlot.slot_id))
        .filter(AdvisorSlot.advisor_id == advisor_id, AdvisorSlot.status == "available")
        .scalar()
        or 0
    )

    return AdvisorDetailResponse(
        advisor_id=adv.advisor_id,
        advisor_name=adv.advisor_name,
        email=adv.email,
        languages=[l.strip() for l in adv.languages.split(";") if l.strip()],
        specialisations=[s.strip() for s in adv.specialisations.split(";") if s.strip()],
        consultation_modes=[m.strip() for m in adv.consultation_modes.split(";") if m.strip()],
        years_experience=adv.years_experience,
        rating=float(adv.rating),
        review_count=adv.review_count,
        working_days=adv.working_days,
        shift_start=adv.shift_start,
        shift_end=adv.shift_end,
        available_slot_count=avail_count,
    )


@router.get(
    "/{advisor_id}/slots",
    response_model=List[AdvisorSlotResponse],
    summary="Get consultation slots for an advisor",
)
def get_advisor_slots(
    advisor_id: str,
    date: Optional[str] = Query(None, description="Filter by YYYY-MM-DD"),
    slot_status: str = Query("available", alias="status", description="available or booked or all"),
    db: Session = Depends(get_db),
):
    """List 30-minute consultation slots for an advisor."""
    # Verify advisor exists
    adv = db.query(Advisor).filter(Advisor.advisor_id == advisor_id).first()
    if not adv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Advisor '{advisor_id}' not found.",
        )

    query = db.query(AdvisorSlot).filter(AdvisorSlot.advisor_id == advisor_id)

    if slot_status != "all":
        query = query.filter(AdvisorSlot.status == slot_status)

    if date:
        try:
            target_date = datetime.strptime(date.strip(), "%Y-%m-%d").date()
            start_dt = datetime.combine(target_date, time.min).replace(tzinfo=IST)
            end_dt = datetime.combine(target_date, time.max).replace(tzinfo=IST)
            query = query.filter(
                AdvisorSlot.slot_start >= start_dt,
                AdvisorSlot.slot_start <= end_dt,
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Expected YYYY-MM-DD.",
            )

    slots = query.order_by(AdvisorSlot.slot_start.asc()).all()
    return slots
