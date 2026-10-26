# CoverWise — Phase 2 Completion Report
## Financial Needs Calculation Engine (HLV & Net Needs)

**Project:** CoverWise  
**Team:** We4  
**Problem Statement:** Talent AP BFSI B2  
**Date:** October 26, 2026  
**Status:** ✅ PHASE 2 COMPLETE  

---

## 1. Executive Summary

Phase 2 implements the complete, mathematically audited **Financial Needs Assessment Engine** for CoverWise. The engine implements both gold-standard life insurance calculation methods:
1. **Human Life Value (HLV)**: Income-replacement approach calculating the present value of the breadwinner's economic contribution over remaining earning years.
2. **Net Needs Approach**: Obligations-based approach calculating total household liabilities, future milestone goals, living support, final expenses, and emergency buffers, minus available assets and existing coverage.

All arithmetic uses Python `Decimal` with finite, year-by-year compounding and discounting (no infinite annuity simplifications, no floating-point rounding drifts). The engine is exposed via a stateless, privacy-preserving REST API (`POST /api/v1/assessments/estimate`) and seamlessly integrated with a responsive React Stage 1 Questionnaire and Stage 2 Results & Explainability Journey.

---

## 2. Files Created and Modified

### Backend Domain & API
- [`FULL_CODE/backend/app/domain/needs.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/domain/needs.py): Pure Python domain engine containing data classes (`FinancialInputs`, `AssumptionSet`, `HLVResult`, `NetNeedsResult`, `AssessmentResult`), finite year-by-year HLV algorithm, Net Needs algorithm, goal compounding/discounting, and cover standardization.
- [`FULL_CODE/backend/app/schemas/assessment.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/schemas/assessment.py): Pydantic v2 schemas for strict input validation (`AssessmentRequest`, `DependentInput`, `GoalInput`, `LoanInput`, `AssumptionsInput`) and typed responses (`AssessmentResponse`, `HLVResponse`, `NetNeedsResponse`, `GoalDetailResponse`).
- [`FULL_CODE/backend/app/api/v1/assessment.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/api/v1/assessment.py): FastAPI assessment endpoint (`POST /api/v1/assessments/estimate`). Completely stateless; logs no raw financial records.
- [`FULL_CODE/backend/app/main.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/main.py): Mounted `assessment_router` alongside `public_router`.
- [`FULL_CODE/backend/tests/test_phase2.py`](file:///e:/TEAMID_12/FULL_CODE/backend/tests/test_phase2.py): 40 comprehensive unit & integration tests for all customer personas, boundary conditions, and API serialization.

### Frontend
- [`FULL_CODE/frontend/src/api/client.ts`](file:///e:/TEAMID_12/FULL_CODE/frontend/src/api/client.ts): Added typed API client methods (`api.estimate`) and Indian currency formatting helpers (`formatINR`, `formatINRLakhCr`).
- [`FULL_CODE/frontend/src/components/assessment/AssessmentWizard.tsx`](file:///e:/TEAMID_12/FULL_CODE/frontend/src/components/assessment/AssessmentWizard.tsx): 5-step guided questionnaire with client validation, test presets, and Simple / Expert mode toggle.
- [`FULL_CODE/frontend/src/components/assessment/AssessmentResults.tsx`](file:///e:/TEAMID_12/FULL_CODE/frontend/src/components/assessment/AssessmentResults.tsx): Stage 2 results dashboard featuring recommended sum assured, HLV vs Net Needs comparative analysis cards, itemized breakdowns, year-by-year actuarial schedule, and clear explanations.
- [`FULL_CODE/frontend/src/App.tsx`](file:///e:/TEAMID_12/FULL_CODE/frontend/src/App.tsx): Integrated the landing page, wizard, and results views into a seamless single-page application.

---

## 3. Implemented Financial Formulas & Assumptions

### A. Human Life Value (HLV)
HLV calculates the present value of income the breadwinner would have contributed to family dependents from current age $A$ until retirement age $R$:

$$\text{Remaining Years } T = \max(0, R - A)$$
$$\text{Annual Contribution Year 1 } C_1 = Y \times (1 - s)$$
$$\text{HLV Gross} = \sum_{t=1}^{T} \frac{C_1 \times (1 + g)^{t-1}}{(1 + r)^t}$$
$$\text{HLV Coverage Gap} = \max(0, \text{HLV Gross} - \text{Existing Cover})$$

Where:
- $Y$ = Gross annual income (or imputed homemaker services value)
- $s$ = Self-consumption share = $30\%$ ($0.30$)
- $g$ = Income growth rate = $6.0\%$ ($0.06$)
- $r$ = Actuarial discount rate = $7.0\%$ ($0.07$)
- $R$ = Retirement age benchmark = $60$ years

### B. Net Needs Approach
Net Needs quantifies family obligations and subtracts existing safety nets:

$$\text{Total Needs} = \text{PV}(\text{Household Living Support}) + \text{Debts} + \text{PV}(\text{Milestone Goals}) + \text{Final Expenses} + \text{Emergency Buffer}$$
$$\text{Total Resources} = \text{Liquid Savings} + \text{Market Investments} + \text{Existing Individual Cover} + \text{Employer Group Cover}^*$$
$$\text{Net Needs Gap} = \max(0, \text{Total Needs} - \text{Total Resources})$$

Where:
- **Dependency Horizon ($H$)**: Youngest child age to 25, or spouse age to 85, capped between 0 and 70 years.
- **PV Living Support**: Monthly expenses (excluding loan EMIs & insurance) multiplied by 12, reduced by deceased member's personal share (25%), compounded at general inflation (5.5%) and discounted at 7.0%.
- **Milestone Goals**: Higher education inflated at 8.0% p.a.; marriage/other goals inflated at 5.5% p.a., discounted at 7.0% p.a.
- **Emergency Buffer**: 6 months of living expenses.
- **Final Expenses**: Fixed benchmark ₹1,50,000.
- **Cover Rounding**: Final recommended sum assured rounded up to the nearest ₹5,00,000 multiple to align with real insurer policies.

---

## 4. Exact Numeric Example

**Profile:**
- Age: 35 | Retirement Age: 60 (25 remaining years)
- Annual Income: ₹12,00,000 | Monthly Expenses: ₹45,000
- Dependents: Spouse (age 32), Child (age 5)
- Debts: Home Loan principal ₹35,00,000
- Goals: Child Higher Education (₹25,00,000 in 2039)
- Existing Cover: Individual Term ₹10,00,000 | Employer GTLI ₹5,00,000
- Liquid Savings: ₹5,00,000 | Market Investments: ₹3,00,000

**Outputs Computed:**
- **Gross HLV:** ₹1,75,75,013
- **HLV Coverage Gap:** ₹1,60,75,013 (after deducting ₹15L existing cover)
- **Net Needs Obligations:**
  - PV Household Support (53-year horizon): ₹1,42,23,735
  - Outstanding Loans: ₹35,00,000
  - Child Education PV (13 yrs @ 8% infl / 7% disc): ₹28,21,368
  - Final Expenses: ₹1,50,000
  - Emergency Buffer (6 mo): ₹2,70,000
  - **Total Needs:** ₹2,09,65,103
- **Total Resources:** ₹23,00,000 (₹15L cover + ₹8L savings/investments)
- **Net Needs Gap:** ₹1,86,65,103
- **Selected Method:** Net Needs (produces the higher protection obligation)
- **Recommended Additional Coverage (Standardized):** **₹1,90,00,000 (₹1.90 Crore)**

---

## 5. API Request and Response

### Request: `POST /api/v1/assessments/estimate`
```json
{
  "age": 35,
  "annual_income_inr": 1200000,
  "monthly_household_expenses_inr": 45000,
  "dependents": [
    { "relationship": "spouse", "age": 32, "has_own_income": false },
    { "relationship": "child", "age": 5, "has_own_income": false }
  ],
  "loans": [
    { "loan_type": "Home Loan", "outstanding_principal_inr": 3500000 }
  ],
  "goals": [
    {
      "goal_type": "child_education",
      "beneficiary": "child",
      "target_amount_today_inr": 2500000,
      "target_year": 2039
    }
  ],
  "individual_life_cover_inr": 1000000,
  "employer_group_life_cover_inr": 500000,
  "liquid_savings_inr": 500000,
  "market_investments_inr": 300000
}
```

### Response: `200 OK`
```json
{
  "hlv": {
    "hlv_gross": "17575013",
    "existing_cover": "1500000",
    "hlv_coverage_gap": "16075013",
    "remaining_earning_years": 25,
    "annual_income_contribution": "840000",
    "warnings": [],
    "year_breakdown": [
      {
        "year": 1,
        "projected_income": "1200000",
        "contribution_after_consumption": "840000",
        "pv_factor": "0.934579",
        "present_value": "785047"
      }
    ]
  },
  "net_needs": {
    "pv_household_support": "14223735",
    "dependency_horizon_years": 53,
    "outstanding_loans": "3500000",
    "pv_goals": "2821368",
    "final_expenses": "150000",
    "emergency_buffer": "270000",
    "total_needs": "20965103",
    "available_assets": "800000",
    "existing_cover": "1500000",
    "total_resources": "2300000",
    "net_needs_gap": "18665103",
    "goal_details": [
      {
        "goal_type": "child_education",
        "beneficiary": "child",
        "target_amount_today_inr": "2500000",
        "target_year": 2039,
        "years_to_goal": 13,
        "inflation_rate_used": "0.08",
        "future_cost": "6799059",
        "present_value": "2821368",
        "included": true,
        "exclusion_reason": null
      }
    ],
    "warnings": []
  },
  "recommended_gap_exact": "18665103",
  "recommended_gap_rounded": "19000000",
  "recommended_method": "net_needs",
  "explanation": "The Net Needs (obligations-based) method produces the higher estimate. This means your family's specific financial obligations (household expenses, loans, goals) exceed the income-replacement value calculation.",
  "assumptions_used": {
    "retirement_age": 60,
    "self_consumption_share": "0.30",
    "income_growth_rate": "0.06",
    "discount_rate": "0.07",
    "general_inflation_pct_pa": "0.055",
    "education_inflation_pct_pa": "0.08",
    "cover_rounding_inr": "500000"
  },
  "currency": "INR",
  "warnings": []
}
```

---

## 6. Test Suite Execution & Results

Both Phase 1 and Phase 2 test suites run cleanly with **100% pass rate**:

```text
============================= test session starts =============================
platform win32 -- Python 3.10.11, pytest-9.1.1, pluggy-1.7.0
rootdir: e:\TEAMID_12\FULL_CODE\backend
collected 51 items

tests/test_phase1.py::TestHealthCheck::test_health_returns_200 PASSED    [  1%]
tests/test_phase1.py::TestHealthCheck::test_health_response_format PASSED [  3%]
tests/test_phase1.py::TestProductsEndpoint::test_products_returns_200 PASSED [  5%]
tests/test_phase1.py::TestProductsEndpoint::test_products_returns_list PASSED [  7%]
tests/test_phase1.py::TestProductsEndpoint::test_products_count_after_import PASSED [  9%]
tests/test_phase1.py::TestProductsEndpoint::test_product_fields PASSED   [ 11%]
tests/test_phase1.py::TestAdvisorsEndpoint::test_advisors_returns_200 PASSED [ 13%]
tests/test_phase1.py::TestAdvisorsEndpoint::test_advisors_filter_by_language PASSED [ 15%]
tests/test_phase1.py::TestAdvisorsEndpoint::test_advisors_filter_by_mode PASSED [ 17%]
tests/test_phase1.py::TestGoldenPremiumCalculation::test_golden_premium_exact_decimal PASSED [ 19%]
tests/test_phase1.py::TestGoldenPremiumCalculation::test_float_would_fail PASSED [ 21%]
tests/test_phase2.py::TestHLVComputation::test_normal_salaried_employee PASSED [ 23%]
tests/test_phase2.py::TestHLVComputation::test_hlv_exact_3_year_simple PASSED [ 25%]
tests/test_phase2.py::TestHLVComputation::test_hlv_g_equals_r PASSED     [ 27%]
tests/test_phase2.py::TestHLVComputation::test_hlv_g_greater_than_r PASSED [ 29%]
tests/test_phase2.py::TestHLVComputation::test_retired_customer_zero_hlv PASSED [ 31%]
tests/test_phase2.py::TestHLVComputation::test_homemaker_zero_income PASSED [ 33%]
tests/test_phase2.py::TestHLVComputation::test_existing_cover_exceeds_hlv PASSED [ 35%]
tests/test_phase2.py::TestHLVComputation::test_employer_group_cover_included PASSED [ 37%]
tests/test_phase2.py::TestHLVComputation::test_employer_group_cover_excluded PASSED [ 39%]
tests/test_phase2.py::TestNetNeedsComputation::test_normal_family_scenario PASSED [ 41%]
tests/test_phase2.py::TestNetNeedsComputation::test_no_dependents PASSED [ 43%]
tests/test_phase2.py::TestNetNeedsComputation::test_retirement_goal_excluded PASSED [ 45%]
tests/test_phase2.py::TestNetNeedsComputation::test_past_goal_excluded PASSED [ 47%]
tests/test_phase2.py::TestNetNeedsComputation::test_education_inflation_vs_general PASSED [ 49%]
tests/test_phase2.py::TestNetNeedsComputation::test_no_loans PASSED      [ 50%]
tests/test_phase2.py::TestNetNeedsComputation::test_retirement_savings_excluded_by_default PASSED [ 52%]
tests/test_phase2.py::TestNetNeedsComputation::test_retirement_savings_included_when_toggled PASSED [ 54%]
tests/test_phase2.py::TestNetNeedsComputation::test_resources_exceed_needs PASSED [ 56%]
tests/test_phase2.py::TestCombinedAssessment::test_salaried_with_dependents PASSED [ 58%]
tests/test_phase2.py::TestCombinedAssessment::test_farmer_irregular_income PASSED [ 60%]
tests/test_phase2.py::TestCombinedAssessment::test_shopkeeper_with_business_income PASSED [ 62%]
tests/test_phase2.py::TestCombinedAssessment::test_homemaker_zero_income PASSED [ 64%]
tests/test_phase2.py::TestCombinedAssessment::test_retired_customer PASSED [ 66%]
tests/test_phase2.py::TestCombinedAssessment::test_customer_without_dependents PASSED [ 68%]
tests/test_phase2.py::TestCombinedAssessment::test_customer_with_outstanding_loans PASSED [ 70%]
tests/test_phase2.py::TestCombinedAssessment::test_coverage_exceeds_needs PASSED [ 72%]
tests/test_phase2.py::TestCombinedAssessment::test_no_savings PASSED     [ 74%]
tests/test_phase2.py::TestCombinedAssessment::test_negative_inputs_rejected PASSED [ 76%]
tests/test_phase2.py::TestCombinedAssessment::test_deterministic_repeated_calculation PASSED [ 78%]
tests/test_phase2.py::TestRounding::test_round_up_to_500k PASSED         [ 80%]
tests/test_phase2.py::TestRounding::test_round_exact_multiple PASSED     [ 82%]
tests/test_phase2.py::TestRounding::test_round_zero PASSED               [ 84%]
tests/test_phase2.py::TestRounding::test_round_small_amount PASSED       [ 86%]
tests/test_phase2.py::TestAssessmentAPI::test_basic_estimate PASSED      [ 88%]
tests/test_phase2.py::TestAssessmentAPI::test_api_with_all_fields PASSED [ 90%]
tests/test_phase2.py::TestAssessmentAPI::test_api_validation_negative_income PASSED [ 92%]
tests/test_phase2.py::TestAssessmentAPI::test_api_validation_invalid_age PASSED [ 94%]
tests/test_phase2.py::TestAssessmentAPI::test_api_validation_invalid_dependent PASSED [ 96%]
tests/test_phase2.py::TestAssessmentAPI::test_api_homemaker PASSED       [ 98%]
tests/test_phase2.py::TestAssessmentAPI::test_api_response_has_assumptions PASSED [100%]

======================== 51 passed, 1 warning in 2.05s ========================
```

---

## 7. UI Functionality Completed

1. **Stage 1 Questionnaire:**
   - 5 clearly staged steps: (1) About You & Income, (2) Family & Dependents, (3) Loans & Liabilities, (4) Future Milestones, (5) Existing Safety Nets.
   - Built-in one-click demo personas: *Salaried with Family*, *Young Single*, *Homemaker*, and *Shopkeeper with Loans*.
   - Interactive fields: dynamic dependent add/remove, loan add/remove, goal add/remove.
   - Client-side validation with real-time feedback.
   - Simple / Expert mode toggle with adjustable assumptions.

2. **Stage 2 Results & Explainability:**
   - Hero banner displaying recommended sum assured formatted in Indian numbering (`₹1.90 Cr` / `₹1,90,00,000`).
   - Side-by-side comparative analysis of HLV and Net Needs methods.
   - Component itemization (Living cost PV, Outstanding loans, Inflated goals, Emergency/final expenses vs existing resources).
   - "Why this amount?" plain-language narrative explaining why Net Needs or HLV was chosen.
   - Interactive tabs: *Comparative Analysis*, *Net Needs Breakdown*, *Human Life Value (HLV)*, and *Assumptions & Policy*.
   - Expandable year-by-year actuarial income schedule.

---

## 8. Security & Privacy Checks

- **Stateless Guest Processing:** `/api/v1/assessments/estimate` does not persist customer income or asset figures to the database.
- **Log Sanitation:** Backend logs only include safe operational telemetry (`age=35`); raw financial amounts and personal details are strictly excluded from logs.
- **Pydantic Range Validation:** All numerical inputs have defined min/max bounds (e.g., age 18-100, max debt ₹100 Cr, non-negative amounts).
- **CORS Restricted:** Backend only accepts requests from explicitly configured origins (`http://localhost:5173`).
- **SQL Injection Prevention:** All queries utilize SQLAlchemy ORM with parameter binding.

---

## 9. How Team We4 Can Explain the Algorithms to Judges

1. **Why two methods instead of one?**
   - HLV measures the *economic replacement value* of the earner's future income (what the family loses without the earner).
   - Net Needs measures the *actual liabilities and goals* the family must pay (what the family must spend).
   - Taking the higher of the two prevents the classic underinsurance trap where a young earner with small debts has huge future income loss, or an older earner with huge home loans has fewer remaining earning years.

2. **Why finite year-by-year instead of the perpetuity formula ($C / r$)?**
   - Human working lives are finite ($60 - \text{age}$). Perpetuities overstate HLV by 40% to 100%.
   - Year-by-year modeling allows applying an annual growth rate ($g = 6\%$) and discount rate ($r = 7\%$) year-by-year.

3. **Why different inflation rates?**
   - General Indian CPI averages ~5.5%, but Indian higher education inflation historically runs at 8%–10%. Lumping them together understates college funding needs.

4. **Why Decimal arithmetic?**
   - Binary floats (`IEEE 754`) introduce binary representation errors in monetary subtraction (e.g. `0.1 + 0.2 != 0.3`). CoverWise exclusively uses Python `Decimal` with explicit `ROUND_HALF_UP` to the rupee.

---

## 10. Next-Phase Priorities (Phase 3)

1. **Product Recommendation & Eligibility Filter:** Match calculated coverage gap against imported Saffron Life product catalog.
2. **Rule-Based Premium Computation:** Compute exact monthly/annual premiums for term, endowment, and ULIP products based on entry age, gender, smoker status, and policy term.
3. **Interactive Plan Customizer:** Sliders for sum assured, policy term, and premium payment frequency with instant premium recalculation.
