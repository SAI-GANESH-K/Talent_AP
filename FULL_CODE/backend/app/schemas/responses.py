"""Pydantic schemas for API responses."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health-check endpoint response."""

    status: str = "ok"
    service: str = "coverwise-api"
    version: str = "0.1.0"
    database: str = "unknown"


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    """Standard error response wrapper."""

    success: bool = False
    error: ErrorDetail


class SuccessResponse(BaseModel):
    """Generic success response wrapper."""

    success: bool = True
    data: dict | list | None = None
    message: str | None = None


class ProductSummary(BaseModel):
    """Public product catalogue summary."""

    product_id: str
    product_name: str
    product_type: str
    variant: str
    plain_language_summary: str
    min_entry_age: int
    max_entry_age: int
    min_sum_assured_inr: int | None
    max_sum_assured_inr: int | None
    premium_payment_options: str
    nri_eligible: bool

    model_config = {"from_attributes": True}


class AdvisorSummary(BaseModel):
    """Public advisor listing."""

    advisor_id: str
    advisor_name: str
    languages: str
    specialisations: str
    consultation_modes: str
    years_experience: int
    rating: float
    review_count: int

    model_config = {"from_attributes": True}
