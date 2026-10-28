"""Seed demo accounts for CoverWise Phase 4 verification.

Seeds 3 demo personas:
1. Customer: customer@coverwise.test / Customer@123
2. Financial Advisor: advisor@coverwise.test / Advisor@123 (Venkata Subba Rao, ADV-7JIHQA)
3. Administrator: admin@coverwise.test / Admin@123
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.app_data import User


def seed_demo_accounts():
    db = SessionLocal()
    try:
        demo_users = [
            {
                "email": "customer@coverwise.test",
                "password": "Customer@123",
                "full_name": "Ramesh Sharma",
                "role": "customer",
                "advisor_id": None,
            },
            {
                "email": "advisor@coverwise.test",
                "password": "Advisor@123",
                "full_name": "Venkata Subba Rao",
                "role": "advisor",
                "advisor_id": "ADV-7JIHQA",
            },
            {
                "email": "admin@coverwise.test",
                "password": "Admin@123",
                "full_name": "CoverWise Platform Admin",
                "role": "admin",
                "advisor_id": None,
            },
        ]

        for u in demo_users:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                existing.password_hash = hash_password(u["password"])
                existing.full_name = u["full_name"]
                existing.role = u["role"]
                existing.advisor_id = u["advisor_id"]
                existing.is_active = True
                print(f"Updated demo user: {u['email']} ({u['role']})")
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
        print("Demo accounts successfully seeded.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding demo accounts: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_accounts()
