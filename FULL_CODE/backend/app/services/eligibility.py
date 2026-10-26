"""Product eligibility engine for CoverWise.

Evaluates official B2 dataset rules (README §6.3):
- Minimum and maximum entry age
- Maximum maturity age and policy tenures
- Minimum and maximum sum assured, and increments
- Minimum annual income
- Age-dependent income-multiple limits (financial underwriting)
- Total individual life cover limits (existing + new)
- Non-term product coverage caps (10x income)
- Non-earning applicant conditions (homemaker with earning spouse)
- Residency / NRI restrictions
- Product-specific extra rules (Child Plan age range, Loan Cover requirements)
- Rider compatibility and age limits
"""

from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class CustomerProfileInput(BaseModel):
    """Customer profile data required for product eligibility and recommendation."""
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(default="male", pattern="^(male|female)$")
    smoker_status: str = Field(default="non_smoker", pattern="^(smoker|non_smoker)$")
    annual_income_inr: Decimal = Field(default=Decimal("0"), ge=0)
    is_homemaker: bool = False
    spouse_annual_income_inr: Decimal = Field(default=Decimal("0"), ge=0)
    is_nri: bool = False
    existing_individual_life_cover_inr: Decimal = Field(default=Decimal("0"), ge=0)
    existing_non_term_sa_inr: Decimal = Field(default=Decimal("0"), ge=0)
    children_ages: list[int] = Field(default_factory=list)
    has_outstanding_loan: bool = False
    preferred_policy_term_years: Optional[int] = None
    monthly_premium_budget_inr: Optional[Decimal] = None
    risk_appetite: str = Field(default="moderate", pattern="^(low|moderate|high)$")


class ProductEligibilityResult(BaseModel):
    """Evaluation result of product eligibility."""
    product_id: str
    product_name: str
    product_type: str
    variant: str
    is_eligible: bool
    rejection_reasons: list[str]
    allowed_terms: list[int]
    min_allowed_sa: Decimal
    max_allowed_sa: Decimal
    sum_assured_step: Decimal
    allowed_payment_options: list[str]
    allowed_modes: list[str]
    eligible_rider_ids: list[str]
    max_individual_cover_limit_inr: Decimal
    max_new_non_term_limit_inr: Optional[Decimal] = None
    warnings: list[str]


def parse_allowed_terms(product_allowed_terms: str, entry_age: int, max_maturity_age: int) -> list[int]:
    """Parse machine-readable allowed_policy_terms string into list of valid term integers.
    
    Filters out any terms that would cause the policy to mature beyond max_maturity_age.
    """
    allowed: list[int] = []
    text = (product_allowed_terms or "").strip()

    if text.startswith("to_age_"):
        # Whole life fixed cover-to age
        try:
            target_age = int(text.replace("to_age_", ""))
        except ValueError:
            target_age = max_maturity_age
        fixed_term = target_age - entry_age
        if fixed_term > 0 and entry_age + fixed_term <= max_maturity_age:
            allowed.append(fixed_term)
        return allowed

    if "-" in text and not text.startswith("-"):
        parts = text.split("-")
        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
            min_t = int(parts[0])
            max_t = int(parts[1])
            for t in range(min_t, max_t + 1):
                if entry_age + t <= max_maturity_age:
                    allowed.append(t)
            return allowed

    if ";" in text or text.isdigit():
        for item in text.split(";"):
            item = item.strip()
            if item.isdigit():
                t = int(item)
                if entry_age + t <= max_maturity_age:
                    allowed.append(t)
        return allowed

    return allowed


def get_income_multiple_limit(income_multiple_limits: Optional[list], age: int) -> int:
    """Find maximum cover multiple of annual income for given age band.
    
    Default fallback is 25x if age <= 35, 20x for 36-45, 15x for 46-55, 10x for 56+.
    """
    if income_multiple_limits and isinstance(income_multiple_limits, list):
        for entry in income_multiple_limits:
            min_age = entry.get("min_age", 0)
            max_age = entry.get("max_age", 120)
            if min_age <= age <= max_age:
                return entry.get("max_multiple_of_annual_income", 10)

    # Standard fallback according to B2 income multiple scale
    if age <= 35:
        return 25
    if age <= 45:
        return 20
    if age <= 50:
        return 15
    if age <= 55:
        return 12
    return 10


def evaluate_product_eligibility(
    product,
    customer: CustomerProfileInput,
    requested_sa: Optional[Decimal] = None,
    requested_term: Optional[int] = None,
    requested_pay_opt: Optional[str] = None,
    all_riders: Optional[list] = None,
) -> ProductEligibilityResult:
    """Evaluate full official eligibility rules for a product against customer profile."""
    rejection_reasons: list[str] = []
    warnings: list[str] = []

    # 1. Entry Age check
    if customer.age < product.min_entry_age:
        rejection_reasons.append(
            f"Customer age {customer.age} is below minimum entry age {product.min_entry_age}."
        )
    if customer.age > product.max_entry_age:
        rejection_reasons.append(
            f"Customer age {customer.age} exceeds maximum entry age {product.max_entry_age}."
        )

    # 2. Terms and Maturity Age
    allowed_terms = parse_allowed_terms(
        product.allowed_policy_terms,
        customer.age,
        product.max_maturity_age,
    )

    if not allowed_terms:
        rejection_reasons.append(
            f"No allowed policy tenure available that matures on or before maximum maturity age {product.max_maturity_age}."
        )
    elif requested_term is not None:
        if requested_term not in allowed_terms:
            rejection_reasons.append(
                f"Requested policy term of {requested_term} years is not permitted (available: {min(allowed_terms)} to {max(allowed_terms)} years, maturing by age {product.max_maturity_age})."
            )

    # 3. Income & Financial Underwriting
    is_non_earning = customer.annual_income_inr <= Decimal("0") or customer.is_homemaker
    max_individual_cover_limit = Decimal("0")
    max_new_non_term_limit: Optional[Decimal] = None

    if is_non_earning:
        # Non-earning applicant rules (B2 README §6.3)
        if not product.non_earning_applicant_allowed:
            rejection_reasons.append(
                f"Product {product.product_name} does not accept non-earning applicants."
            )
        elif customer.spouse_annual_income_inr <= Decimal("0"):
            rejection_reasons.append(
                "Non-earning applicant requires a working spouse with annual income."
            )
        else:
            cap_fixed = (
                Decimal(str(product.non_earning_max_cover_inr))
                if product.non_earning_max_cover_inr is not None
                else Decimal("1000000000")
            )
            cap_mult = (
                Decimal(str(product.non_earning_max_multiple_of_spouse_income)) * customer.spouse_annual_income_inr
                if product.non_earning_max_multiple_of_spouse_income is not None
                else cap_fixed
            )
            max_individual_cover_limit = min(cap_fixed, cap_mult)
            remaining_capacity = max_individual_cover_limit - customer.existing_individual_life_cover_inr

            if remaining_capacity <= Decimal("0"):
                rejection_reasons.append(
                    f"Existing individual life cover of ₹{int(customer.existing_individual_life_cover_inr):,} "
                    f"meets or exceeds the maximum non-earning applicant cap of ₹{int(max_individual_cover_limit):,}."
                )
    else:
        # Earning applicant
        min_income = Decimal(str(product.min_annual_income_inr))
        if customer.annual_income_inr < min_income:
            rejection_reasons.append(
                f"Annual income of ₹{int(customer.annual_income_inr):,} is below product minimum of ₹{int(min_income):,}."
            )

        mult = get_income_multiple_limit(product.income_multiple_limits, customer.age)
        max_individual_cover_limit = customer.annual_income_inr * Decimal(mult)
        remaining_capacity = max_individual_cover_limit - customer.existing_individual_life_cover_inr

        if remaining_capacity <= Decimal("0"):
            rejection_reasons.append(
                f"Existing individual cover of ₹{int(customer.existing_individual_life_cover_inr):,} "
                f"meets or exceeds the financial underwriting limit ({mult}x income = ₹{int(max_individual_cover_limit):,})."
            )

        # Non-term cap (Whole Life, Endowment, ULIP)
        if product.product_type != "Term Life":
            non_term_mult = Decimal(str(product.max_new_non_term_sa_multiple_of_income or 10))
            max_new_non_term_limit = customer.annual_income_inr * non_term_mult
            remaining_non_term = max_new_non_term_limit - customer.existing_non_term_sa_inr
            if remaining_non_term <= Decimal("0"):
                rejection_reasons.append(
                    f"Existing non-term cover already meets or exceeds the 10x non-term cap (₹{int(max_new_non_term_limit):,})."
                )

    # 4. Sum Assured Bounds
    is_ulip = product.product_type == "ULIP"
    if is_ulip:
        # ULIP sum assured is determined by annual premium * multiple
        min_sa = Decimal("0")
        max_sa = max_individual_cover_limit
        sa_step = Decimal("1000")
    else:
        prod_min_sa = Decimal(str(product.min_sum_assured_inr or 0))
        prod_max_sa = Decimal(str(product.max_sum_assured_inr or 0))
        sa_step = Decimal(str(product.sum_assured_step_inr or 100000))

        # Underwriting limit caps maximum SA
        underwriting_cap = max_individual_cover_limit - customer.existing_individual_life_cover_inr
        if max_new_non_term_limit is not None and product.product_type != "Term Life":
            underwriting_cap = min(underwriting_cap, max_new_non_term_limit - customer.existing_non_term_sa_inr)

        min_sa = prod_min_sa
        max_sa = min(prod_max_sa, max(Decimal("0"), underwriting_cap))

        if min_sa > max_sa and not is_non_earning:
            rejection_reasons.append(
                f"Maximum allowed cover under financial underwriting (₹{int(max_sa):,}) is less than the product minimum sum assured (₹{int(min_sa):,})."
            )

        # Check requested SA if supplied
        if requested_sa is not None:
            if requested_sa < prod_min_sa:
                rejection_reasons.append(
                    f"Requested sum assured ₹{int(requested_sa):,} is below product minimum ₹{int(prod_min_sa):,}."
                )
            if requested_sa > prod_max_sa:
                rejection_reasons.append(
                    f"Requested sum assured ₹{int(requested_sa):,} exceeds product maximum ₹{int(prod_max_sa):,}."
                )
            if requested_sa > max_sa:
                rejection_reasons.append(
                    f"Requested sum assured ₹{int(requested_sa):,} exceeds your financial underwriting limit of ₹{int(max_sa):,}."
                )
            if sa_step > Decimal("0") and (requested_sa - prod_min_sa) % sa_step != Decimal("0") and requested_sa % sa_step != Decimal("0"):
                warnings.append(
                    f"Sum assured should align to steps of ₹{int(sa_step):,}."
                )

    # 5. NRI Eligibility
    if customer.is_nri and not product.nri_eligible:
        rejection_reasons.append(
            f"Product {product.product_name} is not eligible for Non-Resident Indians (NRIs)."
        )

    # 6. Product-specific extra rules
    if product.extra_rules and isinstance(product.extra_rules, dict):
        # Child plan age restriction
        if "child_age_min" in product.extra_rules or "child_age_max" in product.extra_rules:
            c_min = product.extra_rules.get("child_age_min", 0)
            c_max = product.extra_rules.get("child_age_max", 15)
            has_qualifying_child = any(c_min <= age <= c_max for age in customer.children_ages)
            if not has_qualifying_child:
                rejection_reasons.append(
                    f"Saffron Nanhika Child Plan requires a child aged between {c_min} and {c_max} years."
                )

        # Loan cover requirement
        if product.variant == "decreasing_cover_term" or "loan" in product.product_name.lower():
            if not customer.has_outstanding_loan:
                rejection_reasons.append(
                    f"Saffron Kesaro Loan Cover requires an active outstanding loan."
                )

    # 7. Payment Options and Modes
    allowed_payment_options = [
        opt.strip() for opt in (product.premium_payment_options or "regular").split(";") if opt.strip()
    ]
    allowed_modes = [
        m.strip() for m in (product.premium_modes or "annual;monthly").split(";") if m.strip()
    ]

    if requested_pay_opt is not None and requested_pay_opt not in allowed_payment_options:
        rejection_reasons.append(
            f"Payment option '{requested_pay_opt}' is not supported by {product.product_name}."
        )

    # 8. Eligible Riders
    eligible_rider_ids: list[str] = []
    prod_rider_ids = [
        r.strip() for r in (product.riders_allowed or "").split(";") if r.strip()
    ]
    if all_riders:
        term_to_check = requested_term or (allowed_terms[0] if allowed_terms else 20)
        for rider in all_riders:
            if rider.rider_id in prod_rider_ids:
                if rider.min_entry_age <= customer.age <= rider.max_entry_age:
                    # Waiver of premium term limit check (entry_age + term <= 70)
                    if rider.rate_basis == "pct_of_base_annual_premium":
                        if customer.age + term_to_check <= 70:
                            eligible_rider_ids.append(rider.rider_id)
                    else:
                        eligible_rider_ids.append(rider.rider_id)

    is_eligible = len(rejection_reasons) == 0

    return ProductEligibilityResult(
        product_id=product.product_id,
        product_name=product.product_name,
        product_type=product.product_type,
        variant=product.variant,
        is_eligible=is_eligible,
        rejection_reasons=rejection_reasons,
        allowed_terms=allowed_terms,
        min_allowed_sa=min_sa,
        max_allowed_sa=max(min_sa, max_sa),
        sum_assured_step=sa_step,
        allowed_payment_options=allowed_payment_options,
        allowed_modes=allowed_modes,
        eligible_rider_ids=eligible_rider_ids,
        max_individual_cover_limit_inr=max_individual_cover_limit,
        max_new_non_term_limit_inr=max_new_non_term_limit,
        warnings=warnings,
    )
