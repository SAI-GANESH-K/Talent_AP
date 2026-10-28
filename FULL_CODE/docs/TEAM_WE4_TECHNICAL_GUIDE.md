# CoverWise — Team We4 Technical Guide & Jury Preparation Handbook

> **Project:** CoverWise  
> **Team:** We4 · **Problem Statement:** BFSI B2  
> **Hackathon:** Talent AP Mega Hackathon 2026  
> **Purpose:** Internal team reference, presentation guide, and jury Q&A handbook.

---

## 1. Executive Summary & Philosophy

When presenting CoverWise to the jury, emphasize our core differentiator:
> **"In the financial services and insurance sector, trust requires explainability. We built a mathematically pure, deterministic, and verifiable platform where every rupee of insurance need and every rupee of premium can be traced to exact actuarial formulas, rather than opaque AI black-box hallucinations."**

---

## 2. Architecture & Data Flow

### A. React to FastAPI REST Communication
- **Client Protocol:** Browser communicates with FastAPI backend via JSON-over-HTTP REST endpoints (`/api/v1/*`).
- **Development Proxy:** In development, Vite's dev server (`localhost:5173`) proxies requests starting with `/api` to Uvicorn (`localhost:8000`), avoiding cross-origin issues.
- **Credential Handling:** Every request includes `credentials: 'include'`. This automatically attaches the `session_id` HttpOnly cookie.
- **CSRF Defense:** For mutating operations (`POST`, `PUT`, `PATCH`, `DELETE`), our frontend client ([`client.ts`](file:///e:/TEAMID_12/FULL_CODE/frontend/src/api/client.ts)) extracts the `csrf_token` cookie and sends it as an HTTP header: `X-CSRF-Token: <token>`.
- **Response Handling:** FastAPI validates inputs and outputs using Pydantic schemas ([`responses.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/schemas/responses.py)), returning consistent, typed JSON payloads.

### B. FastAPI to PostgreSQL Communication
- **ORM Layer:** SQLAlchemy 2.0 with type annotations.
- **Session Lifecycle:** Managed through FastAPI's dependency injection (`get_db()` in [`session.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/db/session.py)).
  - Session opens on request.
  - Automatically commits if successful.
  - Automatically rolls back on any uncaught exception.
  - Always closes and returns the connection to the connection pool in a `finally` block.
- **Financial Precision:** Currency fields use PostgreSQL `NUMERIC(15, 2)` mapped directly to Python's `Decimal` type to avoid floating-point inaccuracies.

---

## 3. Core Mathematical Engines with Worked Examples

### A. Human Life Value (HLV) — Income Replacement
**Concept:** What is the economic loss to the family if the primary earner passes away today?

**Formula:**
$$\text{HLV} = \sum_{t=1}^{N} \frac{\text{Earnings}_t \times (1 - \text{Self Expense Ratio})}{(1 + r)^t}$$

**Worked Example (The ₹1.90 Crore Scenario):**
- **Customer:** Age 30, Retirement Age 60 $\implies N = 30$ years.
- **Current Annual Income:** ₹12,00,000 (₹12 Lakhs).
- **Income Growth Rate ($g$):** 8.0% per annum.
- **Personal Consumption Deduction:** 25.0% (Family of 3).
- **Family Share of Income:** $12,00,000 \times 75\% = ₹9,00,000$ in Year 1.
- **Discount Rate ($r$):** 7.0% per annum.
- **Calculation Mechanism:** For each year $t$ from 1 to 30:
  $$\text{Income}_t = 12,00,000 \times (1 + 0.08)^{t-1}$$
  $$\text{Family Contribution}_t = \text{Income}_t \times 0.75$$
  $$\text{PV}_t = \frac{\text{Family Contribution}_t}{(1 + 0.07)^t}$$
- **Sum of All 30 Years:** ₹1,90,48,220 $\approx$ **₹1.90 Crores**.

*File Reference:* [`needs.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/domain/needs.py) $\to$ `calculate_hlv()`

---

### B. Net Needs Approach — Goal & Liability Based
**Concept:** How much cash is required immediately to clear all debts, fund family goals, and provide household sustenance, minus existing wealth?

**Formula:**
$$\text{Net Needs} = \text{Debt Payoff} + \text{Emergency Fund} + \text{Milestone Goals (Inflated & PV)} + \text{Living Expenses} - \text{Liquid Assets} - \text{Existing Cover}$$

**Worked Example:**
1. **Outstanding Liabilities:** ₹45,00,000 (Home Loan) + ₹5,00,000 (Car Loan) = **₹50,00,000**.
2. **Immediate Needs:** Emergency fund (6 months $\times$ ₹50,000/mo) = **₹3,00,000**.
3. **Future Goal (Child Higher Education in 15 Years):**
   - Cost today: ₹20,00,000.
   - Future cost at 8% education inflation ($i$): $20,00,000 \times (1 + 0.08)^{15} = ₹63,44,338$.
   - Present value at 7% discount rate ($r$): $\frac{63,44,338}{(1 + 0.07)^{15}} = ₹22,99,484$.
4. **Living Expense Maintenance (20 Years):**
   - Annual living expenses = ₹6,00,000.
   - 20-year present value annuity = ₹67,25,000.
5. **Gross Needs:** $50,00,000 + 3,00,000 + 22,99,484 + 67,25,000 = ₹1,43,24,484$.
6. **Existing Assets & Cover:**
   - Liquid Mutual Funds/FDs: ₹15,00,000.
   - Existing Corporate Group Term Cover: ₹25,00,000.
7. **Final Net Life Cover Needed:** $1,43,24,484 - 40,00,000 =$ **₹1,03,24,484** ($\approx$ ₹1.03 Crore).

*File Reference:* [`needs.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/domain/needs.py) $\to$ `calculate_net_needs()`

---

### C. Premium Pricing & Decimal Rounding
**Concept:** Pure actuarial rate tables applied with mode factors and commercial rounding.

**Formula:**
$$\text{Annual Premium} = \left(\frac{\text{Sum Assured}}{1,000}\right) \times \text{Rate} \times (1 - \text{Rebate})$$
$$\text{Modal Factor:} \quad \text{Annual} = 1.0, \quad \text{Semi-Annual} = 0.51, \quad \text{Quarterly} = 0.26, \quad \text{Monthly} = 0.0875$$
$$\text{Installment Premium} = \text{Decimal.quantize}(\text{Annual} \times \text{Modal Factor}, \text{ROUND\_HALF\_UP})$$

**Official ₹1,045 Benchmark Worked Example:**
- **Product:** Saffron Kesaro Term (`PRD-X4CBUF`)
- **Customer:** Male, Age 30, Non-Smoker
- **Policy Term:** **30 Years** (Regular Pay: 30 Years)
- **Base Sum Assured:** ₹1,00,00,000 (₹1 Crore)
- **Frequency:** Monthly (`0.0875`)
- **Add-on Rider:** Accidental Death Benefit Rider (`RDR-LUR23D`) with ₹50,00,000 SA

**Step 1: Base Plan Calculation**
- Rate from `premium_rates` table for Male, Age 30, 30-yr term, Non-smoker: **1.044 per ₹1,000 SA**.
- Annual Base Premium $= \frac{1,00,00,000}{1,000} \times 1.044 = \mathbf{₹10,440.00}$.
- Monthly Base Premium $= \text{ROUND\_HALF\_UP}(10,440.00 \times 0.0875) = \text{ROUND}(913.50) = \mathbf{₹914.00}$.

**Step 2: Rider Calculation**
- Rider Rate $= \mathbf{0.30 \text{ per ₹1,000 SA}}$.
- Annual Rider Premium $= \frac{50,00,000}{1,000} \times 0.30 = \mathbf{₹1,500.00}$.
- Monthly Rider Premium $= \text{ROUND\_HALF\_UP}(1,500.00 \times 0.0875) = \text{ROUND}(131.25) = \mathbf{₹131.00}$.

**Step 3: Total Installment**
$$\text{Total Monthly Premium} = ₹914.00 + ₹131.00 = \mathbf{₹1,045.00}$$

*File Reference:* [`pricing.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/domain/pricing.py) $\to$ `calculate_premium()`

---

## 4. Eligibility & 4-Pillar Recommendation Scoring

### Eligibility Gating
Before any product is scored, it must satisfy hard catalog constraints:
1. $\text{Min Entry Age} \le \text{Customer Age} \le \text{Max Entry Age}$
2. $\text{Customer Age} + \text{Policy Term} \le \text{Max Maturity Age}$
3. $\text{Customer Annual Income} \ge \text{Product Minimum Income}$
4. Smoker compatibility (e.g., plans without tobacco underwriting).

### 4-Pillar Scoring Model (0–100 Scale)
$$\text{Composite Score} = (0.35 \times S_{\text{need}}) + (0.25 \times S_{\text{value}}) + (0.20 \times S_{\text{flex}}) + (0.20 \times S_{\text{solv}})$$
- **Need Match (35%):** Pure Term scores highest for protection needs; Endowment/ULIP scores highest for wealth accumulation goals.
- **Value for Money (25%):** Lowest premium per lakh of coverage receives maximum score.
- **Flexibility (20%):** Evaluates number of available payment terms, modal frequencies, and compatible riders.
- **Solvency (20%):** Standardized metric reflecting Saffron Life's 98.4% claim settlement ratio and 2.1x solvency ratio.

*File Reference:* [`recommendations.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/domain/recommendations.py) $\to$ `score_products()`

---

## 5. Security & Concurrency Architecture

### A. Role-Based Access Control (RBAC)
CoverWise enforces 3 distinct personas:
1. **Customer:** Can only access their own assessments and booking records.
2. **Advisor:** Can only access consultation records assigned to their specific advisor ID. Cannot browse unrelated customers.
3. **Admin:** Accesses aggregate metrics (booking counts, conversion stats, server health). **Privacy Protection:** Customer names, phone numbers, and financial details are explicitly filtered out of admin response payloads.

*File Reference:* [`auth.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/core/auth.py) $\to$ `require_role()`

### B. Session Security & CSRF
- **Session Tokens:** Cryptographically random 32-byte hex string stored in server-side `user_sessions` with 24-hour TTL.
- **Cookie Security:** Delivered with `HttpOnly`, `SameSite=Lax`, `Secure` (in production).
- **CSRF Token:** Double-submit cookie mechanism verified on mutating verbs.

### C. Transaction-Safe Slot Booking
How do we prevent two users from booking the same slot at the exact same millisecond?
1. **Pessimistic Row Lock:** When a booking is attempted, the backend queries:
   ```python
   slot = db.query(AdvisorSlot).filter(AdvisorSlot.id == slot_id).with_for_update().first()
   ```
   PostgreSQL places an exclusive row lock on the slot. Any concurrent request must wait until the transaction commits or aborts.
2. **Database Partial Unique Index:**
   ```sql
   CREATE UNIQUE INDEX ix_bookings_confirmed_slot 
   ON bookings (slot_id) 
   WHERE status = 'confirmed';
   ```
   If a race condition slips past application logic, the database engine itself rejects the duplicate insert with an integrity violation.
3. **Finite State Machine:** Bookings transition strictly:
   $$\text{confirmed} \longrightarrow \text{cancelled} \quad \text{or} \quad \text{confirmed} \longrightarrow \text{completed}$$
   Terminal states cannot be reopened.

*File Reference:* [`booking.py`](file:///e:/TEAMID_12/FULL_CODE/backend/app/api/v1/booking.py)

---

## 6. Five-Language Localization Architecture

CoverWise natively supports **English**, **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, **Tamil (தமிழ்)**, and **Kannada (ಕನ್ನಡ)**.

### How It Works:
- **Zero Calculation Coupling:** Language choice lives in React context (`useLanguage()`). Changing languages only changes UI string bundles ([`translations.ts`](file:///e:/TEAMID_12/FULL_CODE/frontend/src/i18n/translations.ts)); all underlying financial numbers, dates, and currency values remain strictly identical.
- **State Preservation:** Switching languages midway through the assessment wizard preserves all entered figures, sliders, and chosen plans.
- **Native Fonts & Glyphs:** Configured with Google Fonts (Inter + Outfit) with full Unicode glyph coverage for Indic scripts.

---

## 7. Key Code Locations & Function Reference

| Component / Layer | File Path | Key Functions / Classes |
|---|---|---|
| **HLV & Net Needs Engine** | `FULL_CODE/backend/app/domain/needs.py` | `calculate_hlv()`, `calculate_net_needs()` |
| **Pricing Engine** | `FULL_CODE/backend/app/domain/pricing.py` | `calculate_premium()`, `get_rate_factor()` |
| **Recommendation Engine** | `FULL_CODE/backend/app/domain/recommendations.py` | `score_products()`, `check_eligibility()` |
| **Booking & Concurrency** | `FULL_CODE/backend/app/api/v1/booking.py` | `book_consultation()`, `cancel_booking()` |
| **Authentication & RBAC** | `FULL_CODE/backend/app/core/auth.py` | `authenticate_user()`, `require_role()` |
| **Database Models** | `FULL_CODE/backend/app/models/` | `source_data.py`, `app_data.py` |
| **API Client (Frontend)** | `FULL_CODE/frontend/src/api/client.ts` | `apiClient`, `csrf_token` interceptor |
| **Assessment Wizard** | `FULL_CODE/frontend/src/components/assessment/` | `AssessmentWizard.tsx`, `StepDemographics.tsx` |
| **Coverage Dashboard** | `FULL_CODE/frontend/src/components/assessment/` | `ResultsDashboard.tsx`, `ActuarialSchedule.tsx` |
| **Policy Customizer** | `FULL_CODE/frontend/src/components/recommendations/`| `PolicyCustomizerModal.tsx` |
| **Plan Comparison** | `FULL_CODE/frontend/src/components/recommendations/`| `PlanComparisonModal.tsx` |
| **Translations** | `FULL_CODE/frontend/src/i18n/translations.ts` | 5-language dictionary |

---

## 8. Glossary of BFSI Terms

- **HLV (Human Life Value):** The capitalized economic monetary value of an individual's future earning power devoted to dependents.
- **Net Needs Analysis:** An actuarial budgeting method that calculates protection gap by subtracting existing liquid wealth and insurance from total future liabilities and goals.
- **Sum Assured (SA):** The guaranteed tax-free lump sum paid to designated beneficiaries upon death of the life insured.
- **Modal Factor:** Actuarial coefficient applied to an annual premium to calculate semi-annual (0.51), quarterly (0.26), or monthly (0.0875) installment amounts.
- **GTLI (Group Term Life Insurance):** Employer-sponsored group life insurance coverage provided to active corporate employees.
- **Rider:** An optional supplementary benefit contract (e.g., Accidental Death Benefit) attached to a base policy for an additional premium.
- **Partial Unique Index:** A specialized PostgreSQL index with a `WHERE` filter clause, enforcing uniqueness only on records matching the condition (e.g., active bookings).

---

## 9. Frequently Asked Jury Questions & Answers

### Q1: "Why did you build deterministic actuarial engines instead of calling an LLM (OpenAI/Gemini) to calculate the insurance amount?"
**Answer:** "In banking and insurance, financial figures cannot be probabilistic or subject to hallucinations. An LLM might calculate ₹1.2 Crore one second and ₹1.4 Crore the next for the same customer. By implementing pure Python `Decimal` algorithms based on actuarial mathematics, our recommendations are 100% deterministic, audit-compliant, explainable to regulators, and execute locally in under 5 milliseconds without external API costs or privacy risks."

### Q2: "How do you handle floating-point rounding errors in financial numbers?"
**Answer:** "We strictly forbid Python `float` for any money calculation. We use Python's standard `Decimal` class with `ROUND_HALF_UP` and store values in PostgreSQL as `NUMERIC(15, 2)`. This guarantees mathematical exactness down to the paisa, verified by our regression tests (such as our golden ₹1,045 monthly benchmark)."

### Q3: "What prevents two customers from booking the same advisor slot simultaneously?"
**Answer:** "We implement defense-in-depth:
1. Application layer: When checking slot availability, we acquire a pessimistic database row lock (`SELECT ... FOR UPDATE`).
2. Database layer: We created a partial unique index in PostgreSQL (`CREATE UNIQUE INDEX ix_bookings_confirmed_slot ON bookings (slot_id) WHERE status = 'confirmed'`). Even if two requests bypassed application locks, PostgreSQL rejects the second transaction with an integrity constraint violation."

### Q4: "How does your platform ensure privacy across user roles?"
**Answer:** "We enforce strict server-side RBAC:
- Customers can only query their own session records.
- Advisors can only see appointments assigned specifically to their advisor profile.
- Administrators can view platform health, booking volume, and conversion metrics, but our backend serializers explicitly strip out customer names, phone numbers, and financial details."

### Q5: "Can you change languages in the middle of an assessment without losing data?"
**Answer:** "Yes! Our language state is completely separated from our business state. Changing languages updates the UI display string tokens via React Context, but preserves all form state, sliders, and backend calculation results."

---

## 10. 5-Minute Live Demo Rehearsal Script

**Total Time: 5 Minutes | Presenters: Team We4**

| Time | Stage | Action & Key Talking Points |
|---|---|---|
| **0:00 – 0:45** | **Introduction** | Open `http://localhost:5173`. Show modern CoverWise landing page. Mention Problem BFSI B2: *"CoverWise makes life insurance transparent, explainable, and multi-lingual for Saffron Bank."* Switch language to **Telugu** or **Hindi** to show instant localization. |
| **0:45 – 1:45** | **Stage 1: Assessment** | Click *"Start Assessment"*. Select a pre-loaded customer persona (e.g., Rajesh Sharma, Age 30, Married with 1 child). Step through Income, Expenses, Liabilities, and Goals. Highlight: *"Every milestone is inflation-adjusted."* |
| **1:45 – 2:45** | **Stage 2: Needs Dashboard** | Show the Dual Actuarial results: **HLV (₹1.90 Cr)** vs. **Net Needs (₹1.03 Cr)**. Toggle from **Simple Mode** to **Expert Mode**. Expand the **Actuarial Cash Flow Schedule** to show year-by-year discounted cash flows. Emphasize: *"No black box. Every rupee is mathematically accounted for."* |
| **2:45 – 3:30** | **Stage 3: Products & Customizer** | View recommended plans. Open the **Policy Customizer Modal** on *Saffron Kesaro Term*. Move the Sum Assured slider to ₹1 Crore and select Monthly frequency with the Accidental Death Rider. Point out the exact **₹1,045/month** figure: *"Matches the official benchmark to the exact rupee."* Show the **Plan Comparison Modal** with side-by-side specs. |
| **3:30 – 4:30** | **Stage 4: Advisory & RBAC** | Select an Advisor (e.g., Saffron Advisor speaking Telugu/English). Select a real future slot and click *"Confirm Booking"*. Log in as the Advisor to show the consultation queue and update status to *"Completed"*. Quickly log in as Admin to show system aggregate statistics with privacy protections. |
| **4:30 – 5:00** | **Conclusion & Q&A** | Conclude: *"CoverWise delivers bank-grade security, mathematical transparency, 5-language accessibility, and zero hallucination risk. We are ready for questions."* |

---
*Team We4 — Built with excellence for Talent AP Mega Hackathon 2026.*
