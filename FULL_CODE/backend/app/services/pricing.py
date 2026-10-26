"""Official premium calculation engine for CoverWise.

Implements exact dataset pricing rules (README §6.1, §6.2):
- Non-linked product rate lookup from `premium_rates` table
- Sum-assured band factor scaling
- Rider pricing across all 5 riders (ADB, ATPD, CI, WOP, Terminal Illness)
- Category-specific rider premium caps (100% health, 30% other)
- Payment frequencies and exact modal factor arithmetic
- Separate base and rider instalment rounding using Decimal and ROUND_HALF_UP
- ULIP annualized premium and age-dependent sum assured multiples
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.models.source_data import PremiumRate, Product, Rider, UlipFund


class SelectedRiderInput(BaseModel):
    """Input for an optional policy rider."""
    rider_id: str
    sum_assured: Optional[Decimal] = None


class PricingInput(BaseModel):
    """Input parameters for premium calculation."""
    product_id: str
    sum_assured: Decimal = Field(..., ge=0)
    entry_age: int = Field(..., ge=18, le=100)
    policy_term_years: int = Field(..., ge=1, le=100)
    gender: str = Field(default="male", pattern="^(male|female)$")
    smoker_status: str = Field(default="non_smoker", pattern="^(smoker|non_smoker)$")
    premium_payment_option: str = Field(default="regular")
    premium_mode: str = Field(default="monthly", pattern="^(annual|half_yearly|quarterly|monthly|single)$")
    selected_riders: list[SelectedRiderInput] = Field(default_factory=list)
    # ULIP-specific fields
    ulip_annual_premium: Optional[Decimal] = None
    ulip_sa_multiple: Optional[int] = None
    ulip_fund_id: Optional[str] = None


class RiderQuote(BaseModel):
    """Calculated quote for an individual rider."""
    rider_id: str
    rider_name: str
    rider_category: str
    rider_sa: Decimal
    annual_premium: Decimal
    instalment_premium: Decimal
    rate_used: Decimal
    smoker_multiplier_applied: Decimal


class PricingQuote(BaseModel):
    """Complete premium calculation quote."""
    product_id: str
    product_name: str
    product_type: str
    variant: str
    sum_assured: Decimal
    policy_term_years: int
    premium_payment_option: str
    premium_paying_term_years: int
    premium_mode: str
    base_annual_premium: Decimal
    base_instalment_premium: Decimal
    rider_quotes: list[RiderQuote]
    total_annual_premium: Decimal
    total_instalment_premium: Decimal
    modal_factor_used: Decimal
    sa_band_factor_used: Decimal
    rate_per_1000_used: Decimal
    is_ulip: bool
    ulip_details: Optional[dict] = None
    warnings: list[str] = Field(default_factory=list)


def get_sa_band_factor(sa_band_factors: Optional[list], sum_assured: Decimal) -> Decimal:
    """Find applicable sum-assured band factor.
    
    Default is 1.0 if no band factors configured.
    """
    if not sa_band_factors or not isinstance(sa_band_factors, list):
        return Decimal("1.0")

    for band in sa_band_factors:
        min_sa = Decimal(str(band.get("min_sa_inr", 0) or 0))
        max_sa_val = band.get("max_sa_inr")
        max_sa = Decimal(str(max_sa_val)) if max_sa_val is not None else None

        if min_sa <= sum_assured:
            if max_sa is None or sum_assured <= max_sa:
                return Decimal(str(band.get("factor", 1.0)))

    return Decimal("1.0")


def get_modal_factor(product: Product, mode: str, is_ulip: bool) -> Decimal:
    """Determine modal factor for converting annual premium to instalment."""
    if is_ulip:
        # ULIPs have no loading (README §6.2)
        if mode == "annual":
            return Decimal("1.0")
        elif mode == "half_yearly":
            return Decimal("0.5")
        elif mode == "quarterly":
            return Decimal("0.25")
        elif mode == "monthly":
            return (Decimal("1") / Decimal("12")).quantize(Decimal("0.00000001"))
        return Decimal("1.0")

    if mode == "annual":
        return Decimal(str(product.modal_factor_annual or 1.0))
    elif mode == "half_yearly":
        return Decimal(str(product.modal_factor_half_yearly or 0.51))
    elif mode == "quarterly":
        return Decimal(str(product.modal_factor_quarterly or 0.26))
    elif mode == "monthly":
        return Decimal(str(product.modal_factor_monthly or 0.0875))
    elif mode == "single":
        return Decimal("1.0")
    return Decimal("1.0")


def get_rider_rate_for_age(rider: Rider, age: int) -> Optional[Decimal]:
    """Get the rider rate for given entry age band."""
    if 18 <= age <= 30:
        val = rider.rate_entry_age_18_30
    elif 31 <= age <= 40:
        val = rider.rate_entry_age_31_40
    elif 41 <= age <= 50:
        val = rider.rate_entry_age_41_50
    elif 51 <= age <= 60:
        val = rider.rate_entry_age_51_60
    elif 61 <= age <= 65:
        val = rider.rate_entry_age_61_65
    else:
        val = None

    if val is None:
        return None
    return Decimal(str(val))


def calculate_non_linked_premium(
    db: Session,
    product: Product,
    pricing_in: PricingInput,
) -> PricingQuote:
    """Calculate premium for non-linked products (Term Life, Whole Life, Endowment)."""
    warnings: list[str] = []

    # 1. Rate lookup from database
    rate_row = (
        db.query(PremiumRate)
        .filter(
            PremiumRate.product_id == pricing_in.product_id,
            PremiumRate.premium_payment_option == pricing_in.premium_payment_option,
            PremiumRate.entry_age == pricing_in.entry_age,
            PremiumRate.policy_term_years == pricing_in.policy_term_years,
            PremiumRate.gender == pricing_in.gender,
            PremiumRate.smoker_status == pricing_in.smoker_status,
        )
        .first()
    )

    if not rate_row:
        raise ValueError(
            f"No rate row exists for product '{product.product_name}' with option='{pricing_in.premium_payment_option}', "
            f"age={pricing_in.entry_age}, term={pricing_in.policy_term_years}, gender='{pricing_in.gender}', smoker='{pricing_in.smoker_status}'."
        )

    rate_per_1000 = Decimal(str(rate_row.rate_per_1000_sa_inr))
    premium_paying_term = rate_row.premium_paying_term_years

    # 2. Band factor
    band_factor = get_sa_band_factor(product.sa_band_factors, pricing_in.sum_assured)

    # 3. Base annual premium = rate_per_1000 × (sum_assured / 1000) × band_factor
    # Decimal exact calculation
    base_annual_premium = rate_per_1000 * (pricing_in.sum_assured / Decimal("1000")) * band_factor

    # 4. Modal factor
    is_single_pay = pricing_in.premium_payment_option == "single" or pricing_in.premium_mode == "single"
    modal_factor = get_modal_factor(product, "single" if is_single_pay else pricing_in.premium_mode, is_ulip=False)

    # 5. Base instalment
    if is_single_pay:
        base_instalment = base_annual_premium.quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    else:
        base_instalment = (base_annual_premium * modal_factor).quantize(Decimal("1"), rounding=ROUND_HALF_UP)

    # 6. Riders
    rider_quotes: list[RiderQuote] = []
    allowed_rider_ids = [r.strip() for r in (product.riders_allowed or "").split(";") if r.strip()]

    if pricing_in.selected_riders and is_single_pay:
        raise ValueError("Riders cannot be added to single-pay policies.")

    health_rider_total = Decimal("0")
    other_rider_total = Decimal("0")

    for rider_sel in pricing_in.selected_riders:
        if rider_sel.rider_id not in allowed_rider_ids:
            raise ValueError(f"Rider '{rider_sel.rider_id}' is not permitted on product '{product.product_name}'.")

        rider = db.query(Rider).filter_by(rider_id=rider_sel.rider_id).first()
        if not rider:
            raise ValueError(f"Rider '{rider_sel.rider_id}' not found in database.")

        # Age restrictions
        if not (rider.min_entry_age <= pricing_in.entry_age <= rider.max_entry_age):
            raise ValueError(
                f"Rider '{rider.rider_name}' entry age must be between {rider.min_entry_age} and {rider.max_entry_age}."
            )

        # Cover age check
        if pricing_in.entry_age + premium_paying_term > rider.max_cover_age:
            warnings.append(
                f"Rider '{rider.rider_name}' cover will terminate at age {rider.max_cover_age} before policy term ends."
            )

        # Rate lookup
        rate_val = get_rider_rate_for_age(rider, pricing_in.entry_age)
        if rate_val is None:
            raise ValueError(f"No rider rate available for age {pricing_in.entry_age}.")

        smoker_mult = (
            Decimal(str(rider.smoker_multiplier))
            if pricing_in.smoker_status == "smoker"
            else Decimal("1.0")
        )

        rider_annual = Decimal("0")
        rider_sa = rider_sel.sum_assured or Decimal("0")

        if rider.rate_basis == "per_1000_rider_sa":
            # SA validations
            min_r_sa = Decimal(str(rider.min_rider_sa_inr or 0))
            max_r_sa = Decimal(str(rider.max_rider_sa_inr or 1000000000))
            max_pct_base = (
                Decimal(str(rider.max_rider_sa_pct_of_base_sa)) / Decimal("100")
                if rider.max_rider_sa_pct_of_base_sa is not None
                else Decimal("1.0")
            )
            max_allowed_r_sa = min(max_r_sa, pricing_in.sum_assured * max_pct_base)

            if rider_sa <= Decimal("0"):
                # Default rider SA: 50% of base SA or 50 Lakhs (whichever is valid)
                rider_sa = min(max_allowed_r_sa, max(min_r_sa, Decimal("5000000")))

            if rider_sa < min_r_sa:
                raise ValueError(f"Rider sum assured ₹{int(rider_sa):,} is below minimum ₹{int(min_r_sa):,}.")
            if rider_sa > max_allowed_r_sa:
                raise ValueError(
                    f"Rider sum assured ₹{int(rider_sa):,} exceeds maximum permitted ₹{int(max_allowed_r_sa):,} "
                    f"({rider.max_rider_sa_pct_of_base_sa}% of base SA)."
                )

            # Rider annual premium = rate × (rider_sa / 1000) × smoker_multiplier
            rider_annual = rate_val * (rider_sa / Decimal("1000")) * smoker_mult

        elif rider.rate_basis == "pct_of_base_annual_premium":
            # Waiver of premium
            if pricing_in.entry_age + premium_paying_term > 70:
                raise ValueError("Waiver of Premium requires entry age + premium-paying term <= 70.")
            rider_sa = pricing_in.sum_assured
            # rate_val is percentage e.g. 2.5% = 0.025
            rider_annual = (rate_val / Decimal("100")) * base_annual_premium * smoker_mult

        elif rider.rate_basis == "included_free":
            rider_sa = pricing_in.sum_assured
            rider_annual = Decimal("0")

        # Track category caps
        if rider.rider_category == "health":
            health_rider_total += rider_annual
        elif rider.rider_category == "other":
            other_rider_total += rider_annual

        rider_instalment = (
            (rider_annual * modal_factor).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
            if not is_single_pay
            else rider_annual.quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        )

        rider_quotes.append(
            RiderQuote(
                rider_id=rider.rider_id,
                rider_name=rider.rider_name,
                rider_category=rider.rider_category,
                rider_sa=rider_sa,
                annual_premium=rider_annual.quantize(Decimal("1"), rounding=ROUND_HALF_UP),
                instalment_premium=rider_instalment,
                rate_used=rate_val,
                smoker_multiplier_applied=smoker_mult,
            )
        )

    # Validate category caps
    if health_rider_total > base_annual_premium * Decimal("1.0"):
        raise ValueError(
            f"Total health rider premium (₹{int(health_rider_total):,}) exceeds 100% of base annual premium (₹{int(base_annual_premium):,})."
        )
    if other_rider_total > base_annual_premium * Decimal("0.30"):
        raise ValueError(
            f"Total other rider premiums (₹{int(other_rider_total):,}) exceed 30% of base annual premium (₹{int(base_annual_premium):,})."
        )

    # Total amounts
    total_instalment = base_instalment + sum((rq.instalment_premium for rq in rider_quotes), Decimal("0"))
    total_annual = (
        base_annual_premium.quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        + sum((rq.annual_premium for rq in rider_quotes), Decimal("0"))
    )

    return PricingQuote(
        product_id=product.product_id,
        product_name=product.product_name,
        product_type=product.product_type,
        variant=product.variant,
        sum_assured=pricing_in.sum_assured,
        policy_term_years=pricing_in.policy_term_years,
        premium_payment_option=pricing_in.premium_payment_option,
        premium_paying_term_years=premium_paying_term,
        premium_mode=pricing_in.premium_mode,
        base_annual_premium=base_annual_premium.quantize(Decimal("1"), rounding=ROUND_HALF_UP),
        base_instalment_premium=base_instalment,
        rider_quotes=rider_quotes,
        total_annual_premium=total_annual,
        total_instalment_premium=total_instalment,
        modal_factor_used=modal_factor,
        sa_band_factor_used=band_factor,
        rate_per_1000_used=rate_per_1000,
        is_ulip=False,
        warnings=warnings,
    )


def calculate_ulip_premium(
    db: Session,
    product: Product,
    pricing_in: PricingInput,
) -> PricingQuote:
    """Calculate premium and benefits for ULIP products (README §6.2)."""
    warnings: list[str] = []

    min_prem = Decimal(str(product.min_annual_premium_inr or 24000))
    max_prem = Decimal(str(product.max_annual_premium_inr or 2500000))

    annual_premium = pricing_in.ulip_annual_premium or Decimal("50000")
    if annual_premium < min_prem:
        raise ValueError(f"ULIP annualized premium ₹{int(annual_premium):,} is below product minimum ₹{int(min_prem):,}.")
    if annual_premium > max_prem:
        raise ValueError(f"ULIP annualized premium ₹{int(annual_premium):,} exceeds product maximum ₹{int(max_prem):,}.")

    # Sum Assured multiple based on entry age (B2 README §6.2)
    # e.g. entry_age_upto_44: [10, 15, 20], entry_age_45_plus: [7, 10]
    multiples_dict = product.sa_multiple_of_annual_premium or {}
    if pricing_in.entry_age <= 44:
        allowed_multiples = multiples_dict.get("entry_age_upto_44", [10, 15, 20])
    else:
        allowed_multiples = multiples_dict.get("entry_age_45_plus", [7, 10])

    if pricing_in.ulip_sa_multiple is not None:
        if pricing_in.ulip_sa_multiple not in allowed_multiples:
            raise ValueError(
                f"SA multiple {pricing_in.ulip_sa_multiple} is not permitted for age {pricing_in.entry_age} (allowed: {allowed_multiples})."
            )
        multiple = pricing_in.ulip_sa_multiple
    else:
        multiple = allowed_multiples[-1] if allowed_multiples else 10  # default highest multiple

    sum_assured = annual_premium * Decimal(multiple)

    # Modal factors for ULIP: 1, 0.5, 0.25, 1/12
    modal_factor = get_modal_factor(product, pricing_in.premium_mode, is_ulip=True)
    base_instalment = (annual_premium * modal_factor).quantize(Decimal("1"), rounding=ROUND_HALF_UP)

    # Fund details
    fund_id = pricing_in.ulip_fund_id
    fund_obj = None
    if fund_id:
        fund_obj = db.query(UlipFund).filter_by(fund_id=fund_id).first()
    if not fund_obj:
        # Default to first available fund
        allowed_fund_ids = (product.ulip_fund_ids or "").split(";")
        if allowed_fund_ids:
            fund_obj = db.query(UlipFund).filter(UlipFund.fund_id == allowed_fund_ids[0].strip()).first()

    ulip_details = {
        "annualized_premium": str(annual_premium),
        "sa_multiple": multiple,
        "sum_assured": str(sum_assured),
        "fund_name": fund_obj.fund_name if fund_obj else "Saffron Balanced Fund",
        "fund_fmc_pct_pa": str(fund_obj.fmc_pct_pa) if fund_obj else "1.25",
        "lock_in_years": product.lock_in_years or 5,
        "charges_disclosed": product.ulip_charges,
    }

    total_annual = annual_premium.quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    total_instalment = base_instalment

    return PricingQuote(
        product_id=product.product_id,
        product_name=product.product_name,
        product_type=product.product_type,
        variant=product.variant,
        sum_assured=sum_assured,
        policy_term_years=pricing_in.policy_term_years,
        premium_payment_option=pricing_in.premium_payment_option,
        premium_paying_term_years=pricing_in.policy_term_years,
        premium_mode=pricing_in.premium_mode,
        base_annual_premium=annual_premium,
        base_instalment_premium=base_instalment,
        rider_quotes=[],
        total_annual_premium=total_annual,
        total_instalment_premium=total_instalment,
        modal_factor_used=modal_factor,
        sa_band_factor_used=Decimal("1.0"),
        rate_per_1000_used=Decimal("0.0"),
        is_ulip=True,
        ulip_details=ulip_details,
        warnings=warnings,
    )


def calculate_quote(
    db: Session,
    pricing_in: PricingInput,
) -> PricingQuote:
    """Entry point for full premium pricing calculation."""
    product = db.query(Product).filter_by(product_id=pricing_in.product_id).first()
    if not product:
        raise ValueError(f"Product '{pricing_in.product_id}' not found.")

    if product.product_type == "ULIP":
        return calculate_ulip_premium(db, product, pricing_in)
    else:
        return calculate_non_linked_premium(db, product, pricing_in)
