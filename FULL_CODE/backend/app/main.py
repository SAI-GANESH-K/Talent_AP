"""CoverWise FastAPI application entry point.

This is the single obvious entry point for the backend.
It configures CORS, error handlers, and mounts API routers.
"""

import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.advisors import router as advisors_router
from app.api.v1.assessment import router as assessment_router
from app.api.v1.auth import router as auth_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.public import router as public_router
from app.api.v1.recommendations import router as recommendations_router
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
    app.include_router(auth_router)
    app.include_router(assessment_router)
    app.include_router(recommendations_router)
    app.include_router(advisors_router)
    app.include_router(bookings_router)

    # Mount frontend static distribution if built (for single-origin deployment)
    frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
    if frontend_dist.exists() and (frontend_dist / "index.html").exists():
        assets_dir = frontend_dist / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        async def serve_spa(full_path: str):
            if full_path.startswith("api/") or full_path == "api" or full_path.startswith("health"):
                raise HTTPException(status_code=404, detail="Endpoint not found")
            file_path = frontend_dist / full_path
            if full_path and file_path.is_file():
                return FileResponse(str(file_path))
            return FileResponse(str(frontend_dist / "index.html"))

    logger.info(
        "CoverWise API started (env=%s, cors=%s)",
        settings.environment,
        settings.cors_origin_list,
    )

    return app


# Application instance used by uvicorn
app = create_app()
