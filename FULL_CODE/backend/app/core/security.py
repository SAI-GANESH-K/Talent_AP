"""Security utilities.

Password hashing with Argon2id, session management foundations.
"""

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# Argon2id hasher with secure defaults
_ph = PasswordHasher()


def hash_password(password: str) -> str:
    """Hash a password using Argon2id."""
    return _ph.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its Argon2id hash.

    Returns False for mismatches rather than raising exceptions.
    """
    try:
        return _ph.verify(password_hash, password)
    except VerifyMismatchError:
        return False
