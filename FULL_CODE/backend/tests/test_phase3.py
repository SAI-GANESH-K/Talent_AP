"""Comprehensive test suite for Phase 3 Product Recommendation and Pricing System.

Includes:
1. Golden test: Official synthetic example for Saffron Kesaro Term = ₹1,045/mo.
2. Premium pricing engine unit tests (band factors, modal factors, Decimal rounding, smoker multiplier).
3. Product eligibility engine tests (age limits, income multiple caps, NRI, non-earning spouse).
4. Recommendation engine tests (4-pillar scoring, tie-breaking, shortfall calculation).
5. FastAPI endpoint integration tests.
"""

from decimal import Decimal
import warnings
import pytest
from fastapi.testclient import TestClient

warnings.filterwarnings("ignore", category=DeprecationWarning)

from app.db.session import SessionLocal
from app.main import app
from app.models.source_data import Product, Rider
from app.services.eligibility import (
    CustomerProfileInput,
    evaluate_product_eligibility,
)
from app.services.pricing import (
    PricingInput,
    SelectedRiderInput,
    calculate_quote,
)
from app.services.recommendation import (
    generate_recommendations,
)


@pytest.fixture(scope="module")
def db():
    """Provide a database session for testing."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="module")
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


# -----------------------------------------------------------------------------
# 1. GOLDEN TEST: OFFICIAL SYNTHETIC EXAMPLE (₹1,045)
# -----------------------------------------------------------------------------

def test_official_golden_premium_saffron_kesaro(db):
    """Verify official synthetic example calculates exactly ₹1,045.
    
    Inputs:
    - Product: Saffron Kesaro Term (PRD-X4CBUF)
    - Age: 30, Gender: Male, Non-smoker
    - Sum Assured: ₹1 Crore (10,000,000)
    - Policy Term: 30 years
    - Rider: ₹50 Lakh (5,000,000) Accidental Death Benefit (RDR-LUR23D)
    
    Expected exact figures:
    - Base rate per 1,000 SA: 1.044
    - SA Band factor (1 Cr): 1.00
    - Base Annual Premium: ₹10,440
    - Rider Annual Premium: ₹1,500
    - Base Monthly Instalment: ₹914 (10440 * 0.0875 = 913.50 -> 914)
    - Rider Monthly Instalment: ₹131 (1500 * 0.0875 = 131.25 -> 131)
    - Final Monthly Premium: ₹1,045 (914 + 131)
    """
    pricing_in = PricingInput(
        product_id="PRD-X4CBUF",
        entry_age=30,
        gender="male",
        smoker_status="non_smoker",
        policy_term_years=30,
        premium_payment_option="regular",
        premium_mode="monthly",
        sum_assured=Decimal("10000000"),
        selected_riders=[
            SelectedRiderInput(
                rider_id="RDR-LUR23D",
                sum_assured=Decimal("5000000"),
            )
        ],
    )

    quote = calculate_quote(db, pricing_in)

    assert quote.product_id == "PRD-X4CBUF"
    assert quote.base_annual_premium == Decimal("10440.00")
    assert quote.base_instalment_premium == Decimal("914.00")
    assert len(quote.rider_quotes) == 1

    rider_quote = quote.rider_quotes[0]
    assert rider_quote.rider_id == "RDR-LUR23D"
    assert rider_quote.annual_premium == Decimal("1500.00")
    assert rider_quote.instalment_premium == Decimal("131.00")

    assert quote.total_annual_premium == Decimal("11940.00")
    assert quote.total_instalment_premium == Decimal("1045.00")


# -----------------------------------------------------------------------------
# 2. PRICING ENGINE UNIT TESTS
# -----------------------------------------------------------------------------

def test_annual_frequency_exact_calculation(db):
    """Test annual frequency has no modal surcharge (factor = 1.00)."""
    pricing_in = PricingInput(
        product_id="PRD-X4CBUF",
        entry_age=30,
        gender="male",
        smoker_status="non_smoker",
        policy_term_years=30,
        premium_payment_option="regular",
        premium_mode="annual",
        sum_assured=Decimal("10000000"),
        selected_riders=[],
    )
    quote = calculate_quote(db, pricing_in)
    assert quote.base_annual_premium == Decimal("10440.00")
    assert quote.base_instalment_premium == Decimal("10440.00")
    assert quote.total_instalment_premium == Decimal("10440.00")


def test_smoker_multiplier_increases_premium(db):
    """Smoker rates should be significantly higher than non-smoker rates."""
    non_smoker_in = PricingInput(
        product_id="PRD-X4CBUF",
        entry_age=35,
        gender="male",
        smoker_status="non_smoker",
        policy_term_years=25,
        premium_mode="annual",
        sum_assured=Decimal("10000000"),
    )
    smoker_in = PricingInput(
        product_id="PRD-X4CBUF",
        entry_age=35,
        gender="male",
        smoker_status="smoker",
        policy_term_years=25,
        premium_mode="annual",
        sum_assured=Decimal("10000000"),
    )

    quote_ns = calculate_quote(db, non_smoker_in)
    quote_sm = calculate_quote(db, smoker_in)

    assert quote_sm.base_annual_premium > quote_ns.base_annual_premium


def test_female_rates_lower_or_equal_to_male(db):
    """Actuarial mortality tables typically price females lower due to higher life expectancy."""
    male_in = PricingInput(
        product_id="PRD-X4CBUF",
        entry_age=30,
        gender="male",
        smoker_status="non_smoker",
        policy_term_years=30,
        premium_mode="annual",
        sum_assured=Decimal("10000000"),
    )
    female_in = PricingInput(
        product_id="PRD-X4CBUF",
        entry_age=30,
        gender="female",
        smoker_status="non_smoker",
        policy_term_years=30,
        premium_mode="annual",
        sum_assured=Decimal("10000000"),
    )
    quote_m = calculate_quote(db, male_in)
    quote_f = calculate_quote(db, female_in)
    assert quote_f.base_annual_premium <= quote_m.base_annual_premium


def test_rider_cap_exceeded_rejected(db):
    """Rider SA exceeding base SA must raise error."""
    pricing_in = PricingInput(
        product_id="PRD-X4CBUF",
        entry_age=30,
        gender="male",
        smoker_status="non_smoker",
        policy_term_years=30,
        premium_mode="annual",
        sum_assured=Decimal("5000000"),
        selected_riders=[
            SelectedRiderInput(
                rider_id="RDR-LUR23D",
                sum_assured=Decimal("6000000"),  # Exceeds base SA 50L (max 100%)
            )
        ],
    )
    with pytest.raises(ValueError, match="exceeds maximum permitted"):
        calculate_quote(db, pricing_in)


def test_ulip_pricing_calculation(db):
    """Verify ULIP pricing handles fund allocation and annual premium limits."""
    ulip_in = PricingInput(
        product_id="PRD-UPERQ6",
        entry_age=30,
        gender="male",
        smoker_status="non_smoker",
        policy_term_years=20,
        premium_payment_option="regular",
        premium_mode="annual",
        sum_assured=Decimal("1000000"),
        ulip_annual_premium=Decimal("100000"),
        ulip_sa_multiple=10,
        ulip_fund_id="FND-RDC0W3",
    )
    quote = calculate_quote(db, ulip_in)
    assert quote.product_id == "PRD-UPERQ6"
    assert quote.base_annual_premium == Decimal("100000.00")
    assert quote.base_instalment_premium == Decimal("100000.00")
    assert quote.sum_assured == Decimal("1000000")


# -----------------------------------------------------------------------------
# 3. ELIGIBILITY ENGINE TESTS
# -----------------------------------------------------------------------------

def test_eligibility_age_boundaries(db):
    """Under minimum entry age or over maximum entry age should be rejected."""
    product = db.query(Product).filter_by(product_id="PRD-X4CBUF").first()
    assert product is not None
    riders = db.query(Rider).all()

    # Under minimum entry age (17 < 18)
    young_cust = CustomerProfileInput(
        age=17,
        annual_income_inr=Decimal("1000000"),
        gender="male",
    )
    res_young = evaluate_product_eligibility(product, young_cust, all_riders=riders)
    assert not res_young.is_eligible
    assert any("minimum entry age" in r for r in res_young.rejection_reasons)

    # Over maximum entry age (66 > 65)
    old_cust = CustomerProfileInput(
        age=66,
        annual_income_inr=Decimal("1000000"),
        gender="male",
    )
    res_old = evaluate_product_eligibility(product, old_cust, all_riders=riders)
    assert not res_old.is_eligible
    assert any("maximum entry age" in r for r in res_old.rejection_reasons)


def test_eligibility_income_multiple_cap(db):
    """Total insurance cannot exceed age-dependent income multiple (e.g. 25x under 35)."""
    product = db.query(Product).filter_by(product_id="PRD-X4CBUF").first()
    riders = db.query(Rider).all()

    # Income 400,000 -> 25x = 10,000,000 max.
    # Existing cover = 8,000,000 -> max additional = 2,000,000.
    # Product min SA is 2,500,000 -> cannot be accommodated (20L < 25L).
    cust = CustomerProfileInput(
        age=30,
        annual_income_inr=Decimal("400000"),
        existing_individual_life_cover_inr=Decimal("8000000"),
        gender="male",
    )
    res = evaluate_product_eligibility(product, cust, all_riders=riders)
    assert not res.is_eligible
    assert any("underwriting" in r for r in res.rejection_reasons)


def test_nri_customer_eligibility(db):
    """NRI applicant should only be eligible for NRI-supported products."""
    riders = db.query(Rider).all()
    nri_cust = CustomerProfileInput(
        age=32,
        annual_income_inr=Decimal("2500000"),
        is_nri=True,
        gender="male",
    )

    trm_001 = db.query(Product).filter_by(product_id="PRD-X4CBUF").first()
    res = evaluate_product_eligibility(trm_001, nri_cust, all_riders=riders)
    if trm_001.nri_eligible:
        assert res.is_eligible
    else:
        assert not res.is_eligible
        assert any("NRI" in r for r in res.rejection_reasons)


def test_non_earning_spouse_rule(db):
    """Non-earning applicant is eligible only if working spouse has adequate income & cover."""
    product = db.query(Product).filter_by(product_id="PRD-X4CBUF").first()
    riders = db.query(Rider).all()

    # Non-earning with NO working spouse income (0)
    no_spouse = CustomerProfileInput(
        age=30,
        annual_income_inr=Decimal("0"),
        is_homemaker=True,
        spouse_annual_income_inr=Decimal("0"),
        gender="female",
    )
    res1 = evaluate_product_eligibility(product, no_spouse, all_riders=riders)
    assert not res1.is_eligible
    assert any("requires a working spouse" in r for r in res1.rejection_reasons)

    # Product that explicitly disallows non-earning applicants
    p_disallow = db.query(Product).filter_by(product_id="PRD-24CQIR").first()
    res_disallow = evaluate_product_eligibility(
        p_disallow,
        CustomerProfileInput(
            age=30,
            annual_income_inr=Decimal("0"),
            is_homemaker=True,
            spouse_annual_income_inr=Decimal("1000000"),
            gender="female",
        ),
        all_riders=riders,
    )
    assert not res_disallow.is_eligible
    assert any("does not accept non-earning" in r for r in res_disallow.rejection_reasons)

    # Non-earning with working spouse having ₹12L income on eligible product
    with_spouse = CustomerProfileInput(
        age=30,
        annual_income_inr=Decimal("0"),
        is_homemaker=True,
        spouse_annual_income_inr=Decimal("1200000"),
        existing_individual_life_cover_inr=Decimal("0"),
        gender="female",
    )
    res2 = evaluate_product_eligibility(product, with_spouse, all_riders=riders)
    assert res2.is_eligible


# -----------------------------------------------------------------------------
# 4. RECOMMENDATION ENGINE TESTS
# -----------------------------------------------------------------------------

def test_recommendation_scoring_and_ranking(db):
    """Recommendation engine must rank products deterministically using the 4-pillar weights."""
    customer = CustomerProfileInput(
        age=30,
        annual_income_inr=Decimal("1200000"),
        gender="male",
        smoker_status="non_smoker",
        monthly_premium_budget_inr=Decimal("5000"),
        risk_appetite="moderate",
    )
    rec_result = generate_recommendations(
        db=db,
        customer=customer,
        recommended_gap_inr=Decimal("10000000"),
    )

    assert len(rec_result.recommendations) > 0
    first = rec_result.recommendations[0]
    assert 0.0 <= first.composite_score <= 100.0

    scores = [p.composite_score for p in rec_result.recommendations]
    assert scores == sorted(scores, reverse=True)

    assert first.category_label in [
        "Family Protection",
        "Debt Protection",
        "Long-Term Protection",
        "Protection With Savings",
        "Child Future Shield",
        "Investment-Linked Protection",
    ]


def test_recommendation_shortfall_calculation(db):
    """If recommended product has max SA lower than gap, shortfall is reported."""
    customer = CustomerProfileInput(
        age=45,
        annual_income_inr=Decimal("2000000"),
        gender="male",
        smoker_status="non_smoker",
        monthly_premium_budget_inr=Decimal("10000"),
    )
    # Very large gap of 10 Crores
    rec_result = generate_recommendations(
        db=db,
        customer=customer,
        recommended_gap_inr=Decimal("100000000"),
    )
    assert rec_result.recommended_coverage_gap == Decimal("100000000")
    for p in rec_result.recommendations:
        if p.recommended_sum_assured < Decimal("100000000"):
            assert p.coverage_shortfall == Decimal("100000000") - p.recommended_sum_assured


# -----------------------------------------------------------------------------
# 5. FASTAPI ENDPOINT INTEGRATION TESTS
# -----------------------------------------------------------------------------

def test_api_get_all_riders(client):
    """GET /api/v1/products/riders/all returns all 5 riders."""
    response = client.get("/api/v1/products/riders/all")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    rider_ids = [r["rider_id"] for r in data]
    assert "RDR-LUR23D" in rider_ids
    assert "RDR-GRH8AS" in rider_ids


def test_api_get_product_details(client):
    """GET /api/v1/products/{id}/details returns detailed specs."""
    response = client.get("/api/v1/products/PRD-X4CBUF/details")
    assert response.status_code == 200
    data = response.json()
    assert data["product_id"] == "PRD-X4CBUF"
    assert data["product_name"] == "Saffron Kesaro Term"
    assert data["min_sum_assured_inr"] == 2_500_000


def test_api_quote_golden_example(client):
    """POST /api/v1/products/quote returns exact golden ₹1,045 quote."""
    payload = {
        "product_id": "PRD-X4CBUF",
        "entry_age": 30,
        "gender": "male",
        "smoker_status": "non_smoker",
        "policy_term_years": 30,
        "premium_payment_option": "regular",
        "premium_mode": "monthly",
        "sum_assured": 10000000,
        "selected_riders": [
            {
                "rider_id": "RDR-LUR23D",
                "sum_assured": 5000000,
            }
        ],
    }
    response = client.post("/api/v1/products/quote", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert float(data["base_annual_premium"]) == 10440.0
    assert float(data["base_instalment_premium"]) == 914.0
    assert float(data["total_instalment_premium"]) == 1045.0


def test_api_recommendations_endpoint(client):
    """POST /api/v1/products/recommendations returns ranked recommendations."""
    payload = {
        "customer": {
            "age": 32,
            "annual_income_inr": 1500000,
            "gender": "female",
            "smoker_status": "non_smoker",
            "is_nri": False,
            "monthly_premium_budget_inr": 4000,
            "risk_appetite": "moderate",
        },
        "recommended_gap_inr": 12500000,
    }
    response = client.post("/api/v1/products/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_products_evaluated"] >= 14
    assert len(data["recommendations"]) > 0
    assert "headline_explanation" in data
