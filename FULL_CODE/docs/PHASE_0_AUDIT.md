# CoverWise — Phase 0 Source Audit

**Team:** We4 · **Problem:** BFSI B2 · **Date:** 2026-10-26  
**Auditor:** Antigravity (AI coding assistant)  
**Status:** ✅ Complete — all files read, validated, and traced

---

## 1. Source Documents Inspected

### 1.1 Official Organizer Documents

| Document | Location | Pages/Lines | Key Content |
|---|---|---|---|
| `GUIDELINES.pdf` | `FULL_CODE/data/GUIDELINES.pdf` | 4 pages | 12 coding rules, submission checklist, ZIP structure, README skeleton |
| `ProblemStatement.pdf` | `FULL_CODE/data/ProblemStatement.pdf` | 1 page | Problem statement, student goal, expected 4-stage outcome |

### 1.2 Official B2 Data Pack

| Document | Location | Lines | Key Content |
|---|---|---|---|
| `README.md` | `FULL_CODE/data/B2_Life_Insurance_Needs_Finder/README.md` | 681 | §1-9: problem statement, data notice, file inventory, quick start, file relationships, premium rules (§6.1-6.3), data dictionary (§7), data warnings (§8), licence (§9) |
| `docs/glossary.md` | `FULL_CODE/data/B2_Life_Insurance_Needs_Finder/docs/glossary.md` | 90 | Insurance terminology, IRDAI regulatory citations |

### 1.3 Team Project Documents

| Document | Location | Lines | Key Content |
|---|---|---|---|
| `AGENTS.md` | `FULL_CODE/AGENTS.md` | 17 | 10 persistent coding-agent instructions |
| `PRD.md` | `FULL_CODE/docs/PRD.md` | 483 | 14-section PRD: sources of truth, phase 0 requirements, user journeys, financial engines, security, architecture, testing, submission |
| `ANTIGRAVITY_START_HERE.md` | `FULL_CODE/docs/ANTIGRAVITY_START_HERE.md` | 18 | Kickoff request and Phase 0 instructions |

### 1.4 Dataset Files

| File | Location (under `data/B2_.../data/`) | Rows | Size |
|---|---|---|---|
| `products.csv` | ✅ | 14 | 28 KB |
| `products.json` | ✅ | 14 | 55 KB |
| `premium_rates.csv` | ✅ | 39,588 | 1.96 MB |
| `riders.csv` | ✅ | 5 | 3.9 KB |
| `ulip_funds.csv` | ✅ | 4 | 906 B |
| `ulip_mortality_charges.csv` | ✅ | 328 | 8.1 KB |
| `customer_profiles.csv` | ✅ | 200 | 54 KB |
| `customer_profiles.json` | ✅ | 200 | 366 KB |
| `customer_goals.csv` | ✅ | 371 | 26 KB |
| `reference_assumptions.json` | ✅ | 16 values | 3.5 KB |
| `advisors.csv` | ✅ | 15 | 2.8 KB |
| `advisor_slots.csv` | ✅ | 2,201 | 161 KB |

**No missing or unreadable files.**

---

## 2. Dataset Validation Results

### 2.1 Products (14)

- **Types:** 5 Term Life, 2 Whole Life, 4 Endowment, 3 ULIP
- **CSV and JSON contain identical product_id sets:** ✅
- **SA band factors:** 11 non-ULIP products have bands (1-3 each); 3 ULIPs have none ✅
- **All `riders_allowed` reference valid rider_ids:** ✅
- **All `ulip_fund_ids` reference valid fund_ids:** ✅

### 2.2 Premium Rates (39,588)

- **Composite key:** `(product_id, premium_payment_option, entry_age, policy_term_years, gender, smoker_status)`
- **Unique keys:** 39,588 — **0 duplicates** ✅
- **Products represented:** 11 (all non-ULIP products) ✅
- **No null values in any column** ✅
- **All `product_id` values reference valid products** ✅

### 2.3 Riders (5)

| rider_id | Name | Category | Rate Basis |
|---|---|---|---|
| RDR-LUR23D | Accidental Death | other | per_1000_rider_sa |
| RDR-I0Q2E6 | Accidental Disability | other | per_1000_rider_sa |
| RDR-GRH8AS | Critical Illness | health | per_1000_rider_sa |
| RDR-XBHTE9 | Waiver of Premium | other | pct_of_base_annual_premium |
| RDR-ZG7SVA | Terminal Illness (built-in) | built_in | included_free |

- **All `available_on_product_ids` reference valid products** ✅
- **Premium caps:** health=100%, other=30% of base annual premium

### 2.4 ULIP Funds (4) and Mortality Charges (328)

- **Funds:** Equity (FMC 1.35%), Balanced (1.25%), Bond (1.0%), Money Market (0.75%)
- **Mortality charges:** Age 18-99, male/female, smoker/non_smoker — all 328 rows present ✅

### 2.5 Customer Profiles (200)

- **CSV and JSON contain identical profile_id sets** ✅
- **Employment types:** salaried_private, salaried_government, self_employed_professional, business_owner, gig_or_contract, homemaker, retired
- **Zero-income profiles:** 3 (all homemakers)
- **NRI profiles:** 2
- **Profiles without goals:** 39

### 2.6 Customer Goals (371)

- **All `profile_id` values reference valid profiles** ✅
- **`num_goals` matches actual count per profile** ✅
- **Goal types:** child_education, child_marriage, retirement, house_purchase, parents_care
- **Unique profiles with goals:** 161

### 2.7 Advisors (15) and Slots (2,201)

- **All slot `advisor_id` values reference valid advisors** ✅
- **Slot status:** 1,517 available (69%) / 684 booked (31%)
- **Date range:** 2026-10-26 to 2026-11-07 (13 unique dates)
- **All customer preferred languages covered by at least one advisor** ✅
- **Advisor languages:** Bengali, English, Gujarati, Hindi, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu, Urdu

### 2.8 Reference Assumptions (16 optional defaults)

All 16 assumptions read and documented. These are **optional team defaults**, not mandatory formulas.

---

## 3. Golden Test Verification

**Source:** B2 README §6.1 worked example

```
Product:  PRD-X4CBUF (Saffron Kesaro Term)
Customer: male, age 30, non-smoker
Config:   regular pay, 30-year term, SA ₹1,00,00,000 (1 crore)
Rider:    RDR-LUR23D (Accidental Death), rider SA ₹50,00,000

Step 1 — Rate lookup:
  premium_rates.csv row: rate_per_1000_sa_inr = 1.044 ✅

Step 2 — Base annual premium:
  SA = 10,000 × ₹1,000
  Band factor for ₹1 crore (≥₹1,00,00,000): 1.00
  Base annual = 1.044 × 10,000 × 1.00 = ₹10,440 ✅

Step 3 — Rider annual premium:
  RDR-LUR23D rate_entry_age_18_30 = 0.3
  Rider SA = 5,000 × ₹1,000
  Rider annual = 0.3 × 5,000 = ₹1,500 ✅
  Rider % of base = 1,500 / 10,440 = 14.37% (< 30% cap) ✅

Step 4 — Monthly instalments (modal_factor_monthly = 0.0875):
  Base: Decimal(10440) × Decimal(0.0875) = 913.5 → ROUND_HALF_UP → ₹914 ✅
  Rider: Decimal(1500) × Decimal(0.0875) = 131.25 → ROUND_HALF_UP → ₹131 ✅
  Total: 914 + 131 = ₹1,045 ✅

RESULT: ₹1,045/month — MATCHES official example ✅
```

**Note:** Using Python `float` arithmetic gives `10440 × 0.0875 = 913.4999...` which would round DOWN to ₹913. The `Decimal` type is mandatory for correctness.

---

## 4. Source Priority and Classification

### 4.1 Priority Order (from PRD §1.1)

1. Official Talent AP Coding Guidelines v1.1
2. Official B2 pack README.md and CSV/JSON data
3. Official B2 published problem statement
4. Team We4's PRD (design choices where organizers allow)
5. Supplied PPT as background/context

### 4.2 Classification of Requirements

| Requirement | Source | Authority |
|---|---|---|
| Premium calculation (§6.1) | B2 README | **Organizer-mandated** |
| ULIP premium rules (§6.2) | B2 README | **Organizer-mandated** |
| Eligibility rules (§6.3) | B2 README | **Organizer-mandated** |
| Income multiple caps | B2 README | **Organizer-mandated** |
| Rider constraints | B2 README + riders.csv | **Organizer-mandated** |
| Decimal ROUND_HALF_UP rounding | B2 README §6.1 | **Organizer-mandated** |
| Submission ZIP structure | Guidelines p.2 | **Organizer-mandated** |
| 12 coding rules | Guidelines pp.1-4 | **Organizer-mandated** |
| Four-stage journey | Problem Statement | **Organizer-mandated** |
| HLV formula | Team choice | **Team design decision** |
| Net Needs formula | Team choice | **Team design decision** |
| Recommendation ranking | Team choice | **Team design decision** |
| Reference assumptions usage | Optional | **Team design decision** |
| UI design and animations | Team choice | **Team design decision** |
| Language selection | Team choice | **Team design decision** |

### 4.3 Conflicts Found

**None.** The PRD explicitly defers to official sources and correctly marks all team design choices.

---

## 5. Risks and Open Items

| # | Item | Status |
|---|---|---|
| 1 | Retirement goals for self: count as death-cover? | **Team decision needed** (proposed: exclude) |
| 2 | Adult children as dependents | **Team decision needed** (proposed: exclude by default) |
| 3 | Employer group cover counting | Proposed: count (default=true), show toggle |
| 4 | Retirement savings as available assets | Proposed: don't count (default=false), show toggle |
| 5 | Homemaker replacement-services in HLV | Proposed: show separately, not in HLV |
| 6 | ULIP projection scope | Proposed: P0=eligibility+premium, P2=growth chart |
| 7 | Five-language set confirmation | Proposed: English, Telugu, Hindi, Tamil, Kannada |
| 8 | Cover rounding policy | Proposed: round up to ₹5L, show exact too |

---

## 6. Exit Criteria Status

| Criterion | Status |
|---|---|
| Every official file accounted for | ✅ |
| Counts and foreign keys validated | ✅ |
| Official premium example verified (₹1,045) | ✅ |
| Written requirement/source traceability | ✅ (this document) |
| Chosen financial-calculation policy | ✅ (see CALCULATION_POLICY.md) |
| Repo structure and local tooling documented | ✅ (Phase 1 proceeds) |
| No secrets exposed | ✅ |
