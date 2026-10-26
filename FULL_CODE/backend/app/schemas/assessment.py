"""Pydantic schemas for the assessment API.

Request validation and response serialization for the
/api/v1/assessments/estimate endpoint.
"""

from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ── Request Models ──

class DependentInput(BaseModel):
    """A dependent person."""
    relationship: str = Field(..., pattern="^(spouse|child|parent)$")
    age: int = Field(..., ge=0, le=120)
    has_own_income: bool = False


class GoalInput(BaseModel):
    """A financial goal."""
    goal_type: str = Field(..., min_length=1, max_length=50)
    beneficiary: str = Field(..., min_length=1, max_length=50)
    target_amount_today_inr: Decimal = Field(..., ge=0, le=1_000_000_000)
    target_year: int = Field(..., ge=2020, le=2100)
    priority: str = Field(default="medium", pattern="^(high|medium|low)$")


class LoanInput(BaseModel):
    """An outstanding loan."""
    loan_type: str = Field(..., min_length=1, max_length=50)
    outstanding_principal_inr: Decimal = Field(..., ge=0, le=1_000_000_000)


class AssumptionsInput(BaseModel):
    """Adjustable assumptions — Expert Mode."""
    retirement_age: int = Field(default=60, ge=30, le=90)
    self_consumption_share: Decimal = Field(default=Decimal("0.30"), ge=0, lt=1)
    income_growth_rate: Decimal = Field(default=Decimal("0.06"), ge=0, le=Decimal("0.30"))
    discount_rate: Decimal = Field(default=Decimal("0.07"), ge=0, le=Decimal("0.30"))
    general_inflation_pct_pa: Decimal = Field(default=Decimal("0.055"), ge=0, le=Decimal("0.20"))
    education_inflation_pct_pa: Decimal = Field(default=Decimal("0.08"), ge=0, le=Decimal("0.25"))
    household_expense_share_of_deceased_pct: Decimal = Field(default=Decimal("0.25"), ge=0, lt=1)
    child_dependency_end_age: int = Field(default=25, ge=18, le=35)
    life_expectancy_age: int = Field(default=85, ge=60, le=100)
    emergency_fund_months: int = Field(default=6, ge=0, le=24)
    final_expenses_inr: Decimal = Field(default=Decimal("150000"), ge=0, le=10_000_000)
    cover_rounding_inr: Decimal = Field(default=Decimal("500000"), ge=0, le=10_000_000)
    count_employer_group_cover: bool = True
    count_retirement_savings: bool = False


class AssessmentRequest(BaseModel):
    """Complete financial assessment request.

    All monetary values in INR. Monthly expenses exclude loan EMIs
    and insurance premiums (per B2 data dictionary).
    """
    # Personal
    age: int = Field(..., ge=18, le=100, description="Customer's current age")
    annual_income_inr: Decimal = Field(
        default=Decimal("0"), ge=0, le=100_000_000,
        description="Gross annual income in INR"
    )
    is_homemaker: bool = Field(default=False)
    homemaker_services_value_annual_inr: Decimal = Field(
        default=Decimal("0"), ge=0, le=50_000_000,
        description="Estimated annual value of homemaker services"
    )

    # Monthly expenses (excludes loan EMIs per B2 data)
    monthly_household_expenses_inr: Decimal = Field(
        default=Decimal("0"), ge=0, le=10_000_000,
        description="Monthly household expenses excluding loan EMIs and insurance"
    )

    # Dependents, goals, loans
    dependents: list[DependentInput] = Field(default_factory=list, max_length=10)
    goals: list[GoalInput] = Field(default_factory=list, max_length=20)
    loans: list[LoanInput] = Field(default_factory=list, max_length=10)

    # Existing insurance
    individual_life_cover_inr: Decimal = Field(default=Decimal("0"), ge=0, le=1_000_000_000)
    employer_group_life_cover_inr: Decimal = Field(default=Decimal("0"), ge=0, le=1_000_000_000)

    # Available assets
    liquid_savings_inr: Decimal = Field(default=Decimal("0"), ge=0, le=1_000_000_000)
    market_investments_inr: Decimal = Field(default=Decimal("0"), ge=0, le=1_000_000_000)
    retirement_savings_inr: Decimal = Field(default=Decimal("0"), ge=0, le=1_000_000_000)

    # Current year
    current_year: int = Field(default=2026, ge=2024, le=2030)

    # Optional expert assumptions
    assumptions: Optional[AssumptionsInput] = None

    @field_validator("annual_income_inr", "monthly_household_expenses_inr",
                     "individual_life_cover_inr", "employer_group_life_cover_inr",
                     "liquid_savings_inr", "market_investments_inr",
                     "retirement_savings_inr", "homemaker_services_value_annual_inr",
                     mode="before")
    @classmethod
    def coerce_to_decimal(cls, v):
        if isinstance(v, (int, float, str)):
            return Decimal(str(v))
        return v


# ── Response Models ──

class HLVResponse(BaseModel):
    """HLV calculation result."""
    hlv_gross: str
    existing_cover: str
    hlv_coverage_gap: str
    remaining_earning_years: int
    annual_income_contribution: str
    warnings: list[str]
    year_breakdown: list[dict]


class GoalDetailResponse(BaseModel):
    """Individual goal calculation detail."""
    goal_type: str
    beneficiary: str
    target_amount_today_inr: str
    target_year: int
    years_to_goal: int
    inflation_rate_used: str
    future_cost: str
    present_value: str
    included: bool
    exclusion_reason: Optional[str]


class NetNeedsResponse(BaseModel):
    """Net Needs calculation result."""
    pv_household_support: str
    dependency_horizon_years: int
    outstanding_loans: str
    pv_goals: str
    final_expenses: str
    emergency_buffer: str
    total_needs: str
    available_assets: str
    existing_cover: str
    total_resources: str
    net_needs_gap: str
    goal_details: list[GoalDetailResponse]
    warnings: list[str]


class AssessmentResponse(BaseModel):
    """Complete assessment response with both methods."""
    hlv: HLVResponse
    net_needs: NetNeedsResponse
    recommended_gap_exact: str
    recommended_gap_rounded: str
    recommended_method: str
    explanation: str
    assumptions_used: dict
    currency: str
    warnings: list[str]
