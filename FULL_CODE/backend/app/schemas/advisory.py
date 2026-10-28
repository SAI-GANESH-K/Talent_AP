"""Schemas for CoverWise Phase 4 Advisory and Consultation Bookings."""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AdvisorDetailResponse(BaseModel):
    """Dataset-backed financial advisor profile."""

    advisor_id: str
    advisor_name: str
    email: str
    languages: List[str]
    specialisations: List[str]
    consultation_modes: List[str]
    years_experience: int
    rating: float
    review_count: int
    working_days: str
    shift_start: str
    shift_end: str
    available_slot_count: int = 0


class AdvisorSlotResponse(BaseModel):
    """30-minute consultation slot."""

    model_config = ConfigDict(from_attributes=True)

    slot_id: str
    advisor_id: str
    slot_start: datetime
    slot_end: datetime
    status: str


class CreateBookingRequest(BaseModel):
    """Customer request to book a consultation slot."""

    slot_id: str = Field(..., description="Dataset slot identifier, e.g. SLT-...")
    consultation_mode: str = Field(..., description="'video', 'phone', or 'chat'")
    assessment_summary: Optional[Dict[str, Any]] = Field(
        None, description="Optional customer financial assessment summary"
    )


class BookingResponse(BaseModel):
    """Full booking record with customer and advisor context."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    slot_id: str
    advisor_id: str
    advisor_name: Optional[str] = None
    consultation_mode: str
    slot_start: Optional[datetime] = None
    slot_end: Optional[datetime] = None
    assessment_summary: Optional[Dict[str, Any]] = None
    status: str
    advisor_notes: Optional[str] = None
    created_at: datetime


class UpdateConsultationRequest(BaseModel):
    """Advisor status update and notes entry."""

    status: Optional[str] = Field(None, description="'completed' or 'cancelled'")
    advisor_notes: Optional[str] = Field(None, max_length=2000)


class AdminStatsResponse(BaseModel):
    """Platform-wide operational aggregate metrics."""

    total_bookings: int
    confirmed_bookings: int
    completed_bookings: int
    cancelled_bookings: int
    total_advisors: int
    total_slots: int
    available_slots: int
    booked_slots: int
    slot_utilization_pct: float
    bookings_by_mode: Dict[str, int]
