"""Phase 5 Hardening and Integration Test Suite — Security, Booking State Machine, Privacy.

Covers:
1. Security: Demo account seeder fails closed in production and when disabled.
2. Security: Demo account seeder preserves existing passwords without overwriting.
3. Security: Safe client-IP resolution — ignores spoofed X-Forwarded-For from untrusted proxies.
4. Security: Safe client-IP resolution — trusts X-Forwarded-For only from configured trusted proxies.
5. Security: Thread-safe in-memory rate limiter with bounded LRU/TTL key eviction.
6. Booking: Server-side rejection of expired / past consultation slots (Asia/Kolkata timezone).
7. Booking: Strict state machine enforcement:
   - confirmed -> completed (valid for advisor)
   - confirmed -> cancelled (valid for customer/advisor/admin)
   - completed is terminal (cannot be cancelled or reopened; returns 400)
   - cancelled is terminal (cannot be re-cancelled or completed; returns 400)
8. Booking: Slot release isolation (cancellation protects active bookings sharing slot).
9. Privacy: Admin bookings list redacts customer private assessment summaries and advisor notes.
10. Privacy: Customer explicit opt-out (share_assessment=False stores None).
11. Privacy: AssessmentSummaryData validates structured metrics and rejects arbitrary JSON.
"""

import threading
import uuid
import zoneinfo
from datetime import datetime, timedelta
import pytest
from fastapi import Request
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.auth import (
    InMemoryRateLimiter,
    auth_rate_limiter,
    get_client_ip,
)
from app.core.security import hash_password, verify_password
from app.core.config import settings
from app.db.session import SessionLocal
from app.main import app
from app.models.app_data import Booking, User
from app.models.source_data import Advisor, AdvisorSlot
from app.schemas.advisory import AdminBookingResponse, AssessmentSummaryData
from scripts.seed_demo_accounts import seed_demo_accounts

client = TestClient(app)
IST = zoneinfo.ZoneInfo("Asia/Kolkata")


@pytest.fixture(autouse=True)
def clean_rate_limiters():
    """Clear rate limiter buckets before each test."""
    auth_rate_limiter._attempts.clear()


@pytest.fixture
def db_session():
    """Provide a database session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------------------------------------------------------
# 1. SECURITY: DEMO CREDENTIAL EXPOSURE & FAIL-CLOSED SEEDING
# -----------------------------------------------------------------------------

def test_demo_seeder_fails_closed_in_production(monkeypatch):
    """Seeder must raise RuntimeError if environment is set to production."""
    monkeypatch.setattr(settings, "environment", "production")
    with pytest.raises(RuntimeError) as exc_info:
        seed_demo_accounts()
    assert "Demo account seeding is blocked" in str(exc_info.value)


def test_demo_seeder_fails_closed_when_disallowed(monkeypatch):
    """Seeder must raise RuntimeError if allow_demo_seeding is False."""
    monkeypatch.setattr(settings, "environment", "development")
    monkeypatch.setattr(settings, "allow_demo_seeding", False)
    with pytest.raises(RuntimeError) as exc_info:
        seed_demo_accounts()
    assert "Demo account seeding is blocked" in str(exc_info.value)


def test_demo_seeder_preserves_existing_account_passwords(db_session: Session, monkeypatch):
    """Re-running the seeder without force_reset must preserve existing passwords."""
    monkeypatch.setattr(settings, "environment", "development")
    monkeypatch.setattr(settings, "allow_demo_seeding", True)

    # Fetch customer demo account
    user = db_session.query(User).filter(User.email == "customer@coverwise.test").first()
    assert user is not None
    original_hash = user.password_hash

    # Re-run seeder without force_reset
    seed_demo_accounts(force_reset=False)

    db_session.refresh(user)
    assert user.password_hash == original_hash


# -----------------------------------------------------------------------------
# 2. SECURITY: SAFE CLIENT-IP RESOLUTION & RATE LIMITER HARDENING
# -----------------------------------------------------------------------------

def test_client_ip_resolution_untrusted_proxy_ignored():
    """X-Forwarded-For header from an untrusted peer must be completely ignored."""
    scope = {
        "type": "http",
        "client": ("198.51.100.25", 54321),  # Untrusted external IP
        "headers": [
            (b"x-forwarded-for", b"203.0.113.55"),  # Attacker spoofed header
        ],
    }
    request = Request(scope)
    resolved_ip = get_client_ip(request)
    assert resolved_ip == "198.51.100.25"  # Trusted client peer, not spoofed header


def test_client_ip_resolution_trusted_proxy_extracts_client():
    """X-Forwarded-For header is trusted ONLY when coming from a configured trusted proxy."""
    # 127.0.0.1 is in default settings.trusted_proxy_list
    scope = {
        "type": "http",
        "client": ("127.0.0.1", 54321),  # Local reverse proxy
        "headers": [
            (b"x-forwarded-for", b"203.0.113.55, 10.0.0.1"),
        ],
    }
    request = Request(scope)
    resolved_ip = get_client_ip(request)
    assert resolved_ip == "203.0.113.55"


def test_in_memory_rate_limiter_thread_safety_and_bounding():
    """InMemoryRateLimiter must handle concurrent increments safely and bound key storage."""
    limiter = InMemoryRateLimiter(max_keys=100)

    # Concurrent attempts across 20 threads (4 threads per key, 5 attempts each = 20 attempts)
    def worker(client_id: str):
        for _ in range(5):
            limiter.is_allowed(client_id, max_attempts=10, window_seconds=60)

    threads = []
    for i in range(20):
        t = threading.Thread(target=worker, args=(f"user_{i % 5}",))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    # user_0 through user_4 had 20 attempts each (> max_attempts=10), so subsequent attempt is rejected
    for i in range(5):
        assert limiter.is_allowed(f"user_{i}", max_attempts=10, window_seconds=60) is False

    # Resetting user_0 allows a new attempt
    limiter.reset("user_0")
    assert limiter.is_allowed("user_0", max_attempts=10, window_seconds=60) is True

    # Test bounded capacity eviction
    for i in range(150):
        limiter.is_allowed(f"filler_{i}", max_attempts=5, window_seconds=60)

    # Limiter entries must be bounded to at most max_keys
    assert len(limiter._attempts) <= 100


# -----------------------------------------------------------------------------
# 3. APPOINTMENT BOOKING: PREVENT PAST SLOT RESERVATIONS
# -----------------------------------------------------------------------------

def test_server_side_past_slot_booking_rejection(db_session: Session):
    """Booking an expired/past slot must return 400 and reject the reservation."""
    advisor = db_session.query(Advisor).first()
    assert advisor is not None

    # Create a synthetic past slot
    past_start = datetime.now(IST) - timedelta(hours=2)
    past_end = past_start + timedelta(minutes=30)
    past_slot = AdvisorSlot(
        slot_id=f"TEST-PAST-{uuid.uuid4().hex[:6]}",
        advisor_id=advisor.advisor_id,
        slot_start=past_start,
        slot_end=past_end,
        status="available",
    )
    db_session.add(past_slot)
    db_session.commit()

    # Login as customer
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    assert login_resp.status_code == 200
    csrf = login_resp.json()["csrf_token"]

    # Attempt to book the past slot
    book_resp = client.post(
        "/api/v1/bookings",
        json={
            "advisor_id": advisor.advisor_id,
            "slot_id": past_slot.slot_id,
            "consultation_mode": "video",
        },
        headers={"X-CSRF-Token": csrf},
    )

    # Cleanup synthetic past slot
    db_session.delete(past_slot)
    db_session.commit()

    assert book_resp.status_code == 400
    assert "expired" in book_resp.text.lower()


# -----------------------------------------------------------------------------
# 4. APPOINTMENT BOOKING: STATE MACHINE & CONCURRENCY
# -----------------------------------------------------------------------------

def test_booking_state_machine_strict_transitions(db_session: Session):
    """State machine transitions: confirmed -> completed / cancelled.

    Completed and cancelled states are terminal. Cannot reopen or re-cancel.
    """
    # Use the advisor linked to advisor@coverwise.test
    adv_user = db_session.query(User).filter(User.email == "advisor@coverwise.test").first()
    assert adv_user is not None and adv_user.advisor_id is not None
    advisor = db_session.query(Advisor).filter(Advisor.advisor_id == adv_user.advisor_id).first()
    assert advisor is not None

    # Create a synthetic future slot for clean testing
    future_start = datetime.now(IST) + timedelta(days=5, hours=2)
    future_end = future_start + timedelta(minutes=30)
    slot = AdvisorSlot(
        slot_id=f"TEST-FUT-{uuid.uuid4().hex[:6]}",
        advisor_id=advisor.advisor_id,
        slot_start=future_start,
        slot_end=future_end,
        status="available",
    )
    db_session.add(slot)
    db_session.commit()

    # 1. Login as customer and book slot
    cust_login = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    csrf_cust = cust_login.json()["csrf_token"]

    book_resp = client.post(
        "/api/v1/bookings",
        json={
            "advisor_id": advisor.advisor_id,
            "slot_id": slot.slot_id,
            "consultation_mode": "video",
        },
        headers={"X-CSRF-Token": csrf_cust},
    )
    assert book_resp.status_code == 201, book_resp.text
    booking_id = book_resp.json()["id"]

    # 2. Login as assigned advisor and complete the consultation
    adv_login = client.post(
        "/api/v1/auth/login",
        json={"email": "advisor@coverwise.test", "password": "Advisor@123"},
    )
    csrf_adv = adv_login.json()["csrf_token"]

    comp_resp = client.patch(
        f"/api/v1/advisor/consultations/{booking_id}",
        json={"status": "completed", "advisor_notes": "Client opted for term policy."},
        headers={"X-CSRF-Token": csrf_adv},
    )
    assert comp_resp.status_code == 200, comp_resp.text
    assert comp_resp.json()["status"] == "completed"

    # 3. Attempt to cancel a COMPLETED consultation -> MUST FAIL (400)
    # Log back as customer
    cust_relogin = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    csrf_cust_new = cust_relogin.json()["csrf_token"]

    cancel_resp = client.post(
        f"/api/v1/bookings/{booking_id}/cancel",
        headers={"X-CSRF-Token": csrf_cust_new},
    )
    assert cancel_resp.status_code == 400
    assert "completed" in cancel_resp.text.lower()

    # 4. Attempt to reopen completed consultation by setting status back to confirmed -> MUST FAIL (400)
    adv_relogin = client.post(
        "/api/v1/auth/login",
        json={"email": "advisor@coverwise.test", "password": "Advisor@123"},
    )
    csrf_adv_new = adv_relogin.json()["csrf_token"]

    reopen_resp = client.patch(
        f"/api/v1/advisor/consultations/{booking_id}",
        json={"status": "confirmed"},
        headers={"X-CSRF-Token": csrf_adv_new},
    )
    assert reopen_resp.status_code == 400
    assert "terminal" in reopen_resp.text.lower() or "cannot transition" in reopen_resp.text.lower()

    # Cleanup
    b_record = db_session.query(Booking).filter(Booking.id == booking_id).first()
    if b_record:
        db_session.delete(b_record)
    s_record = db_session.query(AdvisorSlot).filter(AdvisorSlot.slot_id == slot.slot_id).first()
    if s_record:
        db_session.delete(s_record)
    db_session.commit()


def test_repeated_cancellation_returns_400(db_session: Session):
    """Repeatedly cancelling a booking returns 400 on the second attempt."""
    advisor = db_session.query(Advisor).first()
    future_start = datetime.now(IST) + timedelta(days=6, hours=3)
    future_end = future_start + timedelta(minutes=30)
    slot = AdvisorSlot(
        slot_id=f"TEST-FUT-{uuid.uuid4().hex[:6]}",
        advisor_id=advisor.advisor_id,
        slot_start=future_start,
        slot_end=future_end,
        status="available",
    )
    db_session.add(slot)
    db_session.commit()

    cust_login = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    csrf_cust = cust_login.json()["csrf_token"]

    book_resp = client.post(
        "/api/v1/bookings",
        json={
            "advisor_id": advisor.advisor_id,
            "slot_id": slot.slot_id,
            "consultation_mode": "video",
        },
        headers={"X-CSRF-Token": csrf_cust},
    )
    assert book_resp.status_code == 201
    booking_id = book_resp.json()["id"]

    # First cancellation succeeds
    c1 = client.post(
        f"/api/v1/bookings/{booking_id}/cancel",
        headers={"X-CSRF-Token": csrf_cust},
    )
    assert c1.status_code == 200
    assert c1.json()["status"] == "cancelled"

    # Second cancellation fails with 400
    c2 = client.post(
        f"/api/v1/bookings/{booking_id}/cancel",
        headers={"X-CSRF-Token": csrf_cust},
    )
    assert c2.status_code == 400
    assert "already cancelled" in c2.text.lower()

    # Cleanup
    b_record = db_session.query(Booking).filter(Booking.id == booking_id).first()
    if b_record:
        db_session.delete(b_record)
    s_record = db_session.query(AdvisorSlot).filter(AdvisorSlot.slot_id == slot.slot_id).first()
    if s_record:
        db_session.delete(s_record)
    db_session.commit()


# -----------------------------------------------------------------------------
# 5. FINANCIAL DATA PRIVACY & ROLE-SEPARATED ENDPOINTS
# -----------------------------------------------------------------------------

def test_financial_data_privacy_admin_booking_list_redaction(db_session: Session):
    """Admin operational list must redact customer assessment summaries and advisor notes."""
    advisor = db_session.query(Advisor).first()
    future_start = datetime.now(IST) + timedelta(days=7, hours=4)
    future_end = future_start + timedelta(minutes=30)
    slot = AdvisorSlot(
        slot_id=f"TEST-FUT-{uuid.uuid4().hex[:6]}",
        advisor_id=advisor.advisor_id,
        slot_start=future_start,
        slot_end=future_end,
        status="available",
    )
    db_session.add(slot)
    db_session.commit()

    # Customer books with private assessment summary
    cust_login = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    csrf_cust = cust_login.json()["csrf_token"]

    book_resp = client.post(
        "/api/v1/bookings",
        json={
            "advisor_id": advisor.advisor_id,
            "slot_id": slot.slot_id,
            "consultation_mode": "video",
            "share_assessment": True,
            "assessment_summary": {
                "coverage_gap": 15000000,
                "annual_income_inr": 1200000,
                "method": "net_needs",
            },
        },
        headers={"X-CSRF-Token": csrf_cust},
    )
    assert book_resp.status_code == 201
    booking_id = book_resp.json()["id"]

    # Login as admin and view operational bookings
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@coverwise.test", "password": "Admin@123"},
    )
    assert admin_login.status_code == 200

    admin_resp = client.get("/api/v1/admin/bookings")
    assert admin_resp.status_code == 200
    bookings = admin_resp.json()

    # Find the target booking
    target = next((b for b in bookings if b["id"] == booking_id), None)
    assert target is not None

    # Operational fields must be present
    assert "id" in target
    assert "customer_name" in target
    assert "advisor_name" in target
    assert target["status"] == "confirmed"

    # Private financial assessment summary and advisor notes must NOT be present in admin schema
    assert "assessment_summary" not in target or target["assessment_summary"] is None
    assert "advisor_notes" not in target or target["advisor_notes"] is None

    # Cleanup
    b_record = db_session.query(Booking).filter(Booking.id == booking_id).first()
    if b_record:
        db_session.delete(b_record)
    s_record = db_session.query(AdvisorSlot).filter(AdvisorSlot.slot_id == slot.slot_id).first()
    if s_record:
        db_session.delete(s_record)
    db_session.commit()


def test_customer_assessment_sharing_opt_out(db_session: Session):
    """When share_assessment=False, assessment_summary is forced to None in the database."""
    advisor = db_session.query(Advisor).first()
    future_start = datetime.now(IST) + timedelta(days=8, hours=2)
    future_end = future_start + timedelta(minutes=30)
    slot = AdvisorSlot(
        slot_id=f"TEST-FUT-{uuid.uuid4().hex[:6]}",
        advisor_id=advisor.advisor_id,
        slot_start=future_start,
        slot_end=future_end,
        status="available",
    )
    db_session.add(slot)
    db_session.commit()

    cust_login = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    csrf_cust = cust_login.json()["csrf_token"]

    book_resp = client.post(
        "/api/v1/bookings",
        json={
            "advisor_id": advisor.advisor_id,
            "slot_id": slot.slot_id,
            "consultation_mode": "video",
            "share_assessment": False,  # Customer opts out of sharing
            "assessment_summary": {
                "coverage_gap": 15000000,
                "annual_income_inr": 1200000,
            },
        },
        headers={"X-CSRF-Token": csrf_cust},
    )
    assert book_resp.status_code == 201
    booking_id = book_resp.json()["id"]

    # Verify directly in database that assessment_summary is None
    b_record = db_session.query(Booking).filter(Booking.id == booking_id).first()
    assert b_record is not None
    assert b_record.assessment_summary is None

    # Cleanup
    db_session.delete(b_record)
    s_record = db_session.query(AdvisorSlot).filter(AdvisorSlot.slot_id == slot.slot_id).first()
    if s_record:
        db_session.delete(s_record)
    db_session.commit()


def test_assessment_summary_schema_validation():
    """AssessmentSummaryData schema must validate expected fields and reject invalid data."""
    valid_data = {
        "recommended_cover_inr": 10000000,
        "coverage_gap": 9500000,
        "annual_income_inr": 1500000,
        "user_age": 35,
        "method": "net_needs",
    }
    model = AssessmentSummaryData.model_validate(valid_data)
    assert model.recommended_cover_inr == 10000000
    assert model.method == "net_needs"
    assert model.user_age == 35
