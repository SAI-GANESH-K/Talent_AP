"""CoverWise FastAPI application entry point.

This is the single obvious entry point for the backend.
It configures CORS, error handlers, and mounts API routers.
"""

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.assessment import router as assessment_router
from app.api.v1.public import router as public_router
from app.core.config import settings
from app.core.exceptions import AppError, app_error_handler, http_exception_handler

# Configure logging — no raw financial data in logs
logging.basicConfig(
    level=logging.INFO if settings.is_development else logging.WARNING,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("coverwise")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="CoverWise API",
        description="Life Insurance Needs Finder — Team We4, BFSI B2",
        version="0.1.0",
        # Only expose docs in development
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
    )

    # CORS — narrow origins from config
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["*"],
    )

    # Error handlers — consistent JSON, never leak internals
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)

    # Mount routers
    app.include_router(public_router)
    app.include_router(assessment_router)

    logger.info(
        "CoverWise API started (env=%s, cors=%s)",
        settings.environment,
        settings.cors_origin_list,
    )

    return app


# Application instance used by uvicorn
app = create_app()
