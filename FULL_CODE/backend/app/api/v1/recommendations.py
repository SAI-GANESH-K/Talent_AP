"""FastAPI router for Phase 3 Product Recommendations and Pricing Quotes."""

import logging
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.source_data import Product, Rider
from app.schemas.recommendations import (
    ProductDetailResponse,
    RecommendationRequest,
    RiderDetailResponse,
)
from app.services.eligibility import (
    CustomerProfileInput,
    ProductEligibilityResult,
    evaluate_product_eligibility,
)
from app.services.pricing import (
    PricingInput,
    PricingQuote,
    calculate_quote,
)
from app.services.recommendation import (
    RecommendationResult,
    generate_recommendations,
)

logger = logging.getLogger("coverwise.recommendations")

router = APIRouter(prefix="/api/v1/products", tags=["products", "recommendations"])


@router.post("/recommendations", response_model=RecommendationResult)
def get_recommendations(
    request: RecommendationRequest,
    db: Annotated[Session, Depends(get_db)],
) -> RecommendationResult:
    """Generate personalized, ranked life insurance recommendations based on assessment gap."""
    logger.info("Recommendation requested (gap=%d)", int(request.recommended_gap_inr))
    try:
        result = generate_recommendations(
            db=db,
            customer=request.customer,
            recommended_gap_inr=request.recommended_gap_inr,
        )
        return result
    except Exception as e:
        logger.exception("Failed to generate recommendations: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations due to an internal calculation error.",
        )


@router.post("/quote", response_model=PricingQuote)
def get_product_quote(
    pricing_in: PricingInput,
    db: Annotated[Session, Depends(get_db)],
) -> PricingQuote:
    """Calculate exact premium quote for specified product, sum assured, tenure, and riders."""
    try:
        quote = calculate_quote(db, pricing_in)
        return quote
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.exception("Failed to calculate quote: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Calculation error while computing premium quote.",
        )


@router.post("/eligibility/{product_id}", response_model=ProductEligibilityResult)
def check_single_eligibility(
    product_id: str,
    customer: CustomerProfileInput,
    db: Annotated[Session, Depends(get_db)],
) -> ProductEligibilityResult:
    """Check whether customer is eligible for a specific product."""
    product = db.query(Product).filter_by(product_id=product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found.",
        )
    riders = db.query(Rider).all()
    return evaluate_product_eligibility(product, customer, all_riders=riders)


@router.get("/riders/all", response_model=list[RiderDetailResponse])
def get_all_riders(
    db: Annotated[Session, Depends(get_db)],
) -> list[RiderDetailResponse]:
    """Retrieve all available policy riders and their criteria."""
    riders = db.query(Rider).all()
    return [
        RiderDetailResponse(
            rider_id=r.rider_id,
            rider_name=r.rider_name,
            rider_category=r.rider_category,
            benefit=r.benefit,
            available_on_product_ids=r.available_on_product_ids,
            min_entry_age=r.min_entry_age,
            max_entry_age=r.max_entry_age,
            max_cover_age=r.max_cover_age,
            min_rider_sa_inr=r.min_rider_sa_inr,
            max_rider_sa_inr=r.max_rider_sa_inr,
            max_rider_sa_pct_of_base_sa=r.max_rider_sa_pct_of_base_sa,
            rate_basis=r.rate_basis,
            smoker_multiplier=float(r.smoker_multiplier),
            max_premium_pct_of_base_premium=r.max_premium_pct_of_base_premium,
        )
        for r in riders
    ]


@router.get("/{product_id}/details", response_model=ProductDetailResponse)
def get_product_details(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> ProductDetailResponse:
    """Retrieve full product specs, benefits, exclusions, and rules."""
    p = db.query(Product).filter_by(product_id=product_id).first()
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found.",
        )
    return ProductDetailResponse(
        product_id=p.product_id,
        product_name=p.product_name,
        product_type=p.product_type,
        variant=p.variant,
        participation=p.participation,
        plain_language_summary=p.plain_language_summary,
        min_entry_age=p.min_entry_age,
        max_entry_age=p.max_entry_age,
        max_maturity_age=p.max_maturity_age,
        min_sum_assured_inr=p.min_sum_assured_inr,
        max_sum_assured_inr=p.max_sum_assured_inr,
        sum_assured_step_inr=p.sum_assured_step_inr,
        policy_term_rule=p.policy_term_rule,
        allowed_policy_terms=p.allowed_policy_terms,
        premium_payment_options=p.premium_payment_options,
        premium_modes=p.premium_modes,
        modal_factor_annual=float(p.modal_factor_annual) if p.modal_factor_annual else None,
        modal_factor_half_yearly=float(p.modal_factor_half_yearly) if p.modal_factor_half_yearly else None,
        modal_factor_quarterly=float(p.modal_factor_quarterly) if p.modal_factor_quarterly else None,
        modal_factor_monthly=float(p.modal_factor_monthly) if p.modal_factor_monthly else None,
        sa_band_factors=p.sa_band_factors,
        min_annual_income_inr=p.min_annual_income_inr,
        non_earning_applicant_allowed=p.non_earning_applicant_allowed,
        riders_allowed=p.riders_allowed,
        nri_eligible=p.nri_eligible,
        death_benefit=p.death_benefit,
        maturity_benefit=p.maturity_benefit,
        key_features=p.key_features,
        key_exclusions=p.key_exclusions,
    )
