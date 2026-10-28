"""Models package — import all models so Alembic can discover them."""

from app.models.app_data import Assessment, AuditEvent, Booking, QuoteScenario, User, UserSession
from app.models.source_data import (
    Advisor,
    AdvisorSlot,
    CustomerGoal,
    PremiumRate,
    Product,
    Rider,
    SyntheticProfile,
    UlipFund,
    UlipMortalityCharge,
)

__all__ = [
    "Product",
    "PremiumRate",
    "Rider",
    "UlipFund",
    "UlipMortalityCharge",
    "Advisor",
    "AdvisorSlot",
    "SyntheticProfile",
    "CustomerGoal",
    "User",
    "UserSession",
    "Assessment",
    "QuoteScenario",
    "Booking",
    "AuditEvent",
]
