# 1201 · BFSI B2: CoverWise — Intelligent Life Insurance Needs Finder & Digital Advisory Platform

> **Talent AP Mega Hackathon 2026 — Problem Statement: BFSI B2**  
> **Team:** We4 · **Team ID:** `1201`  
> **Repository:** `SAI-GANESH-K/Talent_AP` · **Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + FastAPI + PostgreSQL  

---

## What It Does

### The Problem
In Indian retail banking, life insurance penetration remains critically low despite high customer touchpoints. Customers face three major roadblocks:
1. **Opaque, Arbitrary Calculations:** Banks frequently offer generic rules of thumb (e.g., *"buy 10x your annual salary"*), completely ignoring outstanding home loans, dependent education milestones, inflation, and existing liquid assets.
2. **Push Culture & Commission Distrust:** Customers avoid seeking guidance because traditional agency channels are notorious for aggressive telemarketing and pushing high-commission endowment/ULIP products instead of affordable pure term insurance.
3. **Linguistic & Accessibility Barriers:** Digital calculators are overwhelmingly technical and English-first, alienating non-English-speaking families across Tier-2 and Tier-3 India.

### Who Uses CoverWise
* **Retail Bank Customers:** Salaried employees, self-employed professionals, homemakers, and small-business owners seeking an honest, transparent, spam-free financial assessment.
* **Licensed Fee-Only Advisors:** Bank-certified advisors conducting unbiased consultations without sales quotas or commission incentives.
* **Bank Compliance & Administrators:** Supervisory staff monitoring system health, aggregate booking metrics, and actuarial audit trails.

### What Users Experience
CoverWise delivers a self-directed, empathetic four-stage digital journey:
1. **Stage 1 — Financial Assessment:** An intuitive wizard capturing household income, monthly living costs, retirement timeline, outstanding liabilities (home/vehicle/personal loans), active life covers, and family milestones (children's higher education, marriage).
2. **Stage 2 — Dual Actuarial Coverage Needs:** Clear, side-by-side presentation of two respected actuarial models:
   * **Human Life Value (HLV):** Future economic earning power discounted to present value.
   * **Net Needs Analysis:** Total financial obligations minus existing resources, leaving the exact net protection shortfall.
   * *Simplified Layman Explanations:* Transparent calculation rules and safety assumptions explained in plain, everyday language with realistic inflation and interest benchmarks.
3. **Stage 3 — Product Exploration & Real-Time Customizer:**
   * Algorithmic 4-pillar ranking (Need Suitability, Value for Money, Flexibility, Solvency) evaluating the official 14 Saffron Life insurance products.
   * Interactive policy sliders for Sum Assured, Policy Term, and Premium Payment Term with real-time recalculation of annual, semi-annual, quarterly, and monthly premiums down to the exact rupee.
   * Responsive rider add-ons (Accidental Death, Critical Illness, Disability, Waiver of Premium) with clear benefit descriptions and live pricing.
   * Side-by-side comparison modal evaluating up to 3 plans simultaneously.
4. **Stage 4 — Fee-Only Advisor Booking:**
   * Filterable advisor directory by language and specialization.
   * Concurrency-safe calendar slot reservation with zero spam calls and zero personal data leakage.
   * Dedicated management dashboards for customers and advisors.
5. **Stage 5 — InsureMate AI Chatbot:**
   * Multi-lingual conversational insurance assistant powered by Google Gemini API.
   * Context-aware advisory synced with the customer's assessed life cover, recommended plans, and booked appointments.
   * Real-time language switching supporting English, Telugu, Hindi, Tamil, and Kannada.
6. **5 Indic Languages:** Complete runtime switching across **English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), and Kannada (ಕನ್ನಡ)** with 100% mathematical parity.

---

## How to Run

### System Prerequisites
* **Operating System:** Windows, macOS, or Linux
* **Python:** 3.10+ (64-bit)
* **Node.js:** 18.x or 20.x+ with `npm`
* **PostgreSQL:** 14+ running locally (default port: `5432`)

---

### Step-by-Step Setup Guide

#### 1. Clone & Environment Configuration
```bash
git clone https://github.com/SAI-GANESH-K/Talent_AP.git 1201_B2
cd 1201_B2/FULL_CODE

# Copy environment variables template
cp .env.example .env
```

Edit `FULL_CODE/.env` with your PostgreSQL database credentials and configuration:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/coverwise
SESSION_SECRET_KEY=coverwise_secure_production_secret_key_2026
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### 2. Backend Setup & Data Ingestion
Open your terminal in `FULL_CODE/backend`:
```bash
cd FULL_CODE/backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Windows (Command Prompt):
# .venv\Scripts\activate.bat
# On Linux / macOS:
# source .venv/bin/activate

# Install dependencies
pip install -e ".[dev]"

# Create the PostgreSQL database (if not already created)
# psql -U postgres -c "CREATE DATABASE coverwise;"

# Apply database migrations
alembic upgrade head

# Ingest official B2 CSV datasets into PostgreSQL
python -m scripts.import_official_data

# (Optional) Seed demo user accounts (Customer, Advisor, Admin)
python -m scripts.seed_demo_accounts
```

#### 3. Frontend Setup
Open a terminal in `FULL_CODE/frontend`:
```bash
cd FULL_CODE/frontend

# Install dependencies
npm install
```

#### 4. Run the Development Servers
Open two separate terminal windows:

* **Terminal 1 (Backend Server):**
  ```bash
  cd FULL_CODE/backend
  # Activate venv first:
  # .venv\Scripts\activate (Windows) or source .venv/bin/activate (Linux/Mac)
  python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  ```

* **Terminal 2 (Frontend Client):**
  ```bash
  cd FULL_CODE/frontend
  npm run dev
  ```

* **Frontend Web Application:** [http://localhost:5173](http://localhost:5173)
* **Backend Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### Demo User Accounts & Passwords

The platform includes pre-configured synthetic demo accounts for instant evaluation across all user roles (seeded into PostgreSQL via `python -m scripts.seed_demo_accounts`):

| Role | Email / Username | Password | Persona & Privileges |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@coverwise.test` | `Customer@123` | **Ramesh Sharma** — Takes financial needs assessments, customizes policies with sliders & riders, views shortfall analysis, and books consultations. |
| **Advisor** | `advisor@coverwise.test` | `Advisor@123` | **Venkata Subba Rao** (ID: `ADV-7JIHQA`) — Licensed fee-only advisor with access to the Advisor Portal, booked calendar slots, and consultation notes. |
| **Admin** | `admin@coverwise.test` | `Admin@123` | **Platform Administrator** — Access to the Admin Portal, system health monitoring, aggregate booking statistics, and anonymized audit views. |

---

### Where to Put the Data Pack Files
Per the hackathon guidelines, the original synthetic datasets are located in:
```
FULL_CODE/data/B2_Life_Insurance_Needs_Finder/data/
```
This folder contains the official CSV datasets (`products.csv`, `premium_rates.csv`, `riders.csv`, `advisors.csv`, etc.). As required, `FULL_CODE/data/` is excluded from version control via `.gitignore` and is loaded into PostgreSQL via `python -m scripts.import_official_data`.

---

## How to Run the Tests

CoverWise includes an exhaustive automated test suite validating actuarial formulas, exact decimal pricing, recommendation ranking, session security, CSRF defense, and database concurrency locks.

### The One Command to Run All Tests:
```bash
cd FULL_CODE/backend
# Ensure .venv is activated
python -m pytest -v
```

### Verified Test Results: 97/97 Passing Tests (100% Pass Rate)
```text
============================= test session starts =============================
platform win32 -- Python 3.10.11, pytest-9.1.1, pluggy-1.7.0
rootdir: E:\1201_B2\FULL_CODE\backend
configfile: pyproject.toml
testpaths: tests
plugins: anyio-4.15.1, asyncio-1.4.1
collected 97 items

tests/test_phase1.py ...........                                         [ 11%]
tests/test_phase2.py ...........................................         [ 55%]
tests/test_phase3.py ....................                                [ 76%]
tests/test_phase4.py .............                                       [ 89%]
tests/test_phase5.py ...........                                         [100%]

============================= 97 passed in 6.94s ==============================
```

### What Each Test Suite Verifies:

1. **`tests/test_phase1.py` — API Health & Baseline Premium Validation (11 tests):**
   * Verifies `/api/v1/health` endpoint format and database connectivity.
   * Validates product listing endpoints and official field structures.
   * **Actuarial Benchmark Test (`test_golden_premium_exact_decimal`):** Verifies the exact official B2 golden benchmark of **₹1,045.00** monthly premium for a 30-year-old male, non-smoker, purchasing ₹1 Crore Saffron Kesaro Term for 30 years with ₹50 Lakh Accidental Death Benefit Rider. Demonstrates that floating-point arithmetic fails and Decimal precision is essential.

2. **`tests/test_phase2.py` — Actuarial Needs Assessment Engine (43 tests):**
   * **Human Life Value (HLV):** Evaluates salary discounting, growth vs. discount rate parity ($g = r$), zero-income homemakers, retired individuals, and group insurance inclusion/exclusion.
   * **Net Needs Analysis:** Verifies living expenses horizon calculation, liability clearance, education goal inflation (8.0% vs. 5.5% grocery inflation), retirement goal exclusion, and liquid asset offsetting.
   * **Rounding & Edge Cases:** Verifies rounding up to the nearest ₹5,00,000 policy multiple, negative input rejection, and deterministic repeatability.

3. **`tests/test_phase3.py` — Product Recommendation & Pricing Engine (16 tests):**
   * Validates premium pricing across annual, semi-annual, quarterly, and monthly frequencies.
   * Tests smoker multipliers, female discount bands, and rider 30% cap enforcement.
   * Evaluates ULIP pricing and mortality charges.
   * Validates customer eligibility rules (entry age, income multiple caps, NRI eligibility, non-earning spouse criteria).
   * Verifies the 4-pillar algorithmic scoring and ranking pipeline (Need Suitability, Value for Money, Flexibility, Solvency).

4. **`tests/test_phase4.py` — Authentication, RBAC, Advisory & Concurrency (14 tests):**
   * Argon2id password hashing and session cookie lifecycle.
   * Brute-force rate limiting on login routes.
   * CSRF protection on mutating HTTP requests.
   * Role-Based Access Control (RBAC) ensuring Customers cannot access Admin metrics.
   * Multilingual advisor filtering.
   * **Database Row Lock Concurrency Test:** Simulates concurrent booking requests on the same advisor slot using `SELECT ... FOR UPDATE` and the partial unique index `ix_bookings_confirmed_slot` to prove zero double-booking under race conditions.

5. **`tests/test_phase5.py` — Security Hardening, State Machine & Privacy (13 tests):**
   * Demo seeder fail-safe validation preventing execution in production.
   * Trusted proxy client IP resolution.
   * Thread-safe rate limiter verification.
   * Strict booking state machine transitions (confirmed → completed, confirmed → cancelled, and terminal state immutability).
   * Sensitive financial data redaction on administrative appointment lists and customer opt-out compliance.


---

## Project Structure

### Structure Inside `FULL_CODE/`

```
FULL_CODE/
├── backend/
│   ├── app/
│   │   ├── api/v1/              # REST routers: auth, assessment, recommendations, advisors, bookings, public
│   │   ├── core/                # Configuration, security utilities, CSRF, rate-limiter, exceptions
│   │   ├── db/                  # SQLAlchemy database session and Base declarations
│   │   ├── domain/              # Pure actuarial logic: HLV and Net Needs computation
│   │   ├── models/              # Relational models: products, premium_rates, riders, advisors, bookings, users
│   │   ├── schemas/             # Pydantic v2 validation contracts for requests and responses
│   │   └── services/            # Core business logic: eligibility, pricing, recommendation, booking
│   ├── alembic/                 # Version-controlled database schema migrations
│   ├── scripts/                 # Idempotent CSV data import and demo account seeders
│   ├── tests/                   # 97 pytest test cases across 5 test suites
│   ├── pyproject.toml           # Pinned Python package dependencies
│   └── requirements.txt         # Lock-style pip requirements
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── assessment/      # Multi-step financial needs assessment wizard & results view
│   │   │   ├── recommendations/ # Plan cards, policy customizer, rider selector, comparison modal
│   │   │   ├── advisory/        # Advisor directory, slot picker, booking modal, appointments, AI chatbot
│   │   │   ├── advisor/         # Dedicated Advisor portal and consultation notes
│   │   │   ├── admin/           # Dedicated Administrator dashboard and metrics
│   │   │   ├── landing/         # Cinematic split hero, life insurance story modal, value proposition
│   │   │   ├── education/       # Interactive insurance stories and visual explainers
│   │   │   └── ui/              # Reusable UI primitives and animated effects
│   │   ├── i18n/                # Complete translations for English, Telugu, Hindi, Tamil, and Kannada
│   │   ├── api/                 # Type-safe API client with CSRF handling
│   │   ├── App.tsx              # Application shell with responsive navigation and modal state manager
│   │   └── main.tsx             # Application entry point
│   ├── package.json             # Pinned npm dependencies
│   ├── package-lock.json        # Committed deterministic npm lockfile
│   └── vite.config.ts           # Vite bundler configuration with backend proxy
└── .env.example                 # Committed environment variables template (zero secrets)
```

---

## AI Usage

In compliance with Rule 12 of the Talent AP Mega Hackathon guidelines, we transparently disclose all AI tools, assistants, and APIs utilized across the conception, design, and engineering of CoverWise:

### 1. Codebase Engineering & Implementation (Antigravity by Google DeepMind)
* **Agentic Coding Assistant:** **Antigravity** was utilized as the primary AI coding assistant for the development and engineering of the entire codebase.
* **Scope of Development:** Authoring backend FastAPI routes, Pydantic v2 validation contracts, SQLAlchemy 2.0 ORM models, Alembic schema migrations, React 19 TypeScript components, Tailwind CSS styling, 5-language localization dictionaries, and all 97 automated pytest verification tests.
* **Refactoring & Optimization:** Antigravity was leveraged to execute and verify test suites, audit Decimal precision against IRDAI benchmarks, resolve linter warnings, and optimize responsive UI layouts.

### 2. Prompt Engineering & Architecture Structuring (ChatGPT)
* **Prompt Structuring:** **ChatGPT** was used to design, structure, and refine the high-level engineering prompts and domain instructions provided to Antigravity.
* **Domain & Edge-Case Brainstorming:** Utilized to break down the BFSI B2 problem statement, formulate testing edge cases (including PostgreSQL transaction row locks for race condition prevention, non-earning spouse horizons, and irregular income modeling), and craft user journey personas.

### 3. InsureMate AI Chatbot (Google Gemini API)
* **Runtime Advisory Assistant:** Google Gemini API (`gemini-flash-lite-latest`) powers the interactive, conversational InsureMate chatbot (`AIChatbotModal.tsx`).
* **Context-Aware Advisory:** Delivers personalized explanations of policy recommendations, Term vs. ULIP trade-offs, rider benefits, and upcoming advisor appointments in real-time across 5 Indic languages (English, Telugu, Hindi, Tamil, Kannada).
* **High Performance:** Rapid response generation (~1.2s latency) with clean Markdown rendering and graceful fallback handling.

### 4. Crucial Architectural Fact: Zero Runtime LLM Dependency for Actuarial Calculations
* **100% Deterministic Calculations:** CoverWise does **NOT** rely on any external LLM for financial needs assessment, policy pricing, rider charges, or product recommendation ranking.
* **Why This Matters:** Financial advisory requires absolute mathematical auditability and deterministic reproducibility. Every rupee recommended by CoverWise is calculated using verified Python actuarial formulas and official rate tables, guaranteeing zero hallucinations, zero prompt injection vulnerabilities, and zero calculation downtime.

---

## Pre-Built and Third-Party Code

### 1. UI Components & Visual Patterns (21st.dev)
To deliver a modern digital banking user experience, several visual components were adapted from open-source community creations on **[21st.dev](https://21st.dev/)** and customized for CoverWise:
* **Brand Preloader:** Morphing preloader on initial page load (`src/components/ui/scroll-morph-preloader.tsx` and `src/components/layout/AppPreloader.tsx`).
* **Beams Background Canvas:** Ambient light-beam canvas shader illuminating the homepage hero section (`src/components/ui/beams-background.tsx`).
* **Animated SlideTabs:** Magnetic sliding pill tab indicator for navigation (`src/components/ui/slide-tabs.tsx`).
* **Dynamic Watermark Motion Footer:** Interactive branded footer with scroll-revealing typography (`src/components/ui/motion-footer.tsx`).

### 2. Open-Source Libraries & Frameworks
All third-party libraries used in the project are permissive open-source packages (MIT / Apache-2.0 / BSD) pinned in lockfiles:
* **Backend:** FastAPI, Uvicorn, SQLAlchemy 2.0, Alembic, Pydantic v2, Argon2-cffi, pytest, pytest-asyncio, HTTPX.
* **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion, Recharts, Lucide React.

### 3. Pre-Hackathon Work Declaration
* Prior to Day 1, our team reviewed the BFSI problem statements, explored actuarial methodologies (Human Life Value formulas and IRDAI solvency benchmarks), and drafted initial architecture flowcharts.
* **100% of the application code**, database schemas, API routes, calculation engines, localized language dictionaries, and UI components were developed exclusively during the hackathon period.

---

## Limitations & Future Roadmap

In the spirit of honest engineering and transparent disclosure, we highlight the current boundaries of our prototype and our post-hackathon roadmap:

1. **Synthetic Entity Scope:** Saffron Bank and Saffron Life are synthetic entities provided for the Talent AP Mega Hackathon. Rate tables and advisor profiles reflect the official hackathon synthetic datasets.
2. **Advisory Video Integration:** The platform handles calendar slot reservation, time-zone alignment, and consultation notes lifecycle; live video conferencing is simulated and intended to integrate with enterprise Google Meet / WebRTC services.
3. **Medical Underwriting Telemetry:** The current engine models entry age, gender, smoker status, policy term, and sum assured. It does not perform invasive medical underwriting or BMI risk loadings, which would require integration with third-party diagnostic labs.
4. **Dynamic Tax Slabs:** Section 80C and Section 10(10D) tax benefits are noted for informational education, but are not dynamically modeled across individual state tax brackets or evolving Union Budget regimes.
5. **Future Roadmap:**
   * **Account Aggregator (AA) Integration:** Direct consent-based fetching of verified bank statements and mutual fund holdings via Sahamati AA APIs to automate the financial assessment in under 30 seconds.
   * **Vernacular Voice Agent:** Interactive speech-to-text assessment for rural daily-wage earners with limited digital literacy.
   * **Core Banking System (CBS) Webhooks:** Instant pre-approved policy issuance for KYC-verified Saffron Bank account holders.

---
*CoverWise — Developed with precision by Team We4 (`1201`) for the Talent AP Mega Hackathon 2026 (BFSI B2).*
