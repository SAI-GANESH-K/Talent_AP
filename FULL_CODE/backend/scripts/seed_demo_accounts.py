"""Seed demo accounts for CoverWise development and evaluation.

Security controls:
- Strictly development-only execution with fail-closed production block.
- Credentials loaded from configured settings / environment variables.
- Does NOT overwrite existing user passwords on re-run unless --force-reset is passed.
- Safe local testing with synthetic demo personas.
"""

import argparse
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.app_data import User


def seed_demo_accounts(force_reset: bool = False):
    """Seed synthetic customer, advisor, and admin personas in development only."""
    # Fail-closed check: block in production or when seeding is disabled
    if settings.environment != "development" or not settings.allow_demo_seeding:
        raise RuntimeError(
            f"Demo account seeding is blocked in environment '{settings.environment}'. "
            "Seeding synthetic demo accounts is strictly prohibited outside development."
        )

    db = SessionLocal()
    try:
        demo_users = [
            {
                "email": "customer@coverwise.test",
                "password": settings.demo_customer_password,
                "full_name": "Ramesh Sharma",
                "role": "customer",
                "advisor_id": None,
            },
            {
                "email": "advisor@coverwise.test",
                "password": settings.demo_advisor_password,
                "full_name": "Venkata Subba Rao",
                "role": "advisor",
                "advisor_id": "ADV-7JIHQA",
            },
            {
                "email": "admin@coverwise.test",
                "password": settings.demo_admin_password,
                "full_name": "CoverWise Platform Admin",
                "role": "admin",
                "advisor_id": None,
            },
        ]

        for u in demo_users:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                if force_reset:
                    existing.password_hash = hash_password(u["password"])
                    existing.full_name = u["full_name"]
                    existing.role = u["role"]
                    existing.advisor_id = u["advisor_id"]
                    existing.is_active = True
                    print(f"Force-reset demo user: {u['email']} ({u['role']})")
                else:
                    print(f"Skipping existing user: {u['email']} (credentials preserved; use --force-reset to overwrite)")
            else:
                user = User(
                    email=u["email"],
                    password_hash=hash_password(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                    advisor_id=u["advisor_id"],
                    is_active=True,
                )
                db.add(user)
                print(f"Created demo user: {u['email']} ({u['role']})")

        db.commit()
        print("Demo account check complete.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding demo accounts: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed CoverWise development demo accounts")
    parser.add_argument(
        "--force-reset",
        action="store_true",
        help="Overwrite passwords of existing demo accounts",
    )
    args = parser.parse_args()
    seed_demo_accounts(force_reset=args.force_reset)
