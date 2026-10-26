# CoverWise — Intelligent Life Insurance Needs Finder & Digital Advisory Platform

**Team:** We4 · **Problem:** BFSI B2 · **Talent AP Mega Hackathon 2026**  
**Team ID:** TBD (will be assigned by organizers)

## What It Does

CoverWise is a responsive web platform that helps Saffron Bank customers understand their life insurance needs. It guides users through a four-stage journey:

1. **Assessment** — Friendly financial questionnaire collecting income, expenses, dependents, loans, goals, and preferences
2. **Coverage Recommendation** — Calculates protection needs using two methods (Human Life Value and Net Needs Approach) with transparent explanations
3. **Product Selection** — Matches eligible products from Saffron Life's 14 fictional plans, with interactive sliders for real-time premium adjustments
4. **Digital Advisory** — Book a simulated consultation with a fictional financial advisor

Features include Simple/Expert modes, five-language interface (English, Telugu, Hindi, Tamil, Kannada), and secure role-based access for Customers, Advisors, and Administrators.

> **Disclaimer:** Saffron Bank, Saffron Life, all products, rates, advisors and customers are **fictional**, created for the TalentAP Mega Hackathon 2026. Products are not IRDAI-approved. Nothing in this application is financial, insurance, tax or legal advice.

## How to Run

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- PostgreSQL 14+ (installed and running locally)

### Setup

```powershell
# 1. Clone the repository
git clone <repo-url>
cd <TEAM_ID>_B2

# 2. Place the official B2 dataset
# Download and extract the B2 data pack into FULL_CODE/data/B2_Life_Insurance_Needs_Finder/
# The data/ folder is gitignored and NOT included in the repository

# 3. Create environment file
cd FULL_CODE
copy .env.example .env
# Edit .env with your PostgreSQL credentials and a secure secret key

# 4. Backend setup
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e ".[dev]"

# 5. Database setup
# Create the database (if not exists)
psql -U postgres -c "CREATE DATABASE coverwise;"

# Run migrations
alembic upgrade head

# Import official dataset
python -m scripts.import_official_data

# 6. Frontend setup
cd ..\frontend
npm install

# 7. Start the application
# Terminal 1 — Backend
cd FULL_CODE\backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd FULL_CODE\frontend
npm run dev
```

Open http://localhost:5173 in your browser.

API docs available at http://localhost:8000/docs (development only).

### Environment Variables

See `FULL_CODE/.env.example` for all required variables with dummy values.

## How to Run the Tests

```powershell
# Backend tests
cd FULL_CODE\backend
pytest -v

# Frontend tests
cd FULL_CODE\frontend
npm test
```

## Architecture

```
FULL_CODE/
├── backend/          Python + FastAPI + SQLAlchemy + Alembic
│   ├── app/
│   │   ├── api/      Route handlers with Pydantic validation
│   │   ├── core/     Config, security, exceptions
│   │   ├── domain/   Pure calculation engines (needs, pricing, eligibility, recommendations)
│   │   ├── models/   SQLAlchemy ORM models
│   │   ├── db/       Database session management
│   │   ├── schemas/  Pydantic request/response models
│   │   └── services/ Business orchestration
│   ├── alembic/      Database migrations
│   └── tests/        pytest test suite
├── frontend/         React + TypeScript + Vite + Tailwind CSS
│   └── src/
│       ├── api/      Typed API client
│       ├── components/ Reusable UI components
│       ├── features/   Feature modules (assessment, coverage, products, booking)
│       ├── i18n/       Five-language translations
│       ├── pages/      Route-level pages
│       └── theme/      Design tokens and styles
├── scripts/          Data import, submission verification
└── docs/             PRD, audit, calculation policy, architecture
```

**Data Flow:** React UI → Vite proxy `/api` → FastAPI (validation + auth + RBAC) → Pure Python domain engines → SQLAlchemy → PostgreSQL

Core financial calculations (HLV, Net Needs, premium pricing, eligibility) are implemented as pure Python domain services, independently testable without web framework or database dependencies.

## AI Usage

- **Google Antigravity:** AI coding assistant used throughout development for code generation, debugging, and documentation
- **No AI APIs in the application:** All calculations are deterministic Python algorithms. No LLM or external AI service is required for core functionality.

## Pre-Built and Third-Party Code

- Code was written for this hackathon (pre-Day-1 work: project planning and PRD)
- Open-source libraries used: FastAPI, SQLAlchemy, Pydantic, Alembic, React, Vite, Tailwind CSS, Recharts, Motion for React (see lockfiles for complete list)
- No application code from other hackathons or past projects

## Limitations

- All data is **fictional** — not real insurance quotes or financial advice
- Advisor consultation is a **booking simulation**, not a live call
- ULIP fund growth projections use simplified modeling with illustrative return scenarios
- Surrender values and actual bonus declarations are not tabulated in the dataset
- Tax implications are not modelled
- Health conditions and BMI do not affect rates (no health surcharges in the dataset)
- Advisor slots cover a fixed two-week snapshot (2026-10-26 to 2026-11-07)
- Application has not undergone production security audit
