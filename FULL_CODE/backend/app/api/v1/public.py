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
