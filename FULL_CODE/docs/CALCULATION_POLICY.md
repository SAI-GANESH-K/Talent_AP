# CoverWise — Calculation Policy

**Team:** We4 · **Problem:** BFSI B2 · **Date:** 2026-10-26  
**Status:** FROZEN — Do not change formulas without explicit team approval and updated regression tests.

> **Important:** The formulas in this document are **team design choices**, not official organizer requirements. The B2 data pack explicitly states it "adds no requirements, deliverables, formulas, metrics or scoring of its own." Premium pricing, rider rules, eligibility constraints, and ULIP rules are **organizer-mandated** and documented in the B2 README §6.1–6.3; they are not repeated here in full but are implemented exactly as specified.

---

## 1. Human Life Value (HLV) — Team-Defined

### 1.1 Purpose

Estimate the present value of future income that the insured's family would lose over their remaining working life, after deducting the insured's personal consumption.

### 1.2 Formula

```
Inputs:
  I     = annual_income_inr (customer's gross annual income)
  c     = self_consumption_share (fraction, default 0.30)
  g     = income_growth_rate (fraction, from customer's expected_income_growth_pct
          or default 0.06)
  r     = discount_rate (fraction, default 0.07 from post_tax_return_on_payout_pct_pa)
  age   = customer's current age
  R     = retirement_age (default 60)
  n     = max(0, R - age)  — remaining earning years

HLV_gross = Σ[t=1..n] ( I × (1 - c) × (1 + g)^(t-1) ) / (1 + r)^t

When g ≠ r, this simplifies to:
  HLV_gross = I × (1 - c) / (1 + g)
              × ( (1 + g) / (1 + r) )
              × ( 1 - ((1 + g) / (1 + r))^n ) / ( 1 - (1 + g) / (1 + r) )

When g = r:
  HLV_gross = I × (1 - c) × n / (1 + r)

Always compute term-by-term with Decimal to avoid floating-point accumulation errors.
```

### 1.3 Coverage Gap

```
existing_cover = individual_life_cover_inr
               + (employer_group_life_cover_inr  IF count_employer_group_cover)

HLV_coverage_gap = max(0, HLV_gross - existing_cover)
```

### 1.4 Edge Cases

| Case | Behavior |
|---|---|
| `n = 0` (age ≥ retirement_age) | HLV_gross = 0. Net Needs may still apply. |
| Zero income (homemaker) | HLV_gross = 0 from income method. Show replacement-services estimate separately (not added to HLV) using `homemaker_services_value_annual_inr × dependency_horizon`. |
| Irregular income (gig/seasonal) | Use customer-entered annualized income. Disclose uncertainty. |
| `g ≥ r` | Sum diverges in closed form — compute term-by-term. |
| Existing cover > HLV_gross | HLV_coverage_gap = 0. Do not show negative. |

### 1.5 Assumptions Exposed to User

- `retirement_age` (default 60, adjustable)
- `self_consumption_share` (default 30%, adjustable in Expert Mode)
- `income_growth_rate` (from profile or default 6%)
- `discount_rate` (default 7%)
- `count_employer_group_cover` (default true, togglable)

---

## 2. Net Needs Approach — Team-Defined

### 2.1 Purpose

Estimate the total financial obligations the family would face if the insured died today, minus the resources already available.

### 2.2 Formula

```
=== NEEDS SIDE ===

1. Present Value of Future Household Support:
   E_annual = monthly_household_expenses × 12
   E_family = E_annual × (1 - household_expense_share_of_deceased_pct)
   i = general_inflation_pct_pa (default 5.5%)
   r = discount_rate (default 7.0%)
   H = dependency_horizon_years

   PV_household = Σ[t=1..H] ( E_family × (1 + i)^(t-1) ) / (1 + r)^t

   dependency_horizon = max across:
     - youngest child: (child_dependency_end_age - child_age) years
     - spouse without income: (life_expectancy_age - spouse_age) years
     - dependent parents: (life_expectancy_age - parent_age) years
     If no dependents: H = 0, PV_household = 0

2. Outstanding Loan Principal (one-time):
   loans = Σ outstanding_principal for all active loans
   (home_loan + car_loan + personal_loan + education_loan)
   NOTE: Loan EMIs are EXCLUDED from monthly_household_expenses per B2 data
   dictionary, so adding principal here does NOT double-count.

3. Present Value of Future Goals:
   For each goal:
     inflation = education_inflation (8%) for child_education goals
               = general_inflation (5.5%) for all others
     years_to_goal = target_year - current_year
     future_cost = target_amount_today × (1 + inflation)^years_to_goal
     PV_goal = future_cost / (1 + r)^years_to_goal

   EXCLUSION: Goals where beneficiary = "self" AND goal_type = "retirement"
   are excluded from death-cover needs. Shown separately as informational.

   PV_goals = Σ PV_goal (for included goals only)

4. Final Expenses (one-time):
   final_expenses = final_expenses_inr (default ₹1,50,000)

5. Emergency Buffer (one-time):
   emergency = monthly_household_expenses × emergency_fund_months (default 6)

Total_needs = PV_household + loans + PV_goals + final_expenses + emergency


=== RESOURCES SIDE ===

available_assets = liquid_savings_inr
                 + market_investments_inr
                 + (retirement_savings_inr  IF count_retirement_savings)

existing_cover = individual_life_cover_inr
               + (employer_group_life_cover_inr  IF count_employer_group_cover)

Total_resources = available_assets + existing_cover


=== NET NEEDS GAP ===

NetNeeds_gap = max(0, Total_needs - Total_resources)
```

### 2.3 Anti-Double-Counting Rules

| Risk | Mitigation |
|---|---|
| Loan EMI in household expenses | B2 data dictionary states `monthly_household_expenses_inr` **excludes** loan EMIs and insurance premiums. Adding principal separately is correct. |
| Existing cover counted twice | Deducted only once in Total_resources. Not deducted from individual need components. |
| Retirement goal as death cover | Goals with `beneficiary=self, goal_type=retirement` excluded from death-cover needs. |
| Employer group cover reliability | Controlled by `count_employer_group_cover` toggle (default true). Disclosure: group cover typically ends when employment ends. |
| Retirement savings availability | Controlled by `count_retirement_savings` toggle (default false). EPF/PPF/NPS may be illiquid. |

### 2.4 Edge Cases

| Case | Behavior |
|---|---|
| No dependents | PV_household = 0. Loans + goals + final expenses may still produce a need. |
| No loans | loans = 0 |
| No goals | PV_goals = 0 |
| Zero income, homemaker | Net Needs still computed from family expenses and goals. Eligibility is a separate check. |
| All resources > total needs | NetNeeds_gap = 0. Customer may not need more cover. |
| Negative years_to_goal | Goal already past. Exclude from calculation. |

### 2.5 Assumptions Exposed to User

- `general_inflation_pct_pa` (default 5.5%)
- `education_inflation_pct_pa` (default 8.0%)
- `discount_rate` (default 7.0%)
- `household_expense_share_of_deceased_pct` (default 25%)
- `child_dependency_end_age` (default 25)
- `life_expectancy_age` (default 85)
- `emergency_fund_months` (default 6)
- `final_expenses_inr` (default ₹1,50,000)
- `count_employer_group_cover` (default true)
- `count_retirement_savings` (default false)

---

## 3. Combining Estimates — Team-Defined

### 3.1 Policy

1. Compute **both** HLV_coverage_gap and NetNeeds_gap independently.
2. Display both to the user with full itemized breakdowns.
3. **Recommended additional coverage = max(HLV_coverage_gap, NetNeeds_gap)**.
4. If `cover_rounding_inr` > 0 (default ₹5,00,000): round UP to next multiple. Always show exact unrounded value alongside.
5. Zero gap remains zero — never force a recommendation.
6. Show which method produced the larger estimate and explain why.

### 3.2 Rationale

The higher of the two methods provides a conservative (i.e., more protective) recommendation. This is a common financial planning approach. Displaying both gives the user transparency into both income-replacement and needs-based perspectives.

---

## 4. Arithmetic Policy

### 4.1 Mandatory Rules (from B2 README §6.1)

- All premium calculations use Python `decimal.Decimal` type.
- Rounding to nearest rupee uses `ROUND_HALF_UP`.
- Base instalment and each rider instalment are rounded **separately**, then summed.
- Single-pay premium: rounded once, no modal factor.

### 4.2 Team Rules (for needs calculations)

- HLV and Net Needs computed with `Decimal` for monetary values.
- Intermediate present-value computations maintain at least 6 decimal places.
- Final coverage gap rounded only for display (`cover_rounding_inr`); unrounded value stored and used for eligibility matching.
- Indian number formatting (lakh/crore) for display; canonical storage in INR integers or Decimal.

---

## 5. Product Recommendation Ranking — Team-Defined

### 5.1 Pipeline

1. **Hard gate (mandatory):** Eliminate all products failing eligibility rules (B2 §6.3). Return machine-readable rejection reasons.
2. **Coverage fit score:** `min(1, product_max_SA / recommended_gap)` — how much of the gap can this product cover?
3. **Affordability score:** `1 - min(1, monthly_premium / monthly_budget)` — higher is more affordable.
4. **Type fit:**
   - Protection need primary → prefer Term Life
   - Savings goals declared + medium/high risk → consider Endowment/ULIP (with disclosures)
   - Low risk appetite → prefer non-linked products
5. **Feature fit:** Tenure matches preference, desired riders available.
6. **Composite score:** Weighted sum (coverage 40%, affordability 30%, type fit 20%, feature fit 10%).
7. **Stable tie-break:** Product ID alphabetical for deterministic ordering.

### 5.2 Rules

- Only eligible products are ranked. Ineligible products return rejection reasons.
- Budget shortfall is shown explicitly, not hidden.
- Zero coverage gap → "You appear adequately covered" with option to explore plans anyway.
- No eligible product → honest "No product matches your criteria" with advisor referral.
- No commission-biased placement. No opaque AI scoring.
- Identical inputs produce identical outputs (deterministic).

---

## 6. Change Control

Any modification to the formulas, assumptions, or ranking weights in this document requires:

1. Explicit team approval documented in a commit message.
2. Updated regression tests verifying the change.
3. Updated version note at the top of this file.

Do not silently change calculation behavior after this policy is frozen.
