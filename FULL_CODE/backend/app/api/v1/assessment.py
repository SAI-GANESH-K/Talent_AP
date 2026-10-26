"""Assessment API endpoint.

POST /api/v1/assessments/estimate — runs HLV + Net Needs calculations.
Does NOT persist guest data by default.
"""

import logging

from fastapi import APIRouter

from app.domain.needs import (
    AssumptionSet,
    Dependent,
    FinancialInputs,
    Goal,
    Loan,
    compute_assessment,
)
from app.schemas.assessment import (
    AssessmentRequest,
    AssessmentResponse,
    GoalDetailResponse,
    HLVResponse,
    NetNeedsResponse,
)

logger = logging.getLogger("coverwise.assessment")

router = APIRouter(prefix="/api/v1/assessments", tags=["assessments"])


def _build_domain_inputs(req: AssessmentRequest) -> tuple[FinancialInputs, AssumptionSet]:
    """Convert Pydantic request to domain data classes."""
    dependents = [
        Dependent(
            relationship=d.relationship,
            age=d.age,
            has_own_income=d.has_own_income,
        )
        for d in req.dependents
    ]
    goals = [
        Goal(
            goal_type=g.goal_type,
            beneficiary=g.beneficiary,
            target_amount_today_inr=g.target_amount_today_inr,
            target_year=g.target_year,
            priority=g.priority,
        )
        for g in req.goals
    ]
    loans = [
        Loan(
            loan_type=l.loan_type,
            outstanding_principal_inr=l.outstanding_principal_inr,
        )
        for l in req.loans
    ]

    inputs = FinancialInputs(
        age=req.age,
        annual_income_inr=req.annual_income_inr,
        is_homemaker=req.is_homemaker,
        homemaker_services_value_annual_inr=req.homemaker_services_value_annual_inr,
        monthly_household_expenses_inr=req.monthly_household_expenses_inr,
        dependents=dependents,
        goals=goals,
        loans=loans,
        individual_life_cover_inr=req.individual_life_cover_inr,
        employer_group_life_cover_inr=req.employer_group_life_cover_inr,
        liquid_savings_inr=req.liquid_savings_inr,
        market_investments_inr=req.market_investments_inr,
        retirement_savings_inr=req.retirement_savings_inr,
        current_year=req.current_year,
    )

    if req.assumptions:
        a = req.assumptions
        assumptions = AssumptionSet(
            retirement_age=a.retirement_age,
            self_consumption_share=a.self_consumption_share,
            income_growth_rate=a.income_growth_rate,
            discount_rate=a.discount_rate,
            general_inflation_pct_pa=a.general_inflation_pct_pa,
            education_inflation_pct_pa=a.education_inflation_pct_pa,
            household_expense_share_of_deceased_pct=a.household_expense_share_of_deceased_pct,
            child_dependency_end_age=a.child_dependency_end_age,
            life_expectancy_age=a.life_expectancy_age,
            emergency_fund_months=a.emergency_fund_months,
            final_expenses_inr=a.final_expenses_inr,
            cover_rounding_inr=a.cover_rounding_inr,
            count_employer_group_cover=a.count_employer_group_cover,
            count_retirement_savings=a.count_retirement_savings,
        )
    else:
        assumptions = AssumptionSet()

    return inputs, assumptions


def _serialize_result(result) -> AssessmentResponse:
    """Convert domain result to Pydantic response.

    All Decimal values are serialized as strings to preserve precision.
    """
    hlv = result.hlv
    nn = result.net_needs

    return AssessmentResponse(
        hlv=HLVResponse(
            hlv_gross=str(hlv.hlv_gross),
            existing_cover=str(hlv.existing_cover),
            hlv_coverage_gap=str(hlv.hlv_coverage_gap),
            remaining_earning_years=hlv.remaining_earning_years,
            annual_income_contribution=str(hlv.annual_income_contribution),
            warnings=hlv.warnings,
            year_breakdown=hlv.year_breakdown,
        ),
        net_needs=NetNeedsResponse(
            pv_household_support=str(nn.pv_household_support),
            dependency_horizon_years=nn.dependency_horizon_years,
            outstanding_loans=str(nn.outstanding_loans),
            pv_goals=str(nn.pv_goals),
            final_expenses=str(nn.final_expenses),
            emergency_buffer=str(nn.emergency_buffer),
            total_needs=str(nn.total_needs),
            available_assets=str(nn.available_assets),
            existing_cover=str(nn.existing_cover),
            total_resources=str(nn.total_resources),
            net_needs_gap=str(nn.net_needs_gap),
            goal_details=[
                GoalDetailResponse(
                    goal_type=gd.goal_type,
                    beneficiary=gd.beneficiary,
                    target_amount_today_inr=str(gd.target_amount_today_inr),
                    target_year=gd.target_year,
                    years_to_goal=gd.years_to_goal,
                    inflation_rate_used=str(gd.inflation_rate_used),
                    future_cost=str(gd.future_cost),
                    present_value=str(gd.present_value),
                    included=gd.included,
                    exclusion_reason=gd.exclusion_reason,
                )
                for gd in nn.goal_details
            ],
            warnings=nn.warnings,
        ),
        recommended_gap_exact=str(result.recommended_gap_exact),
        recommended_gap_rounded=str(result.recommended_gap_rounded),
        recommended_method=result.recommended_method,
        explanation=result.explanation,
        assumptions_used=result.assumptions_used,
        currency=result.currency,
        warnings=result.warnings,
    )


@router.post("/estimate", response_model=AssessmentResponse)
def estimate_coverage(request: AssessmentRequest) -> AssessmentResponse:
    """Run HLV + Net Needs assessment.

    Does NOT persist data — this is a stateless calculation for guest users.
    No financial data is logged.
    """
    # Log action only (no customer profile or financial data)
    logger.info("Assessment estimate requested")

    inputs, assumptions = _build_domain_inputs(request)
    result = compute_assessment(inputs, assumptions)

    return _serialize_result(result)
