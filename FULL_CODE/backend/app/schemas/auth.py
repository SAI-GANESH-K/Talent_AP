"""Authentication schemas for CoverWise Phase 4."""

import re
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_REGEX = re.compile(r"^[\w\.\+\-]+@[\w\.\-]+\.[a-zA-Z]{2,}$")


class UserRegisterRequest(BaseModel):
    """Customer registration payload.
    Role is strictly defaulted and locked to 'customer'.
    """

    email: str = Field(..., description="Customer email address")
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email address format.")
        return clean


class UserLoginRequest(BaseModel):
    """Customer, Advisor, or Administrator login payload."""

    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email address format.")
        return clean


class UserResponse(BaseModel):
    """Public user identity returned to authenticated frontend."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    role: str
    advisor_id: Optional[str] = None
    is_active: bool


class AuthResponse(BaseModel):
    """Response returned upon registration or login."""

    user: UserResponse
    csrf_token: str
    message: str


class SessionInfoResponse(BaseModel):
    """Response for /auth/me check."""

    user: UserResponse
    csrf_token: str
