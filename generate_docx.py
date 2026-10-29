import sys
from pathlib import Path
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_document():
    doc = docx.Document()
    
    # Page Margins: 0.8 inch all around
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Color Palette: Deep Navy (#0F172A), Teal (#0D9488), Slate Gray (#475569)
    COLOR_NAVY = RGBColor(15, 23, 42)
    COLOR_TEAL = RGBColor(13, 148, 136)
    COLOR_SLATE = RGBColor(71, 85, 105)

    def set_cell_background(cell, hex_color):
        shading_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
        cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{m}')
            node.set(qn('w:w'), str(val))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    # -------------------------------------------------------------
    # DOCUMENT HEADER
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_title = title_p.add_run("CoverWise — Technical Architecture, Libraries & Workflow Guide")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_NAVY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(14)
    run_sub = sub_p.add_run("Talent AP Mega Hackathon 2026 · Problem BFSI B2 · Team We4 (ID: 12)")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(11)
    run_sub.font.bold = True
    run_sub.font.color.rgb = COLOR_TEAL

    # Meta Callout Box
    meta_table = doc.add_table(rows=1, cols=1)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_cell = meta_table.cell(0, 0)
    set_cell_background(meta_cell, "F1F5F9")
    set_cell_margins(meta_cell, top=120, bottom=120, left=200, right=200)
    p_meta = meta_cell.paragraphs[0]
    p_meta.paragraph_format.space_after = Pt(2)
    r1 = p_meta.add_run("Document Scope: ")
    r1.font.bold = True
    r1.font.size = Pt(10)
    r1.font.color.rgb = COLOR_NAVY
    r2 = p_meta.add_run("Comprehensive reference covering all frontend & backend libraries and their specific purpose, the step-by-step user workflow from registration to advisor slot booking, system modules functionality, and a complete plain-English glossary of every financial and actuarial term.")
    r2.font.size = Pt(9.5)
    r2.font.color.rgb = COLOR_SLATE

    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION 1: DETAILED TECH STACK & LIBRARIES WITH PURPOSES
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    r = h1.add_run("1. Complete Technology Stack & Installed Libraries Breakdown")
    r.font.name = "Arial"
    r.font.color.rgb = COLOR_NAVY

    doc.add_paragraph("Every single library and module in CoverWise was chosen with intention to ensure financial precision, bank-grade security, zero calculation hallucination, and 60fps responsive performance.")

    # 1.1 FRONTEND LIBRARIES TABLE
    doc.add_heading("A. Frontend Libraries & Modules (React 19 Ecosystem)", level=2)
    
    fe_libs = [
        ("React 19 (react, react-dom)", "v19.3.1", "Core Component Framework", "Provides the reactive virtual DOM and hooks architecture for the 4-stage customer assessment wizard, reactive state management, and seamless UI transitions."),
        ("TypeScript", "v6.0.3", "Static Type Safety", "Enforces end-to-end type safety between frontend data models (AssessmentRequest, AssessmentResponse, SelectedPlan) and backend schemas, eliminating runtime type errors."),
        ("Vite", "v8.3.4", "Next-Gen Build Engine", "High-performance build tool with sub-second hot module replacement (HMR), production bundling (compiles in ~1.9s), and development reverse proxy forwarding /api requests to FastAPI on port 8000."),
        ("Tailwind CSS v4 (@tailwindcss/vite)", "v4.3.3", "Fintech Styling Framework", "Provides a utility-first styling system implementing the CoverWise 'Premium Minimal Fintech' theme: Deep Navy (#0F172A), Trust Teal (#0D9488), Warm Gold (#D4A843), and clean card surfaces."),
        ("Motion for React (motion)", "v14.6.0", "Cinematic Interaction & Animations", "Powers the branded cinematic entrance preloader, smooth viewport-triggered scroll-reveal storytelling on the homepage, and fluid modal transitions (60fps GPU acceleration)."),
        ("Recharts", "v3.10.1", "Financial Data Visualization", "Renders responsive, interactive SVG curves for the Human Life Value (HLV) income replacement trajectory across working years to age 60."),
        ("React Router DOM", "v7.18.4", "Client Navigation Support", "Enables seamless SPA view transitions and URL state synchronization between customer assessment views, advisor portal, and admin dashboard."),
        ("Oxlint", "v1.88.0", "High-Speed Linter", "Rust-based ultra-fast linter that maintains code quality, accessibility checks (a11y), and zero unused imports across the frontend codebase.")
    ]

    fe_table = doc.add_table(rows=len(fe_libs) + 1, cols=4)
    fe_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers_fe = ["Library / Package", "Version", "Category", "Exact Purpose in CoverWise"]
    for i, h in enumerate(headers_fe):
        cell = fe_table.cell(0, i)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for row_idx, (lib, ver, cat, purp) in enumerate(fe_libs, start=1):
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate([lib, ver, cat, purp]):
            c = fe_table.cell(row_idx, col_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, top=60, bottom=60, left=100, right=100)
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_NAVY
            elif col_idx == 2:
                r.font.color.rgb = COLOR_TEAL
            else:
                r.font.color.rgb = COLOR_SLATE

    doc.add_paragraph()

    # 1.2 BACKEND LIBRARIES TABLE
    doc.add_heading("B. Backend Libraries & Modules (FastAPI & Python 3.12 Ecosystem)", level=2)

    be_libs = [
        ("FastAPI", ">=0.115.0", "Async Web API Framework", "High-performance REST API routing with native asynchronous support, automatic OpenAPI/Swagger interactive documentation (/docs), and dependency-injection architecture."),
        ("Uvicorn[standard]", ">=0.30.0", "Lightning ASGI Server", "Production-grade ASGI web server running FastAPI with event loop optimizations (uvloop) and HTTP/2 proxy compatibility."),
        ("Pydantic v2 (pydantic)", ">=2.9.0", "Data Validation & Schemas", "Rust-backed data validation engine that enforces strict schema validation on incoming financial requests, ensuring accurate decimal amounts, non-negative numbers, and clean JSON serialization."),
        ("Pydantic Settings", ">=2.5.0", "Environment Configuration", "Type-safe environment variable parsing from .env files (database credentials, session secret keys, CORS origins, and API ports)."),
        ("SQLAlchemy 2.0", ">=2.0.35", "Relational ORM & Database Engine", "Manages database connections, connection pooling, and complex SQL transactions. Implements pessimistic row-level locking (with_for_update()) on consultation slots to eliminate race conditions."),
        ("Psycopg 3 (psycopg[binary])", ">=3.2.0", "Modern PostgreSQL Driver", "High-speed native C-extension database adapter connecting Python to PostgreSQL 16 with binary protocol support and connection pooling."),
        ("Alembic", ">=1.13.0", "Database Migrations", "Tracks database schema revisions, table definitions, indexes, and automated migration scripts across PostgreSQL environments."),
        ("Argon2-cffi", ">=23.1.0", "Bank-Grade Password Hashing", "The winner of the Password Hashing Competition (PHC). Provides memory-hard cryptographic protection against brute-force, dictionary, and GPU rainbow-table attacks for user credentials."),
        ("ItsDangerous", ">=2.2.0", "Cryptographic Signing", "Generates and verifies tamper-proof session tokens and Double-Submit CSRF security cookies used to protect mutating endpoints."),
        ("Python-Multipart", ">=0.0.12", "Form Data Parsing", "Handles multipart/form-data encoding for secure credential transfer during customer login and registration."),
        ("Pytest & Pytest-Asyncio", ">=8.3.0", "Automated Testing Framework", "Powers the CoverWise 97/97 regression test suite, testing actuarial calculations, pricing formulas, ranking algorithms, concurrency safety, and RBAC authentication."),
        ("HTTPX", ">=0.27.0", "Async HTTP Testing Client", "Provides asynchronous test client execution for validating FastAPI endpoints and concurrent slot booking stress tests.")
    ]

    be_table = doc.add_table(rows=len(be_libs) + 1, cols=4)
    be_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers_be = ["Library / Package", "Version", "Category", "Exact Purpose in CoverWise"]
    for i, h in enumerate(headers_be):
        cell = be_table.cell(0, i)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for row_idx, (lib, ver, cat, purp) in enumerate(be_libs, start=1):
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate([lib, ver, cat, purp]):
            c = be_table.cell(row_idx, col_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, top=60, bottom=60, left=100, right=100)
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_NAVY
            elif col_idx == 2:
                r.font.color.rgb = COLOR_TEAL
            else:
                r.font.color.rgb = COLOR_SLATE

    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION 2: END-TO-END WORKFLOW (REGISTRATION TO BOOKING)
    # -------------------------------------------------------------
    h2 = doc.add_heading(level=1)
    h2.paragraph_format.space_before = Pt(18)
    h2.paragraph_format.space_after = Pt(6)
    r = h2.add_run("2. End-to-End Workflow: From User Registration to Advisor Booking")
    r.font.name = "Arial"
    r.font.color.rgb = COLOR_NAVY

    doc.add_paragraph("This section breaks down the entire customer journey in simple, neat, and sequential steps. It clearly explains what happens on the screen (Frontend) and behind the scenes (Backend & Database) at every moment:")

    steps = [
        ("Step 1: User Lands on CoverWise & Picks Language",
         "What User Sees: ", "The user arrives at the clean fintech homepage, experiences a 850ms cinematic branded preloader, and can immediately toggle between 5 Indian languages (English, Telugu, Hindi, Tamil, Kannada) using the navbar dropdown or hero chip.",
         "Behind the Scenes: ", "React's useLanguage() context loads the corresponding language dictionary from translations.ts. The session checks sessionStorage('cw_preloader_shown') so the preloader only runs once per browser session. No API calls are needed for language changes, resulting in instant 0ms rendering."),

        ("Step 2: Optional User Registration / Sign-Up",
         "What User Sees: ", "The user clicks 'Sign In / Register' in the navbar (or can browse anonymously first). A modal opens allowing them to enter Full Name, Email Address, and Password.",
         "Behind the Scenes: ", "Frontend sends a POST request to /api/v1/auth/register. The backend checks for duplicate emails, hashes the password using Argon2-cffi, creates a user record with role='customer', generates an HttpOnly session cookie, and returns a double-submit CSRF token header."),

        ("Step 3: Stage 1 — 5-Step Guided Needs Assessment",
         "What User Sees: ", "The user clicks 'Find My Cover →' and progresses through 5 easy steps:\n"
         "• Step 1 (Demographics): Age, Gender, Tobacco/Smoker status, NRI status, Annual Income, Monthly Household Expenses.\n"
         "• Step 2 (Dependents): Number of dependent family members and age of the youngest dependent child.\n"
         "• Step 3 (Liabilities): Outstanding home loans, car loans, personal debts.\n"
         "• Step 4 (Milestones): Future financial goals (Child Higher Education, Child Marriage, Target Year).\n"
         "• Step 5 (Existing Assets): Current savings (mutual funds, FDs) and existing life cover.",
         "Behind the Scenes: ", "Frontend state stores all inputs. Users can switch between 'Simple Mode' (standard IRDAI benchmarks: 8% inflation, 7% discount rate, 25% personal consumption) and 'Expert Mode' (customizable percentages). Form entries survive language toggles without data loss."),

        ("Step 4: Stage 2 — Instant Actuarial Analysis & Coverage Gap",
         "What User Sees: ", "A comprehensive visual dashboard comparing:\n"
         "• Human Life Value (HLV): The total economic value of lost earnings to age 60.\n"
         "• Net Needs Breakdown: Living Support PV + Debt Payoff + Discounted Milestone Goals + 6-Month Emergency Buffer.\n"
         "• The Net Protection Gap: The final recommended life cover amount (e.g. ₹1.90 Crore), rounded up to the nearest standard multiple.\n"
         "• Goal Compounding Table: Shows how a ₹25 Lakh college fee today compounds to ₹67 Lakhs in 13 years at 8% inflation, and discounts to ₹28 Lakhs today at 7% return.",
         "Behind the Scenes: ", "Frontend calls POST /api/v1/assessments/calculate. Python executes needs.py using pure Decimal precision. It computes year-by-year income projections with personal consumption deduction (1 - c), compounds each goal with FV = PV * (1 + i)^t, and discounts with PV = FV / (1 + r)^t. Zero AI hallucination; 100% mathematically verifiable."),

        ("Step 5: Stage 3 — Plan Recommendations & 4-Pillar Ranking",
         "What User Sees: ", "Ranked cards displaying suitable IRDAI life insurance policies (Saffron Kesaro Term, Kesaro Return, Kesaro Rising Cover) with match percentages (e.g. 99% Match), monthly/annual premiums, and key benefits. Users can check 'Compare' on up to 3 plans for side-by-side comparison.",
         "Behind the Scenes: ", "Backend executes recommendations.py. It filters out non-compliant plans (e.g., age or income outside limits) and scores eligible policies using our 4-Pillar Model: 40% Coverage Gap Fit + 30% Affordability + 20% Product Type Fit + 10% Feature & Tenure Fit. All features, watchouts, and reasons are translated dynamically into the user's active language by localizeCatalog.ts."),

        ("Step 6: Policy Customization & 'Select This Plan'",
         "What User Sees: ", "The user clicks 'Customize Plan' on their preferred card. A modal opens allowing them to adjust Policy Term (e.g. 25 to 40 years), Sum Assured, Payment Frequency (Monthly or Annual), and add-on riders (Accidental Death Benefit, Critical Illness Cover). When satisfied, they click 'Select This Plan'.",
         "Behind the Scenes: ", "Live pricing recalculations call pricing.py with official rate tables. When 'Select This Plan' is clicked, the selected policy ID, sum assured, tenure, premium, and rider list are saved into the app's SelectedPlan state. A prominent 'Your Selected Protection Plan' banner appears at the top of recommendations."),

        ("Step 7: Stage 4 — Certified Advisor Discovery",
         "What User Sees: ", "The user clicks 'Continue to Advisor Consultation →'. The directory opens displaying certified human advisors with star ratings, experience years, spoken languages, and consultation modes (Video, Phone, Chat). The user filters by their native language (e.g., Telugu).",
         "Behind the Scenes: ", "If the user is not yet logged in, CoverWise automatically pops up the AuthModal. After signing in, it returns the user directly to the advisor view with zero progress lost. AdvisorDirectory.tsx displays the top header unified with Stages 1–3, complete with a badge displaying the customer's selected plan."),

        ("Step 8: Transaction-Safe Slot Booking & Plan Handoff",
         "What User Sees: ", "The user clicks 'Book Consultation' on their chosen advisor, selects a date and an available 30-minute time slot, and clicks 'Confirm Booking'.",
         "Behind the Scenes: ", "1. Frontend sends POST /api/v1/bookings/ with slot_id, consultation_mode, and assessment_summary (which carries the user's protection gap and selected plan details).\n"
         "2. Backend opens a PostgreSQL transaction and locks the slot row: SELECT * FROM advisor_slots WHERE id = ? FOR UPDATE.\n"
         "3. If another customer tries to book the same slot at the exact same millisecond, they are safely blocked and receive a clean 'Slot already taken' notice.\n"
         "4. Backend inserts the confirmed booking record and updates the slot status to 'booked'.\n"
         "5. The database partial unique index ix_bookings_confirmed_slot acts as a second hardware-level guarantee against duplicate bookings."),

        ("Step 9: Confirmation & Post-Booking Advisor Dashboard",
         "What User Sees: ", "• Customer: Instant 'Consultation Confirmed!' screen with meeting details, advisor name, and an option to view 'My Consultations'.\n"
         "• Advisor: When the advisor logs in, their dedicated 'Advisor Portal' displays the new appointment with a clean 'Customer's Shared Financial Summary' card showing the customer's protection gap (₹1.90 Cr), selected plan, tenure, and riders—allowing the advisor to prepare personalized advice beforehand.",
         "Behind the Scenes: ", "The booking record is accessible only by the customer who created it (IDOR protection) and the specific assigned advisor via RBAC route guards. The advisor can update status to 'completed' or 'cancelled' and save consultation notes into PostgreSQL.")
    ]

    for step_num, wus_title, wus_text, bts_title, bts_text in steps:
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(8)
        sp.paragraph_format.space_after = Pt(2)
        r_step = sp.add_run(step_num)
        r_step.font.name = "Arial"
        r_step.font.size = Pt(11)
        r_step.font.bold = True
        r_step.font.color.rgb = COLOR_NAVY

        # What User Sees paragraph
        p_wus = doc.add_paragraph()
        p_wus.paragraph_format.left_indent = Inches(0.2)
        p_wus.paragraph_format.space_after = Pt(2)
        r_wt = p_wus.add_run(wus_title)
        r_wt.font.bold = True
        r_wt.font.size = Pt(9.5)
        r_wt.font.color.rgb = COLOR_TEAL
        r_wd = p_wus.add_run(wus_text)
        r_wd.font.size = Pt(9.5)
        r_wd.font.color.rgb = COLOR_SLATE

        # Behind the scenes paragraph
        p_bts = doc.add_paragraph()
        p_bts.paragraph_format.left_indent = Inches(0.2)
        p_bts.paragraph_format.space_after = Pt(6)
        r_bt = p_bts.add_run(bts_title)
        r_bt.font.bold = True
        r_bt.font.size = Pt(9.5)
        r_bt.font.color.rgb = COLOR_NAVY
        r_bd = p_bts.add_run(bts_text)
        r_bd.font.size = Pt(9.5)
        r_bd.font.color.rgb = COLOR_SLATE

    # -------------------------------------------------------------
    # SECTION 3: SYSTEM MODULES AND THEIR FUNCTIONALITY
    # -------------------------------------------------------------
    h3 = doc.add_heading(level=1)
    h3.paragraph_format.space_before = Pt(18)
    h3.paragraph_format.space_after = Pt(6)
    r = h3.add_run("3. System Modules and Core Responsibilities")
    r.font.name = "Arial"
    r.font.color.rgb = COLOR_NAVY

    modules = [
        ("Module 1: Actuarial Needs Engine (needs.py)", 
         "Calculates financial protection gaps using verifiable mathematics rather than black-box AI approximations. Runs calculate_hlv() (present value of all future lost earnings to age 60, applying personal consumption deductions) and calculate_net_needs() (debt payoff + emergency cash + future milestones minus existing liquid wealth)."),
        ("Module 2: Pricing & Rate Lookup Engine (pricing.py)",
         "Determines exact annual and monthly installment premiums. Interpolates base rates per ₹1,000 Sum Assured from official dataset tables, applies modal factors (Monthly: 0.0875, Quarterly: 0.26, Semi-Annual: 0.51, Annual: 1.0), calculates supplementary rider premiums, and executes commercial half-up rounding (ROUND_HALF_UP)."),
        ("Module 3: Recommendation & Ranking Engine (recommendations.py)",
         "Evaluates candidate policies against hard gating criteria (entry age, maturity age, minimum income threshold, smoker underwriting) and ranks them using a weighted composite score: 40% Coverage Fit + 30% Affordability + 20% Product Type Fit + 10% Feature & Tenure Fit."),
        ("Module 4: Concurrency-Safe Booking Engine (booking.py)",
         "Manages 30-minute consultation appointments. Uses PostgreSQL pessimistic row locks (SELECT ... FOR UPDATE) to prevent double-booking race conditions when multiple users click the same slot simultaneously. Backed by a partial unique database index as a fail-safe constraint."),
        ("Module 5: Role-Based Navigation & Security Module (auth.py, App.tsx)",
         "Enforces complete isolation between Customer, Advisor, and Admin roles. Authenticated advisors are automatically routed to their consultation portal with client briefs; admins access aggregate operational statistics with customer personal identifiable information (PII) masked."),
        ("Module 6: Indic Multilingual Localization Engine (translations.ts, localizeCatalog.ts)",
         "Maintains complete dictionary mapping across 5 Indian languages (English, Telugu, Hindi, Tamil, Kannada). Translates 100% of product features, exclusions, reasons, and goal names with zero calculation drift or currency discrepancies.")
    ]
    for m_title, m_desc in modules:
        mp = doc.add_paragraph(style='List Bullet')
        mp.paragraph_format.space_after = Pt(4)
        rmt = mp.add_run(m_title + "\n")
        rmt.font.bold = True
        rmt.font.color.rgb = COLOR_NAVY
        rmd = mp.add_run(m_desc)
        rmd.font.size = Pt(9.5)
        rmd.font.color.rgb = COLOR_SLATE

    # -------------------------------------------------------------
    # SECTION 4: PLAIN-ENGLISH GLOSSARY (THE JARGON BUSTER)
    # -------------------------------------------------------------
    h4 = doc.add_heading(level=1)
    h4.paragraph_format.space_before = Pt(18)
    h4.paragraph_format.space_after = Pt(6)
    r = h4.add_run("4. Plain-English Glossary of All Calculation Terms")
    r.font.name = "Arial"
    r.font.color.rgb = COLOR_NAVY

    doc.add_paragraph("This glossary explains every single input parameter, math formula, and financial concept used in CoverWise in crystal-clear, plain English:")

    glossary_items = [
        ("Current Age", "Profile", "The customer's age in completed years today. Sets the remaining working years until retirement and determines the baseline mortality rate used for premium calculations."),
        ("Retirement Age", "Profile", "The age when the breadwinner plans to stop working (default: 60 years). Human Life Value is calculated only up to this age because you only replace earned income during your working life."),
        ("Gender", "Profile", "Male or Female. Actuarial life tables in India show that women have a longer statistical life expectancy, leading to lower term life premium rates."),
        ("Smoker Status", "Profile", "Whether the customer consumes tobacco. Tobacco significantly increases health risks; non-smokers receive up to 30%–50% discount on insurance premiums."),
        ("NRI Status", "Profile", "Non-Resident Indian (living/working outside India). Triggers specific underwriting rules and currency compliance considerations."),
        ("Homemaker", "Profile", "A family member managing household operations without formal salary. Life cover recognizes their vital economic contribution (childcare, domestic support) that would cost money to replace."),
        ("Annual Income", "Financial", "Total gross take-home earnings received in one year. Serves as the foundation for calculating how much income needs to be replaced if the earner passes away."),
        ("Monthly Expenses", "Financial", "The essential money spent every month on groceries, utilities, rents, and bills. This is the family's survival baseline that must continue uninterrupted."),
        ("Self-Consumption Share", "Actuarial", "The portion of income the breadwinner spends exclusively on themselves (food, clothes, personal travel). If the breadwinner passes away, this expense disappears. Deducting this (20%–30% ICMR benchmark) prevents the family from over-insuring."),
        ("Family Contribution", "Financial", "Annual Income minus Self-Consumption Share. The net money that actually feeds, clothes, and supports the spouse, children, and parents."),
        ("Youngest Dependent Age", "Family", "The age of the youngest child or family dependent today. Used to compute the Dependency Horizon."),
        ("Dependency Horizon", "Family", "The number of years until the youngest child becomes financially independent (typically at age 23–25). If your youngest child is 2, your family needs income protection for at least 23 years."),
        ("Outstanding Liabilities", "Debt", "The total unpaid balance on all home loans, car loans, and personal borrowings. Insurance must provide enough immediate cash to clear 100% of debt so banks don't seize the family home."),
        ("Emergency Buffer", "Safety", "A reserve fund (equal to 6 months of living expenses) set aside for sudden emergencies, medical needs, or transitional shocks."),
        ("Final Expenses", "Safety", "An immediate cash allowance for hospital, medical, and funeral expenses incurred during bereavement."),
        ("Liquid Assets", "Wealth", "Savings accounts, Fixed Deposits (FDs), and Mutual Funds that can be cashed in quickly. Subtracted from the insurance need so the user doesn't buy unnecessary cover."),
        ("Existing Life Cover", "Insurance", "Any term policies or corporate group life covers already active. Also subtracted from the gross need to find the remaining gap."),
        ("Milestone Goals", "Goals", "Major future family events like college degrees or weddings that must be funded even if the parent is no longer there."),
        ("Today's Cost (PV_today)", "Goals", "What the milestone goal would cost if you paid for it today (e.g. ₹25 Lakhs for an engineering degree today)."),
        ("Target Year", "Goals", "The future year when the money is needed (e.g. child is 5 today; college starts at age 18 in 13 years)."),
        ("Education Inflation (i)", "Math", "The annual rate at which college fees increase in India (typically 8%–10%). A ₹25 Lakh degree today will cost over ₹67 Lakhs in 13 years!"),
        ("Future Cost (FV)", "Math", "The compounded total cost of the goal when the time arrives: FV = PV_today * (1 + i)^t."),
        ("Discount Rate (r)", "Math", "The safe annual interest rate (typically 7%) the family can earn by investing the insurance payout in government bonds or fixed deposits."),
        ("Present Value (PV)", "Math", "How much cash is needed today so that with interest, it grows to meet the future goal: PV = FV / (1 + r)^t. Prevents over-insuring."),
        ("Human Life Value (HLV)", "Actuarial", "The total economic loss to the family if the earner passes away today. Equal to the sum of all future family income contributions discounted to today's value."),
        ("Net Needs Approach", "Actuarial", "Itemized calculation: Total Loans + Emergency Fund + Milestone Goals (PV) + Living Support (PV) minus Current Liquid Savings minus Existing Policies."),
        ("Recommended Cover Gap", "Result", "The exact amount of new life insurance protection the customer needs to buy today to be 100% financially secure."),
        ("Cover Rounding Step", "Policy", "Rounding the calculated gap up to the nearest clean standard multiple (e.g. nearest ₹5 Lakh or ₹10 Lakh) to match insurer policy blocks."),
        ("Sum Assured (SA)", "Product", "The guaranteed tax-free lump sum paid to the family if the policyholder passes away during the policy term."),
        ("Policy Term (Tenure)", "Product", "The number of years the policy stays active (e.g. 25 or 30 years). Usually chosen to match your dependency horizon or retirement age."),
        ("Modal Loading Factor", "Pricing", "A standard multiplier applied when paying monthly rather than annually (0.0875 for monthly, 0.26 for quarterly, 0.51 for semi-annual)."),
        ("Supplementary Riders", "Product", "Affordable add-on protections attached to the policy, such as Accidental Death Benefit or Critical Illness Cover."),
        ("Claim Settlement Ratio", "Trust", "The percentage of death claims an insurer successfully pays out (e.g. 98.4%). Higher ratios signify dependable insurers."),
        ("Solvency Ratio", "Trust", "A financial health score mandated by IRDAI (>= 1.5) measuring an insurer's ability to pay catastrophic claims without going bankrupt."),
        ("Match Score (0-100%)", "AI/Alg", "An objective suitability score calculated by our 4-pillar algorithm (40% Coverage, 30% Affordability, 20% Type, 10% Features) to eliminate sales bias.")
    ]

    gloss_table = doc.add_table(rows=len(glossary_items) + 1, cols=3)
    gloss_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Term / Concept", "Category", "Plain-English Meaning & Purpose"]
    for i, h in enumerate(headers):
        cell = gloss_table.cell(0, i)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for row_idx, (t_name, t_cat, t_desc) in enumerate(glossary_items, start=1):
        c1 = gloss_table.cell(row_idx, 0)
        c2 = gloss_table.cell(row_idx, 1)
        c3 = gloss_table.cell(row_idx, 2)
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        set_cell_background(c1, bg)
        set_cell_background(c2, bg)
        set_cell_background(c3, bg)
        set_cell_margins(c1, top=60, bottom=60, left=100, right=100)
        set_cell_margins(c2, top=60, bottom=60, left=100, right=100)
        set_cell_margins(c3, top=60, bottom=60, left=100, right=100)
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(t_name)
        r1.font.bold = True
        r1.font.size = Pt(9)
        r1.font.color.rgb = COLOR_NAVY
        
        p2 = c2.paragraphs[0]
        r2 = p2.add_run(t_cat)
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = COLOR_TEAL

        p3 = c3.paragraphs[0]
        r3 = p3.add_run(t_desc)
        r3.font.size = Pt(8.5)
        r3.font.color.rgb = COLOR_SLATE

    # Save to disk
    output_path = Path("E:/TEAMID_12/COVERWISE_SYSTEM_DOCUMENTATION_AND_TERMINOLOGY_GUIDE.docx")
    doc.save(str(output_path))
    print(f"Successfully generated updated Word document at: {output_path}")

if __name__ == "__main__":
    create_document()
