"""Standard error response handling.

Provides consistent JSON error format across all endpoints.
Never leaks internal details (stack traces, SQL, file paths) to clients.
"""

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error with HTTP status code."""

    def __init__(self, status_code: int, detail: str, error_code: str | None = None):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code or "error"
        super().__init__(detail)


class NotFoundError(AppError):
    def __init__(self, resource: str = "Resource"):
        super().__init__(404, f"{resource} not found", "not_found")


class ForbiddenError(AppError):
    def __init__(self, detail: str = "Access denied"):
        super().__init__(403, detail, "forbidden")


class ConflictError(AppError):
    def __init__(self, detail: str = "Conflict"):
        super().__init__(409, detail, "conflict")


class ValidationError(AppError):
    def __init__(self, detail: str = "Invalid input"):
        super().__init__(422, detail, "validation_error")


async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    """Convert AppError exceptions to consistent JSON responses."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.error_code,
                "message": exc.detail,
            },
        },
    )


async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    """Convert FastAPI HTTPExceptions to our standard format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "http_error",
                "message": exc.detail,
            },
        },
    )


async def unhandled_exception_handler(_request: Request, _exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions — never leak internals."""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "internal_error",
                "message": "An unexpected error occurred.",
            },
        },
    )
