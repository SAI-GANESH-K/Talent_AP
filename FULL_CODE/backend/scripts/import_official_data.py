"""Idempotent import of official B2 dataset into PostgreSQL.

Reads CSV/JSON files from the B2 data directory, validates schemas and counts,
and upserts into the database. Safe to re-run — uses ON CONFLICT DO UPDATE.

Usage:
    python -m scripts.import_official_data

Reads B2_DATA_DIR from environment or defaults to FULL_CODE/data/B2_.../data/.
Prints summary counts only — never dumps financial records.
"""

import csv
import json
import sys
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.dialects.postgresql import insert as pg_insert

# Add parent to path so we can import app modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.db.session import SessionLocal
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

# IST offset for parsing slot timestamps
IST = timezone(timedelta(hours=5, minutes=30))


def load_csv(filepath: Path) -> list[dict]:
    """Read a CSV file, returning list of row dicts."""
    with open(filepath, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def load_json(filepath: Path) -> list | dict:
    """Read a JSON file."""
    with open(filepath, encoding="utf-8") as f:
        return json.load(f)


def safe_int(value: str) -> int | None:
    """Convert string to int, returning None for empty/missing values."""
    if value is None or value.strip() == "":
        return None
    return int(value)


def safe_decimal(value: str) -> Decimal | None:
    """Convert string to Decimal without float intermediate. Returns None for empty."""
    if value is None or value.strip() == "":
        return None
    return Decimal(value.strip())


def safe_float(value: str) -> float | None:
    """Convert to float for non-financial fields. Returns None for empty."""
    if value is None or value.strip() == "":
        return None
    return float(value)


def safe_bool(value: str) -> bool | None:
    """Parse boolean from CSV string."""
    if value is None or value.strip() == "":
        return None
    return value.strip().lower() in ("true", "1", "yes")


def parse_json_field(value: str) -> dict | list | None:
    """Parse a JSON string from a CSV cell."""
    if value is None or value.strip() == "" or value.strip().lower() == "null":
        return None
    return json.loads(value)


def parse_ist_timestamp(value: str) -> datetime:
    """Parse an IST timestamp string like '2026-10-26T10:00:00' into a timezone-aware datetime."""
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=IST)
    return dt


def import_products(data_dir: Path, db) -> int:
    """Import products from products.json (canonical nested source)."""
    products = load_json(data_dir / "products.json")

    for p in products:
        stmt = pg_insert(Product.__table__).values(
            product_id=p["product_id"],
            product_name=p["product_name"],
            product_type=p["product_type"],
            variant=p["variant"],
            participation=p["participation"],
            plain_language_summary=p["plain_language_summary"],
            min_entry_age=p["min_entry_age"],
            max_entry_age=p["max_entry_age"],
            max_maturity_age=p["max_maturity_age"],
            min_sum_assured_inr=p.get("min_sum_assured_inr"),
            max_sum_assured_inr=p.get("max_sum_assured_inr"),
            sum_assured_step_inr=p.get("sum_assured_step_inr"),
            policy_term_rule=p["policy_term_rule"],
            allowed_policy_terms=p["allowed_policy_terms"],
            min_policy_term_years=p.get("min_policy_term_years"),
            max_policy_term_years=p.get("max_policy_term_years"),
            premium_payment_options=p["premium_payment_options"]
            if isinstance(p["premium_payment_options"], str)
            else ";".join(p["premium_payment_options"]),
            premium_payment_rules=p.get("premium_payment_rules"),
            premium_modes=p["premium_modes"]
            if isinstance(p["premium_modes"], str)
            else ";".join(p["premium_modes"]),
            modal_factor_annual=p.get("modal_factor_annual"),
            modal_factor_half_yearly=p.get("modal_factor_half_yearly"),
            modal_factor_quarterly=p.get("modal_factor_quarterly"),
            modal_factor_monthly=p.get("modal_factor_monthly"),
            sa_band_factors=p.get("sa_band_factors"),
            income_multiple_limits=p.get("income_multiple_limits"),
            min_annual_premium_inr=p.get("min_annual_premium_inr"),
            max_annual_premium_inr=p.get("max_annual_premium_inr"),
            sa_multiple_of_annual_premium=p.get("sa_multiple_of_annual_premium"),
            ulip_fund_ids=p.get("ulip_fund_ids")
            if isinstance(p.get("ulip_fund_ids"), str) or p.get("ulip_fund_ids") is None
            else ";".join(p["ulip_fund_ids"]),
            ulip_charges=p.get("ulip_charges"),
            lock_in_years=p.get("lock_in_years"),
            min_annual_income_inr=p["min_annual_income_inr"],
            max_new_non_term_sa_multiple_of_income=p.get(
                "max_new_non_term_sa_multiple_of_income"
            ),
            non_earning_applicant_rule=p["non_earning_applicant_rule"],
            non_earning_applicant_allowed=p["non_earning_applicant_allowed"],
            non_earning_max_cover_inr=p.get("non_earning_max_cover_inr"),
            non_earning_max_multiple_of_spouse_income=p.get(
                "non_earning_max_multiple_of_spouse_income"
            ),
            riders_allowed=p.get("riders_allowed")
            if isinstance(p.get("riders_allowed"), str) or p.get("riders_allowed") is None
            else ";".join(p["riders_allowed"]),
            nri_eligible=p["nri_eligible"],
            death_benefit=p["death_benefit"],
            maturity_benefit=p.get("maturity_benefit"),
            survival_benefits=p.get("survival_benefits"),
            key_features=p["key_features"],
            key_exclusions=p["key_exclusions"],
            surrender_and_lock_in=p["surrender_and_lock_in"],
            medical_underwriting=p["medical_underwriting"],
            extra_rules=p.get("extra_rules"),
            pricing_source=p["pricing_source"],
            illustrative_bonus_4pct_scenario_per_1000_sa_pa=p.get(
                "illustrative_bonus_4pct_scenario_per_1000_sa_pa"
            ),
            illustrative_bonus_8pct_scenario_per_1000_sa_pa=p.get(
                "illustrative_bonus_8pct_scenario_per_1000_sa_pa"
            ),
        ).on_conflict_do_update(
            index_elements=["product_id"],
            set_={"product_name": p["product_name"]},
        )
        db.execute(stmt)

    db.flush()
    return len(products)


def import_premium_rates(data_dir: Path, db) -> int:
    """Import premium_rates.csv — 39,588 rows. Reads rates as Decimal strings."""
    rows = load_csv(data_dir / "premium_rates.csv")
    count = 0

    # Batch insert for performance
    batch = []
    for r in rows:
        batch.append({
            "product_id": r["product_id"],
            "premium_payment_option": r["premium_payment_option"],
            "premium_paying_term_years": int(r["premium_paying_term_years"]),
            "entry_age": int(r["entry_age"]),
            "policy_term_years": int(r["policy_term_years"]),
            "gender": r["gender"],
            "smoker_status": r["smoker_status"],
            # Read as Decimal string to avoid float precision loss
            "rate_per_1000_sa_inr": Decimal(r["rate_per_1000_sa_inr"]),
        })
        count += 1

        if len(batch) >= 5000:
            stmt = pg_insert(PremiumRate.__table__).values(batch)
            stmt = stmt.on_conflict_do_update(
                constraint="uq_rate_lookup",
                set_={"rate_per_1000_sa_inr": stmt.excluded.rate_per_1000_sa_inr},
            )
            db.execute(stmt)
            batch = []

    if batch:
        stmt = pg_insert(PremiumRate.__table__).values(batch)
        stmt = stmt.on_conflict_do_update(
            constraint="uq_rate_lookup",
            set_={"rate_per_1000_sa_inr": stmt.excluded.rate_per_1000_sa_inr},
        )
        db.execute(stmt)

    db.flush()
    return count


def import_riders(data_dir: Path, db) -> int:
    """Import riders.csv — 5 rows."""
    rows = load_csv(data_dir / "riders.csv")

    for r in rows:
        stmt = pg_insert(Rider.__table__).values(
            rider_id=r["rider_id"],
            rider_name=r["rider_name"],
            rider_category=r["rider_category"],
            benefit=r["benefit"],
            available_on_product_ids=r["available_on_product_ids"],
            min_entry_age=int(r["min_entry_age"]),
            max_entry_age=int(r["max_entry_age"]),
            max_cover_age=int(r["max_cover_age"]),
            min_rider_sa_inr=safe_int(r["min_rider_sa_inr"]),
            max_rider_sa_inr=safe_int(r["max_rider_sa_inr"]),
            max_rider_sa_pct_of_base_sa=safe_int(r["max_rider_sa_pct_of_base_sa"]),
            rider_sa_rule=r["rider_sa_rule"],
            rate_basis=r["rate_basis"],
            rate_entry_age_18_30=safe_decimal(r["rate_entry_age_18_30"]),
            rate_entry_age_31_40=safe_decimal(r["rate_entry_age_31_40"]),
            rate_entry_age_41_50=safe_decimal(r["rate_entry_age_41_50"]),
            rate_entry_age_51_60=safe_decimal(r["rate_entry_age_51_60"]),
            rate_entry_age_61_65=safe_decimal(r.get("rate_entry_age_61_65", "")),
            smoker_multiplier=Decimal(r["smoker_multiplier"]),
            max_premium_pct_of_base_premium=safe_int(r["max_premium_pct_of_base_premium"]),
            rider_term_rule=r["rider_term_rule"],
            key_exclusions=r["key_exclusions"],
        ).on_conflict_do_update(
            index_elements=["rider_id"],
            set_={"rider_name": r["rider_name"]},
        )
        db.execute(stmt)

    db.flush()
    return len(rows)


def import_ulip_funds(data_dir: Path, db) -> int:
    """Import ulip_funds.csv — 4 rows."""
    rows = load_csv(data_dir / "ulip_funds.csv")

    for r in rows:
        stmt = pg_insert(UlipFund.__table__).values(
            fund_id=r["fund_id"],
            fund_name=r["fund_name"],
            asset_class=r["asset_class"],
            equity_pct_min=int(r["equity_pct_min"]),
            equity_pct_max=int(r["equity_pct_max"]),
            debt_pct_min=int(r["debt_pct_min"]),
            debt_pct_max=int(r["debt_pct_max"]),
            money_market_pct_min=int(r["money_market_pct_min"]),
            money_market_pct_max=int(r["money_market_pct_max"]),
            risk_level=r["risk_level"],
            fmc_pct_pa=Decimal(r["fmc_pct_pa"]),
            objective=r["objective"],
            available_on_product_ids=r["available_on_product_ids"],
        ).on_conflict_do_update(
            index_elements=["fund_id"],
            set_={"fund_name": r["fund_name"]},
        )
        db.execute(stmt)

    db.flush()
    return len(rows)


def import_ulip_mortality(data_dir: Path, db) -> int:
    """Import ulip_mortality_charges.csv — 328 rows."""
    rows = load_csv(data_dir / "ulip_mortality_charges.csv")
    batch = []

    for r in rows:
        batch.append({
            "attained_age": int(r["attained_age"]),
            "gender": r["gender"],
            "smoker_status": r["smoker_status"],
            "annual_rate_per_1000_sum_at_risk_inr": Decimal(
                r["annual_rate_per_1000_sum_at_risk_inr"]
            ),
        })

    stmt = pg_insert(UlipMortalityCharge.__table__).values(batch)
    stmt = stmt.on_conflict_do_update(
        constraint="uq_ulip_mortality_lookup",
        set_={
            "annual_rate_per_1000_sum_at_risk_inr": stmt.excluded.annual_rate_per_1000_sum_at_risk_inr
        },
    )
    db.execute(stmt)
    db.flush()
    return len(rows)


def import_advisors(data_dir: Path, db) -> int:
    """Import advisors.csv — 15 rows."""
    rows = load_csv(data_dir / "advisors.csv")

    for r in rows:
        stmt = pg_insert(Advisor.__table__).values(
            advisor_id=r["advisor_id"],
            advisor_name=r["advisor_name"],
            languages=r["languages"],
            specialisations=r["specialisations"],
            consultation_modes=r["consultation_modes"],
            years_experience=int(r["years_experience"]),
            rating=Decimal(r["rating"]),
            review_count=int(r["review_count"]),
            working_days=r["working_days"],
            shift_start=r["shift_start"],
            shift_end=r["shift_end"],
            lunch_break=r["lunch_break"],
            email=r["email"],
        ).on_conflict_do_update(
            index_elements=["advisor_id"],
            set_={"advisor_name": r["advisor_name"]},
        )
        db.execute(stmt)

    db.flush()
    return len(rows)


def import_advisor_slots(data_dir: Path, db) -> int:
    """Import advisor_slots.csv — 2,201 rows. Parse IST timestamps."""
    rows = load_csv(data_dir / "advisor_slots.csv")
    batch = []

    for r in rows:
        batch.append({
            "slot_id": r["slot_id"],
            "advisor_id": r["advisor_id"],
            "slot_start": parse_ist_timestamp(r["slot_start"]),
            "slot_end": parse_ist_timestamp(r["slot_end"]),
            "status": r["status"],
        })

        if len(batch) >= 1000:
            stmt = pg_insert(AdvisorSlot.__table__).values(batch)
            stmt = stmt.on_conflict_do_update(
                index_elements=["slot_id"],
                set_={"status": stmt.excluded.status},
            )
            db.execute(stmt)
            batch = []

    if batch:
        stmt = pg_insert(AdvisorSlot.__table__).values(batch)
        stmt = stmt.on_conflict_do_update(
            index_elements=["slot_id"],
            set_={"status": stmt.excluded.status},
        )
        db.execute(stmt)

    db.flush()
    return len(rows)


def import_synthetic_profiles(data_dir: Path, db) -> int:
    """Import customer_profiles.json as JSONB documents — 200 profiles."""
    profiles = load_json(data_dir / "customer_profiles.json")

    for p in profiles:
        stmt = pg_insert(SyntheticProfile.__table__).values(
            profile_id=p["profile_id"],
            data=p,
        ).on_conflict_do_update(
            index_elements=["profile_id"],
            set_={"data": p},
        )
        db.execute(stmt)

    db.flush()
    return len(profiles)


def import_customer_goals(data_dir: Path, db) -> int:
    """Import customer_goals.csv — 371 rows."""
    rows = load_csv(data_dir / "customer_goals.csv")

    batch = []
    for r in rows:
        batch.append({
            "goal_id": r["goal_id"],
            "profile_id": r["profile_id"],
            "goal_type": r["goal_type"],
            "beneficiary": r["beneficiary"],
            "target_amount_today_inr": int(r["target_amount_today_inr"]),
            "target_year": int(r["target_year"]),
            "priority": r["priority"],
        })

    stmt = pg_insert(CustomerGoal.__table__).values(batch)
    stmt = stmt.on_conflict_do_update(
        index_elements=["goal_id"],
        set_={"priority": stmt.excluded.priority},
    )
    db.execute(stmt)
    db.flush()
    return len(rows)


def main() -> None:
    """Run the complete dataset import with validation."""
    data_dir = settings.data_dir_path
    print(f"CoverWise Data Import — reading from: {data_dir}")

    if not data_dir.exists():
        print(f"ERROR: Data directory not found: {data_dir}")
        print("Place the B2 dataset at FULL_CODE/data/B2_Life_Insurance_Needs_Finder/data/")
        sys.exit(1)

    # Verify expected files exist
    expected_files = [
        "products.json",
        "premium_rates.csv",
        "riders.csv",
        "ulip_funds.csv",
        "ulip_mortality_charges.csv",
        "customer_profiles.json",
        "customer_goals.csv",
        "advisors.csv",
        "advisor_slots.csv",
    ]
    missing = [f for f in expected_files if not (data_dir / f).exists()]
    if missing:
        print(f"ERROR: Missing files: {missing}")
        sys.exit(1)

    db = SessionLocal()
    try:
        # Import in dependency order
        counts = {}
        counts["products"] = import_products(data_dir, db)
        counts["premium_rates"] = import_premium_rates(data_dir, db)
        counts["riders"] = import_riders(data_dir, db)
        counts["ulip_funds"] = import_ulip_funds(data_dir, db)
        counts["ulip_mortality_charges"] = import_ulip_mortality(data_dir, db)
        counts["advisors"] = import_advisors(data_dir, db)
        counts["advisor_slots"] = import_advisor_slots(data_dir, db)
        counts["synthetic_profiles"] = import_synthetic_profiles(data_dir, db)
        counts["customer_goals"] = import_customer_goals(data_dir, db)

        db.commit()

        # Validation
        print("\n=== Import Summary ===")
        expected = {
            "products": 14,
            "premium_rates": 39588,
            "riders": 5,
            "ulip_funds": 4,
            "ulip_mortality_charges": 328,
            "advisors": 15,
            "advisor_slots": 2201,
            "synthetic_profiles": 200,
            "customer_goals": 371,
        }

        all_ok = True
        for table, count in counts.items():
            exp = expected[table]
            status = "OK" if count == exp else "MISMATCH"
            if count != exp:
                all_ok = False
            print(f"  {table}: {count} rows (expected {exp}) {status}")

        # Verify DB counts match
        for table_name, model in [
            ("products", Product),
            ("premium_rates", PremiumRate),
            ("riders", Rider),
            ("ulip_funds", UlipFund),
            ("advisors", Advisor),
            ("advisor_slots", AdvisorSlot),
        ]:
            db_count = db.query(model).count()
            exp = expected[table_name]
            if db_count != exp:
                print(f"  WARNING: {table_name} DB count {db_count} != expected {exp}")
                all_ok = False

        if all_ok:
            print("\n[OK] All imports validated successfully.")
        else:
            print("\n[FAIL] Some validations failed -- check above.")
            sys.exit(1)

    except Exception as e:
        db.rollback()
        print(f"\nERROR during import: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
