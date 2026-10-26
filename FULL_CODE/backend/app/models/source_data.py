"""SQLAlchemy models for source-imported reference data.

These tables hold the official B2 dataset, imported idempotently.
Original IDs are preserved and treated as immutable primary keys.
Financial values use Numeric (maps to PostgreSQL NUMERIC) for exact precision.
"""

from sqlalchemy import (
    Boolean,
    DateTime,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Product(Base):
    """Saffron Life product catalogue — 14 fictional insurance products."""

    __tablename__ = "products"

    product_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    product_name: Mapped[str] = mapped_column(String(100), nullable=False)
    product_type: Mapped[str] = mapped_column(String(20), nullable=False)  # Term Life, etc.
    variant: Mapped[str] = mapped_column(String(60), nullable=False)
    participation: Mapped[str] = mapped_column(String(20), nullable=False)
    plain_language_summary: Mapped[str] = mapped_column(Text, nullable=False)

    # Age limits
    min_entry_age: Mapped[int] = mapped_column(Integer, nullable=False)
    max_entry_age: Mapped[int] = mapped_column(Integer, nullable=False)
    max_maturity_age: Mapped[int] = mapped_column(Integer, nullable=False)

    # Sum assured (nullable for ULIPs)
    min_sum_assured_inr: Mapped[int | None] = mapped_column(Integer)
    max_sum_assured_inr: Mapped[int | None] = mapped_column(Integer)
    sum_assured_step_inr: Mapped[int | None] = mapped_column(Integer)

    # Policy terms
    policy_term_rule: Mapped[str] = mapped_column(Text, nullable=False)
    allowed_policy_terms: Mapped[str] = mapped_column(String(100), nullable=False)
    min_policy_term_years: Mapped[int | None] = mapped_column(Integer)
    max_policy_term_years: Mapped[int | None] = mapped_column(Integer)

    # Premium payment
    premium_payment_options: Mapped[str] = mapped_column(String(100), nullable=False)
    premium_payment_rules: Mapped[str | None] = mapped_column(Text)
    premium_modes: Mapped[str] = mapped_column(String(100), nullable=False)

    # Modal factors (nullable for single-pay-only)
    modal_factor_annual: Mapped[float | None] = mapped_column(Numeric(6, 4))
    modal_factor_half_yearly: Mapped[float | None] = mapped_column(Numeric(6, 4))
    modal_factor_quarterly: Mapped[float | None] = mapped_column(Numeric(6, 4))
    modal_factor_monthly: Mapped[float | None] = mapped_column(Numeric(6, 4))

    # SA band factors and income limits (JSON)
    sa_band_factors: Mapped[dict | None] = mapped_column(JSONB)
    income_multiple_limits: Mapped[list | None] = mapped_column(JSONB)

    # ULIP-specific
    min_annual_premium_inr: Mapped[int | None] = mapped_column(Integer)
    max_annual_premium_inr: Mapped[int | None] = mapped_column(Integer)
    sa_multiple_of_annual_premium: Mapped[dict | None] = mapped_column(JSONB)
    ulip_fund_ids: Mapped[str | None] = mapped_column(Text)
    ulip_charges: Mapped[dict | None] = mapped_column(JSONB)
    lock_in_years: Mapped[int | None] = mapped_column(Integer)

    # Income and eligibility
    min_annual_income_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    max_new_non_term_sa_multiple_of_income: Mapped[int | None] = mapped_column(Integer)

    # Non-earning applicant rules
    non_earning_applicant_rule: Mapped[str] = mapped_column(Text, nullable=False)
    non_earning_applicant_allowed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    non_earning_max_cover_inr: Mapped[int | None] = mapped_column(Integer)
    non_earning_max_multiple_of_spouse_income: Mapped[int | None] = mapped_column(Integer)

    # Features
    riders_allowed: Mapped[str | None] = mapped_column(Text)
    nri_eligible: Mapped[bool] = mapped_column(Boolean, nullable=False)

    # Benefits and descriptions
    death_benefit: Mapped[str] = mapped_column(Text, nullable=False)
    maturity_benefit: Mapped[str | None] = mapped_column(Text)
    survival_benefits: Mapped[str | None] = mapped_column(Text)
    key_features: Mapped[str] = mapped_column(Text, nullable=False)
    key_exclusions: Mapped[str] = mapped_column(Text, nullable=False)
    surrender_and_lock_in: Mapped[str] = mapped_column(Text, nullable=False)
    medical_underwriting: Mapped[str] = mapped_column(Text, nullable=False)
    extra_rules: Mapped[dict | None] = mapped_column(JSONB)
    pricing_source: Mapped[str] = mapped_column(String(60), nullable=False)

    # Participating product bonuses (nullable for non-par)
    illustrative_bonus_4pct_scenario_per_1000_sa_pa: Mapped[int | None] = mapped_column(Integer)
    illustrative_bonus_8pct_scenario_per_1000_sa_pa: Mapped[int | None] = mapped_column(Integer)


class PremiumRate(Base):
    """Premium rates for non-linked products — 39,588 rows.

    Each row is one allowed pricing combination.
    Missing row = combination not allowed.
    """

    __tablename__ = "premium_rates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    premium_payment_option: Mapped[str] = mapped_column(String(20), nullable=False)
    premium_paying_term_years: Mapped[int] = mapped_column(Integer, nullable=False)
    entry_age: Mapped[int] = mapped_column(Integer, nullable=False)
    policy_term_years: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(10), nullable=False)
    smoker_status: Mapped[str] = mapped_column(String(12), nullable=False)
    # Store as NUMERIC for exact decimal arithmetic
    rate_per_1000_sa_inr: Mapped[float] = mapped_column(Numeric(10, 6), nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "premium_payment_option",
            "entry_age",
            "policy_term_years",
            "gender",
            "smoker_status",
            name="uq_rate_lookup",
        ),
    )


class Rider(Base):
    """Optional policy riders — 5 riders."""

    __tablename__ = "riders"

    rider_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    rider_name: Mapped[str] = mapped_column(String(100), nullable=False)
    rider_category: Mapped[str] = mapped_column(String(20), nullable=False)
    benefit: Mapped[str] = mapped_column(Text, nullable=False)
    available_on_product_ids: Mapped[str] = mapped_column(Text, nullable=False)

    # Eligibility
    min_entry_age: Mapped[int] = mapped_column(Integer, nullable=False)
    max_entry_age: Mapped[int] = mapped_column(Integer, nullable=False)
    max_cover_age: Mapped[int] = mapped_column(Integer, nullable=False)

    # SA limits
    min_rider_sa_inr: Mapped[int | None] = mapped_column(Integer)
    max_rider_sa_inr: Mapped[int | None] = mapped_column(Integer)
    max_rider_sa_pct_of_base_sa: Mapped[int | None] = mapped_column(Integer)
    rider_sa_rule: Mapped[str] = mapped_column(Text, nullable=False)

    # Pricing
    rate_basis: Mapped[str] = mapped_column(String(40), nullable=False)
    rate_entry_age_18_30: Mapped[float | None] = mapped_column(Numeric(8, 4))
    rate_entry_age_31_40: Mapped[float | None] = mapped_column(Numeric(8, 4))
    rate_entry_age_41_50: Mapped[float | None] = mapped_column(Numeric(8, 4))
    rate_entry_age_51_60: Mapped[float | None] = mapped_column(Numeric(8, 4))
    rate_entry_age_61_65: Mapped[float | None] = mapped_column(Numeric(8, 4))
    smoker_multiplier: Mapped[float] = mapped_column(Numeric(4, 2), nullable=False)
    max_premium_pct_of_base_premium: Mapped[int | None] = mapped_column(Integer)
    rider_term_rule: Mapped[str] = mapped_column(Text, nullable=False)
    key_exclusions: Mapped[str] = mapped_column(Text, nullable=False)


class UlipFund(Base):
    """ULIP investment funds — 4 funds."""

    __tablename__ = "ulip_funds"

    fund_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    fund_name: Mapped[str] = mapped_column(String(100), nullable=False)
    asset_class: Mapped[str] = mapped_column(String(20), nullable=False)
    equity_pct_min: Mapped[int] = mapped_column(Integer, nullable=False)
    equity_pct_max: Mapped[int] = mapped_column(Integer, nullable=False)
    debt_pct_min: Mapped[int] = mapped_column(Integer, nullable=False)
    debt_pct_max: Mapped[int] = mapped_column(Integer, nullable=False)
    money_market_pct_min: Mapped[int] = mapped_column(Integer, nullable=False)
    money_market_pct_max: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    fmc_pct_pa: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    objective: Mapped[str] = mapped_column(Text, nullable=False)
    available_on_product_ids: Mapped[str] = mapped_column(Text, nullable=False)


class UlipMortalityCharge(Base):
    """ULIP mortality charges by age/gender/smoker — 328 rows."""

    __tablename__ = "ulip_mortality_charges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    attained_age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(10), nullable=False)
    smoker_status: Mapped[str] = mapped_column(String(12), nullable=False)
    annual_rate_per_1000_sum_at_risk_inr: Mapped[float] = mapped_column(
        Numeric(10, 6), nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "attained_age", "gender", "smoker_status", name="uq_ulip_mortality_lookup"
        ),
    )


class Advisor(Base):
    """Fictional advisors — 15 records."""

    __tablename__ = "advisors"

    advisor_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    advisor_name: Mapped[str] = mapped_column(String(100), nullable=False)
    languages: Mapped[str] = mapped_column(Text, nullable=False)
    specialisations: Mapped[str] = mapped_column(Text, nullable=False)
    consultation_modes: Mapped[str] = mapped_column(String(40), nullable=False)
    years_experience: Mapped[int] = mapped_column(Integer, nullable=False)
    rating: Mapped[float] = mapped_column(Numeric(3, 1), nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, nullable=False)
    working_days: Mapped[str] = mapped_column(String(20), nullable=False)
    shift_start: Mapped[str] = mapped_column(String(5), nullable=False)
    shift_end: Mapped[str] = mapped_column(String(5), nullable=False)
    lunch_break: Mapped[str] = mapped_column(String(11), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)


class AdvisorSlot(Base):
    """30-minute advisor consultation slots — 2,201 records.

    Status is 'available' or 'booked'. Application bookings update this status
    transactionally using row-level locking.
    """

    __tablename__ = "advisor_slots"

    slot_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    advisor_id: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    slot_start: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    slot_end: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(12), nullable=False, default="available")

    __table_args__ = (
        Index("ix_slots_available", "advisor_id", "status", "slot_start"),
    )


class SyntheticProfile(Base):
    """Synthetic customer profiles for demo/testing — 200 records."""

    __tablename__ = "synthetic_profiles"

    profile_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    data: Mapped[dict] = mapped_column(JSONB, nullable=False)


class CustomerGoal(Base):
    """Customer financial goals — 371 records."""

    __tablename__ = "customer_goals"

    goal_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    profile_id: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    goal_type: Mapped[str] = mapped_column(String(30), nullable=False)
    beneficiary: Mapped[str] = mapped_column(String(30), nullable=False)
    target_amount_today_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    target_year: Mapped[int] = mapped_column(Integer, nullable=False)
    priority: Mapped[str] = mapped_column(String(10), nullable=False)
