# CoverWise — persistent coding-agent instructions

You are developing **CoverWise**, Team We4's original **Talent AP B2 life-insurance web platform**.

1. Before code, read `FULL_CODE/docs/PRD.md`, then find/read `GUIDELINES(FINAL).pdf` and the **original** B2 pack `README.md` (all sections), glossary, original problem statement/PPT, and CSV/JSON in `FULL_CODE/data/` (including nested directories). Read dataset schema/rules and validate every record programmatically; do not display thousands of rows or leak records.
2. **MANDATORY Phase 0:** create `FULL_CODE/docs/PHASE_0_AUDIT.md` and `FULL_CODE/docs/CALCULATION_POLICY.md` before implementing code. Follow source-priority and conflict handling in PRD. Original pack dictates premium/eligibility, not a mandatory needs formula.
3. Stack fixed: **React + TypeScript + Vite + Tailwind; Python + FastAPI + Pydantic + SQLAlchemy + Psycopg + Alembic; PostgreSQL**. Web responsive, not native mobile. No PHP or MySQL.
4. Core HLV and Net Needs **are both backend algorithms**; document team-chosen formulas, unit-test and do not silently change once frozen. Premium, rider and ULIP pricing MUST conform to official B2 README §§6.1–6.3; use `Decimal` and `ROUND_HALF_UP` as specified. Never fabricate quotes.
5. Implement actual four-stage customer experience; Simple/Expert presentation, five working languages, fair product matching, honest no-eligible/coverage-gap states, advisor booking and server-side Customer/Advisor/Admin roles.
6. Security first: use only synthetic data, never real Aadhaar/PAN/payment info; no secrets in frontend or repository, strict backend authorization, input validation, CSRF protections with cookie sessions, rate limits, safe CORS, masked logs. Never allow double-booking.
7. All **application code and technical docs under `FULL_CODE/`**, top-level only `README.md`, `.gitignore`, optional `LICENSE` and `FULL_CODE/`. `FULL_CODE/data/` holds temporary original datasets/docs for development ONLY and must be Git-ignored/excluded from final zip. No `submission/` output for B2.
8. Write readable, typed, modular code with migrations, idempotent import scripts, tests, pinned lockfiles, formatter/linter and Windows-friendly run commands. Do not reuse application code from unrelated hackathons. Declare AI assistance and pre-Day-1 work in README.
9. Optional APIs/LLMs only when demonstrably useful; must work when disabled; keep API keys in backend `.env` only, no agent permission for unreviewed risky actions.
10. At each milestone report changed files, actual commands/tests and remaining limitations. Do not claim a test ran if it did not. Prioritize correctness and working demonstration over fancy effects.

**Read `FULL_CODE/docs/ANTIGRAVITY_START_HERE.md` for the kickoff request.**
