"""CoverWise Financial Needs Assessment Engine.

Implements Human Life Value (HLV) and Net Needs Approach as documented
in CALCULATION_POLICY.md (frozen 2026-10-26).

All monetary arithmetic uses Decimal. Formulas use finite year-by-year
summation to avoid divergence issues when g >= r.

This module is pure Python — no database or framework dependencies.
"""

from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP, ROUND_CEILING
from typing import Optional

# ──────────────────────────────────────────────────────────────
# Constants and defaults (from CALCULATION_POLICY.md)
# ──────────────────────────────────────────────────────────────

DEFAULT_RETIREMENT_AGE = 60
DEFAULT_SELF_CONSUMPTION_SHARE = Decimal("0.30")
DEFAULT_INCOME_GROWTH_RATE = Decimal("0.06")
DEFAULT_DISCOUNT_RATE = Decimal("0.07")
DEFAULT_GENERAL_INFLATION = Decimal("0.055")
DEFAULT_EDUCATION_INFLATION = Decimal("0.08")
DEFAULT_HOUSEHOLD_EXPENSE_SHARE_OF_DECEASED = Decimal("0.25")
DEFAULT_CHILD_DEPENDENCY_END_AGE = 25
DEFAULT_LIFE_EXPECTANCY_AGE = 85
DEFAULT_EMERGENCY_FUND_MONTHS = 6
DEFAULT_FINAL_EXPENSES_INR = Decimal("150000")
DEFAULT_COVER_ROUNDING_INR = Decimal("500000")

# Precision for intermediate calculations
CALC_PRECISION = Decimal("0.000001")  # 6 decimal places


# ──────────────────────────────────────────────────────────────
# Data classes for inputs and outputs
# ──────────────────────────────────────────────────────────────

@dataclass
class AssumptionSet:
    """Adjustable calculation assumptions — exposed to user in Expert Mode."""

    retirement_age: int = DEFAULT_RETIREMENT_AGE
    self_consumption_share: Decimal = DEFAULT_SELF_CONSUMPTION_SHARE
    income_growth_rate: Decimal = DEFAULT_INCOME_GROWTH_RATE
    discount_rate: Decimal = DEFAULT_DISCOUNT_RATE
    general_inflation_pct_pa: Decimal = DEFAULT_GENERAL_INFLATION
    education_inflation_pct_pa: Decimal = DEFAULT_EDUCATION_INFLATION
    household_expense_share_of_deceased_pct: Decimal = DEFAULT_HOUSEHOLD_EXPENSE_SHARE_OF_DECEASED
    child_dependency_end_age: int = DEFAULT_CHILD_DEPENDENCY_END_AGE
    life_expectancy_age: int = DEFAULT_LIFE_EXPECTANCY_AGE
    emergency_fund_months: int = DEFAULT_EMERGENCY_FUND_MONTHS
    final_expenses_inr: Decimal = DEFAULT_FINAL_EXPENSES_INR
    cover_rounding_inr: Decimal = DEFAULT_COVER_ROUNDING_INR
    count_employer_group_cover: bool = True
    count_retirement_savings: bool = False


@dataclass
class Dependent:
    """A single dependent person."""

    relationship: str  # "spouse", "child", "parent"
    age: int
    has_own_income: bool = False


@dataclass
class Goal:
    """A customer financial goal."""

    goal_type: str  # "child_education", "child_marriage", "retirement", etc.
    beneficiary: str  # "self", "child_1", "family", "self_and_spouse", etc.
    target_amount_today_inr: Decimal
    target_year: int
    priority: str = "medium"


@dataclass
class Loan:
    """An outstanding loan."""

    loan_type: str  # "home_loan", "car_loan", "personal_loan", "education_loan"
    outstanding_principal_inr: Decimal


@dataclass
class FinancialInputs:
    """All customer-provided financial data needed for assessment."""

    # Personal
    age: int
    annual_income_inr: Decimal = Decimal("0")
    is_homemaker: bool = False
    homemaker_services_value_annual_inr: Decimal = Decimal("0")

    # Monthly expenses (excludes loan EMIs per B2 data dictionary)
    monthly_household_expenses_inr: Decimal = Decimal("0")

    # Dependents
    dependents: list[Dependent] = field(default_factory=list)

    # Goals
    goals: list[Goal] = field(default_factory=list)

    # Loans (outstanding principal only)
    loans: list[Loan] = field(default_factory=list)

    # Existing insurance
    individual_life_cover_inr: Decimal = Decimal("0")
    employer_group_life_cover_inr: Decimal = Decimal("0")

    # Available assets
    liquid_savings_inr: Decimal = Decimal("0")
    market_investments_inr: Decimal = Decimal("0")
    retirement_savings_inr: Decimal = Decimal("0")

    # Current year (for goal calculations)
    current_year: int = 2026


# ──────────────────────────────────────────────────────────────
# Result data classes
# ──────────────────────────────────────────────────────────────

@dataclass
class HLVResult:
    """Human Life Value calculation result."""

    hlv_gross: Decimal
    existing_cover: Decimal
    hlv_coverage_gap: Decimal
    remaining_earning_years: int
    annual_income_contribution: Decimal  # I × (1 - c)
    warnings: list[str] = field(default_factory=list)
    # Year-by-year breakdown for transparency (first 5 + last year)
    year_breakdown: list[dict] = field(default_factory=list)


@dataclass
class GoalDetail:
    """A single goal's contribution to Net Needs."""

    goal_type: str
    beneficiary: str
    target_amount_today_inr: Decimal
    target_year: int
    years_to_goal: int
    inflation_rate_used: Decimal
    future_cost: Decimal
    present_value: Decimal
    included: bool
    exclusion_reason: Optional[str] = None


@dataclass
class NetNeedsResult:
    """Net Needs calculation result."""

    # Needs side
    pv_household_support: Decimal
    dependency_horizon_years: int
    outstanding_loans: Decimal
    pv_goals: Decimal
    final_expenses: Decimal
    emergency_buffer: Decimal
    total_needs: Decimal

    # Resources side
    available_assets: Decimal
    existing_cover: Decimal
    total_resources: Decimal

    # Gap
    net_needs_gap: Decimal

    # Details
    goal_details: list[GoalDetail] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


@dataclass
class AssessmentResult:
    """Complete assessment with both methods and recommendation."""

    hlv: HLVResult
    net_needs: NetNeedsResult
    recommended_gap_exact: Decimal
    recommended_gap_rounded: Decimal
    recommended_method: str  # "hlv" or "net_needs" or "neither"
    explanation: str
    assumptions_used: dict
    currency: str = "INR"
    warnings: list[str] = field(default_factory=list)


# ──────────────────────────────────────────────────────────────
# Input validation
# ──────────────────────────────────────────────────────────────

def validate_inputs(inputs: FinancialInputs, assumptions: AssumptionSet) -> list[str]:
    """Validate financial inputs. Returns list of error messages (empty = valid)."""
    errors: list[str] = []

    if inputs.age < 0 or inputs.age > 120:
        errors.append("Age must be between 0 and 120.")
    if inputs.annual_income_inr < Decimal("0"):
        errors.append("Annual income cannot be negative.")
    if inputs.monthly_household_expenses_inr < Decimal("0"):
        errors.append("Monthly household expenses cannot be negative.")
    if inputs.individual_life_cover_inr < Decimal("0"):
        errors.append("Individual life cover cannot be negative.")
    if inputs.employer_group_life_cover_inr < Decimal("0"):
        errors.append("Employer group life cover cannot be negative.")
    if inputs.liquid_savings_inr < Decimal("0"):
        errors.append("Liquid savings cannot be negative.")
    if inputs.market_investments_inr < Decimal("0"):
        errors.append("Market investments cannot be negative.")
    if inputs.retirement_savings_inr < Decimal("0"):
        errors.append("Retirement savings cannot be negative.")

    for loan in inputs.loans:
        if loan.outstanding_principal_inr < Decimal("0"):
            errors.append(f"Loan principal for {loan.loan_type} cannot be negative.")

    for goal in inputs.goals:
        if goal.target_amount_today_inr < Decimal("0"):
            errors.append(f"Goal amount for {goal.goal_type} cannot be negative.")

    if assumptions.self_consumption_share < Decimal("0") or assumptions.self_consumption_share >= Decimal("1"):
        errors.append("Self-consumption share must be between 0 and 1 (exclusive).")
    if assumptions.discount_rate < Decimal("0"):
        errors.append("Discount rate cannot be negative.")

    return errors


# ──────────────────────────────────────────────────────────────
# HLV Calculation
# ──────────────────────────────────────────────────────────────

def compute_hlv(
    inputs: FinancialInputs,
    assumptions: AssumptionSet,
) -> HLVResult:
    """Compute Human Life Value using finite year-by-year summation.

    Formula from CALCULATION_POLICY.md §1.2:
      HLV_gross = Σ[t=1..n] (I × (1-c) × (1+g)^(t-1)) / (1+r)^t

    Always uses term-by-term Decimal arithmetic regardless of g vs r relationship.
    """
    warnings: list[str] = []

    # Remaining earning years
    n = max(0, assumptions.retirement_age - inputs.age)

    # Annual income contribution (income minus self-consumption)
    I = inputs.annual_income_inr
    c = assumptions.self_consumption_share
    annual_contribution = I * (Decimal("1") - c)

    # Handle special cases
    if n == 0:
        warnings.append(
            f"Age {inputs.age} is at or beyond retirement age "
            f"{assumptions.retirement_age}. HLV from income is zero."
        )

    if I == Decimal("0"):
        if inputs.is_homemaker:
            warnings.append(
                "Zero personal income (homemaker). HLV from income method is zero. "
                f"Estimated replacement services value: "
                f"{inputs.homemaker_services_value_annual_inr}/year."
            )
        else:
            warnings.append(
                "Zero annual income reported. HLV from income method is zero."
            )

    g = assumptions.income_growth_rate
    r = assumptions.discount_rate

    if g >= r and n > 0 and I > Decimal("0"):
        warnings.append(
            f"Income growth rate ({g}) >= discount rate ({r}). "
            "Using finite year-by-year summation (no divergence)."
        )

    # Year-by-year summation with Decimal
    hlv_gross = Decimal("0")
    year_breakdown: list[dict] = []

    one = Decimal("1")
    for t in range(1, n + 1):
        # Income in year t: I × (1+g)^(t-1)
        income_year_t = I * (one + g) ** (t - 1)
        # Contribution after self-consumption
        contribution_t = income_year_t * (one - c)
        # Present value factor: 1 / (1+r)^t
        pv_factor = one / (one + r) ** t
        # PV of this year's contribution
        pv_contribution = (contribution_t * pv_factor).quantize(
            CALC_PRECISION, rounding=ROUND_HALF_UP
        )
        hlv_gross += pv_contribution

        # Capture first 5 years and last year for transparency
        if t <= 5 or t == n:
            year_breakdown.append({
                "year": t,
                "projected_income": str(income_year_t.quantize(Decimal("1"), rounding=ROUND_HALF_UP)),
                "contribution_after_consumption": str(contribution_t.quantize(Decimal("1"), rounding=ROUND_HALF_UP)),
                "pv_factor": str(pv_factor.quantize(CALC_PRECISION)),
                "present_value": str(pv_contribution.quantize(Decimal("1"), rounding=ROUND_HALF_UP)),
            })

    # Round gross to nearest rupee
    hlv_gross = hlv_gross.quantize(Decimal("1"), rounding=ROUND_HALF_UP)

    # Existing cover deduction
    existing_cover = inputs.individual_life_cover_inr
    if assumptions.count_employer_group_cover:
        existing_cover += inputs.employer_group_life_cover_inr
        if inputs.employer_group_life_cover_inr > Decimal("0"):
            warnings.append(
                "Employer group cover is included but typically ends when "
                "employment ends. Consider toggling this off for a conservative estimate."
            )

    hlv_gap = max(Decimal("0"), hlv_gross - existing_cover)

    if existing_cover > hlv_gross and hlv_gross > Decimal("0"):
        warnings.append(
            "Your existing life insurance cover exceeds the HLV estimate. "
            "You may already be adequately covered from an income-replacement perspective."
        )

    return HLVResult(
        hlv_gross=hlv_gross,
        existing_cover=existing_cover,
        hlv_coverage_gap=hlv_gap,
        remaining_earning_years=n,
        annual_income_contribution=annual_contribution.quantize(Decimal("1"), rounding=ROUND_HALF_UP),
        warnings=warnings,
        year_breakdown=year_breakdown,
    )


# ──────────────────────────────────────────────────────────────
# Net Needs Calculation
# ──────────────────────────────────────────────────────────────

def _compute_dependency_horizon(
    dependents: list[Dependent],
    assumptions: AssumptionSet,
) -> int:
    """Compute the longest dependency horizon across all dependents.

    Returns 0 if no dependents exist.
    """
    if not dependents:
        return 0

    horizons: list[int] = []

    for dep in dependents:
        if dep.relationship == "child":
            h = max(0, assumptions.child_dependency_end_age - dep.age)
            horizons.append(h)
        elif dep.relationship == "spouse" and not dep.has_own_income:
            h = max(0, assumptions.life_expectancy_age - dep.age)
            horizons.append(h)
        elif dep.relationship == "parent":
            h = max(0, assumptions.life_expectancy_age - dep.age)
            horizons.append(h)
        # Spouse with own income: not financially dependent

    return max(horizons) if horizons else 0


def _compute_pv_household_support(
    monthly_expenses: Decimal,
    expense_share_of_deceased: Decimal,
    inflation: Decimal,
    discount_rate: Decimal,
    horizon_years: int,
) -> Decimal:
    """PV of future household expenses the family would need, net of deceased's share.

    Formula from CALCULATION_POLICY.md §2.2:
      E_family = E_annual × (1 - household_expense_share_of_deceased)
      PV = Σ[t=1..H] (E_family × (1+i)^(t-1)) / (1+r)^t
    """
    if horizon_years <= 0 or monthly_expenses <= Decimal("0"):
        return Decimal("0")

    annual_expenses = monthly_expenses * Decimal("12")
    family_expenses = annual_expenses * (Decimal("1") - expense_share_of_deceased)

    one = Decimal("1")
    pv_total = Decimal("0")

    for t in range(1, horizon_years + 1):
        expense_in_year_t = family_expenses * (one + inflation) ** (t - 1)
        pv_factor = one / (one + discount_rate) ** t
        pv_total += (expense_in_year_t * pv_factor).quantize(
            CALC_PRECISION, rounding=ROUND_HALF_UP
        )

    return pv_total.quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def _compute_goal_details(
    goals: list[Goal],
    current_year: int,
    assumptions: AssumptionSet,
) -> list[GoalDetail]:
    """Compute PV of each goal, applying exclusion rules.

    CALCULATION_POLICY.md §2.2 item 3:
    - Education goals use education_inflation_pct_pa (8%)
    - All others use general_inflation_pct_pa (5.5%)
    - Goals with beneficiary containing "self" AND goal_type = "retirement"
      are excluded from death-cover needs
    - Past goals (negative years_to_goal) are excluded
    """
    details: list[GoalDetail] = []
    one = Decimal("1")

    for goal in goals:
        years_to_goal = goal.target_year - current_year

        # Determine inflation rate
        if "education" in goal.goal_type.lower():
            inflation = assumptions.education_inflation_pct_pa
        else:
            inflation = assumptions.general_inflation_pct_pa

        # Check exclusion: self-beneficiary retirement goals
        is_self_retirement = (
            goal.goal_type.lower() == "retirement"
            and "self" in goal.beneficiary.lower()
        )

        # Past goals
        is_past = years_to_goal <= 0

        # Compute future cost and PV
        if is_past:
            future_cost = Decimal("0")
            pv = Decimal("0")
            included = False
            reason = f"Goal already past (target year {goal.target_year})."
        elif is_self_retirement:
            future_cost = goal.target_amount_today_inr * (one + inflation) ** years_to_goal
            pv = (future_cost / (one + assumptions.discount_rate) ** years_to_goal).quantize(
                Decimal("1"), rounding=ROUND_HALF_UP
            )
            future_cost = future_cost.quantize(Decimal("1"), rounding=ROUND_HALF_UP)
            included = False
            reason = "Self-beneficiary retirement goal excluded from death-cover needs."
        else:
            future_cost = goal.target_amount_today_inr * (one + inflation) ** years_to_goal
            pv = (future_cost / (one + assumptions.discount_rate) ** years_to_goal).quantize(
                Decimal("1"), rounding=ROUND_HALF_UP
            )
            future_cost = future_cost.quantize(Decimal("1"), rounding=ROUND_HALF_UP)
            included = True
            reason = None

        details.append(GoalDetail(
            goal_type=goal.goal_type,
            beneficiary=goal.beneficiary,
            target_amount_today_inr=goal.target_amount_today_inr,
            target_year=goal.target_year,
            years_to_goal=years_to_goal,
            inflation_rate_used=inflation,
            future_cost=future_cost,
            present_value=pv,
            included=included,
            exclusion_reason=reason,
        ))

    return details


def compute_net_needs(
    inputs: FinancialInputs,
    assumptions: AssumptionSet,
) -> NetNeedsResult:
    """Compute Net Needs Approach as documented in CALCULATION_POLICY.md §2.

    Returns itemized breakdown of all needs and resources.
    """
    warnings: list[str] = []

    # ── NEEDS SIDE ──

    # 1. PV of household support
    dependency_horizon = _compute_dependency_horizon(
        inputs.dependents, assumptions
    )

    if not inputs.dependents:
        warnings.append("No dependents listed. Household support need is zero.")

    pv_household = _compute_pv_household_support(
        monthly_expenses=inputs.monthly_household_expenses_inr,
        expense_share_of_deceased=assumptions.household_expense_share_of_deceased_pct,
        inflation=assumptions.general_inflation_pct_pa,
        discount_rate=assumptions.discount_rate,
        horizon_years=dependency_horizon,
    )

    # 2. Outstanding loans
    total_loans = Decimal("0")
    for loan in inputs.loans:
        total_loans += loan.outstanding_principal_inr
    total_loans = total_loans.quantize(Decimal("1"), rounding=ROUND_HALF_UP)

    # 3. PV of future goals
    goal_details = _compute_goal_details(
        inputs.goals, inputs.current_year, assumptions
    )
    pv_goals = sum(
        (gd.present_value for gd in goal_details if gd.included),
        Decimal("0"),
    ).quantize(Decimal("1"), rounding=ROUND_HALF_UP)

    excluded_goals = [gd for gd in goal_details if not gd.included]
    if excluded_goals:
        for gd in excluded_goals:
            if gd.exclusion_reason:
                warnings.append(
                    f"Goal '{gd.goal_type}' for '{gd.beneficiary}': {gd.exclusion_reason}"
                )

    # 4. Final expenses
    final_expenses = assumptions.final_expenses_inr

    # 5. Emergency buffer
    emergency_buffer = (
        inputs.monthly_household_expenses_inr * Decimal(str(assumptions.emergency_fund_months))
    ).quantize(Decimal("1"), rounding=ROUND_HALF_UP)

    total_needs = pv_household + total_loans + pv_goals + final_expenses + emergency_buffer

    # ── RESOURCES SIDE ──

    available_assets = inputs.liquid_savings_inr + inputs.market_investments_inr
    if assumptions.count_retirement_savings:
        available_assets += inputs.retirement_savings_inr
    else:
        if inputs.retirement_savings_inr > Decimal("0"):
            warnings.append(
                "Retirement savings (EPF/PPF/NPS) excluded from available resources. "
                "These are typically illiquid. Toggle 'count_retirement_savings' to include."
            )

    existing_cover = inputs.individual_life_cover_inr
    if assumptions.count_employer_group_cover:
        existing_cover += inputs.employer_group_life_cover_inr
        if inputs.employer_group_life_cover_inr > Decimal("0"):
            warnings.append(
                "Employer group cover included. This typically ends when employment ends."
            )

    total_resources = available_assets + existing_cover

    # ── GAP ──

    net_needs_gap = max(Decimal("0"), total_needs - total_resources)

    if total_resources > total_needs and total_needs > Decimal("0"):
        warnings.append(
            "Your total resources exceed your calculated financial needs. "
            "You may already be adequately covered."
        )

    return NetNeedsResult(
        pv_household_support=pv_household,
        dependency_horizon_years=dependency_horizon,
        outstanding_loans=total_loans,
        pv_goals=pv_goals,
        final_expenses=final_expenses,
        emergency_buffer=emergency_buffer,
        total_needs=total_needs,
        available_assets=available_assets,
        existing_cover=existing_cover,
        total_resources=total_resources,
        net_needs_gap=net_needs_gap,
        goal_details=goal_details,
        warnings=warnings,
    )


# ──────────────────────────────────────────────────────────────
# Combined Assessment
# ──────────────────────────────────────────────────────────────

def _round_up_to_multiple(value: Decimal, multiple: Decimal) -> Decimal:
    """Round a value UP to the next multiple (e.g., ₹5,00,000).

    Zero stays zero.
    """
    if value <= Decimal("0") or multiple <= Decimal("0"):
        return Decimal("0")

    # Ceiling division
    quotient = (value / multiple).quantize(Decimal("1"), rounding=ROUND_CEILING)
    return quotient * multiple


def compute_assessment(
    inputs: FinancialInputs,
    assumptions: Optional[AssumptionSet] = None,
) -> AssessmentResult:
    """Run both HLV and Net Needs, combine into recommendation.

    CALCULATION_POLICY.md §3:
    - Recommended = max(HLV_gap, NetNeeds_gap)
    - Round UP to cover_rounding_inr multiple
    - Zero remains zero
    """
    if assumptions is None:
        assumptions = AssumptionSet()

    # Validate
    errors = validate_inputs(inputs, assumptions)
    if errors:
        raise ValueError("; ".join(errors))

    # Compute both methods
    hlv = compute_hlv(inputs, assumptions)
    net_needs = compute_net_needs(inputs, assumptions)

    # Combine: max of both gaps
    hlv_gap = hlv.hlv_coverage_gap
    nn_gap = net_needs.net_needs_gap

    if hlv_gap == Decimal("0") and nn_gap == Decimal("0"):
        recommended_exact = Decimal("0")
        recommended_method = "neither"
        explanation = (
            "Both the income-replacement (HLV) and needs-based analyses "
            "show no additional coverage gap. Your existing resources and "
            "insurance appear adequate for your current situation."
        )
    elif hlv_gap >= nn_gap:
        recommended_exact = hlv_gap
        recommended_method = "hlv"
        explanation = (
            f"The Human Life Value (income-replacement) method produces the "
            f"higher estimate. This means the cost of replacing your income "
            f"contribution over {hlv.remaining_earning_years} earning years "
            f"exceeds the itemized financial needs assessment."
        )
    else:
        recommended_exact = nn_gap
        recommended_method = "net_needs"
        explanation = (
            "The Net Needs (obligations-based) method produces the higher "
            "estimate. This means your family's specific financial obligations "
            "(household expenses, loans, goals) exceed the income-replacement "
            "value calculation."
        )

    # Round UP to nearest multiple
    if recommended_exact > Decimal("0") and assumptions.cover_rounding_inr > Decimal("0"):
        recommended_rounded = _round_up_to_multiple(
            recommended_exact, assumptions.cover_rounding_inr
        )
    else:
        recommended_rounded = recommended_exact

    # Collect all warnings
    all_warnings = hlv.warnings + net_needs.warnings

    # Serialize assumptions for response
    assumptions_dict = {
        "retirement_age": assumptions.retirement_age,
        "self_consumption_share": str(assumptions.self_consumption_share),
        "income_growth_rate": str(assumptions.income_growth_rate),
        "discount_rate": str(assumptions.discount_rate),
        "general_inflation_pct_pa": str(assumptions.general_inflation_pct_pa),
        "education_inflation_pct_pa": str(assumptions.education_inflation_pct_pa),
        "household_expense_share_of_deceased_pct": str(assumptions.household_expense_share_of_deceased_pct),
        "child_dependency_end_age": assumptions.child_dependency_end_age,
        "life_expectancy_age": assumptions.life_expectancy_age,
        "emergency_fund_months": assumptions.emergency_fund_months,
        "final_expenses_inr": str(assumptions.final_expenses_inr),
        "cover_rounding_inr": str(assumptions.cover_rounding_inr),
        "count_employer_group_cover": assumptions.count_employer_group_cover,
        "count_retirement_savings": assumptions.count_retirement_savings,
    }

    return AssessmentResult(
        hlv=hlv,
        net_needs=net_needs,
        recommended_gap_exact=recommended_exact,
        recommended_gap_rounded=recommended_rounded,
        recommended_method=recommended_method,
        explanation=explanation,
        assumptions_used=assumptions_dict,
        warnings=all_warnings,
    )
