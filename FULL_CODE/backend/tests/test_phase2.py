"""Phase 2 tests — Financial needs assessment engine.

Tests cover all scenarios from the Phase 2 requirements:
- Normal HLV and Net Needs computations
- Edge cases (zero income, retired, no dependents, etc.)
- Anti-double-counting rules
- Decimal precision and rounding
- API endpoint validation
- Deterministic repeated calculations

Expected values are manually computed from CALCULATION_POLICY.md formulas.
"""

from decimal import Decimal, ROUND_HALF_UP

import pytest
from fastapi.testclient import TestClient

from app.domain.needs import (
    AssumptionSet,
    Dependent,
    FinancialInputs,
    Goal,
    Loan,
    compute_assessment,
    compute_hlv,
    compute_net_needs,
    _round_up_to_multiple,
)
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


# ──────────────────────────────────────────────────────────────
# HLV Tests
# ──────────────────────────────────────────────────────────────

class TestHLVComputation:
    """Test Human Life Value calculation."""

    def test_normal_salaried_employee(self):
        """30-year-old, ₹12L income, 30 years to retirement.

        I=1200000, c=0.30, g=0.06, r=0.07, n=30
        Contribution = 1200000 * 0.70 = 840000/yr
        Year-by-year PV with Decimal.
        """
        inputs = FinancialInputs(
            age=30,
            annual_income_inr=Decimal("1200000"),
        )
        assumptions = AssumptionSet()
        result = compute_hlv(inputs, assumptions)

        assert result.remaining_earning_years == 30
        assert result.annual_income_contribution == Decimal("840000")
        assert result.hlv_gross > Decimal("0")
        # Manual check: first year contribution PV = 840000 / 1.07 ≈ 785046.73
        # Total should be in the range of ~1.6-2cr for these parameters
        assert Decimal("15000000") < result.hlv_gross < Decimal("25000000")
        assert result.hlv_coverage_gap == result.hlv_gross  # no existing cover

    def test_hlv_exact_3_year_simple(self):
        """3-year simple case for exact verification.

        I=100000, c=0, g=0, r=0.10, n=3
        Year 1: 100000 / 1.10 = 90909.090909
        Year 2: 100000 / 1.21 = 82644.628099
        Year 3: 100000 / 1.331 = 75131.480180
        Total = 248685.199188 → 248685
        """
        inputs = FinancialInputs(
            age=57,
            annual_income_inr=Decimal("100000"),
        )
        assumptions = AssumptionSet(
            retirement_age=60,
            self_consumption_share=Decimal("0"),
            income_growth_rate=Decimal("0"),
            discount_rate=Decimal("0.10"),
        )
        result = compute_hlv(inputs, assumptions)

        assert result.remaining_earning_years == 3
        assert result.hlv_gross == Decimal("248685")

    def test_hlv_g_equals_r(self):
        """When g = r, formula is I*(1-c)*n/(1+r) per year.

        I=100000, c=0, g=0.07, r=0.07, n=3
        Each year: 100000 * (1.07)^(t-1) / (1.07)^t = 100000/1.07
        = 93457.943925... per year
        Total = 3 * 93457.943925 ≈ 280374 (rounded)

        But we compute term-by-term with Decimal, so verify:
        Year 1: 100000 * 1.00 / 1.07 = 93457.943925
        Year 2: 100000 * 1.07 / 1.1449 = 93457.943925
        Year 3: 100000 * 1.1449 / 1.225043 = 93457.943925
        Sum = 280373.831776 → 280374
        """
        inputs = FinancialInputs(
            age=57,
            annual_income_inr=Decimal("100000"),
        )
        assumptions = AssumptionSet(
            retirement_age=60,
            self_consumption_share=Decimal("0"),
            income_growth_rate=Decimal("0.07"),
            discount_rate=Decimal("0.07"),
        )
        result = compute_hlv(inputs, assumptions)

        assert result.remaining_earning_years == 3
        assert result.hlv_gross == Decimal("280374")

    def test_hlv_g_greater_than_r(self):
        """Growth > discount — still finite with year-by-year sum.

        I=100000, c=0, g=0.10, r=0.07, n=3
        Year 1: 100000 / 1.07 = 93457.943925
        Year 2: 110000 / 1.1449 = 96077.386...
        Year 3: 121000 / 1.225043 = 98769.908...
        Should produce a valid finite result.
        """
        inputs = FinancialInputs(
            age=57,
            annual_income_inr=Decimal("100000"),
        )
        assumptions = AssumptionSet(
            retirement_age=60,
            self_consumption_share=Decimal("0"),
            income_growth_rate=Decimal("0.10"),
            discount_rate=Decimal("0.07"),
        )
        result = compute_hlv(inputs, assumptions)

        assert result.remaining_earning_years == 3
        assert result.hlv_gross > Decimal("280000")  # > g==r case
        # Check warning about g >= r
        assert any("growth rate" in w.lower() for w in result.warnings)

    def test_retired_customer_zero_hlv(self):
        """Age >= retirement → HLV = 0."""
        inputs = FinancialInputs(
            age=65,
            annual_income_inr=Decimal("500000"),
        )
        result = compute_hlv(inputs, AssumptionSet())

        assert result.remaining_earning_years == 0
        assert result.hlv_gross == Decimal("0")
        assert result.hlv_coverage_gap == Decimal("0")
        assert any("retirement" in w.lower() for w in result.warnings)

    def test_homemaker_zero_income(self):
        """Homemaker with zero income → HLV gross = 0, with services warning."""
        inputs = FinancialInputs(
            age=35,
            annual_income_inr=Decimal("0"),
            is_homemaker=True,
            homemaker_services_value_annual_inr=Decimal("300000"),
        )
        result = compute_hlv(inputs, AssumptionSet())

        assert result.hlv_gross == Decimal("0")
        assert result.hlv_coverage_gap == Decimal("0")
        assert any("homemaker" in w.lower() for w in result.warnings)

    def test_existing_cover_exceeds_hlv(self):
        """Existing insurance > HLV → gap = 0, warning shown."""
        inputs = FinancialInputs(
            age=55,
            annual_income_inr=Decimal("500000"),
            individual_life_cover_inr=Decimal("50000000"),
        )
        result = compute_hlv(inputs, AssumptionSet())

        assert result.hlv_coverage_gap == Decimal("0")
        assert any("adequately covered" in w.lower() for w in result.warnings)

    def test_employer_group_cover_included(self):
        """With count_employer_group_cover=True, employer cover reduces gap."""
        inputs = FinancialInputs(
            age=30,
            annual_income_inr=Decimal("1200000"),
            individual_life_cover_inr=Decimal("5000000"),
            employer_group_life_cover_inr=Decimal("2000000"),
        )
        assumptions = AssumptionSet(count_employer_group_cover=True)
        result = compute_hlv(inputs, assumptions)

        assert result.existing_cover == Decimal("7000000")
        assert any("employer" in w.lower() for w in result.warnings)

    def test_employer_group_cover_excluded(self):
        """With count_employer_group_cover=False, employer cover not counted."""
        inputs = FinancialInputs(
            age=30,
            annual_income_inr=Decimal("1200000"),
            individual_life_cover_inr=Decimal("5000000"),
            employer_group_life_cover_inr=Decimal("2000000"),
        )
        assumptions = AssumptionSet(count_employer_group_cover=False)
        result = compute_hlv(inputs, assumptions)

        assert result.existing_cover == Decimal("5000000")


# ──────────────────────────────────────────────────────────────
# Net Needs Tests
# ──────────────────────────────────────────────────────────────

class TestNetNeedsComputation:
    """Test Net Needs Approach calculation."""

    def test_normal_family_scenario(self):
        """Salaried employee with spouse, child, home loan, goals."""
        inputs = FinancialInputs(
            age=35,
            annual_income_inr=Decimal("1200000"),
            monthly_household_expenses_inr=Decimal("60000"),
            dependents=[
                Dependent(relationship="spouse", age=32, has_own_income=False),
                Dependent(relationship="child", age=5),
            ],
            loans=[
                Loan(loan_type="home_loan", outstanding_principal_inr=Decimal("3500000")),
            ],
            goals=[
                Goal(
                    goal_type="child_education",
                    beneficiary="child_1",
                    target_amount_today_inr=Decimal("2000000"),
                    target_year=2038,
                ),
            ],
            individual_life_cover_inr=Decimal("5000000"),
            liquid_savings_inr=Decimal("500000"),
            market_investments_inr=Decimal("200000"),
        )
        result = compute_net_needs(inputs, AssumptionSet())

        # Dependency horizon: max(spouse: 85-32=53, child: 25-5=20) = 53
        assert result.dependency_horizon_years == 53
        assert result.outstanding_loans == Decimal("3500000")
        assert result.pv_household_support > Decimal("0")
        assert result.pv_goals > Decimal("0")
        assert result.final_expenses == Decimal("150000")
        assert result.emergency_buffer == Decimal("360000")  # 60000 * 6
        assert result.total_needs > Decimal("0")
        assert result.existing_cover == Decimal("5000000")
        assert result.available_assets == Decimal("700000")  # 500k + 200k
        assert result.net_needs_gap > Decimal("0")

    def test_no_dependents(self):
        """No dependents → PV_household = 0, but loans/goals may still apply."""
        inputs = FinancialInputs(
            age=28,
            annual_income_inr=Decimal("800000"),
            monthly_household_expenses_inr=Decimal("30000"),
            dependents=[],
            loans=[
                Loan(loan_type="education_loan", outstanding_principal_inr=Decimal("500000")),
            ],
        )
        result = compute_net_needs(inputs, AssumptionSet())

        assert result.dependency_horizon_years == 0
        assert result.pv_household_support == Decimal("0")
        assert result.outstanding_loans == Decimal("500000")
        assert any("no dependents" in w.lower() for w in result.warnings)

    def test_retirement_goal_excluded(self):
        """Self-beneficiary retirement goals are excluded from death needs."""
        inputs = FinancialInputs(
            age=40,
            monthly_household_expenses_inr=Decimal("50000"),
            dependents=[Dependent(relationship="spouse", age=38)],
            goals=[
                Goal(
                    goal_type="retirement",
                    beneficiary="self_and_spouse",
                    target_amount_today_inr=Decimal("10000000"),
                    target_year=2046,
                ),
                Goal(
                    goal_type="child_education",
                    beneficiary="child_1",
                    target_amount_today_inr=Decimal("2000000"),
                    target_year=2038,
                ),
            ],
        )
        result = compute_net_needs(inputs, AssumptionSet())

        # Retirement goal excluded
        retirement_goals = [gd for gd in result.goal_details
                           if gd.goal_type == "retirement"]
        assert len(retirement_goals) == 1
        assert retirement_goals[0].included is False
        assert "excluded" in retirement_goals[0].exclusion_reason.lower()

        # Education goal included
        edu_goals = [gd for gd in result.goal_details
                    if gd.goal_type == "child_education"]
        assert len(edu_goals) == 1
        assert edu_goals[0].included is True

    def test_past_goal_excluded(self):
        """Goals with target_year <= current_year are excluded."""
        inputs = FinancialInputs(
            age=40,
            current_year=2026,
            goals=[
                Goal(
                    goal_type="house_purchase",
                    beneficiary="family",
                    target_amount_today_inr=Decimal("5000000"),
                    target_year=2025,
                ),
            ],
        )
        result = compute_net_needs(inputs, AssumptionSet())

        assert result.goal_details[0].included is False
        assert "past" in result.goal_details[0].exclusion_reason.lower()
        assert result.pv_goals == Decimal("0")

    def test_education_inflation_vs_general(self):
        """Education goals use 8% inflation, others use 5.5%."""
        inputs = FinancialInputs(
            age=35,
            current_year=2026,
            goals=[
                Goal(
                    goal_type="child_education",
                    beneficiary="child_1",
                    target_amount_today_inr=Decimal("1000000"),
                    target_year=2036,
                ),
                Goal(
                    goal_type="child_marriage",
                    beneficiary="child_1",
                    target_amount_today_inr=Decimal("1000000"),
                    target_year=2036,
                ),
            ],
        )
        result = compute_net_needs(inputs, AssumptionSet())

        edu_goal = next(gd for gd in result.goal_details if gd.goal_type == "child_education")
        marriage_goal = next(gd for gd in result.goal_details if gd.goal_type == "child_marriage")

        assert edu_goal.inflation_rate_used == Decimal("0.08")
        assert marriage_goal.inflation_rate_used == Decimal("0.055")
        # Education future cost should be higher due to higher inflation
        assert edu_goal.future_cost > marriage_goal.future_cost

    def test_no_loans(self):
        """No loans → outstanding_loans = 0."""
        inputs = FinancialInputs(age=30, loans=[])
        result = compute_net_needs(inputs, AssumptionSet())
        assert result.outstanding_loans == Decimal("0")

    def test_retirement_savings_excluded_by_default(self):
        """Retirement savings excluded by default (illiquid)."""
        inputs = FinancialInputs(
            age=35,
            liquid_savings_inr=Decimal("500000"),
            retirement_savings_inr=Decimal("1000000"),
        )
        assumptions = AssumptionSet(count_retirement_savings=False)
        result = compute_net_needs(inputs, assumptions)

        assert result.available_assets == Decimal("500000")
        assert any("retirement savings" in w.lower() for w in result.warnings)

    def test_retirement_savings_included_when_toggled(self):
        """Retirement savings included when explicitly toggled."""
        inputs = FinancialInputs(
            age=35,
            liquid_savings_inr=Decimal("500000"),
            retirement_savings_inr=Decimal("1000000"),
        )
        assumptions = AssumptionSet(count_retirement_savings=True)
        result = compute_net_needs(inputs, assumptions)

        assert result.available_assets == Decimal("1500000")

    def test_resources_exceed_needs(self):
        """When resources > needs, gap = 0 with appropriate warning."""
        inputs = FinancialInputs(
            age=45,
            monthly_household_expenses_inr=Decimal("30000"),
            dependents=[Dependent(relationship="child", age=20)],
            individual_life_cover_inr=Decimal("50000000"),
            liquid_savings_inr=Decimal("20000000"),
        )
        result = compute_net_needs(inputs, AssumptionSet())

        assert result.net_needs_gap == Decimal("0")
        assert any("adequately covered" in w.lower() for w in result.warnings)


# ──────────────────────────────────────────────────────────────
# Combined Assessment Tests
# ──────────────────────────────────────────────────────────────

class TestCombinedAssessment:
    """Test the combined assessment with both methods."""

    def test_salaried_with_dependents(self):
        """Full scenario: 35yo, ₹12L, family, loans, goals."""
        inputs = FinancialInputs(
            age=35,
            annual_income_inr=Decimal("1200000"),
            monthly_household_expenses_inr=Decimal("60000"),
            dependents=[
                Dependent(relationship="spouse", age=32),
                Dependent(relationship="child", age=5),
            ],
            loans=[
                Loan(loan_type="home_loan", outstanding_principal_inr=Decimal("3500000")),
            ],
            goals=[
                Goal(
                    goal_type="child_education",
                    beneficiary="child_1",
                    target_amount_today_inr=Decimal("2000000"),
                    target_year=2038,
                ),
            ],
            individual_life_cover_inr=Decimal("5000000"),
            liquid_savings_inr=Decimal("500000"),
        )
        result = compute_assessment(inputs)

        assert result.hlv.hlv_gross > Decimal("0")
        assert result.net_needs.total_needs > Decimal("0")
        assert result.recommended_gap_exact >= Decimal("0")
        assert result.recommended_gap_rounded >= result.recommended_gap_exact
        assert result.recommended_method in ("hlv", "net_needs", "neither")
        assert result.currency == "INR"
        assert len(result.explanation) > 0

    def test_farmer_irregular_income(self):
        """Farmer with annualized irregular income."""
        inputs = FinancialInputs(
            age=40,
            annual_income_inr=Decimal("400000"),  # Annualized
            monthly_household_expenses_inr=Decimal("25000"),
            dependents=[
                Dependent(relationship="spouse", age=38),
                Dependent(relationship="child", age=12),
                Dependent(relationship="parent", age=70),
            ],
            loans=[],
        )
        result = compute_assessment(inputs)

        assert result.hlv.hlv_gross > Decimal("0")
        assert result.net_needs.dependency_horizon_years > 0

    def test_shopkeeper_with_business_income(self):
        """Shopkeeper with business income."""
        inputs = FinancialInputs(
            age=42,
            annual_income_inr=Decimal("600000"),
            monthly_household_expenses_inr=Decimal("35000"),
            dependents=[
                Dependent(relationship="spouse", age=40, has_own_income=False),
                Dependent(relationship="child", age=10),
                Dependent(relationship="child", age=7),
            ],
            loans=[
                Loan(loan_type="personal_loan", outstanding_principal_inr=Decimal("200000")),
            ],
            goals=[
                Goal(goal_type="child_education", beneficiary="child_1",
                     target_amount_today_inr=Decimal("1500000"), target_year=2034),
                Goal(goal_type="child_education", beneficiary="child_2",
                     target_amount_today_inr=Decimal("1500000"), target_year=2037),
            ],
        )
        result = compute_assessment(inputs)

        assert result.hlv.hlv_gross > Decimal("0")
        assert result.net_needs.pv_goals > Decimal("0")

    def test_homemaker_zero_income(self):
        """Homemaker — HLV=0 from income, but Net Needs may still apply."""
        inputs = FinancialInputs(
            age=35,
            annual_income_inr=Decimal("0"),
            is_homemaker=True,
            homemaker_services_value_annual_inr=Decimal("300000"),
            monthly_household_expenses_inr=Decimal("40000"),
            dependents=[
                Dependent(relationship="child", age=8),
            ],
        )
        result = compute_assessment(inputs)

        assert result.hlv.hlv_gross == Decimal("0")
        # Net Needs may still produce a gap from expenses + goals
        assert result.net_needs.total_needs > Decimal("0")

    def test_retired_customer(self):
        """Retired — HLV=0 from age, Net Needs may still apply."""
        inputs = FinancialInputs(
            age=65,
            annual_income_inr=Decimal("0"),
            monthly_household_expenses_inr=Decimal("30000"),
            dependents=[
                Dependent(relationship="spouse", age=62),
            ],
            liquid_savings_inr=Decimal("5000000"),
            individual_life_cover_inr=Decimal("2000000"),
        )
        result = compute_assessment(inputs)

        assert result.hlv.hlv_gross == Decimal("0")
        assert result.hlv.remaining_earning_years == 0

    def test_customer_without_dependents(self):
        """No dependents — reduced needs."""
        inputs = FinancialInputs(
            age=28,
            annual_income_inr=Decimal("800000"),
            monthly_household_expenses_inr=Decimal("20000"),
            dependents=[],
            loans=[
                Loan(loan_type="education_loan", outstanding_principal_inr=Decimal("300000")),
            ],
        )
        result = compute_assessment(inputs)

        assert result.net_needs.dependency_horizon_years == 0
        assert result.net_needs.pv_household_support == Decimal("0")

    def test_customer_with_outstanding_loans(self):
        """Multiple loans contribute to needs."""
        inputs = FinancialInputs(
            age=35,
            annual_income_inr=Decimal("1000000"),
            monthly_household_expenses_inr=Decimal("40000"),
            dependents=[Dependent(relationship="spouse", age=33)],
            loans=[
                Loan(loan_type="home_loan", outstanding_principal_inr=Decimal("4000000")),
                Loan(loan_type="car_loan", outstanding_principal_inr=Decimal("300000")),
                Loan(loan_type="personal_loan", outstanding_principal_inr=Decimal("200000")),
            ],
        )
        result = compute_assessment(inputs)

        assert result.net_needs.outstanding_loans == Decimal("4500000")

    def test_coverage_exceeds_needs(self):
        """Existing coverage > both calculations → zero gap."""
        inputs = FinancialInputs(
            age=30,
            annual_income_inr=Decimal("500000"),
            monthly_household_expenses_inr=Decimal("20000"),
            dependents=[Dependent(relationship="child", age=15)],
            individual_life_cover_inr=Decimal("100000000"),
            liquid_savings_inr=Decimal("50000000"),
        )
        result = compute_assessment(inputs)

        assert result.recommended_gap_exact == Decimal("0")
        assert result.recommended_gap_rounded == Decimal("0")
        assert result.recommended_method == "neither"

    def test_no_savings(self):
        """Customer with zero savings — all needs contribute to gap."""
        inputs = FinancialInputs(
            age=30,
            annual_income_inr=Decimal("600000"),
            monthly_household_expenses_inr=Decimal("30000"),
            dependents=[Dependent(relationship="spouse", age=28)],
            liquid_savings_inr=Decimal("0"),
            market_investments_inr=Decimal("0"),
            retirement_savings_inr=Decimal("0"),
        )
        result = compute_assessment(inputs)

        assert result.net_needs.available_assets == Decimal("0")
        assert result.net_needs.total_resources == Decimal("0")

    def test_negative_inputs_rejected(self):
        """Negative monetary values raise ValueError."""
        inputs = FinancialInputs(
            age=30,
            annual_income_inr=Decimal("-100000"),
        )
        with pytest.raises(ValueError, match="negative"):
            compute_assessment(inputs)

    def test_deterministic_repeated_calculation(self):
        """Same inputs always produce same outputs."""
        inputs = FinancialInputs(
            age=35,
            annual_income_inr=Decimal("1200000"),
            monthly_household_expenses_inr=Decimal("50000"),
            dependents=[
                Dependent(relationship="spouse", age=33),
                Dependent(relationship="child", age=3),
            ],
        )
        r1 = compute_assessment(inputs)
        r2 = compute_assessment(inputs)

        assert r1.hlv.hlv_gross == r2.hlv.hlv_gross
        assert r1.net_needs.net_needs_gap == r2.net_needs.net_needs_gap
        assert r1.recommended_gap_exact == r2.recommended_gap_exact
        assert r1.recommended_gap_rounded == r2.recommended_gap_rounded


# ──────────────────────────────────────────────────────────────
# Rounding Tests
# ──────────────────────────────────────────────────────────────

class TestRounding:
    """Test coverage-gap rounding behavior."""

    def test_round_up_to_500k(self):
        assert _round_up_to_multiple(Decimal("1200001"), Decimal("500000")) == Decimal("1500000")

    def test_round_exact_multiple(self):
        assert _round_up_to_multiple(Decimal("1000000"), Decimal("500000")) == Decimal("1000000")

    def test_round_zero(self):
        assert _round_up_to_multiple(Decimal("0"), Decimal("500000")) == Decimal("0")

    def test_round_small_amount(self):
        assert _round_up_to_multiple(Decimal("1"), Decimal("500000")) == Decimal("500000")


# ──────────────────────────────────────────────────────────────
# API Endpoint Tests
# ──────────────────────────────────────────────────────────────

class TestAssessmentAPI:
    """Test the POST /api/v1/assessments/estimate endpoint."""

    def test_basic_estimate(self, client):
        """Simple assessment request returns valid response."""
        response = client.post("/api/v1/assessments/estimate", json={
            "age": 35,
            "annual_income_inr": 1200000,
            "monthly_household_expenses_inr": 50000,
            "dependents": [
                {"relationship": "spouse", "age": 33},
                {"relationship": "child", "age": 5},
            ],
        })
        assert response.status_code == 200
        data = response.json()

        assert "hlv" in data
        assert "net_needs" in data
        assert "recommended_gap_exact" in data
        assert "recommended_gap_rounded" in data
        assert "explanation" in data
        assert data["currency"] == "INR"

        # Values should be numeric strings
        assert int(data["hlv"]["hlv_gross"]) > 0
        assert int(data["recommended_gap_exact"]) >= 0

    def test_api_with_all_fields(self, client):
        """Full request with all optional fields."""
        response = client.post("/api/v1/assessments/estimate", json={
            "age": 40,
            "annual_income_inr": 1500000,
            "monthly_household_expenses_inr": 70000,
            "dependents": [
                {"relationship": "spouse", "age": 38, "has_own_income": False},
                {"relationship": "child", "age": 10},
                {"relationship": "parent", "age": 72},
            ],
            "goals": [
                {
                    "goal_type": "child_education",
                    "beneficiary": "child_1",
                    "target_amount_today_inr": 2000000,
                    "target_year": 2036,
                },
                {
                    "goal_type": "retirement",
                    "beneficiary": "self_and_spouse",
                    "target_amount_today_inr": 10000000,
                    "target_year": 2046,
                },
            ],
            "loans": [
                {"loan_type": "home_loan", "outstanding_principal_inr": 4000000},
            ],
            "individual_life_cover_inr": 5000000,
            "employer_group_life_cover_inr": 2000000,
            "liquid_savings_inr": 1000000,
            "market_investments_inr": 500000,
            "retirement_savings_inr": 800000,
            "assumptions": {
                "count_employer_group_cover": True,
                "count_retirement_savings": False,
            },
        })
        assert response.status_code == 200
        data = response.json()

        # Retirement goal should be excluded
        excluded = [g for g in data["net_needs"]["goal_details"] if not g["included"]]
        assert any("retirement" in g["goal_type"] for g in excluded)

    def test_api_validation_negative_income(self, client):
        """Negative income rejected by Pydantic."""
        response = client.post("/api/v1/assessments/estimate", json={
            "age": 30,
            "annual_income_inr": -100000,
        })
        assert response.status_code == 422  # Pydantic validation error

    def test_api_validation_invalid_age(self, client):
        """Age out of range rejected."""
        response = client.post("/api/v1/assessments/estimate", json={
            "age": 5,
        })
        assert response.status_code == 422

    def test_api_validation_invalid_dependent(self, client):
        """Invalid dependent relationship rejected."""
        response = client.post("/api/v1/assessments/estimate", json={
            "age": 35,
            "dependents": [{"relationship": "friend", "age": 30}],
        })
        assert response.status_code == 422

    def test_api_homemaker(self, client):
        """Homemaker scenario through API."""
        response = client.post("/api/v1/assessments/estimate", json={
            "age": 35,
            "annual_income_inr": 0,
            "is_homemaker": True,
            "homemaker_services_value_annual_inr": 300000,
            "monthly_household_expenses_inr": 40000,
            "dependents": [
                {"relationship": "child", "age": 8},
            ],
        })
        assert response.status_code == 200
        data = response.json()
        assert data["hlv"]["hlv_gross"] == "0"

    def test_api_response_has_assumptions(self, client):
        """Response includes the assumptions used."""
        response = client.post("/api/v1/assessments/estimate", json={
            "age": 30,
            "annual_income_inr": 600000,
        })
        data = response.json()

        assert "assumptions_used" in data
        assert "retirement_age" in data["assumptions_used"]
        assert "discount_rate" in data["assumptions_used"]
