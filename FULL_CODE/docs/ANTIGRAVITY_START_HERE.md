# First message to paste into Google Antigravity

You are the lead full-stack engineer for **CoverWise**, an original responsive web platform for Team We4's Talent AP Mega Hackathon 2026 BFSI B2 problem.

My project root already exists. It contains `FULL_CODE/` and a temporary, ignored `FULL_CODE/data/` directory containing the extracted official B2 datasets, problem statement, coding-guidelines PDF and presentation (possibly nested). **Do not create another repository or rename the root to a guessed team ID.**

**FIRST, DO NOT WRITE APPLICATION CODE.**

1. Read `FULL_CODE/AGENTS.md` and **all of `FULL_CODE/docs/PRD.md`**.
2. Discover the exact paths of all official reference documents under `FULL_CODE/data/` and read *every section* of the B2 pack `README.md` (including §§6.1, 6.2, 6.3, 7 and 8), its glossary, the complete four-page `GUIDELINES(FINAL).pdf`, the published problem statement and the PPT. If you cannot read a file directly, report the problem rather than pretending you read it.
3. Inventory every CSV/JSON schema, inspect representative records and use a script to validate all rows/counts, foreign keys and unique rate keys. Note CSV/JSON copies of the same entities. Verify the official **₹1,045/month** non-linked premium example using exact Decimal calculations.
4. Summarize which details are **organizer-mandated** (especially exact premiums, eligibility, submission structure) versus **team design choices** (HLV and Net Needs formulas, UI, ranking assumptions). Flag missing/ambiguous policies rather than inventing official requirements.
5. Create `FULL_CODE/docs/PHASE_0_AUDIT.md`, `FULL_CODE/docs/CALCULATION_POLICY.md` and an actionable phase plan; keep source paths traceable. Explain your proposed project architecture for **React/TypeScript/Vite/Tailwind + Python/FastAPI + PostgreSQL** and security model. The team must understand the generated code.
6. Once Phase 0 is complete and conflicts/assumptions are documented, begin Phase 1 foundation only: proper `FULL_CODE` structure, env example, migrations, validated import, FastAPI entry point, React app, API contract and tests. No premature large one-shot implementation. Provide exact PowerShell commands to run PostgreSQL/API/web/tests. Commit only if Git is initialized and the state is safe.
7. Continue later phases incrementally, using the PRD as acceptance criteria. Never weaken the official rules or invent rates; never commit `FULL_CODE/data/`, `.env`, build products, or private data. Keep final B2 source package compliant and leave team ID as TBD.

Return the Phase 0 audit, source-completeness status, calculated example, key decisions and intended file changes. Use the official documents as sources of truth for product rules and the PRD for team-selected UX and architecture.
