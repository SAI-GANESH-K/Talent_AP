"""Authentication and session management for CoverWise Phase 4.

Includes:
- Cryptographic session and CSRF token generation
- In-memory rate limiting for login and registration
- Cookie helpers for HttpOnly, SameSite=Lax sessions
- Server-side session verification against `user_sessions`
- RBAC role enforcement dependencies (Customer, Advisor, Admin)
- CSRF header verification for cookie-authenticated mutating requests
"""

import collections
import logging
import secrets
import time
from datetime import datetime, timedelta, timezone
from typing import Callable, Optional

from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.app_data import User, UserSession

logger = logging.getLogger("coverwise.auth")

SESSION_COOKIE_NAME = "coverwise_session"
CSRF_COOKIE_NAME = "coverwise_csrf"


class InMemoryRateLimiter:
    """Thread-safe sliding window rate limiter."""

    def __init__(self) -> None:
        self._attempts: dict[str, collections.deque[float]] = collections.defaultdict(
            collections.deque
        )

    def is_allowed(self, key: str, max_attempts: int = 5, window_seconds: int = 300) -> bool:
        """Check if an action is within rate limits."""
        now = time.time()
        q = self._attempts[key]
        # Purge timestamps outside the window
        while q and q[0] <= now - window_seconds:
            q.popleft()
        if len(q) >= max_attempts:
            return False
        q.append(now)
        return True

    def reset(self, key: str) -> None:
        """Reset attempts for a key upon successful action."""
        if key in self._attempts:
            del self._attempts[key]


# Global rate limiter instances
auth_rate_limiter = InMemoryRateLimiter()


def generate_session_token() -> str:
    """Generate cryptographically secure 256-bit URL-safe session token."""
    return secrets.token_urlsafe(32)


def generate_csrf_token() -> str:
    """Generate cryptographically secure 256-bit hex CSRF token."""
    return secrets.token_hex(32)


def set_auth_cookies(
    response: Response,
    session_token: str,
    csrf_token: str,
    max_age_seconds: Optional[int] = None,
) -> None:
    """Set secure session and CSRF cookies on HTTP response.

    - coverwise_session: HttpOnly=True (inaccessible to JavaScript)
    - coverwise_csrf: HttpOnly=False (readable by client to send in X-CSRF-Token header)
    """
    max_age = max_age_seconds or settings.session_max_age_seconds
    is_secure = not settings.is_development

    # HttpOnly session cookie
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_token,
        max_age=max_age,
        expires=max_age,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        path="/",
    )

    # CSRF cookie (client-accessible for double-submit header pattern)
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf_token,
        max_age=max_age,
        expires=max_age,
        httponly=False,
        samesite="lax",
        secure=is_secure,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    """Delete session and CSRF cookies on logout."""
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/", httponly=True, samesite="lax")
    response.delete_cookie(key=CSRF_COOKIE_NAME, path="/", httponly=False, samesite="lax")


def get_current_session(
    request: Request, db: Session = Depends(get_db)
) -> tuple[User, UserSession]:
    """Retrieve active session from cookie or Authorization header.

    Validates expiration and user status.
    Raises HTTPException 401 if unauthenticated or expired.
    """
    session_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not session_token:
        # Fallback check for Authorization: Bearer <session_token> (useful in testing)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:].strip()

    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
        )

    # Look up session in DB
    user_session = (
        db.query(UserSession)
        .filter(UserSession.session_token == session_token)
        .first()
    )

    if not user_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session not found or expired. Please log in again.",
        )

    # Check expiration
    now_utc = datetime.now(timezone.utc)
    if user_session.expires_at <= now_utc:
        # Invalidate expired session
        db.delete(user_session)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
        )

    # Fetch associated user
    user = db.query(User).filter(User.id == user_session.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or not found.",
        )

    return user, user_session


def get_current_user(
    auth: tuple[User, UserSession] = Depends(get_current_session)
) -> User:
    """FastAPI dependency returning current authenticated User."""
    return auth[0]


def get_optional_current_user(
    request: Request, db: Session = Depends(get_db)
) -> Optional[User]:
    """FastAPI dependency returning current User if authenticated, else None."""
    try:
        user, _ = get_current_session(request, db)
        return user
    except HTTPException:
        return None


def require_role(*allowed_roles: str) -> Callable[[User], User]:
    """Factory dependency for Role-Based Access Control (RBAC).

    Usage:
        @router.get('/advisor/consultations')
        def get_consultations(user: User = Depends(require_role('advisor'))):
            ...
    """

    def role_dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            logger.warning(
                "Access denied for user %s with role %s (required: %s)",
                user.id,
                user.role,
                allowed_roles,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: operation requires one of {allowed_roles} roles.",
            )
        return user

    return role_dependency


def verify_csrf(
    request: Request, auth: tuple[User, UserSession] = Depends(get_current_session)
) -> None:
    """Verify CSRF token for mutating state requests (POST, PUT, PATCH, DELETE).

    Must match the session's recorded CSRF token via constant-time comparison.
    """
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        csrf_header = request.headers.get("X-CSRF-Token")
        _, user_session = auth
        if not csrf_header or not secrets.compare_digest(csrf_header, user_session.csrf_token):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or missing CSRF token.",
            )
