# CoverWise — Intelligent Life Insurance Needs Finder & Digital Advisory Platform

> **Talent AP Mega Hackathon 2026 — Problem Statement: BFSI B2**  
> **Team:** We4 · **Workspace:** `TEAMID_12`  
> **Target Production Release:** October 30–31, 2026  
> **Official Dataset:** Saffron Bank / Saffron Life Synthetic Insurance Data Pack

---

## 1. Project Overview

**CoverWise** is an enterprise-grade, explainable, and multi-lingual life insurance needs calculation and digital advisory platform built specifically for Saffron Bank customers. Developed by **Team We4** for the Talent AP Mega Hackathon 2026 (Problem Statement BFSI B2), CoverWise transforms the intimidating and opaque life insurance procurement process into an intuitive, transparent, and empathetic digital journey.

Rather than relying on opaque AI black boxes or aggressive sales push tactics, CoverWise puts actuarial rigor, mathematical transparency, customer autonomy, and data privacy at the core of the insurance advisory experience.

---

## 2. Problem Statement & Solution

### The BFSI B2 Challenge
In modern retail banking, life insurance under-penetration remains pervasive:
1. **Opaque Calculation:** Customers are offered arbitrary coverage multiples (e.g., "10x annual income") without considering inflation, liabilities, existing assets, or family life-stage milestones.
2. **Push Culture vs. Empathetic Advisory:** Customers fear interacting with commission-driven agents who aggressively promote high-margin endowment plans over cost-effective pure term protection.
3. **Linguistic & Accessibility Barriers:** Digital insurance calculators are overwhelmingly English-first and complex, isolating non-English-speaking Tier-2/Tier-3 customers.
4. **Data Privacy & Security:** Sensitive financial profiles (income, debt, medical flags) are frequently leaked to third-party telemarketers.

### The CoverWise Solution
CoverWise addresses each challenge with a four-pillar approach:
- **Dual Actuarial Engine:** Side-by-side Human Life Value (Income Replacement) and Net Needs Analysis (Liability & Goal-based), fully transparent with down-to-the-rupee inflation and present value schedules.
- **Empathetic Digital Journey:** Four-stage guided journey (Assessment $\to$ Coverage Needs $\to$ Product Customizer $\to$ Advisor Booking) allowing self-directed exploration without spam.
- **Five-Language Support:** Instant runtime switching across **English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), and Kannada (ಕನ್ನಡ)** with complete mathematical parity.
- **Bank-Grade Security Architecture:** HttpOnly cookie-based session tokens, double-submit CSRF defense, Argon2id password hashing, Safe Client IP rate-limiting, and strict server-side Role-Based Access Control (RBAC).

---

## 3. Main Features

- **Empathetic Financial Assessment:** Multi-step guided wizard collecting annual income, household expenses, retirement timeline, outstanding loans, existing insurance covers, and dependent milestones (child education, marriage).
- **Dual Actuarial Modeling:**
  - **Human Life Value (HLV):** Finite-horizon income replacement discounted at real net discount rates ($r_{real} = \frac{1 + r}{1 + g} - 1$).
  - **Net Needs Approach:** Comprehensive sum of immediate expenses, debt clearance, inflation-adjusted future family goals, and ongoing living maintenance, less liquid assets and existing life insurance.
- **Simple vs. Expert Mode:** Instant toggle between a clean, accessible summary view and an expert actuarial dashboard with year-by-year cash flow projections.
- **Deterministic 4-Pillar Recommendation Engine:** Scores and ranks all 14 official Saffron Life products based on Suitability, Value-for-Money, Flexibility, and Claim Solvency.
- **Dynamic Policy Customizer:** Interactive sliders for Sum Assured, Policy Term, Premium Payment Term, Payment Mode (Annual, Semi-Annual, Quarterly, Monthly), and Riders with real-time Decimal-precise premium calculations.
- **Plan Comparison Matrix:** Side-by-side modal comparing up to 3 plans across premiums, coverage, entry age, riders, and key features.
- **Transaction-Safe Advisor Booking:** Slot reservation engine backed by PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) and a database partial unique index (`ix_bookings_confirmed_slot`) preventing race conditions and double-bookings.
- **Role-Based Portals:** Specialized dashboards for **Customers** (manage appointments), **Advisors** (consultation queue and status lifecycle), and **Administrators** (anonymized system telemetry, booking metrics, and platform health).

---

## 4. Technology Stack

| Layer | Technologies | Justification |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons | Type safety, ultra-fast HMR (<350ms build time), utility-first responsive styling, and modern accessibility primitives. |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, Uvicorn | High-performance asynchronous REST API, automatic OpenAPI generation, and strict data validation contracts. |
| **ORM & Migrations** | SQLAlchemy 2.0, Alembic | Type-annotated relational queries, transactional integrity, and version-controlled schema migrations. |
| **Database** | PostgreSQL 14+ | ACID compliance, `NUMERIC(15, 2)` financial precision, and advanced partial unique indexing. |
| **Security** | Argon2id, Secure HttpOnly Cookies, Double-Submit CSRF | Bank-standard cryptographic password hashing, prevention of XSS token theft, and cross-site forgery mitigation. |
| **Testing** | pytest, pytest-asyncio, HTTPX, Node Test Runner | 97 comprehensive regression, actuarial, security, and concurrency tests. |

---

## 5. System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Tier (Browser)"]
        UI["React 18 + Vite SPA"]
        I18N["Five-Language Context (en, te, hi, ta, kn)"]
        Store["Client State (Zustand / React Context)"]
        UI --> I18N
        UI --> Store
    end

    subgraph Gateway["API & Security Boundary"]
        Proxy["Vite Proxy / Reverse Proxy (/api/v1)"]
        CookieAuth["HttpOnly Session Cookie"]
        CSRF["X-CSRF-Token Validation Header"]
        RateLimit["Safe Client IP InMemory Rate Limiter"]
        Proxy --> CookieAuth
        Proxy --> CSRF
        Proxy --> RateLimit
    end

    subgraph Server["FastAPI Backend Application"]
        Router["FastAPI REST Endpoints (/api/v1)"]
        RBAC["Server-Side RBAC Guard (customer, advisor, admin)"]
        NeedsEngine["Needs Calculation Engine (HLV & Net Needs)"]
        PricingEngine["Deterministic Premium Pricing Engine"]
        RecEngine["4-Pillar Product Recommendation Engine"]
        BookingService["Transaction-Safe Booking Service"]
        
        Router --> RBAC
        RBAC --> NeedsEngine
        RBAC --> PricingEngine
        RBAC --> RecEngine
        RBAC --> BookingService
    end

    subgraph Database["Data Tier (PostgreSQL 14+)"]
        PG[(PostgreSQL Database)]
        BookingService -- "SELECT ... FOR UPDATE" --> PG
        Router -- "SQLAlchemy 2.0 ORM" --> PG
    end

    UI -- "REST over HTTPS / Credentials: Include" --> Proxy
    Proxy --> Router
```

---

## 6. Database Architecture

CoverWise utilizes 15 relational tables categorized into **Official Source Data** (immutable catalog tables imported from the hackathon data pack) and **Application Operational Data** (transactional tables with UUID primary keys):

```
DATABASE: coverwise (PostgreSQL)
│
├── Official Source Catalog (9 Tables)
│   ├── products                 - 14 Saffron Life insurance products (term, savings, ulip, health)
│   ├── premium_rates            - 39,588 actuarial premium rate rows across age, gender, smoker, term
│   ├── riders                   - 5 optional supplementary riders (ADB, CI, WOP, Term, Hospital)
│   ├── ulip_funds               - 4 investment fund profiles with benchmark return histories
│   ├── ulip_mortality_charges   - 328 mortality rate factors by age and gender
│   ├── advisors                 - 15 licensed financial advisors with credentials and languages
│   ├── advisor_slots            - 2,201 availability windows across October/November 2026
│   ├── synthetic_profiles       - 200 benchmark customer financial profiles for instant demo
│   └── customer_goals           - 371 mapped milestones (education, marriage, property, wealth)
│
└── Application Operational Tables (6 Tables)
    ├── users                    - Authenticated accounts with Argon2id password hashes and role tags
    ├── user_sessions            - Server-side HttpOnly active session store with TTL expiry
    ├── assessment_records       - Saved customer financial profiles and calculated coverage needs
    ├── product_recommendations  - Recommendation score snapshots linked to assessments
    ├── bookings                 - Advisory appointments with strict finite state machine
    └── audit_logs               - Administrative audit trails for security and compliance
```

### Critical Concurrency Protection
To guarantee zero double-booking under concurrent load, the `bookings` table enforces a database-level partial unique index:
```sql
CREATE UNIQUE INDEX ix_bookings_confirmed_slot 
ON bookings (slot_id) 
WHERE status = 'confirmed';
```
This index guarantees that while multiple historical records (`cancelled`, `completed`) may exist for a time slot, exactly one `confirmed` appointment can exist for any given `slot_id` at any time.

---

## 7. HLV & Net Needs Explanation

### Human Life Value (HLV) — Income Replacement Method
The HLV method evaluates the economic capital value of the primary earner to their surviving family:
$$\text{HLV} = \sum_{t=1}^{N} \frac{\text{Earnings}_t \times (1 - \text{Self Expense Ratio})}{(1 + r)^t}$$
- **Earnings Projection:** Current annual income escalated at annual income growth rate $g$ (default: 8.0%).
- **Self-Maintenance Deduction:** The earner's personal consumption is deducted (default: 25.0% for 2+ dependents, 30.0% for 1 dependent).
- **Discounting:** Cash flows are discounted to present value using discount rate $r$ (default: 7.0%).
- **Working Years Remaining ($N$):** $\text{Target Retirement Age} - \text{Current Age}$.

### Net Needs Approach — Liability & Goal-Based Method
The Net Needs method calculates the immediate lump sum required to insulate the family against all debt and future commitments:
$$\text{Net Needs} = \text{Immediate Needs} + \text{Debt Payoff} + \text{Future Family Goals} + \text{Living Maintenance} - \text{Liquid Assets} - \text{Existing Life Cover}$$
- **Immediate Needs:** Emergency fund (6 months household expenses) + funeral/transition costs.
- **Debt Payoff:** Total outstanding home loans, personal loans, vehicle loans, and credit card balances.
- **Future Family Goals:** Education, marriage, and milestone funds escalated by specific goal inflation $i$ (default: 8.0%) and discounted to present value.
- **Living Maintenance:** Present value of annual household living expenses for the required dependency horizon (years until youngest child reaches age 25).
- **Existing Coverage Deductions:** Liquid savings, mutual funds, PF balance, and active life covers (GTLI, individual term) are credited against gross needs.

---

## 8. Official Synthetic Premium-Pricing Methodology

All premium pricing strictly executes the official Saffron Life actuarial rate formulation:
$$\text{Annual Base Premium} = \left(\frac{\text{Sum Assured}}{1,000}\right) \times \text{Base Rate} \times (1 - \text{Large Sum Assured Rebate})$$
$$\text{Modal Factor:} \quad \text{Annual} = 1.0, \quad \text{Semi-Annual} = 0.51, \quad \text{Quarterly} = 0.26, \quad \text{Monthly} = 0.0875$$
$$\text{Installment Premium} = \text{RoundHalfUp}\left(\text{Annual Premium} \times \text{Modal Factor}\right)$$

### Official Benchmark Verification (₹1,045 Total Monthly Premium)
CoverWise pricing has been verified against the official B2 benchmark rate row:
- **Product:** Saffron Kesaro Term (`PRD-X4CBUF`)
- **Profile:** Age 30, Male, Non-smoker, ₹1,00,00,000 (₹1 Crore) Base Life Cover
- **Policy Term:** **30-year policy term** (regular premium payment term: 30 years)
- **Payment Frequency:** Monthly (`modal_factor = 0.0875`)
- **Add-on Rider:** Saffron Kesaro Accidental Death Benefit Rider (`RDR-LUR23D`) with ₹50,00,000 (₹50 Lakh) Sum Assured (Rider Rate = 0.30 per ₹1,000 SA)

```text
CALCULATION BREAKDOWN:
Base Rate: 1.044 per 1,000 SA
Base Annual Premium: (1,00,00,000 / 1,000) * 1.044 = ₹10,440.00
Base Monthly Premium: RoundHalfUp(10,440.00 * 0.0875) = ₹914.00

Rider Rate: 0.30 per 1,000 SA
Rider Annual Premium: (50,00,000 / 1,000) * 0.30 = ₹1,500.00
Rider Monthly Premium: RoundHalfUp(1,500.00 * 0.0875) = ₹131.00

Total Monthly Premium: ₹914.00 + ₹131.00 = ₹1,045.00
```
*Validated in regression test `test_golden_premium_exact_decimal`.*

---

## 9. Recommendation Logic

CoverWise implements a fully explainable, transparent 4-pillar scoring algorithm (0 to 100 points) evaluating every eligible plan from the 14-product catalog:

| Pillar | Weight | Evaluation Criteria |
|---|---|---|
| **1. Need Suitability** | 35% | Exact alignment between plan category (Term, Savings, ULIP) and customer stated objective (pure protection, wealth accumulation, retirement). |
| **2. Value for Money** | 25% | Ratio of coverage benefit to premium cost per lakh sum assured relative to market category benchmarks. |
| **3. Flexibility & Customization** | 20% | Availability of rider add-ons (ADB, Critical Illness), multiple payment frequencies, and policy term options. |
| **4. Solvency & Claim Track Record** | 20% | Saffron Life historical claims settlement ratio (98.4%) and regulatory solvency margin (2.1x). |

Plans are filtered through strict eligibility gates (minimum/maximum entry age, maximum maturity age, minimum income, smoker acceptance) before ranking.

---

## 10. Security Architecture

CoverWise is engineered to meet commercial banking security standards:

1. **HttpOnly Session Cookies:** Session tokens are stored strictly in `HttpOnly`, `SameSite=Lax` (or `Strict`), and `Secure` cookies. JavaScript cannot access session tokens, completely thwarting token-theft via Cross-Site Scripting (XSS).
2. **Double-Submit CSRF Protection:** Mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) require an `X-CSRF-Token` header matching the client cookie, verified server-side.
3. **Argon2id Password Hashing:** User passwords are encrypted with Argon2id using recommended OWASP cryptographic memory and time cost parameters.
4. **Safe Client IP Rate Limiting:** Brute-force attacks against authentication routes are throttled per client IP address. To prevent IP spoofing, `X-Forwarded-For` headers are only inspected if the direct connection originates from a configured, trusted proxy.
5. **Server-Side Role-Based Access Control (RBAC):**
   - `customer`: Can view and manage only their own assessments and bookings.
   - `advisor`: Can view and update consultation notes only for bookings assigned specifically to their advisor profile.
   - `admin`: Accesses system-wide aggregate telemetry; sensitive customer financial records and private notes are filtered out of admin responses.
6. **No Client-Side Secrets:** Zero demo passwords or API secrets are packaged into public JavaScript bundles or localized language files.

---

## 11. Four-Stage Customer Journey

```
[ Stage 1: Assessment Wizard ]
  ├── Basic demographics (Age, Gender, Smoker Status)
  ├── Financial flows (Annual Income, Monthly Expenses)
  ├── Liabilities (Home Loans, Education Loans, Credit Cards)
  └── Family goals (Child Education, Marriage, Retirement Timeline)
         │
         ▼
[ Stage 2: Coverage Recommendation Dashboard ]
  ├── Dual Actuarial Display: HLV vs. Net Needs
  ├── Recommended Target Coverage Amount
  ├── Interactive Simple / Expert Mode Actuarial Cashflow Schedules
  └── Inflation & Discount Rate Sensitivity Controls
         │
         ▼
[ Stage 3: Product Exploration & Policy Customizer ]
  ├── 4-Pillar Recommended Plan Matches
  ├── Real-time Interactive Customizer (SA, Term, Riders, Frequency)
  ├── Dynamic Premium Recalculation with Modal Breakdown
  └── Side-by-Side Plan Comparison Matrix (up to 3 products)
         │
         ▼
[ Stage 4: Digital Advisory & Booking ]
  ├── Advisor Directory (Language, Specialization, Rating)
  ├── Live Real-time Available Slot Selection
  ├── Concurrency-Safe Confirmation
  └── Dedicated Customer & Advisor Management Portals
```

---

## 12. Local Setup & Execution

### Prerequisites
- **Python 3.10+** (64-bit)
- **Node.js 18+** & **npm**
- **PostgreSQL 14+** (running on `localhost:5432`)

### Step-by-Step Installation

```powershell
# 1. Clone repository and navigate to workspace
git clone <repository_url>
cd TEAMID_12

# 2. Configure Environment Variables
cd FULL_CODE
copy .env.example .env
# Edit .env with your local PostgreSQL password:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/coverwise
# SESSION_SECRET_KEY=generate_a_secure_random_hex_key

# 3. Backend Setup
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e ".[dev]"

# 4. Database Initialization
# In PostgreSQL CLI (psql):
# CREATE DATABASE coverwise;
alembic upgrade head

# 5. Import Official B2 Datasets
python -m scripts.import_official_data

# 6. (Optional) Seed Synthetic Demo Accounts
python -m scripts.seed_demo_accounts

# 7. Frontend Setup
cd ..\frontend
npm install

# 8. Start Development Servers
# Terminal 1 — Backend:
cd FULL_CODE\backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend:
cd FULL_CODE\frontend
npm run dev
```

The application is accessible at **`http://localhost:5173`**.  
Interactive Swagger API documentation is available at **`http://localhost:8000/docs`**.

---

## 13. Migration & Dataset Import Instructions

Database migrations and dataset loaders are fully idempotent:
```powershell
cd FULL_CODE\backend
.venv\Scripts\Activate.ps1

# Execute Alembic Migrations
alembic upgrade head

# Run Official Data Importer (reads B2 CSV datasets)
python -m scripts.import_official_data
```

**Imported Catalog Inventory:**
- Products: **14**
- Premium Rate Factor Rows: **39,588**
- Supplementary Riders: **5**
- ULIP Investment Funds: **4**
- Mortality Charge Factors: **328**
- Licensed Financial Advisors: **15**
- Availability Time Slots: **2,201**
- Benchmark Customer Profiles: **200**
- Tracked Life Goals: **371**

---

## 14. Test Instructions & Actual Results

CoverWise includes an exhaustive test suite covering actuarial precision, API validation, RBAC boundaries, rate limiting, and slot booking race conditions.

```powershell
cd FULL_CODE\backend
.venv\Scripts\Activate.ps1
pytest -v
```

### Verified Test Run: 97/97 Passing Tests (100% Pass Rate)
```text
============================= test session starts =============================
platform win32 -- Python 3.10.11, pytest-8.3.4, pluggy-1.5.0
cachedir: .pytest_cache
rootdir: e:\TEAMID_12\FULL_CODE\backend
plugins: anyio-4.8.0, asyncio-0.25.3
collected 97 items

tests/test_phase1.py ...........                                         [ 11%]
tests/test_phase2.py ...........................................         [ 55%]
tests/test_phase3.py ....................                                [ 76%]
tests/test_phase4.py .............                                       [ 89%]
tests/test_phase5.py ...........                                         [100%]

============================= 97 passed in 6.64s ==============================
```

---

## 15. AI Tools Used & Team Contributions

### AI Tools Utilized
- **Google Antigravity / Gemini:** Utilized as an intelligent pair programming assistant for boilerplate generation, test case expansion, localized translation verification, and architecture documentation.
- **Strictly No External AI Runtime Dependencies:** All runtime calculations (HLV, Net Needs, premium rates, product scoring) are 100% deterministic, transparent Python algorithms executing locally without third-party LLM APIs.

### Team We4 Contributions
- **Actuarial Modeling & Mathematics:** Formalized HLV income replacement and Net Needs present-value formulations with inflation and discounting schedules.
- **Full-Stack Engineering:** Developed FastAPI REST contracts, PostgreSQL schema with partial indexes, and React TypeScript frontend with 5-language accessibility.
- **Security Hardening:** Implemented HttpOnly cookie management, Double-Submit CSRF, rate limiters, and RBAC gatekeepers.
- **Quality Assurance:** Authored 97 automated regression tests and verified zero secret leakage in production builds.

---

## 16. Pre-Developed Work Disclosure

- **Project Planning & Ideation:** Architecture design, problem analysis, and PRD specifications were outlined prior to Day 1.
- **Open-Source Foundations:** Relies on standardized open-source libraries (FastAPI, React, Vite, Tailwind CSS, SQLAlchemy, Pydantic, Alembic).
- **Zero Proprietary Code Reuse:** 100% of the application source code, API routes, calculation engines, and UI components were written exclusively for the Talent AP Mega Hackathon 2026.

---

## 17. Prototype Limitations

1. **Fictional Entity Scope:** Saffron Bank and Saffron Life are synthetic entities created for the hackathon.
2. **Advisory Simulation:** The digital advisory module facilitates calendar appointment booking and consultation management; it does not host integrated WebRTC video calls.
3. **Underwriting Assumptions:** Health and medical risk factors (BMI, medical history) are not simulated, reflecting the structure of the official hackathon synthetic rate tables.
4. **Tax Modeling:** Tax deductions under Section 80C and Section 10(10D) are noted for informational reference but are not dynamically computed across state tax jurisdictions.
5. **Fixed Calendar Window:** Advisor availability slots reflect the official hackathon snapshot period (October–November 2026).

---

## 18. Synthetic-Data & Non-Binding Quote Disclaimer

> **IMPORTANT REGULATORY DISCLAIMER:**  
> CoverWise is a hackathon prototype developed solely for educational and competitive demonstration purposes for the **Talent AP Mega Hackathon 2026**.  
> 
> All bank names, insurance products, premium schedules, advisor credentials, and customer profiles are **purely synthetic and fictional**. Products referenced are not registered with or approved by the Insurance Regulatory and Development Authority of India (IRDAI).  
> 
> Calculations and recommendations generated by CoverWise are illustrative estimations and do **NOT** constitute binding insurance offers, legal underwriting commitments, or certified financial advice.

---
*CoverWise — Developed with precision by Team We4 for Talent AP Mega Hackathon 2026.*
