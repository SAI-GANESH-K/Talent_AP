"""Authentication endpoints for CoverWise Phase 4.

Provides secure registration, login, session inspection, and logout.
Uses Argon2id password hashing, HttpOnly session cookies, and CSRF protection.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.auth import (
    auth_rate_limiter,
    clear_auth_cookies,
    generate_csrf_token,
    generate_session_token,
    get_current_session,
    set_auth_cookies,
    verify_csrf,
)
from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models.app_data import User, UserSession
from app.schemas.auth import (
    AuthResponse,
    SessionInfoResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def _get_client_ip(request: Request) -> str:
    """Extract client IP address safely from request headers or client host."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new customer account",
)
def register(
    req: UserRegisterRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Register customer account. Role is strictly customer — advisor/admin cannot self-register."""
    client_ip = _get_client_ip(request)
    rate_key = f"reg:{client_ip}"
    if not auth_rate_limiter.is_allowed(rate_key, max_attempts=5, window_seconds=300):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Registration rate limit exceeded. Please wait a few minutes before trying again.",
        )

    # Check for existing email (case-insensitive)
    existing = db.query(User).filter(User.email.ilike(req.email.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Hash password with Argon2id
    pwd_hash = hash_password(req.password)

    # Always create with role='customer' (prevents privilege escalation)
    new_user = User(
        email=req.email.strip().lower(),
        password_hash=pwd_hash,
        full_name=req.full_name.strip(),
        role="customer",
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    # Generate session & CSRF tokens
    session_token = generate_session_token()
    csrf_token = generate_csrf_token()
    expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=settings.session_max_age_seconds
    )

    new_session = UserSession(
        user_id=new_user.id,
        session_token=session_token,
        csrf_token=csrf_token,
        expires_at=expires_at,
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_user)

    # Set secure HttpOnly cookies
    set_auth_cookies(response, session_token, csrf_token)

    return AuthResponse(
        user=UserResponse.model_validate(new_user),
        csrf_token=csrf_token,
        message="Registration successful. Welcome to CoverWise!",
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Log into customer, advisor, or admin account",
)
def login(
    req: UserLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Authenticate with email and password. Issues HttpOnly session cookie."""
    client_ip = _get_client_ip(request)
    email_clean = req.email.strip().lower()
    rate_key = f"login:{client_ip}:{email_clean}"

    if not auth_rate_limiter.is_allowed(rate_key, max_attempts=5, window_seconds=300):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please wait 5 minutes before trying again.",
        )

    # Safe lookup: generic error on mismatch
    user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if not user or not user.is_active or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Reset rate limit on success
    auth_rate_limiter.reset(rate_key)

    # Generate session & CSRF tokens
    session_token = generate_session_token()
    csrf_token = generate_csrf_token()
    expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=settings.session_max_age_seconds
    )

    new_session = UserSession(
        user_id=user.id,
        session_token=session_token,
        csrf_token=csrf_token,
        expires_at=expires_at,
    )
    db.add(new_session)
    db.commit()
    db.refresh(user)

    # Set secure HttpOnly cookies
    set_auth_cookies(response, session_token, csrf_token)

    return AuthResponse(
        user=UserResponse.model_validate(user),
        csrf_token=csrf_token,
        message="Login successful.",
    )


@router.get(
    "/me",
    response_model=SessionInfoResponse,
    summary="Check active session and get current user profile",
)
def get_me(
    auth: tuple[User, UserSession] = Depends(get_current_session),
):
    """Return profile and CSRF token of currently logged in user."""
    user, session = auth
    return SessionInfoResponse(
        user=UserResponse.model_validate(user),
        csrf_token=session.csrf_token,
    )


@router.post(
    "/logout",
    summary="Log out and invalidate active session",
)
def logout(
    response: Response,
    auth: tuple[User, UserSession] = Depends(get_current_session),
    _csrf: None = Depends(verify_csrf),
    db: Session = Depends(get_db),
):
    """Invalidate session in database and delete cookies."""
    _, session = auth
    db.delete(session)
    db.commit()
    clear_auth_cookies(response)
    return {"success": True, "message": "Successfully logged out."}
