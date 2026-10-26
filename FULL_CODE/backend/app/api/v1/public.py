"""Health-check and product/advisor catalogue endpoints.

These are the Phase 1 public endpoints — no auth required.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.source_data import Advisor, Product
from app.schemas.responses import AdvisorSummary, HealthResponse, ProductSummary

router = APIRouter(prefix="/api/v1", tags=["public"])


@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)) -> HealthResponse:
    """Readiness/liveness check — verifies database connectivity."""
    db_status = "unknown"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return HealthResponse(
        status="ok" if db_status == "connected" else "degraded",
        database=db_status,
    )


@router.get("/products", response_model=list[ProductSummary])
def list_products(db: Session = Depends(get_db)) -> list[ProductSummary]:
    """Return the public product catalogue.

    Safe for unauthenticated access — contains no sensitive data.
    """
    products = db.query(Product).order_by(Product.product_type, Product.product_name).all()
    return [ProductSummary.model_validate(p) for p in products]


@router.get("/advisors", response_model=list[AdvisorSummary])
def list_advisors(
    language: str | None = None,
    specialty: str | None = None,
    mode: str | None = None,
    db: Session = Depends(get_db),
) -> list[AdvisorSummary]:
    """Return advisors, optionally filtered by language/specialty/mode.

    Filtering uses case-insensitive partial match on semicolon-separated fields.
    """
    query = db.query(Advisor)

    if language:
        query = query.filter(Advisor.languages.ilike(f"%{language}%"))
    if specialty:
        query = query.filter(Advisor.specialisations.ilike(f"%{specialty}%"))
    if mode:
        query = query.filter(Advisor.consultation_modes.ilike(f"%{mode}%"))

    advisors = query.order_by(Advisor.rating.desc()).all()
    return [AdvisorSummary.model_validate(a) for a in advisors]
