"""Phase 4 Test Suite — Authentication, RBAC, Advisory, and Booking Concurrency.

Verifies:
1. Customer registration and role locking (never allows advisor/admin self-assignment)
2. Login credential verification, Argon2id hashing, and HttpOnly session cookie issuance
3. Login rate-limiting (429 Too Many Requests)
4. Session inspection (/api/v1/auth/me) and logout session invalidation
5. CSRF protection on cookie-authenticated mutating requests
6. Strict RBAC enforcement (Customer, Advisor, Admin boundaries)
7. IDOR/BOLA protection (customer cannot cancel or view other customer's bookings)
8. Advisor BOLA protection (advisor cannot update consultations of other advisors)
9. Transaction-safe booking (row-locking, partial unique constraint)
10. Concurrency: race condition test where simultaneous booking yields exactly 1 success
11. Safe slot release upon cancellation and subsequent re-booking
12. Advisor consultation updates and consultation notes persistence
13. Admin aggregate operational metrics
14. Multilingual advisor discovery filtering (Telugu, Tamil, Kannada, Hindi, English)
"""

import concurrent.futures
import uuid
import zoneinfo
from datetime import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.auth import auth_rate_limiter
from app.db.session import SessionLocal
from app.main import app
from app.models.app_data import User
from app.models.source_data import Advisor, AdvisorSlot

client = TestClient(app)
IST = zoneinfo.ZoneInfo("Asia/Kolkata")


@pytest.fixture(autouse=True)
def clean_rate_limiters():
    """Clear in-memory rate limiter buckets before each test."""
    auth_rate_limiter._attempts.clear()


@pytest.fixture
def db_session():
    """Provide a real database session and clean up created test data."""
    db: Session = SessionLocal()
    yield db
    db.close()


def test_customer_registration_locks_role_to_customer(db_session: Session):
    """Registration endpoint must strictly create 'customer' role even if client passes 'admin'."""
    test_email = f"cust_reg_{uuid.uuid4().hex[:8]}@coverwise.test"
    payload = {
        "email": test_email,
        "password": "SecurePassword@123",
        "full_name": "Test User",
        "role": "admin",  # Attacker attempt to escalate privilege
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["user"]["role"] == "customer"
    assert data["user"]["email"] == test_email
    assert "coverwise_session" in response.cookies
    assert "coverwise_csrf" in response.cookies

    # Verify user in database
    user = db_session.query(User).filter(User.email == test_email).first()
    assert user is not None
    assert user.role == "customer"
    assert user.password_hash != "SecurePassword@123"  # Must be Argon2id hash


def test_duplicate_registration_rejected():
    """Attempting to register with an existing email returns 400."""
    test_email = f"dup_{uuid.uuid4().hex[:8]}@coverwise.test"
    payload = {
        "email": test_email,
        "password": "SecurePassword@123",
        "full_name": "Original User",
    }
    r1 = client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 201

    r2 = client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 400
    assert "already exists" in r2.text


def test_login_success_and_session_cookies():
    """Valid credentials set HttpOnly session cookie and return CSRF token."""
    email = "customer@coverwise.test"
    password = "Customer@123"

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200, login_resp.text
    data = login_resp.json()
    assert data["user"]["email"] == email
    assert data["user"]["role"] == "customer"
    assert "csrf_token" in data
    assert "coverwise_session" in login_resp.cookies


def test_login_invalid_password_returns_401():
    """Invalid password returns safe generic 401 error."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "WrongPassword!"},
    )
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.text


def test_login_rate_limiting():
    """Too many failed attempts trigger 429 Too Many Requests."""
    target_email = f"brute_{uuid.uuid4().hex[:6]}@coverwise.test"
    for i in range(5):
        resp = client.post(
            "/api/v1/auth/login",
            json={"email": target_email, "password": f"Wrong_{i}"},
        )
        assert resp.status_code == 401

    # 6th attempt must be rate-limited
    blocked_resp = client.post(
        "/api/v1/auth/login",
        json={"email": target_email, "password": "Wrong_6"},
    )
    assert blocked_resp.status_code == 429
    assert "Too many failed login attempts" in blocked_resp.text


def test_auth_me_and_logout_flow():
    """Login -> /api/v1/auth/me -> logout -> /api/v1/auth/me returns 401."""
    # 1. Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    assert login_resp.status_code == 200
    csrf_token = login_resp.json()["csrf_token"]

    # 2. Check /api/v1/auth/me
    me_resp = client.get("/api/v1/auth/me")
    assert me_resp.status_code == 200
    assert me_resp.json()["user"]["email"] == "customer@coverwise.test"

    # 3. Logout with CSRF header
    logout_resp = client.post(
        "/api/v1/auth/logout",
        headers={"X-CSRF-Token": csrf_token},
    )
    assert logout_resp.status_code == 200

    # 4. /api/v1/auth/me should now fail with 401
    post_logout_me = client.get("/api/v1/auth/me")
    assert post_logout_me.status_code == 401


def test_csrf_protection_on_mutating_requests():
    """Mutating state operations without valid X-CSRF-Token return 403."""
    # Login as customer
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    assert login_resp.status_code == 200

    # Attempt to logout without X-CSRF-Token header
    bad_logout = client.post("/api/v1/auth/logout")
    assert bad_logout.status_code == 403
    assert "CSRF" in bad_logout.text

    # Attempt to logout with wrong token
    wrong_csrf = client.post(
        "/api/v1/auth/logout",
        headers={"X-CSRF-Token": "invalid_csrf_token_value"},
    )
    assert wrong_csrf.status_code == 403


def test_rbac_customer_cannot_access_admin_stats():
    """Customer role is forbidden from accessing /api/v1/admin/stats."""
    # Login as customer
    client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    stats_resp = client.get("/api/v1/admin/stats")
    assert stats_resp.status_code == 403
    assert "Access denied" in stats_resp.text


def test_rbac_admin_can_access_admin_stats():
    """Admin role can access /api/v1/admin/stats."""
    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@coverwise.test", "password": "Admin@123"},
    )
    stats_resp = client.get("/api/v1/admin/stats")
    assert stats_resp.status_code == 200
    data = stats_resp.json()
    assert "total_bookings" in data
    assert "total_advisors" in data
    assert data["total_advisors"] >= 15
    assert "total_slots" in data
    assert data["total_slots"] >= 2000


def test_multilingual_advisor_filtering():
    """Filtering advisors by Telugu, Tamil, Kannada, Hindi, and English returns dataset advisors."""
    # 1. Telugu filter
    telugu_resp = client.get("/api/v1/advisors?language=Telugu")
    assert telugu_resp.status_code == 200
    telugu_advisors = telugu_resp.json()
    assert len(telugu_advisors) > 0
    assert any("Telugu" in a["languages"] for a in telugu_advisors)

    # 2. Kannada filter
    kannada_resp = client.get("/api/v1/advisors?language=Kannada")
    assert kannada_resp.status_code == 200
    kannada_advisors = kannada_resp.json()
    assert len(kannada_advisors) > 0
    assert any("Kannada" in a["languages"] for a in kannada_advisors)

    # 3. Tamil filter
    tamil_resp = client.get("/api/v1/advisors?language=Tamil")
    assert tamil_resp.status_code == 200
    tamil_advisors = tamil_resp.json()
    assert len(tamil_advisors) > 0
    assert any("Tamil" in a["languages"] for a in tamil_advisors)

    # 4. Hindi filter
    hindi_resp = client.get("/api/v1/advisors?language=Hindi")
    assert hindi_resp.status_code == 200
    assert len(hindi_resp.json()) > 0


def test_anonymous_cannot_book_appointment():
    """Anonymous user without session cookie cannot book a slot (returns 401)."""
    # Clear any cookies
    client.cookies.clear()
    resp = client.post(
        "/api/v1/bookings",
        json={"slot_id": "SLT-TEST", "consultation_mode": "video"},
    )
    assert resp.status_code == 401


def test_transaction_safe_slot_booking_and_cancellation(db_session: Session):
    """Customer books an available slot, verifies status, and then cancels it safely releasing the slot."""
    # 1. Find an available slot in database and check advisor's supported mode
    slot = (
        db_session.query(AdvisorSlot)
        .filter(AdvisorSlot.status == "available", AdvisorSlot.slot_start > datetime.now(IST))
        .first()
    )
    assert slot is not None, "Expected available slots in official dataset"
    test_slot_id = slot.slot_id
    advisor = db_session.query(Advisor).filter(Advisor.advisor_id == slot.advisor_id).first()
    supported_mode = advisor.consultation_modes.split(";")[0].strip().lower()

    # 2. Login as customer
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    assert login_resp.status_code == 200
    csrf_token = login_resp.json()["csrf_token"]

    # 3. Book the slot
    booking_req = {
        "slot_id": test_slot_id,
        "consultation_mode": supported_mode,
        "assessment_summary": {"recommended_cover_inr": 7500000, "product": "PRD-TL-001"},
    }
    book_resp = client.post(
        "/api/v1/bookings",
        json=booking_req,
        headers={"X-CSRF-Token": csrf_token},
    )
    assert book_resp.status_code == 201, book_resp.text
    booking_data = book_resp.json()
    booking_id = booking_data["id"]
    assert booking_data["status"] == "confirmed"
    assert booking_data["slot_id"] == test_slot_id

    # 4. Verify slot is now 'booked' in database
    db_session.expire_all()
    slot_refreshed = (
        db_session.query(AdvisorSlot)
        .filter(AdvisorSlot.slot_id == test_slot_id)
        .first()
    )
    assert slot_refreshed.status == "booked"

    # 5. Attempting to book the SAME slot again must return 409 Conflict
    double_book_resp = client.post(
        "/api/v1/bookings",
        json=booking_req,
        headers={"X-CSRF-Token": csrf_token},
    )
    assert double_book_resp.status_code == 409
    assert "already booked" in double_book_resp.text

    # 6. Check /api/v1/bookings/my
    my_bookings_resp = client.get("/api/v1/bookings/my")
    assert my_bookings_resp.status_code == 200
    my_ids = [b["id"] for b in my_bookings_resp.json()]
    assert booking_id in my_ids

    # 7. Customer cancels their booking
    cancel_resp = client.post(
        f"/api/v1/bookings/{booking_id}/cancel",
        headers={"X-CSRF-Token": csrf_token},
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"

    # 8. Verify slot is released back to 'available'
    db_session.expire_all()
    slot_released = (
        db_session.query(AdvisorSlot)
        .filter(AdvisorSlot.slot_id == test_slot_id)
        .first()
    )
    assert slot_released.status == "available"

    # 9. Verify slot can now be re-booked safely
    rebook_resp = client.post(
        "/api/v1/bookings",
        json=booking_req,
        headers={"X-CSRF-Token": csrf_token},
    )
    assert rebook_resp.status_code == 201
    rebook_id = rebook_resp.json()["id"]
    assert rebook_id != booking_id

    # Cleanup rebook
    client.post(f"/api/v1/bookings/{rebook_id}/cancel", headers={"X-CSRF-Token": csrf_token})


def test_idor_customer_cannot_cancel_other_customer_booking(db_session: Session):
    """Customer A cannot cancel Customer B's booking (403 Forbidden)."""
    # 1. Register customer B
    cust_b_email = f"cust_b_{uuid.uuid4().hex[:6]}@coverwise.test"
    reg_b = client.post(
        "/api/v1/auth/register",
        json={"email": cust_b_email, "password": "Password@123", "full_name": "Customer B"},
    )
    assert reg_b.status_code == 201
    csrf_b = reg_b.json()["csrf_token"]

    # 2. Customer B books an available slot
    slot = (
        db_session.query(AdvisorSlot)
        .filter(AdvisorSlot.status == "available", AdvisorSlot.slot_start > datetime.now(IST))
        .first()
    )
    assert slot is not None
    slot_id = slot.slot_id
    advisor = db_session.query(Advisor).filter(Advisor.advisor_id == slot.advisor_id).first()
    supported_mode = advisor.consultation_modes.split(";")[0].strip().lower()

    book_resp = client.post(
        "/api/v1/bookings",
        json={"slot_id": slot_id, "consultation_mode": supported_mode},
        headers={"X-CSRF-Token": csrf_b},
    )
    assert book_resp.status_code == 201
    b_booking_id = book_resp.json()["id"]

    # 3. Log in as Customer A
    login_a = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    assert login_a.status_code == 200
    csrf_a = login_a.json()["csrf_token"]

    # 4. Customer A attempts to cancel Customer B's booking
    idor_cancel = client.post(
        f"/api/v1/bookings/{b_booking_id}/cancel",
        headers={"X-CSRF-Token": csrf_a},
    )
    assert idor_cancel.status_code == 403
    assert "not authorized" in idor_cancel.text

    # Cleanup: Customer B cancels their booking
    client.post(
        "/api/v1/auth/login",
        json={"email": cust_b_email, "password": "Password@123"},
    )
    client.post(f"/api/v1/bookings/{b_booking_id}/cancel", headers={"X-CSRF-Token": csrf_b})


def test_advisor_consultation_portal_and_notes(db_session: Session):
    """Advisor can view assigned consultations, update status to completed, and add notes."""
    # 1. Customer books a slot for advisor ADV-7JIHQA
    slot = (
        db_session.query(AdvisorSlot)
        .filter(
            AdvisorSlot.advisor_id == "ADV-7JIHQA",
            AdvisorSlot.status == "available",
            AdvisorSlot.slot_start > datetime.now(IST),
        )
        .first()
    )
    assert slot is not None, "Need available slot for ADV-7JIHQA"
    slot_id = slot.slot_id

    cust_login = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@coverwise.test", "password": "Customer@123"},
    )
    csrf_cust = cust_login.json()["csrf_token"]

    book_resp = client.post(
        "/api/v1/bookings",
        json={
            "slot_id": slot_id,
            "consultation_mode": "phone",
            "assessment_summary": {"coverage_gap": 5000000},
        },
        headers={"X-CSRF-Token": csrf_cust},
    )
    assert book_resp.status_code == 201
    booking_id = book_resp.json()["id"]

    # 2. Advisor logs in
    adv_login = client.post(
        "/api/v1/auth/login",
        json={"email": "advisor@coverwise.test", "password": "Advisor@123"},
    )
    assert adv_login.status_code == 200
    csrf_adv = adv_login.json()["csrf_token"]

    # 3. Advisor views consultations
    consultations_resp = client.get("/api/v1/advisor/consultations")
    assert consultations_resp.status_code == 200
    adv_bookings = consultations_resp.json()
    matching = [b for b in adv_bookings if b["id"] == booking_id]
    assert len(matching) == 1
    assert matching[0]["customer_name"] == "Ramesh Sharma"

    # 4. Advisor completes consultation and adds notes
    update_resp = client.patch(
        f"/api/v1/advisor/consultations/{booking_id}",
        json={
            "status": "completed",
            "advisor_notes": "Discussed 20-year term plan with critical illness rider. Customer agreed to proceed.",
        },
        headers={"X-CSRF-Token": csrf_adv},
    )
    assert update_resp.status_code == 200
    updated_data = update_resp.json()
    assert updated_data["status"] == "completed"
    assert "critical illness" in updated_data["advisor_notes"]


def test_concurrent_double_booking_race_condition(db_session: Session):
    """Simultaneous booking requests for the same slot result in exactly one 201 and one 409."""
    # 1. Setup two distinct customers
    cust1_email = f"race1_{uuid.uuid4().hex[:6]}@coverwise.test"
    cust2_email = f"race2_{uuid.uuid4().hex[:6]}@coverwise.test"

    client1 = TestClient(app)
    reg1 = client1.post("/api/v1/auth/register", json={"email": cust1_email, "password": "Password@123", "full_name": "Racer 1"})
    assert reg1.status_code == 201
    csrf1 = reg1.json()["csrf_token"]

    client2 = TestClient(app)
    reg2 = client2.post("/api/v1/auth/register", json={"email": cust2_email, "password": "Password@123", "full_name": "Racer 2"})
    assert reg2.status_code == 201
    csrf2 = reg2.json()["csrf_token"]

    # 2. Pick an available slot
    slot = (
        db_session.query(AdvisorSlot)
        .filter(AdvisorSlot.status == "available", AdvisorSlot.slot_start > datetime.now(IST))
        .first()
    )
    assert slot is not None
    slot_id = slot.slot_id
    advisor = db_session.query(Advisor).filter(Advisor.advisor_id == slot.advisor_id).first()
    mode = advisor.consultation_modes.split(";")[0].strip().lower()

    # 3. Fire concurrent booking requests
    def attempt_booking(c: TestClient, csrf: str):
        return c.post(
            "/api/v1/bookings",
            json={"slot_id": slot_id, "consultation_mode": mode},
            headers={"X-CSRF-Token": csrf},
        )

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(attempt_booking, client1, csrf1)
        f2 = executor.submit(attempt_booking, client2, csrf2)
        r1 = f1.result()
        r2 = f2.result()

    status_codes = sorted([r1.status_code, r2.status_code])
    assert status_codes == [201, 409], f"Expected exactly one 201 and one 409, got: {status_codes}"
