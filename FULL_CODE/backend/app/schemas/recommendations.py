"""Pydantic schemas for Phase 3 Product Recommendations & Pricing API."""

from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field

from app.services.eligibility import CustomerProfileInput, ProductEligibilityResult
from app.services.pricing import PricingInput, PricingQuote, RiderQuote, SelectedRiderInput
from app.services.recommendation import RecommendationResult, RecommendedProduct, RejectedProduct


class RecommendationRequest(BaseModel):
    """Request payload for personalized product recommendations."""
    customer: CustomerProfileInput
    recommended_gap_inr: Decimal = Field(default=Decimal("0"), ge=0)


class ProductDetailResponse(BaseModel):
    """Complete product catalogue item details."""
    product_id: str
    product_name: str
    product_type: str
    variant: str
    participation: str
    plain_language_summary: str
    min_entry_age: int
    max_entry_age: int
    max_maturity_age: int
    min_sum_assured_inr: Optional[int]
    max_sum_assured_inr: Optional[int]
    sum_assured_step_inr: Optional[int]
    policy_term_rule: str
    allowed_policy_terms: str
    premium_payment_options: str
    premium_modes: str
    modal_factor_annual: Optional[float]
    modal_factor_half_yearly: Optional[float]
    modal_factor_quarterly: Optional[float]
    modal_factor_monthly: Optional[float]
    sa_band_factors: Optional[list]
    min_annual_income_inr: int
    non_earning_applicant_allowed: bool
    riders_allowed: Optional[str]
    nri_eligible: bool
    death_benefit: str
    maturity_benefit: Optional[str]
    key_features: str
    key_exclusions: str


class RiderDetailResponse(BaseModel):
    """Rider specifications and eligibility."""
    rider_id: str
    rider_name: str
    rider_category: str
    benefit: str
    available_on_product_ids: str
    min_entry_age: int
    max_entry_age: int
    max_cover_age: int
    min_rider_sa_inr: Optional[int]
    max_rider_sa_inr: Optional[int]
    max_rider_sa_pct_of_base_sa: Optional[int]
    rate_basis: str
    smoker_multiplier: float
    max_premium_pct_of_base_premium: Optional[int]
