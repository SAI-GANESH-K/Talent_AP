"""Intelligent product recommendation engine for CoverWise.

Implements the official 4-pillar ranking pipeline (CALCULATION_POLICY.md §5):
1. Hard gate: eliminate ineligible products using the eligibility engine
2. Coverage fit score (40% weight)
3. Affordability score (30% weight)
4. Product-type fit score (20% weight)
5. Feature fit score (10% weight)
6. Deterministic tie-breaking by product_id alphabetical
7. Customer-friendly labels and plain-language match explanations
"""

from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.models.source_data import Product, Rider
from app.services.eligibility import CustomerProfileInput, evaluate_product_eligibility
from app.services.pricing import (
    PricingInput,
    PricingQuote,
    calculate_quote,
)


class RecommendedProduct(BaseModel):
    """Ranked and quoted recommended product for customer."""
    rank: int
    product_id: str
    product_name: str
    product_type: str
    variant: str
    category_label: str  # "Family Protection", "Long-Term Protection", etc.
    composite_score: float  # 0.0 - 100.0
    coverage_fit_score: float
    affordability_score: float
    type_fit_score: float
    feature_fit_score: float
    recommended_sum_assured: Decimal
    recommended_policy_term: int
    coverage_shortfall: Decimal
    quote: PricingQuote
    why_recommended: str
    key_benefits: list[str]
    key_limitations: list[str]
    allowed_terms: list[int]
    min_allowed_sa: Decimal
    max_allowed_sa: Decimal
    sum_assured_step: Decimal
    allowed_payment_options: list[str]
    allowed_modes: list[str]
    eligible_rider_ids: list[str]


class RejectedProduct(BaseModel):
    """Product failing eligibility criteria with structured rejection reasons."""
    product_id: str
    product_name: str
    product_type: str
    variant: str
    rejection_reasons: list[str]


class RecommendationResult(BaseModel):
    """Complete recommendation engine output."""
    recommended_coverage_gap: Decimal
    total_products_evaluated: int
    eligible_count: int
    ineligible_count: int
    recommendations: list[RecommendedProduct]
    rejected_products: list[RejectedProduct]
    headline_explanation: str
    disclaimer: str


def get_category_label(product_type: str, variant: str) -> str:
    """Map insurance product type to intuitive customer-friendly category label."""
    if product_type == "Term Life":
        if "loan" in variant:
            return "Debt Protection"
        return "Family Protection"
    elif product_type == "Whole Life":
        return "Long-Term Protection"
    elif product_type == "Endowment":
        if "child" in variant:
            return "Child Future Shield"
        return "Protection With Savings"
    elif product_type == "ULIP":
        return "Investment-Linked Protection"
    return "Life Protection"


def get_type_fit_score(product: Product, customer: CustomerProfileInput, gap: Decimal) -> float:
    """Evaluate product-type suitability based on protection gap and customer goals."""
    ptype = product.product_type

    # High protection gap (> 50L) prioritizing pure financial safety
    if gap >= Decimal("5000000"):
        if ptype == "Term Life":
            return 1.0
        elif ptype == "Whole Life":
            return 0.70
        elif ptype == "Endowment":
            return 0.60
        elif ptype == "ULIP":
            return 0.50

    # Low to moderate gap, customer may value savings or whole-life longevity
    if customer.risk_appetite == "high":
        if ptype == "ULIP":
            return 0.95
        elif ptype == "Term Life":
            return 0.90
        elif ptype == "Endowment":
            return 0.65
        return 0.70

    if customer.risk_appetite == "low":
        if ptype == "Term Life":
            return 0.95
        elif ptype == "Endowment":
            return 0.90
        elif ptype == "Whole Life":
            return 0.85
        elif ptype == "ULIP":
            return 0.35

    # Moderate risk default
    if ptype == "Term Life":
        return 0.95
    elif ptype == "Endowment":
        return 0.80
    elif ptype == "Whole Life":
        return 0.75
    elif ptype == "ULIP":
        return 0.70

    return 0.75


def generate_recommendations(
    db: Session,
    customer: CustomerProfileInput,
    recommended_gap_inr: Decimal,
) -> RecommendationResult:
    """Execute the full 4-pillar recommendation pipeline."""
    products = db.query(Product).order_by(Product.product_id).all()
    riders = db.query(Rider).all()

    eligible_candidates: list[dict] = []
    rejected_products: list[RejectedProduct] = []

    for prod in products:
        eligibility = evaluate_product_eligibility(prod, customer, all_riders=riders)

        if not eligibility.is_eligible:
            rejected_products.append(
                RejectedProduct(
                    product_id=prod.product_id,
                    product_name=prod.product_name,
                    product_type=prod.product_type,
                    variant=prod.variant,
                    rejection_reasons=eligibility.rejection_reasons,
                )
            )
            continue

        # Determine target SA for this product
        if prod.product_type == "ULIP":
            # For ULIP, estimate monthly budget to annualized premium
            annual_prem = (
                (customer.monthly_premium_budget_inr * Decimal("12"))
                if customer.monthly_premium_budget_inr and customer.monthly_premium_budget_inr > Decimal("0")
                else Decimal("60000")
            )
            min_p = Decimal(str(prod.min_annual_premium_inr or 24000))
            max_p = Decimal(str(prod.max_annual_premium_inr or 2500000))
            annual_prem = min(max_p, max(min_p, annual_prem))
            target_sa = annual_prem * (Decimal("20") if customer.age <= 44 else Decimal("10"))
        else:
            if recommended_gap_inr > Decimal("0"):
                # Align to gap, capped at product max allowed SA
                target_sa = min(eligibility.max_allowed_sa, recommended_gap_inr)
                target_sa = max(eligibility.min_allowed_sa, target_sa)
            else:
                target_sa = max(eligibility.min_allowed_sa, min(Decimal("5000000"), eligibility.max_allowed_sa))

            # Step alignment
            if eligibility.sum_assured_step > Decimal("0"):
                step = eligibility.sum_assured_step
                target_sa = (target_sa // step) * step
                if target_sa < eligibility.min_allowed_sa:
                    target_sa = eligibility.min_allowed_sa
                target_sa = min(target_sa, eligibility.max_allowed_sa)

        # Determine target term
        if customer.preferred_policy_term_years and customer.preferred_policy_term_years in eligibility.allowed_terms:
            target_term = customer.preferred_policy_term_years
        else:
            # For whole life, take single allowed term
            if prod.product_type == "Whole Life":
                target_term = eligibility.allowed_terms[0] if eligibility.allowed_terms else 30
            else:
                # Target retirement age 60, or maximum allowed term up to 30 years
                target_term = max(0, 60 - customer.age)
                if target_term not in eligibility.allowed_terms:
                    # Choose closest available term
                    target_term = min(eligibility.allowed_terms, key=lambda x: abs(x - 30))

        # Default payment option
        pay_opt = "regular"
        if "regular" not in eligibility.allowed_payment_options:
            pay_opt = eligibility.allowed_payment_options[0]

        # Calculate quote
        pricing_in = PricingInput(
            product_id=prod.product_id,
            sum_assured=target_sa,
            entry_age=customer.age,
            policy_term_years=target_term,
            gender=customer.gender,
            smoker_status=customer.smoker_status,
            premium_payment_option=pay_opt,
            premium_mode="monthly",
            selected_riders=[],
            ulip_annual_premium=annual_prem if prod.product_type == "ULIP" else None,
        )

        try:
            quote = calculate_quote(db, pricing_in)
        except Exception as e:
            # If default pricing combination is unavailable, note in rejection
            rejected_products.append(
                RejectedProduct(
                    product_id=prod.product_id,
                    product_name=prod.product_name,
                    product_type=prod.product_type,
                    variant=prod.variant,
                    rejection_reasons=[f"Default pricing combination unavailable: {str(e)}"],
                )
            )
            continue

        # ── 4-Pillar Scoring (CALCULATION_POLICY.md §5) ──

        # 1. Coverage Fit Score (40%)
        if recommended_gap_inr > Decimal("0"):
            cov_ratio = float(target_sa / recommended_gap_inr)
            coverage_fit = min(1.0, cov_ratio)
        else:
            coverage_fit = 1.0

        # 2. Affordability Score (30%)
        if customer.monthly_premium_budget_inr and customer.monthly_premium_budget_inr > Decimal("0"):
            ratio = float(quote.total_instalment_premium / customer.monthly_premium_budget_inr)
            if ratio <= 1.0:
                affordability = 1.0 - (ratio * 0.4)
            else:
                affordability = max(0.0, 1.0 - (ratio - 1.0))
        else:
            monthly_income = customer.annual_income_inr / Decimal("12")
            if monthly_income > Decimal("0"):
                ratio = float(quote.total_instalment_premium / monthly_income)
                affordability = max(0.0, 1.0 - min(1.0, ratio / 0.15))
            else:
                affordability = 0.85

        # 3. Product Type Fit (20%)
        type_fit = get_type_fit_score(prod, customer, recommended_gap_inr)

        # 4. Feature Fit (10%)
        feature_fit = 0.8
        if customer.preferred_policy_term_years and target_term == customer.preferred_policy_term_years:
            feature_fit += 0.1
        if eligibility.eligible_rider_ids:
            feature_fit += 0.1
        feature_fit = min(1.0, feature_fit)

        # Composite score (0 - 100)
        composite = (
            (coverage_fit * 0.40)
            + (affordability * 0.30)
            + (type_fit * 0.20)
            + (feature_fit * 0.10)
        ) * 100.0

        shortfall = max(Decimal("0"), recommended_gap_inr - target_sa)

        # Explanation formulation
        if prod.product_type == "Term Life":
            why = (
                f"Delivers ₹{int(target_sa):,} in pure protection to shield your family's coverage gap "
                f"with maximum cost-efficiency."
            )
        elif prod.product_type == "Whole Life":
            why = (
                f"Protects your family across your entire lifespan up to age {prod.max_maturity_age} "
                f"with guaranteed payout upon death."
            )
        elif prod.product_type == "Endowment":
            why = (
                f"Combines life cover protection with disciplined long-term maturity savings "
                f"for family milestones."
            )
        else:
            why = (
                f"Market-linked life coverage providing wealth accumulation potential "
                f"with flexible annual premium investment."
            )

        benefits = [b.strip() for b in prod.key_features.split(";") if b.strip()][:3]
        limitations = [e.strip() for e in prod.key_exclusions.split(";") if e.strip()][:2]

        eligible_candidates.append({
            "product_id": prod.product_id,
            "product_name": prod.product_name,
            "product_type": prod.product_type,
            "variant": prod.variant,
            "category_label": get_category_label(prod.product_type, prod.variant),
            "composite_score": round(composite, 1),
            "coverage_fit_score": round(coverage_fit * 100, 1),
            "affordability_score": round(affordability * 100, 1),
            "type_fit_score": round(type_fit * 100, 1),
            "feature_fit_score": round(feature_fit * 100, 1),
            "recommended_sum_assured": target_sa,
            "recommended_policy_term": target_term,
            "coverage_shortfall": shortfall,
            "quote": quote,
            "why_recommended": why,
            "key_benefits": benefits,
            "key_limitations": limitations,
            "allowed_terms": eligibility.allowed_terms,
            "min_allowed_sa": eligibility.min_allowed_sa,
            "max_allowed_sa": eligibility.max_allowed_sa,
            "sum_assured_step": eligibility.sum_assured_step,
            "allowed_payment_options": eligibility.allowed_payment_options,
            "allowed_modes": eligibility.allowed_modes,
            "eligible_rider_ids": eligibility.eligible_rider_ids,
        })

    # Sort deterministically: composite_score DESC, then product_id ASC
    eligible_candidates.sort(key=lambda x: (-x["composite_score"], x["product_id"]))

    ranked_recommendations: list[RecommendedProduct] = []
    for rank, item in enumerate(eligible_candidates, start=1):
        item["rank"] = rank
        ranked_recommendations.append(RecommendedProduct(**item))

    # Headline explanation
    if ranked_recommendations:
        top = ranked_recommendations[0]
        headline = (
            f"Based on your calculated coverage gap of ₹{int(recommended_gap_inr):,}, "
            f"we identified {len(ranked_recommendations)} eligible plans. "
            f"Top match: {top.product_name} ({top.category_label}) with a {top.composite_score}% suitability score."
        )
    else:
        headline = (
            "No insurance products in our catalogue match your profile criteria. "
            "Please consult our certified advisors for specialized underwriting assistance."
        )

    disclaimer = (
        "Illustrations only. Fictional dataset-derived product ratings for Talent AP 2026. "
        "Not financial advice or guaranteed policy underwriting approval."
    )

    return RecommendationResult(
        recommended_coverage_gap=recommended_gap_inr,
        total_products_evaluated=len(products),
        eligible_count=len(ranked_recommendations),
        ineligible_count=len(rejected_products),
        recommendations=ranked_recommendations,
        rejected_products=rejected_products,
        headline_explanation=headline,
        disclaimer=disclaimer,
    )
