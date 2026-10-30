# TEAMID_12 · BFSI B2: CoverWise — Intelligent Life Insurance Needs Finder & Digital Advisory Platform

> **Talent AP Mega Hackathon 2026 — Problem Statement: BFSI B2**  
> **Team:** We4 · **Team ID:** `TEAMID_12`  
> **Repository:** `SAI-GANESH-K/Talent_AP` · **Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + FastAPI + PostgreSQL  

---

## What It Does

### The Problem
In Indian retail banking, life insurance penetration remains critically low despite high customer touchpoints. Customers face three major roadblocks:
1. **Opaque, Arbitrary Calculations:** Banks frequently offer generic rules of thumb (e.g., *"buy 10x your annual salary"*), completely ignoring outstanding home loans, dependent education milestones, inflation, and existing liquid assets.
2. **Push Culture & Commission Distrust:** Customers avoid seeking guidance because traditional agency channels are notorious for aggressive telemarketing and pushing high-commission endowment/ULIP products instead of affordable pure term insurance.
3. **Linguistic & Accessibility Barriers:** Digital calculators are overwhelmingly technical and English-first, alienating non-English-speaking families across Tier-2 and Tier-3 India.

### Who Uses CoverWise
* **Retail Bank Customers:** Salaried employees, self-employed professionals, homemakers, and small-business owners seeking an honest, spam-free financial assessment.
* **Licensed Fee-Only Advisors:** Bank-certified advisors conducting unbiased consultations without sales quotas or commission incentives.
* **Bank Compliance & Administrators:** Supervisory staff monitoring system health, aggregate booking metrics, and actuarial audit trails.

### What Users Experience
CoverWise delivers a self-directed, empathetic four-stage digital journey:
1. **Stage 1 — Financial Assessment:** An intuitive wizard capturing household income, monthly living costs, retirement timeline, outstanding liabilities (home/vehicle/personal loans), active life covers, and family milestones (children's higher education, marriage).
2. **Stage 2 — Dual Actuarial Coverage Needs:** Clear, side-by-side presentation of two respected actuarial models:
   * **Human Life Value (HLV):** Future economic earning power discounted to present value.
   * **Net Needs Analysis:** Total financial obligations minus existing resources, leaving the exact net protection shortfall.
   * *Simple vs. Expert Mode:* Users can view a clean summary or expand full year-by-year cashflow projections with interactive inflation and discount rate sensitivity sliders.
3. **Stage 3 — Product Exploration & Real-Time Customizer:**
   * Algorithmic 4-pillar ranking (Need Suitability, Value for Money, Flexibility, Solvency) evaluating the official 14 Saffron Life insurance products.
   * Interactive policy sliders for Sum Assured, Policy Term, and Premium Payment Term with real-time recalculation of annual, semi-annual, quarterly, and monthly premiums down to the exact rupee.
   * Side-by-side comparison modal evaluating up to 3 plans simultaneously.
4. **Stage 4 — Fee-Only Advisor Booking:**
   * Filterable advisor directory by language and specialization.
   * Concurrency-safe calendar slot reservation with zero spam calls and zero personal data leakage.
   * Dedicated management dashboards for customers and advisors.
5. **5 Indic Languages:** Complete runtime switching across **English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), and Kannada (ಕನ್ನಡ)** with 100% mathematical parity.

---

## How to Run

### System Prerequisites
* **Operating System:** Windows, macOS, or Linux
* **Python:** 3.10+ (64-bit)
* **Node.js:** 18.x or 20.x+ with `npm`
* **PostgreSQL:** 14+ running locally (default port: `5432`)

---

### Method A: 1-Click Launch (Windows)

We have provided ready-to-run automation batch scripts in the project root:

1. **Start Everything:** Double-click [`run.bat`](file:///e:/TEAMID_12/run.bat) (or run `./run.bat` in Command Prompt).
   * Automatically clears any stale processes on ports `8000` and `5173`.
   * Activates the Python virtual environment and starts the FastAPI backend on `http://0.0.0.0:8000`.
   * Starts the Vite frontend on `http://0.0.0.0:5173`.
   * Detects your local network IP and prints the mobile testing link.
   * Automatically launches your default browser to `http://localhost:5173`.
2. **Stop Cleanly:** Double-click [`stop.bat`](file:///e:/TEAMID_12/stop.bat) to terminate backend and frontend servers and free all ports.
3. **Mobile Cloudflare Preview:** Double-click [`mobile-tunnel.bat`](file:///e:/TEAMID_12/mobile-tunnel.bat) to generate an instant, secure public HTTPS link for mobile testing on 4G/5G networks.

---

### Method B: Manual Step-by-Step Setup

#### 1. Clone & Environment Setup
```bash
git clone https://github.com/SAI-GANESH-K/Talent_AP.git TEAMID_12
cd TEAMID_12/FULL_CODE

# Copy environment variables template
cp .env.example .env
```
Edit `FULL_CODE/.env` with your PostgreSQL database credentials:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/coverwise
SESSION_SECRET_KEY=coverwise_secure_production_secret_key_2026
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### 2. Backend Setup & Data Ingestion
```bash
cd FULL_CODE/backend

# Create and activate virtual environment
python -m venv .venv

# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -e ".[dev]"

# Create the PostgreSQL database (if not already created)
# psql -U postgres -c "CREATE DATABASE coverwise;"

# Run database migrations
alembic upgrade head

# Ingest official B2 CSV datasets into PostgreSQL
python -m scripts.import_official_data

# (Optional) Seed demo user accounts
python -m scripts.seed_demo_accounts
```

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

#### 4. Start Development Servers
Open two separate terminal windows:

* **Terminal 1 (Backend):**
  ```bash
  cd FULL_CODE/backend
  .venv/Scripts/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  ```
* **Terminal 2 (Frontend):**
  ```bash
  cd FULL_CODE/frontend
  npm run dev
  ```

* **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* **Backend Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### Where to Put the Data Pack Files
Per Rule 2 and Rule 11 of the hackathon guidelines, the original synthetic datasets are located in:
```
FULL_CODE/data/B2_Life_Insurance_Needs_Finder/data/
```
This folder contains the official CSV datasets (`products.csv`, `premium_rates.csv`, `riders.csv`, `advisors.csv`, etc.). As required, `FULL_CODE/data/` is excluded from version control via `.gitignore` and is loaded cleanly into PostgreSQL via `python -m scripts.import_official_data`.

---

## How to Run the Tests

CoverWise includes an exhaustive automated test suite validating actuarial formulas, exact decimal pricing, recommendation ranking, session security, CSRF defense, and database concurrency locks.

### The One Command to Run All Tests:
```powershell
cd FULL_CODE/backend
.venv\Scripts\pytest.exe -v
```

### Verified Test Results: 97/97 Passing Tests (100% Pass Rate)
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

============================= 97 passed in 11.75s =============================
```

### What the Test Suite Verifies:
* **Actuarial Benchmark Test (`test_golden_premium_exact_decimal`):** Verifies the exact official B2 golden benchmark of **₹1,045.00** monthly premium for a 30-year-old male, non-smoker, purchasing ₹1 Crore Saffron Kesaro Term for 30 years with ₹50 Lakh Accidental Death Benefit Rider.
* **Dual-Model Calculation Integrity:** Verifies HLV present value discounting and Net Needs liability clearance across edge-case profiles (zero liabilities, multi-child goals, early retirement).
* **Security & Auth:** Verifies Argon2id password hashing, HttpOnly session cookie handling, rate limiting on `/api/v1/auth/login`, and cross-origin CSRF header checks.
* **Concurrency Lock Verification:** Simulates concurrent booking requests on the same advisor slot to ensure zero double-booking under race conditions via `SELECT ... FOR UPDATE` and the `ix_bookings_confirmed_slot` unique partial index.

---

## Architecture

### System Flow Diagram

```mermaid
flowchart TD
    subgraph Client["Client Tier (Browser / Mobile)"]
        UI["React 19 + Vite SPA"]
        I18N["Five-Language Context (en, te, hi, ta, kn)"]
        UI_Components["Tailwind CSS v4 + 21st.dev Effects"]
        UI --> I18N
        UI --> UI_Components
    end

    subgraph Security["API Gateway & Security Layer"]
        Proxy["Vite Dev Proxy (/api/v1)"]
        CookieAuth["HttpOnly Session Cookie Guard"]
        CSRF["X-CSRF-Token Verification"]
        RateLimit["Client IP InMemory Rate Limiter"]
        Proxy --> CookieAuth
        Proxy --> CSRF
        Proxy --> RateLimit
    end

    subgraph Server["FastAPI Backend Application (FULL_CODE/backend)"]
        Router["FastAPI REST Endpoints (/api/v1)"]
        RBAC["Server-Side RBAC (Customer, Advisor, Admin)"]
        NeedsEngine["Actuarial Needs Engine (HLV & Net Needs)"]
        PricingEngine["Deterministic Decimal Premium Engine"]
        RecEngine["4-Pillar Product Recommendation Engine"]
        BookingService["Concurrency-Safe Slot Booking Service"]

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

    UI -- "REST over HTTPS (credentials: include)" --> Proxy
    Proxy --> Router
```

### Structure Inside `FULL_CODE/`

```
FULL_CODE/
├── backend/
│   ├── app/
│   │   ├── api/v1/              # REST routers: auth, assessment, recommendations, advisors, bookings
│   │   ├── core/                # Configuration, security utilities, CSRF, rate-limiter, exceptions
│   │   ├── db/                  # SQLAlchemy database session and Base declarations
│   │   ├── models/              # Relational models: products, premium_rates, advisors, bookings, users
│   │   ├── schemas/             # Pydantic v2 validation contracts for requests and responses
│   │   └── services/            # Core business & actuarial logic:
│   │       ├── needs.py         # Pure HLV & Net Needs actuarial calculations
│   │       ├── pricing.py       # Actuarial rate lookups & Decimal modal factor rounding
│   │       ├── recommendation.py# 4-Pillar scoring algorithm
│   │       └── booking.py       # Row-locked transaction slot reservations
│   ├── alembic/                 # Version-controlled database schema migrations
│   ├── scripts/                 # Idempotent CSV data import and demo account seeders
│   ├── tests/                   # 97 pytest test cases across 5 test suites
│   ├── pyproject.toml           # Pinned Python package dependencies
│   └── requirements.txt         # Lock-style pip requirements
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── assessment/      # Multi-step financial needs assessment wizard
│   │   │   ├── recommendations/ # Plan cards, policy sliders, modal breakdown, comparison modal
│   │   │   ├── advisors/        # Advisor discovery, calendar slot picker, booking confirmation
│   │   │   ├── portals/         # Dedicated Customer, Advisor, and Admin portals
│   │   │   ├── landing/         # Cinematic split hero, life insurance story modal, how it works, final CTA
│   │   │   └── ui/              # Reusable UI primitives and animated effects (21st.dev inspired)
│   │   ├── i18n/                # Complete translations for English, Telugu, Hindi, Tamil, and Kannada
│   │   ├── services/            # Type-safe API client (Axios-like fetch wrapper with CSRF handling)
│   │   ├── types/               # TypeScript interface definitions mirroring backend schemas
│   │   ├── App.tsx              # Application shell with responsive navigation and view state router
│   │   └── main.tsx             # Application entry point
│   ├── package.json             # Pinned npm dependencies
│   ├── package-lock.json        # Committed deterministic npm lockfile
│   └── vite.config.ts           # Vite bundler configuration with backend proxy
├── docs/                        # In-depth architectural, calculation policy, and audit specifications
└── .env.example                 # Committed environment variables template (zero secrets)
```

---

## AI Usage

In compliance with Rule 12 of the Talent AP Mega Hackathon guidelines, we transparently disclose all AI tools utilized during the conception, design, and engineering of CoverWise:

### 1. Instructional Design & Prompt Engineering (ChatGPT)
* **Prompt Structuring:** All high-level problem statement breakdowns, user journey personas, financial domain questions, and step-by-step engineering prompts provided to the development environment were designed and structured using **ChatGPT**.
* **Edge-Case Brainstorming:** Used to formulate complex testing scenarios (such as concurrent double-booking race conditions, non-working spouse dependency horizons, and Indic localization edge cases).

### 2. Code Implementation & Verification (Antigravity by Google DeepMind)
* **AI Coding Assistant:** The entire codebase — including backend FastAPI routes, Pydantic schemas, SQLAlchemy ORM models, Alembic migrations, React 19 TypeScript components, Tailwind CSS v4 styles, and all 97 automated pytest tests — was authored, debugged, and verified using **Antigravity** (Google DeepMind's agentic AI coding assistant).
* **Test Verification & Refactoring:** Antigravity was used to run live command-line test suites, verify mathematical precision against official IRDAI benchmarks, fix linter warnings, and optimize responsive mobile layout behavior.

### 3. Crucial Architectural Fact: Zero Runtime AI / LLM Dependencies
* **100% Deterministic Calculations:** CoverWise does **NOT** rely on any external LLM API (OpenAI, Anthropic, or Gemini) at runtime for financial calculations, policy pricing, or product recommendations.
* **Why This Matters:** Financial advisory requires absolute mathematical auditability and deterministic reproducibility. Every rupee recommended by CoverWise is calculated using verified Python actuarial formulas and official rate tables, guaranteeing zero hallucinations, zero prompt injection vulnerabilities, and zero API downtime.

---

## Pre-Built and Third-Party Code

### 1. UI Components & Animation Effects (21st.dev)
To achieve a consumer-grade, modern digital banking user experience, several visual components and animation patterns were adapted from open-source community creations on **[21st.dev](https://21st.dev/)** and customized for the CoverWise theme:
* **Morphing Brand Preloader:** Smooth Apple-style preloader morphing SVG brand assets on initial page load (`src/components/ui/scroll-morph-preloader.tsx` and `src/components/AppPreloader.tsx`).
* **Beams Background Canvas:** Ambient light-beam canvas shader illuminating the homepage hero section (`src/components/ui/beams-background.tsx`).
* **Animated SlideTabs:** Magnetic sliding pill tab indicator for the top navigation bar (`src/components/ui/slide-tabs.tsx`).
* **Dynamic Watermark Motion Footer:** Interactive branded footer with scroll-revealing typography and floating quick links (`src/components/ui/motion-footer.tsx`).

### 2. Open-Source Libraries & Frameworks
All third-party libraries used in the project are permissive open-source packages (MIT / Apache-2.0 / BSD) pinned in lockfiles:
* **Backend:** FastAPI, Uvicorn, SQLAlchemy 2.0, Alembic, Pydantic v2, Argon2-cffi, pytest, pytest-asyncio, HTTPX.
* **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion (formerly Framer Motion), Recharts, Lucide React.

### 3. Pre-Hackathon Work Declaration
* Prior to Day 1, our team reviewed the BFSI problem statements, explored actuarial methodologies (Human Life Value formulas and IRDAI solvency benchmarks), and drafted initial architecture flowcharts.
* **100% of the application code**, database schemas, API routes, calculation engines, localized language dictionaries, and UI components were developed exclusively during the hackathon period.

---

## Limitations & Future Roadmap

In the spirit of honest engineering and transparent disclosure (Rule 12), we highlight the current boundaries of our prototype and our post-hackathon roadmap:

1. **Synthetic Entity Scope:** Saffron Bank and Saffron Life are synthetic entities provided for the Talent AP Mega Hackathon. Rate tables and advisor profiles reflect the official hackathon synthetic datasets.
2. **Advisory Video Integration:** The platform handles calendar slot reservation, time-zone alignment, and consultation notes lifecycle; live video conferencing is simulated and intended to integrate with enterprise Google Meet / WebRTC services.
3. **Medical Underwriting Telemetry:** The current engine models entry age, gender, smoker status, policy term, and sum assured. It does not perform invasive medical underwriting or BMI risk loadings, which would require integration with third-party diagnostic labs.
4. **Dynamic Tax Slabs:** Section 80C and Section 10(10D) tax benefits are noted for informational education, but are not dynamically modeled across individual state tax brackets or evolving Union Budget regimes.
5. **Future Roadmap:**
   * **Account Aggregator (AA) Integration:** Direct consent-based fetching of verified bank statements and mutual fund holdings via Sahamati AA APIs to automate the financial assessment in under 30 seconds.
   * **Vernacular Voice Agent:** Interactive speech-to-text assessment for rural daily-wage earners with limited digital literacy.
   * **Core Banking System (CBS) Webhooks:** Instant pre-approved policy issuance for KYC-verified Saffron Bank account holders.

---

## Summary Checklist (Hackathon Compliance)

- [x] **Top-level directory structure:** Clean layout with `README.md`, `.gitignore`, `LICENSE`, and `FULL_CODE/`.
- [x] **No Secrets Committed:** `.env` is ignored; `.env.example` is committed with safe dummy values.
- [x] **Data Excluded:** `FULL_CODE/data/` synthetic datasets are excluded from git history.
- [x] **No Build Junk:** `.venv/`, `node_modules/`, `dist/`, `.pytest_cache/`, and temporary folders removed and ignored.
- [x] **Deterministic Dependencies:** Lockfiles committed (`package-lock.json`, `pyproject.toml`).
- [x] **Automated Tests:** 97 tests passing with single-command execution.
- [x] **Transparent Attribution:** Full disclosure of AI tools (ChatGPT, Antigravity) and UI effects (21st.dev).

---
*CoverWise — Developed with precision by Team We4 (`TEAMID_12`) for the Talent AP Mega Hackathon 2026 (BFSI B2).*
