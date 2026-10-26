# CoverWise — Phase 2 Completion Report

> **Team We4 · Talent AP Mega Hackathon 2026 · BFSI B2**  
> Completed: 2026-10-26

## Status: PHASE 2 COMPLETE ✅

The **Financial Needs Calculation Engine** (Human Life Value & Net Needs Approach) is fully implemented, mathematically audited, tested with 51/51 passing unit tests, and integrated into the live React application.

---

## What Was Built

### 1. Backend Domain & Calculation Engine

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| Domain Engine | [`needs.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/domain/needs.py) | Complete | Finite year-by-year HLV, Net Needs, goal compounding, cover rounding, Decimal precision |
| API Schemas | [`assessment.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/schemas/assessment.py) | Complete | Strict Pydantic v2 schemas for inputs, dependents, goals, loans, and assumptions |
| Assessment API | [`assessment.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/api/v1/assessment.py) | Complete | `POST /api/v1/assessments/estimate` — stateless, privacy-preserving, no guest data logged |
| Router Registry | [`main.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/main.py) | Complete | Mounted `assessment_router` alongside `public_router` |

### 2. Frontend Assessment Journey (React + Vite + TypeScript)

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| API Client | [`client.ts`](file:///e:/TEAMID_12/FULL_CODE/frontend/src/api/client.ts) | Complete | Typed `api.estimate()` method + Indian notation formatters (`formatINR`, `formatINRLakhCr`) |
| Stage 1: Wizard | [`AssessmentWizard.tsx`](file:///e:/TEAMID_12/FULL_CODE/frontend/src/components/assessment/AssessmentWizard.tsx) | Complete | 5-step questionnaire, 4 one-click test personas, client validation, Simple/Expert mode |
| Stage 2: Results | [`AssessmentResults.tsx`](file:///e:/TEAMID_12/FULL_CODE/frontend/src/components/assessment/AssessmentResults.tsx) | Complete | Hero badge, comparative cards (HLV vs Net Needs), goal inflation table, actuarial schedule |
| App Shell | [`App.tsx`](file:///e:/TEAMID_12/FULL_CODE/frontend/src/App.tsx) | Complete | Seamless transitions: Landing Page ↔ Questionnaire ↔ Assessment Results |

---

## Mathematical Implementation & Assumptions

### A. Human Life Value (HLV)
- **Concept:** Present value of breadwinner's economic contribution over remaining earning years.
- **Formula:** 
  $$\text{HLV Gross} = \sum_{t=1}^{T} \frac{\text{Annual Contribution} \times (1 + g)^{t-1}}{(1 + r)^t}$$
- **Assumptions:**
  - Remaining earning horizon $T = \max(0, 60 - \text{Age})$
  - Self-consumption share $s = 30\%$ (deducted before compounding)
  - Income growth $g = 6.0\%$ p.a.
  - Actuarial discount rate $r = 7.0\%$ p.a.
  - Coverage gap = $\max(0, \text{HLV Gross} - \text{Existing Cover})$

### B. Net Needs Approach
- **Concept:** Itemized family obligations minus available financial safety nets.
- **Formula:** 
  $$\text{Total Needs} = \text{PV}(\text{Living Support}) + \text{Debts} + \text{PV}(\text{Goals}) + \text{Final Expenses} + \text{Emergency Buffer}$$
  $$\text{Net Needs Gap} = \max(0, \text{Total Needs} - \text{Total Resources})$$
- **Assumptions:**
  - Living Support horizon: Younger child to 25 or spouse to 85.
  - Monthly expenses exclude loan EMIs and insurance premiums. Deceased member's personal share (25%) deducted.
  - Higher education inflation: **8.0% p.a.** vs General household inflation: **5.5% p.a.**
  - Final expenses: ₹1,50,000 | Emergency buffer: 6 months expenses.
  - Recommended sum assured: Standardized up to nearest ₹5,00,000 multiple.

---

## Live Calculation Example (Verified in Engine & UI)

**Customer Inputs (Salaried with Family):**
- Age: 35 | Retirement Age: 60 (25 remaining years)
- Annual Income: ₹12,00,000 | Monthly Living Expenses: ₹45,000
- Dependents: Spouse (age 32), Child (age 5)
- Debts: Home Loan principal ₹35,00,000
- Milestone Goals: Child Higher Education (₹25,00,000 in 2039)
- Existing Safety Nets: Individual Life Cover ₹10,00,000 + Employer GTLI ₹5,00,000
- Liquid Assets: Savings ₹5,00,000 + Mutual Funds ₹3,00,000

**Exact Computed Outputs:**

| Metric | Amount (INR) | Formatted | Notes |
|--------|--------------|-----------|-------|
| **Gross HLV** | ₹1,75,75,013 | ₹1.76 Cr | 25-yr income replacement at 7% disc / 6% growth |
| **HLV Coverage Gap** | ₹1,60,75,013 | ₹1.61 Cr | After deducting ₹15L existing cover |
| **PV Living Support** | ₹1,42,23,735 | ₹1.42 Cr | 53-year horizon discounted at 7% |
| **Outstanding Debts** | ₹35,00,000 | ₹35.00 Lakh | Home loan payoff |
| **Child Education PV** | ₹28,21,368 | ₹28.21 Lakh | Inflated at 8% to ₹67.99L, discounted to PV |
| **Emergency + Final** | ₹4,20,000 | ₹4.20 Lakh | 6 mo living buffer (₹2.70L) + final expenses (₹1.50L) |
| **Total Needs** | ₹2,09,65,103 | ₹2.10 Cr | Total family obligations |
| **Total Resources** | ₹23,00,000 | ₹23.00 Lakh | ₹15L cover + ₹8L liquid savings & investments |
| **Net Needs Gap** | ₹1,86,65,103 | ₹1.87 Cr | Net obligations deficit |
| **Driver Method** | **Net Needs** | — | Obligations exceed pure income replacement |
| **Recommended Cover** | **₹1,90,00,000** | **₹1.90 Cr** | Standardized up to nearest ₹5 Lakh multiple |

---

## Tests (51/51 Passing)

```text
============================= test session starts =============================
platform win32 -- Python 3.10.11, pytest-9.1.1, pluggy-1.7.0
rootdir: e:\TEAMID_12\FULL_CODE\backend
plugins: anyio-4.15.1, asyncio-1.4.1
collected 51 items

tests/test_phase1.py::TestHealthCheck::test_health_returns_200 PASSED    [  1%]
tests/test_phase1.py::TestHealthCheck::test_health_response_format PASSED [  3%]
tests/test_phase1.py::TestProductsEndpoint::test_products_returns_200 PASSED [  5%]
tests/test_phase1.py::TestProductsEndpoint::test_products_returns_list PASSED [  7%]
tests/test_phase1.py::TestProductsEndpoint::test_products_count_after_import PASSED [  9%]
tests/test_phase1.py::TestProductFields::test_product_fields PASSED      [ 11%]
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

## Running the Application

```powershell
# 1. Start Backend Server (from FULL_CODE/backend/)
.venv\Scripts\uvicorn.exe app.main:app --port 8000 --reload

# 2. Start Frontend Server (from FULL_CODE/frontend/)
npm run dev

# 3. Run Pytest Suite (from FULL_CODE/backend/)
.venv\Scripts\pytest.exe tests -v
```

- **Frontend Application:** http://localhost:5173
- **FastAPI Interactive Docs:** http://localhost:8000/docs
- **Assessment API Endpoint:** `POST http://localhost:8000/api/v1/assessments/estimate`

---

## GitHub Repository & Checkpoint

- **Repository:** `https://github.com/SAI-GANESH-K/Talent_AP.git`
- **Branch:** `main` (tracked to `origin/main`)
- **Commit:** `d2d5685` — *feat(phase2): complete financial needs calculation engine and assessment journey*

---

## Next Steps — Phase 3 Priorities

1. **Product Recommendation & Matching:** Match the calculated coverage gap (e.g. ₹1.90 Cr) against imported Saffron Life products (`products` table).
2. **Rule-Based Premium Engine:** Compute exact age/gender/smoker-band premiums using `premium_rates` table with decimal precision.
3. **Interactive Plan Customizer:** Sliders for coverage sum assured, policy term, and payment frequencies with instant premium recalculation.
